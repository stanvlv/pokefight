import { pokemonsAtom } from "./pokemons";
import { pbClient, jotaiStore } from "../pocketbase/pb";
import { myself } from "../pocketbase/lobby";
import { atom } from "jotai";

const PLAYCARDS_COUNTDOWN = 20; // seconds

let sendTicks = true;
export function invertTicks() {
    sendTicks = !sendTicks;
}

// So the game state can be split into two parts:
// 1. Synced state - this is the state that is synced between all players
// 2. Local state - this is the state that is only relevant to the local player
//
// The synced state is stored in the realtime database(pocketbase table), and the local state is stored in the browser.

// we have 4 collections:
// 1. game state - this is the synced state
// 2. client requests - this is the requests that the client sends to the host
// 3. game state updates - this is the updates that the host sends to the client
// 4. game invitations - this is the invitations that the host sends to potential clients
export const gameStateCollection = pbClient.collection("gameState");
const clientRequestCollection = pbClient.collection("gameClientRequest");
const gameStateUpdateCollection = pbClient.collection("gameStateUpdate");
const invitationCollection = pbClient.collection("gameInvitation");

// const allClRequests = await clientRequestCollection.getFullList();
// for (const clRequest of allClRequests) {
//     await clientRequestCollection.delete(clRequest.id);
// }

const currentState = atom("idle"); // idle, host, client
const openInvitation = atom(null); // the invitation that we initiated. Contains {id}
const allInvitationsAtom = atom([]); // all invitations that we received. Contains [{id, host}]

export const invitationsAtom = atom ((get) => get(allInvitationsAtom));
export const currentStateAtom = atom((get) => get(currentState));

const syncGameStateAtom = atom(null);
const localGameStateAtom = atom(null);

export const syncGameStateAtomView = atom((get) => get(syncGameStateAtom));

export const recentCombatLogAtom = atom([]);

/// Section 0: resetting the game state
export function resetGameState () {
    // we reset the game state
    changeCurrentState("idle");
    jotaiStore.set(openInvitation, null);
    jotaiStore.set(syncGameStateAtom, null);
    jotaiStore.set(recentCombatLogAtom, []);
    clearTimers();
    gameStateCollection.unsubscribe();
}

/// Section 1: constructors for objects that we use in this module

function dealCards ( deck, hand ) {
    // we drop all previous cards and deal 5 new cards
    const newHand = deck.slice(0, 5);
    const newDeck = deck.slice(5);
    return [newDeck, newHand];
}

async function createGameStateSynced () {
    // assumption: both client and the host have the same card array in the same order in pokemonsAtom
    // in this case we dont have to extract cards from the atoms and trigger unnecessary fetches

    // instead we can just store an array of card ids
    const cards = await (async () => { 
        const cardAtoms = await jotaiStore.get(pokemonsAtom);
        console.log("cardAtoms", cardAtoms);
        // we use pokemon id as the card id
        return Array.from({length: cardAtoms.length}, (_, i) => i + 1);
    })();

    console.log("cards", cards);

    // we shuffle the cards
    const shuffle = (a) => {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }
    shuffle(cards);

    console.log("shuffled cards", cards);

    const [dealtOnce, hostHand] = dealCards(cards, []);
    const [dealtTwice, clientHand] = dealCards(dealtOnce, []);

    return {
        // this contains the initial state of the game
        cardDeck: dealtTwice,
        hostHand: hostHand,
        clientHand: clientHand,
        hostLife: 200,
        clientLife: 200,
        hostBoard: [],
        hostBoardHealth: [],
        clientBoard: [],
        clientBoardHealth: [],
        clientCardsPlayed: 0, // number of cards played by the client in the current turn
        hostCardsPlayed: 0, // number of cards played by the host in the current turn
        gamePhase: "playCards", // "playCards", "fight"
        winState: "none", // "none", "host", "client", "draw"
        countdown: PLAYCARDS_COUNTDOWN, // in seconds, the client has the authority on updating this!
        // in addition this also contains .id, .client and .host properties which store the client and host ids
        // but are added later in createHostGameState
    }
}

