/* eslint-disable no-restricted-globals */
import { profiles } from "../data";
import {
  processList,
  GetDataType,
  listPageSize,
  ProfileListType,
} from "../consts";

self.onmessage = (e: MessageEvent<string>) => {
  const data = JSON.parse(e.data) as GetDataType;

  if (data.action !== processList.getData) {
    return;
  }

  //initial records post
  if (data.period === "initial") {
    const items = profiles.filter((item, index) => index < listPageSize);

    const response: ProfileListType = {
      loading: false,
      list: items,
      page: data.thePageNumber,
    };

    self.postMessage(JSON.stringify(response));
  }

  //on Page change records post
  if (
    data.period === "pageNumber" ||
    data.period === "next" ||
    data.period === "prev"
  ) {
    const items = profiles.slice(
      (data.thePageNumber - 1) * listPageSize,
      data.thePageNumber * listPageSize
    );

    const response: ProfileListType = {
      loading: false,
      list: items,
      page: data.thePageNumber,
    };

    self.postMessage(JSON.stringify(response));
  }
};

export {};
