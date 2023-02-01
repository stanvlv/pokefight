import PocketBase from "pocketbase";
import { atom, getDefaultStore } from "jotai";
const pbAddress = "https://pb.flyingsquirrels.de/";

const pbClient = new PocketBase(pbAddress);

const lobby = pbClient.collection("lobby");

// synchronize our information at the start of the app lifetime

export const lobbyArray = atom([]);
const jotaiStore = getDefaultStore();

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
            created: data.record.created,
            updated: data.record.updated,
        }])
    } else if (data.action === "update") {
        console.log("Witness object update: ", data.record);
        jotaiStore.set(lobbyArray, jotaiStore.get(lobbyArray).map(oldItem => oldItem.id === data.record.id ? {
            id: data.record.id,
            name: data.record.name,
            status: data.record.status,
            created: data.record.created,
            updated: data.record.updated,
        } : oldItem));
    } else if (data.action === "delete") {
        console.log("Witness object deletion: ", data.record);
        jotaiStore.set(lobbyArray, jotaiStore.get(lobbyArray).filter(oldItem => oldItem.id !== data.record.id));
    } else {
        console.error("Unexpected event received in lobby.subscribe: ", data);
    }
})
