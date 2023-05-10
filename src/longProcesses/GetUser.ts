/* eslint-disable no-restricted-globals */
import { processList } from "../consts";

self.onmessage = async (e: MessageEvent<string>) => {
  if (e.data !== processList.getUser) {
    return;
  }

  console.log("data", e.data);

  const result = await fetch("https://reqres.in/api/users?page=2");
  const res = await result.json();

  self.postMessage(JSON.stringify(res));
};

export {};
