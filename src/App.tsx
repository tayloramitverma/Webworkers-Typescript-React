import React from "react";
import Loader from "./components/Loader";
import Pagination from "./components/Pagination";
import Table from "./components/Table";
import {
  processList,
  LengthCountType,
  ProfileListType,
  GetDataType,
  listPageSize,
} from "./consts";

const App = () => {
  const [lengthCount, setLengthCount] = React.useState<LengthCountType>({
    loading: true,
    value: 0,
  });
  const [profileList, setProfileList] = React.useState<ProfileListType>({
    loading: true,
    list: [],
    page: 1,
  });

  const counter: Worker = React.useMemo(
    () => new Worker(new URL("./longProcesses/getCount.ts", import.meta.url)),
    []
  );
  const getData: Worker = React.useMemo(
    () => new Worker(new URL("./longProcesses/getData.ts", import.meta.url)),
    []
  );

  const handlePageNumber = (userSelectedPage: number) => {
    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "pageNumber",
        thePageNumber: userSelectedPage,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
  };

  const prevHandler = (userSelectedPage: number) => {
    if (profileList.page === 1) {
      return;
    }

    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "prev",
        thePageNumber: userSelectedPage - 1,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
  };

  const nextHandler = (userSelectedPage: number, thePageLength: number) => {
    if (userSelectedPage < thePageLength) {
      if (window.Worker) {
        const request = {
          action: processList.getData,
          period: "next",
          thePageNumber: userSelectedPage + 1,
        } as GetDataType;

        getData.postMessage(JSON.stringify(request));
      }
    }
  };

  React.useEffect(() => {
    if (window.Worker) {
      counter.postMessage(processList.count);
    }
  }, [counter]);

  React.useEffect(() => {
    if (window.Worker) {
      counter.onmessage = (e: MessageEvent<string>) => {
        setLengthCount((prev) => ({
          ...prev,
          loading: false,
          value: Number(e.data) && Number(e.data),
        }));
      };
    }
  }, [counter]);

  React.useEffect(() => {
    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "initial",
        thePageNumber: profileList.page,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (window.Worker) {
      getData.onmessage = (e: MessageEvent<string>) => {
        const response = JSON.parse(e.data) as unknown as ProfileListType;
        console.log({ response });

        setProfileList((prev) => ({
          ...prev,
          loading: response.loading,
          list: response.list,
          page: response.page,
        }));
      };
    }
  }, [getData]);

  return (
    <main className="main-container">
      <section className="count">
        Total count of Profiles is{" "}
        <b>{lengthCount.loading ? <Loader size={14} /> : lengthCount.value}</b>
      </section>
      <section className="table-container">
        {profileList.loading ? (
          <Loader size={40} display="block" />
        ) : (
          <>
            <Table list={profileList.list} />
            <Pagination
              page={profileList.page}
              pages={lengthCount.value / listPageSize}
              pageClick={(pageNumber) => {
                handlePageNumber(pageNumber);
              }}
              prevHandler={() => prevHandler(profileList.page)}
              nextHandler={() =>
                nextHandler(profileList.page, lengthCount.value / listPageSize)
              }
            />
          </>
        )}
      </section>
    </main>
  );
};

export default App;