export async function createInvitation() {
    const invitation = {
        host: jotaiStore.get(myself).id,
        '$autoCancel': false,
    };
    // subscribe to listen to client response to the invitation
    clientRequestCollection.subscribe("*", onClientRequest);
    const pbEntry = await invitationCollection.create(invitation);
    jotaiStore.set(openInvitation, pbEntry);
    return pbEntry;
}

function createClientRequest(requestType, data) {
    return {
        clientId: jotaiStore.get(myself).id,
        type: requestType,
        '$autoCancel': false,
        data,
    }
}

function createGameStateUpdate(updateType, data) {
    const gameState = jotaiStore.get(syncGameStateAtom);
    return {
        gameId: gameState.id,
        type: updateType,
        '$autoCancel': false,
        data,
    }
}

// Creates an object that represents an action that was optimistically applied to the synced state,
// and can be undone if the server rejects the action
let undoableActions = [];
function createUndoableAction(checkRemove, undo) {
    undoableActions.push({
        checkRemove, undo
    });
}

let tickTimer = null;
function initializeTimer(fun, timerMs) {
    if (tickTimer) {
        clearInterval(tickTimer);
    }
    if (jotaiStore.get(currentState) === "client") {
        tickTimer = setInterval(() => sendTicks && fun(), timerMs ?? 1000);
    }
}
function clearTimers() {
    if (tickTimer) {
        clearInterval(tickTimer);
    }
}

// section 1b detect win condition on state

function detectWinCondition(state) {
    if (state.hostLife < 0 && state.clientLife < 0) {
        return "draw";
    }
    if (state.hostLife < 0) {
        return "client";
    }
    if (state.clientLife < 0) {
        return "host";
    }
    return "none";
}

/// Section 2: Dealing with invitations

{
    const currentInvitations = await invitationCollection.getFullList();
    jotaiStore.set(allInvitationsAtom, currentInvitations);
}
// we subscribe to the invitation collection to update 
invitationCollection.subscribe("*", (data) => {
    if (data.action === "create") {
        jotaiStore.set(allInvitationsAtom, (old) => [...old, data.record]);
    } else if (data.action === "delete") {
        jotaiStore.set(allInvitationsAtom, (old) => old.filter((i) => i.id !== data.record.id));
    } else if (data.action === "update") {
        jotaiStore.set(allInvitationsAtom, (old) => old.map((i) => i.id === data.record.id ? data.record : i));
    } else {
        console.error("unknown action in invitationCollection", data);
    }
});

function onGameState(data) {
    if (data.action === "create") {
        // check if this is the game state that we are waiting for
        const newState = data.record;
        if (newState.client === jotaiStore.get(myself).id) {
            // we are the client, and we were accepted by the host
            // we can now start the game
            gameStateCollection.unsubscribe("*");
            jotaiStore.set(syncGameStateAtom, newState);
            // jotaiStore.set(currentState, "client");
            changeCurrentState("client");
            // the game starts in the playCards phase, so we initialize the timer
            initializeTimer(async () => {
                const update = createClientRequest("tickSecond", {});
                jotaiStore.set(syncGameStateAtom, (old) => ({...old, countdown: old.countdown - 1}));
                await clientRequestCollection.create(update);
            });
        }
    }
}

export async function acceptInvitation(invitationId) {
    // we are the client, accepting the invitation from the host
    const joinRequest = createClientRequest("gameJoin", {invitationId});
    // subscribe to the game state updates, so that we see when we were accepted
    gameStateCollection.subscribe("*", onGameState);
    await clientRequestCollection.create(joinRequest);
}

async function clearInvitation() {
    const invitation = jotaiStore.get(openInvitation);
    if (invitation) {
        jotaiStore.set(openInvitation, null);
        await invitationCollection.delete(invitation.id);
    }
}


/// Section 3: Creating the game state and initializing the game

async function createHostGameState(opponentId) {
    const state = await createGameStateSynced();
    state.client = opponentId;
    state.host = jotaiStore.get(myself).id;
    // clientRequestCollection.subscribe("*", onClientRequest);
    const pbEntry = await gameStateCollection.create(state);
    changeCurrentState("host");
    return pbEntry;
}

