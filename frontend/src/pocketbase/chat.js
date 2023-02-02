import { atom } from "jotai";
import { pbClient, jotaiStore } from "./pb.js";
import { myself } from "./lobby.js";

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