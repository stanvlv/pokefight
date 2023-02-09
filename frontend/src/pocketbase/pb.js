import PocketBase from "pocketbase";
import { getDefaultStore } from "jotai";
export const backendUrl = import.meta.env.VITE_BACKEND_URL;
const pbAddress = "http://pb.flyingsquirrels.de/";

export const pbClient = new PocketBase(pbAddress);
export const jotaiStore = getDefaultStore();
pbClient.autoCancellation(false);
