import { pokemonsAtom } from "./pokemons";
import { pbClient, jotaiStore } from "../pocketbase/pb";
import { myself } from "../pocketbase/lobby";
import { atom } from "jotai";

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
export const invitationCollection = pbClient.collection("gameInvitation");

export const currentState = atom("idle"); // idle, host, client
export const openInvitation = atom(null); // the invitation that we initiated. Contains {id}
export const allInvitationsAtom = atom([]); // all invitations that we received. Contains [{id, host}]

const syncGameStateAtom = atom(null);
const localGameStateAtom = atom(null);

/// Section 1: constructors for objects that we use in this module

function createGameStateSynced () {
    // assumption: both client and the host have the same card array in the same order in pokemonsAtom
    // in this case we dont have to extract cards from the atoms and trigger unnecessary fetches

    // instead we can just store an array of card ids
    const cards = (() => { 
        const cardAtoms = jotaiStore.get(pokemonsAtom);
        // we use pokemon id as the card id
        return Array.from({length: cardAtoms.length}, (_, i) => i + 1);
    })();

    // we shuffle the cards
    const shuffle = (a) => {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }
    shuffle(cards);

    return {
        // this contains the initial state of the game
        cardDeck: cards,
        hostHand: [],
        clientHand: [],
        hostLife: 200,
        clientLife: 200,
        hostBoard: [],
        clientBoard: [],
        currentlyPlaying: "host", // host, client
        countdown: 20, // in seconds, the client has the authority on updating this!
        // in addition this also contains .client and .host properties which store the client and host ids
        // but are added later in createHostGameState
    }
}

export async function createInvitation() {
    const invitation = {
        host: jotaiStore.get(myself).id
    };
    const pbEntry = await invitationCollection.create(invitation);
    jotaiStore.set(openInvitation, pbEntry);
    return pbEntry;
}

function createClientRequest(requestType, data) {
    return {
        clientId: jotaiStore.get(myself).id,
        type: requestType,
        data,
    }
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
            jotaiStore.set(currentState, "client");
        }
    }
}

async function acceptInvitation(invitationId) {
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
    const state = createGameStateSynced();
    state.client = opponentId;
    state.host = jotaiStore.get(myself).id;
    clientRequestCollection.subscribe("*", onClientRequest);
    const pbEntry = await gameStateCollection.create(state);
    changeCurrentState("host");
    return pbEntry;
}

function onGameStateUpdate(data) {
    if (currentState === "host") {
        // this is just what we sent ourselves, ignore
        return;
    }
    // if we have a game, and the game id is the same, continue otherwise return
    const syncState = jotaiStore.get(syncGameStateAtom);
    if (!syncState || syncState.id !== data.record.game_id) {
        return;
    }
    if (data.action === "create") {
        // todo: react on state updates (events from the host)
    } else {
        // we dont expect any other action
        console.error("Unexpected game state update action: ", data);
    }
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
    if (!syncState || syncState.id !== data.record.game_id) {
        return;
    }
    if (data.action === "create") {
        // todo: react on client requests (events from the client)
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
        console.error("Unexpected game state: ", currentState);
    }
}

// function to test the game logic without the frontend
window.game = (command, args) => {

}