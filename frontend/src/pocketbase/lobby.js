import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { pbClient, jotaiStore } from "./pb.js";

const lobbyCollection = pbClient.collection("lobby");

// synchronize our information at the start of the app lifetime

// this atom will hold the list of all users in the lobby
export const lobbyArray = atom([]);
// this atom will hold the information about the current user
export const myself = atom(null);
// this atom will hold the name of the current user, saved in local storage
export const savedUserName = atomWithStorage(
  "savedUserName",
  JSON.parse(localStorage.getItem("savedUserName"))
);

let heartbeatTimer = null; // this will hold the setInterval handle for the heartbeat timer
let lastBeatTimestamp = 0;
let lastMeasuredPing = 0;

const initialLobby = await lobbyCollection.getFullList();

jotaiStore.set(
  lobbyArray,
  initialLobby.map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
    created: item.created,
    updated: item.updated,
    ping: item.ping,
  }))
);

lobbyCollection.subscribe("*", (data) => {
  if (data.action === "create") {
    // console.log("witness object creation: ", data.record);
    jotaiStore.set(lobbyArray, [
      ...jotaiStore.get(lobbyArray),
      {
        id: data.record.id,
        name: data.record.name,
        status: data.record.status,
        created: new Date(data.record.created),
        updated: new Date(data.record.updated),
        ping: data.record.ping,
      },
    ]);
  } else if (data.action === "update") {
    // console.log("Witness object update: ", data.record);
    jotaiStore.set(
      lobbyArray,
      jotaiStore.get(lobbyArray).map((oldItem) =>
        oldItem.id === data.record.id
          ? {
              id: data.record.id,
              name: data.record.name,
              status: data.record.status,
              ping: data.record.ping,
              created: new Date(data.record.created),
              updated: new Date(data.record.updated),
            }
          : oldItem
      )
    );
    if (jotaiStore.get(myself)?.id === data.record.id) {
      // console.log("Detected changes to myself");
      lastMeasuredPing = Date.now() - lastBeatTimestamp;
      // console.log("milliseconds for round-trip:", lastMeasuredPing);
      jotaiStore.set(myself, { ...data.record });
    }
  } else if (data.action === "delete") {
    // console.log("Witness object deletion: ", data.record);
    jotaiStore.set(
      lobbyArray,
      jotaiStore
        .get(lobbyArray)
        .filter((oldItem) => oldItem.id !== data.record.id)
    );
    if (jotaiStore.get(myself)?.id === data.record.id) {
      // console.log("Detected changes to myself");
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      jotaiStore.set(myself, null);
    }
  } else {
    console.error("Unexpected event received in lobby.subscribe: ", data);
  }
});

function heartbeat(id) {
  return async () => {
    try {
      // const me = jotaiStore.get(myself);
      lastBeatTimestamp = Date.now();
      await lobbyCollection.update(id, { ping: lastMeasuredPing }); // dont know if it works this way: YES IT FREAKIN DOES
    } catch (err) {
      console.log("heartbeat totally errors out: ", err);
    }
  };
}

export async function addMyself(name, status) {
  const currentLobby = jotaiStore.get(lobbyArray);
  const foundId = currentLobby.find((val) => val.name === name);
  let retObj;
  try {
    if (foundId) {
      // we have found a user with the given name in the table.
      // now we have to just update it
      retObj = await lobbyCollection.update(foundId.id, {
        name,
        status,
      });
      // the atom will be updated by the realtime listener, so we don't need to do it here.
    } else {
      retObj = await lobbyCollection.create({
        name,
        status,
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
