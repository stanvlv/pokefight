import PocketBase from "pocketbase";
import { getDefaultStore } from "jotai";
const pbAddress = "https://pb.flyingsquirrels.de/";

export const pbClient = new PocketBase(pbAddress);
export const jotaiStore = getDefaultStore();
