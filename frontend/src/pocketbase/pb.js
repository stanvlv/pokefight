import PocketBase from "pocketbase";
import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
const pbAddress = "https://pb.flyingsquirrels.de/";

const pbClient = new PocketBase(pbAddress);

const lobby = pbClient.collection("lobby");

// synchronize our information at the start of the app lifetime

export const lobbyArray = atom([]);
export const myself = atom(null);
export const savedUserName = atomWithStorage("savedUserName", JSON.parse(localStorage.getItem("savedUserName")));
const jotaiStore = getDefaultStore();
let heartbeatTimer = null;
let lastBeatTimestamp = 0;
let lastMeasuredPing = 0;

const items = await lobby.getFullList();

jotaiStore.set(lobbyArray, items.map(item => ({id: item.id, 
    name: item.name, 
    status: item.status, 
    created: item.created, 
    updated: item.updated,
    ping: item.ping,
})));

lobby.subscribe("*", (data) => {
    if (data.action === "create") {
        console.log("witness object creation: ", data.record);
        jotaiStore.set(lobbyArray, [... jotaiStore.get(lobbyArray), {
            id: data.record.id,
            name: data.record.name,
            status: data.record.status,
            created: new Date(data.record.created),
            updated: new Date(data.record.updated),
            ping: data.record.ping,
        }])
    } else if (data.action === "update") {
        console.log("Witness object update: ", data.record);
        jotaiStore.set(lobbyArray, jotaiStore.get(lobbyArray).map(oldItem => oldItem.id === data.record.id ? {
            id: data.record.id,
            name: data.record.name,
            status: data.record.status,
            ping: data.record.ping,
            created: new Date(data.record.created),
            updated: new Date(data.record.updated),
        } : oldItem));
        if (jotaiStore.get(myself)?.id === data.record.id) {
            console.log("Detected changes to myself");
            lastMeasuredPing = Date.now() - lastBeatTimestamp;
            console.log("milliseconds for round-trip:", lastMeasuredPing);
            jotaiStore.set(myself, {...data.record});
        }
    } else if (data.action === "delete") {
        console.log("Witness object deletion: ", data.record);
        jotaiStore.set(lobbyArray, jotaiStore.get(lobbyArray).filter(oldItem => oldItem.id !== data.record.id));
        if (jotaiStore.get(myself)?.id === data.record.id) {
            console.log("Detected changes to myself");
            if (heartbeatTimer) {
                clearInterval(heartbeatTimer);
                heartbeatTimer = null;
            }
            jotaiStore.set(myself, null);
        }
    } else {
        console.error("Unexpected event received in lobby.subscribe: ", data);
    }
})

function heartbeat(id) {
    return async () => {
        try {
            const me = jotaiStore.get(myself);
            lastBeatTimestamp = Date.now();
            const res = await lobby.update(id, {ping: lastMeasuredPing}); // dont know if it works this way: YES IT FREAKIN DOES
        } catch (err) {
            console.log("heartbeat totally errors out: ", err);
        }
    }
}

export async function addMyself(name, status) {
    const currentLobby = jotaiStore.get(lobbyArray);
    const foundId = currentLobby.find(val => val.name === name);
    let retObj;
    try {
        if (foundId) {
            // we have found a user with the given name in the table.
            // now we have to just update it
            retObj = await lobby.update(foundId.id, {
                name, status
            });
            // the atom will be updated by the realtime listener, so we don't need to do it here.
        } else {
            retObj = await lobby.create({
                name, status
            });
            // the atom will be updated by the realtime listener, so we don't need to do it here.
        }
    } catch (err) {
        console.log(err);
        return;
    }
    jotaiStore.set(myself, retObj);
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
    }
    heartbeatTimer = setInterval(heartbeat(retObj.id), 4000);
}


/// now we add some chat here
const chatCollection = pbClient.collection("lobbyChat");

const startingChat = await chatCollection.getList(1, 20, {sort: "-created", expand: "sender"});

export const chatArrayAtom = atom([]);

console.log("initial chat content: ", startingChat.items);

jotaiStore.set(chatArrayAtom, startingChat.items.map(item => ({
    ...item
})));

chatCollection.subscribe("*", (data) => {
    if (data.action === "create") {
        console.log("adding chat element: ", data.record);
        jotaiStore.set(chatArrayAtom, [data.record, ...jotaiStore.get(chatArrayAtom)]);
    } else {
        console.log("Unexpected chat collection event: ", data);
    }
})

export async function writeToChat(message) {
    const me = jotaiStore.get(myself);
    if (!me) {
        console.error("Dont have myself - cant write");
        return;
    }

    const result = await chatCollection.create({sender: me.id, message});
}
