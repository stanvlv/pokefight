import PocketBase from "pocketbase";
import { atom, getDefaultStore } from "jotai";
const pbAddress = "https://pb.flyingsquirrels.de/";

const pbClient = new PocketBase(pbAddress);

const lobby = pbClient.collection("lobby");

// synchronize our information at the start of the app lifetime

export const lobbyArray = atom([]);
export const myself = atom(null);
const jotaiStore = getDefaultStore();

const heartbeatTimer = null;
let lastBeatTimestamp = 0;

const items = await lobby.getFullList();

jotaiStore.set(lobbyArray, items.map(item => ({id: item.id, 
    name: item.name, 
    status: item.status, 
    created: item.created, 
    updated: item.updated
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
        }])
    } else if (data.action === "update") {
        console.log("Witness object update: ", data.record);
        jotaiStore.set(lobbyArray, jotaiStore.get(lobbyArray).map(oldItem => oldItem.id === data.record.id ? {
            id: data.record.id,
            name: data.record.name,
            status: data.record.status,
            created: new Date(data.record.created),
            updated: new Date(data.record.updated),
        } : oldItem));
        if (jotaiStore.get(myself)?.id === data.record.id) {
            console.log("Detected changes to myself");
            console.log("milliseconds for round-trip:", Date.now() - lastBeatTimestamp);
            jotaiStore.set(myself, {...data.record});
        }
    } else if (data.action === "delete") {
        console.log("Witness object deletion: ", data.record);
        jotaiStore.set(lobbyArray, jotaiStore.get(lobbyArray).filter(oldItem => oldItem.id !== data.record.id));
        if (jotaiStore.get(myself).id === data.record.id) {
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
            const res = await lobby.update(id, {}); // dont know if it works this way: YES IT FREAKIN DOES
        } catch (err) {
            console.log("heartbeat totally errors out: ", err);
        }
    }
}

export async function addMyself(name, status) {
    const currentLobby = jotaiStore.get(lobbyArray);
    const foundId = currentLobby.find(val => val.name === name);
    let retObj;
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
    jotaiStore.set(myself, retObj);
    setInterval(heartbeat(retObj.id), 4000);
}