async function onGameStateUpdate(dataInc) {
    if (currentState === "host") {
        // this is just what we sent ourselves, ignore
        return;
    }
    // if we have a game, and the game id is the same, continue otherwise return
    const syncState = jotaiStore.get(syncGameStateAtom);
    if (!syncState || syncState.id !== dataInc.record.gameId) {
        return;
    }
    if (dataInc.action === "create") {
        // todo: react on state updates (events from the host)
        const update = dataInc.record;
        const data = update.data;
        // for each undoable action, check if it can be removed
        undoableActions = undoableActions.filter((a) => !a.checkRemove(update));
        if (update.type === "fight") {
            for (const action of undoableActions) {
                action.undo(update);
            }
            undoableActions = [];
            // Q: does jotai store .set() work with async functions?
            // jotaiStore.set(syncGameStateAtom, (old) => updateGameState(old, data));
            const oldState = jotaiStore.get(syncGameStateAtom);
            const newState = await updateGameState(oldState, data);
            jotaiStore.set(syncGameStateAtom, newState);
            // set game phase to "fight"
            jotaiStore.set(syncGameStateAtom, (old) => ({...old, gamePhase: "fight"}));
            // set the timer to show the fight
            if (jotaiStore.get(syncGameStateAtom).winState === "none") {
                // todo: instead send the message after the animation is done
                initializeTimer(async () => {
                    // send tick to change the game phase to "playCards"
                    const update = createClientRequest("tickSecond", {});
                    await clientRequestCollection.create(update);
                    clearTimers();
                }, 5000);
            }
        } else if (update.type === "playCards") {
            // set game phase to "playCards"
            jotaiStore.set(syncGameStateAtom, (old) => ({...old, gamePhase: "playCards", countdown: PLAYCARDS_COUNTDOWN, clientCardsPlayed: 0, hostCardsPlayed: 0}));
            // set the timer to issue game ticks
            initializeTimer(async () => {
                const update = createClientRequest("tickSecond", {});
                jotaiStore.set(syncGameStateAtom, (old) => ({...old, countdown: old.countdown - 1}));
                await clientRequestCollection.create(update);
            });
        } else if (update.type === "playCard") {
            if (data.target === "clientBoard") {
                // we can just ignore this, because we already optimistically updated the game state
                return;
            }
            const pokemons = await jotaiStore.get(pokemonsAtom);
            jotaiStore.set(syncGameStateAtom, (old) => {
                const newState = {...old};
                newState.hostHand = newState.hostHand.filter((id) => id !== data.cardId);
                newState.hostBoard = [... newState.hostBoard, data.cardId];
                const pokemon = jotaiStore.get(pokemons[data.cardId - 1]);
                newState.hostBoardHealth = [...newState.hostBoardHealth, pokemon.base.HP];
                newState.hostCardsPlayed += 1;
                return newState;
            });
        }
    } else {
        // we dont expect any other action
        console.error("Unexpected game state update action: ", dataInc);
    }
}

async function simulateFightingPhase(syncState) {
    // this will be an array of all the events that happened during the fight
    // which are basically just the attacks.
    // the client will then use this to update the game state
    // Type signature: {attacker: "host" | "client", attackerCardId: number, target: "face" | "card", targetCardId: number, damage: number}[]
    const result = [];

    // simulates the fighting phase using syncState as the current game state
    // first, lets map the cards to their actual data
    const pokemons = await jotaiStore.get(pokemonsAtom);
    // const hostHand = syncState.hostHand.map((id) => jotaiStore.get(pokemons[id - 1]));
    // const clientHand = syncState.clientHand.map((id) => jotaiStore.get(pokemons[id - 1]));
    const hostBoard = syncState.hostBoard.map((id) => ({ ...jotaiStore.get(pokemons[id - 1])}));
    const clientBoard = syncState.clientBoard.map((id) => ({ ...jotaiStore.get(pokemons[id - 1])}));
    hostBoard.forEach((card, index) => card.health = syncState.hostBoardHealth[index]);
    clientBoard.forEach((card, index) => card.health = syncState.clientBoardHealth[index]);

    // move order: host, client, host, client, host, client ...
    const moveOrder = [];
    let i = 0; let j = 0;
    let hostTurn = true;
    for(; i < hostBoard.length || j < clientBoard.length;) {
        if (hostTurn) {
            if (i < hostBoard.length) {
                moveOrder.push([hostBoard[i], "host"]);
                i++;
            }
        } else {
            if (j < clientBoard.length) {
                moveOrder.push([clientBoard[j], "client"]);
                j++;
            }
        }
        hostTurn = !hostTurn;
    }

    // now we have the move order, lets simulate the fight
    for (const [card, turnOrder] of moveOrder) {
        const opponent = turnOrder === "host" ? clientBoard : hostBoard;
        const randomIndex = Math.floor(Math.random() * (opponent.length + 1)); // +1 to include the face
        if (randomIndex === opponent.length) {
            // we hit the face
            if (turnOrder === "host") {
                // syncState.clientLife -= card.base.Attack;
                result.push({attacker: "host", attackerCardId: card.id, target: "face", damage: card.base.Attack});
            } else {
                // syncState.hostLife -= card.base.Attack;
                result.push({attacker: "client", attackerCardId: card.id, target: "face", damage: card.base.Attack});
            }
        } else {
            // we hit a card
            const targetCard = opponent[randomIndex];
            // targetCard.health -= card.base.Attack - targetCard.base.Defense;
            if (turnOrder === "host") {
                result.push({attacker: "host", attackerCardId: card.id, target: "card", targetCardId: targetCard.id, damage: card.base.Attack});
            } else {
                result.push({attacker: "client", attackerCardId: card.id, target: "card", targetCardId: targetCard.id, damage: card.base.Attack});
            }
        }
    }

    return result;
}

async function updateGameState(oldState, events) {
    // this will update the game state based on the events
    // and return the new game state
    const newState = { ...oldState,
        hostBoard: [...oldState.hostBoard],
        clientBoard: [...oldState.clientBoard],
        hostBoardHealth: [...oldState.hostBoardHealth],
        clientBoardHealth: [...oldState.clientBoardHealth],
        hostHand: [...oldState.hostHand],
        clientHand: [...oldState.clientHand],
    };
    const pokemons = await jotaiStore.get(pokemonsAtom);
    const hostBoard = newState.hostBoard.map((id) => ({ ...jotaiStore.get(pokemons[id - 1])}));
    const clientBoard = newState.clientBoard.map((id) => ({ ...jotaiStore.get(pokemons[id - 1])}));
    hostBoard.forEach((card, index) => card.health = newState.hostBoardHealth[index]);
    clientBoard.forEach((card, index) => card.health = newState.clientBoardHealth[index]);

    const combatLog = [];

    for (const event of events) {
        const attacker = event.attacker === "host" ? hostBoard : clientBoard;
        const attackerCard = attacker.find((card) => card.id === event.attackerCardId);
        if (event.target === "face") {
            if (event.attacker === "host") {
                newState.clientLife -= event.damage;
            } else {
                newState.hostLife -= event.damage;
            }
            combatLog.push(`${attackerCard.name.english} attacked the face for ${event.damage} damage, leaving the opponent with ${event.attacker === "host" ? newState.clientLife : newState.hostLife} health.`);
        } else {
            // we hit a card
            const opponent = event.attacker === "host" ? clientBoard : hostBoard;
            const targetCard = opponent.find((card) => card.id === event.targetCardId);
            targetCard.health -= event.damage;
            combatLog.push(`${attackerCard.name.english} attacked a card ${targetCard.name.english} for ${event.damage} damage, leaving it with ${targetCard.health} health.`);
        }
    }

    // now we have to update the health arrays
    newState.hostBoardHealth = hostBoard.filter((card) => card.health > 0).map((card) => card.health);
    newState.clientBoardHealth = clientBoard.filter((card) => card.health > 0).map((card) => card.health);
    
    // now we have to check if any pokemon died
    console.log(hostBoard, clientBoard);
    newState.hostBoard = hostBoard.filter((card) => card.health > 0).map((card) => card.id);
    newState.clientBoard = clientBoard.filter((card) => card.health > 0).map((card) => card.id);
    newState.winState = detectWinCondition(newState);
    if (newState.winState === "none") {
        const [newDeck, newHostHand] = dealCards(newState.cardDeck, newState.hostHand);
        const [newDeck2, newClientHand] = dealCards(newDeck, newState.clientHand);
        newState.cardDeck = newDeck2;
        newState.hostHand = newHostHand;
        newState.clientHand = newClientHand;
    }
    jotaiStore.set(recentCombatLogAtom, combatLog);
    return newState;
}

async function onClientRequest(data) {
    if (currentState === "client") {
        // this is just what we sent ourselves, ignore
        return;
    }
    // if we have a game, and the game id is the same, continue otherwise return
    const syncState = jotaiStore.get(syncGameStateAtom);
    // special case for "gameJoin" requests: they can be accepted even if we dont have a game or currentState is "idle"
    if (!syncState && data.action === "create") {
        // the game doenot exist, but we have an open invitation
        const request = data.record;
        if (request.type === "gameJoin") {
            const invitation = jotaiStore.get(openInvitation);
            if (invitation && invitation.id === request.data.invitationId) {
                // we have an open invitation, and the request is for the same invitation
                // we can accept the request
                clearInvitation();
                const newState = await createHostGameState(request.clientId);
                jotaiStore.set(syncGameStateAtom, newState);
                return;
            }
        }
    }
    if (!syncState || syncState.client !== data.record.clientId) {
        return;
    }
    if (data.action === "create") {
        // todo: react on client requests (events from the client)
        const request = data.record;
        if (request.type === "tickSecond") {
            // The client sent a tickSecond request, we need to update the game state
            if (syncState.gamePhase === "playCards" && syncState.countdown === 1) {
                // the countdown reached 1, we need to switch to the next phase
                const stateChanges = await simulateFightingPhase(syncState);
                const newState = await updateGameState(syncState, stateChanges);
                newState.gamePhase = "fight";
                const update = createGameStateUpdate("fight", stateChanges);
                await gameStateUpdateCollection.create(update);
                jotaiStore.set(syncGameStateAtom, newState);
            } else if (syncState.gamePhase === "playCards") {
                // we just need to update the countdown
                const newState = { ...syncState };
                newState.countdown--;
                jotaiStore.set(syncGameStateAtom, newState);
            } else if (syncState.gamePhase === "fight") {
                // we need to switch to the next phase
                const newState = { ...syncState };
                newState.gamePhase = "playCards";
                newState.countdown = PLAYCARDS_COUNTDOWN;
                newState.hostCardsPlayed = 0;
                newState.clientCardsPlayed = 0;
                const update = createGameStateUpdate("playCards", {});
                await gameStateUpdateCollection.create(update);
                jotaiStore.set(syncGameStateAtom, newState);
            }
        } else if (request.type === "playCard") {
            // the client wants to play a card
            const cardId = request.data.cardId;
            const pokemons = await jotaiStore.get(pokemonsAtom);
            jotaiStore.set(syncGameStateAtom, (oldState) => {
                const newState = { ...oldState };
                newState.clientHand = newState.clientHand.filter((id) => id !== cardId);
                newState.clientBoard = [...newState.clientBoard, cardId];
                const pokemon = jotaiStore.get(pokemons[cardId - 1]);
                newState.clientBoardHealth = [...newState.clientBoardHealth, pokemon.base.HP];
                newState.clientCardsPlayed += 1;
                return newState;
            });
            // acknowledge the request by sending the update
            const update = createGameStateUpdate("playCard", { cardId, target: "clientBoard" });
            await gameStateUpdateCollection.create(update);
        }
    } else {
        // we dont expect any other action
        console.error("Unexpected client request action: ", data);
    }
}

function changeCurrentState(newState) {
    jotaiStore.set(currentState, newState);
    if (newState === "idle") {
        // we need to unsubscribe from the game state updates
        gameStateUpdateCollection.unsubscribe("*");
        clientRequestCollection.unsubscribe("*");
    } else if (newState === "client") {
        // we need to subscribe to the game state updates
        gameStateUpdateCollection.subscribe("*", onGameStateUpdate);
    } else if (newState === "host") {
        // we already subscribed to the client requests in createHostGameState
    } else {
        console.error("Unexpected game state: ", newState);
    }
}

/// Section 4: Playing the cards

export async function playCard(cardId) {
    const myCurrentState = jotaiStore.get(currentState);
    const syncState = jotaiStore.get(syncGameStateAtom);
    const winState = syncState.winState;
    if (winState !== "none") {
        // cant play cards if the game is over
        console.log(winState)
        console.log("cant play cards if the game is over")
        return;
    }
    if (syncState.gamePhase !== "playCards") {
        // cant play cards if its not the playCards phase
        console.log("cant play cards if its not the playCards phase")
        return;
    }
    if (myCurrentState === "client") {
        // Check if we can play the card
        if (syncState.clientCardsPlayed >= 2) {
            // we already played 2 cards
            console.log("cant play more than 2 cards per turn")
            return;
        }
        if (syncState.clientBoard.length >= 5) {
            // we already have 5 cards on the board
            console.log("cant play more than 5 cards on the board")
            return;
        }

        const req = createClientRequest("playCard", { cardId });
        const pokemons = await jotaiStore.get(pokemonsAtom);
        jotaiStore.set(syncGameStateAtom, (oldState) => {
            const newState = { ...oldState };
            newState.clientHand = newState.clientHand.filter((id) => id !== cardId);
            newState.clientBoard = [...newState.clientBoard, cardId];
            // get pokemons HP value
            const pokemon = jotaiStore.get(pokemons[cardId - 1]);
            console.log("playing pokemon id ", cardId, " name ", pokemon.name, " id ", pokemon.id);
            newState.clientBoardHealth = [...newState.clientBoardHealth, pokemon.base.HP];
            newState.clientCardsPlayed += 1;
            return newState;
        });
        createUndoableAction((update) => update.type === "playCard" && update.data.cardId === cardId, () => {
            // the server has not confirmed the request, so we need to undo it
            jotaiStore.set(syncGameStateAtom, (oldState) => {
                const newState = { ...oldState };
                newState.clientHand = [...newState.clientHand, cardId];
                const clientBoardIndex = newState.clientBoard.indexOf(cardId);
                newState.clientBoard = newState.clientBoard.filter((id) => id !== cardId);
                newState.clientBoardHealth = newState.clientBoardHealth.filter((_, index) => index !== clientBoardIndex);
                newState.clientCardsPlayed -= 1;
                return newState;
            });
        });
        await clientRequestCollection.create(req);
    } else if (myCurrentState === "host") {
        // Check if we can play the card
        if (syncState.hostCardsPlayed >= 2) {
            // we already played 2 cards
            console.log("cant play more than 2 cards per turn")
            return;
        }
        if (syncState.hostBoard.length >= 5) {
            // we already have 5 cards on the board
            console.log("cant play more than 5 cards on the board")
            return;
        }

        const pokemons = await jotaiStore.get(pokemonsAtom);
        jotaiStore.set(syncGameStateAtom, (oldState) => {
            const newState = { ...oldState };
            newState.hostHand = newState.hostHand.filter((id) => id !== cardId);
            newState.hostBoard = [...newState.hostBoard, cardId];
            // get pokemons HP value
            const pokemon = jotaiStore.get(pokemons[cardId - 1]);
            newState.hostBoardHealth = [...newState.hostBoardHealth, pokemon.base.HP];
            newState.hostCardsPlayed += 1;
            return newState;
        });
        const update = createGameStateUpdate("playCard", { cardId, target: "hostBoard" });
        await gameStateUpdateCollection.create(update);
    } else {
        console.error("Unexpected game state: ", myCurrentState);
    }
}

// function to test the game logic without the frontend
window.game = (command, args) => {
    if (command === "playCard") {
        playCard(args);
    }
}
