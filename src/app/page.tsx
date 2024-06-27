"use client";
import PageTitle from "@/components/page-title/page-title.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import Button from "@/components/ui/button/button.component";
import { ArrowForwardRounded } from "@mui/icons-material";
import ContentItemsWrapper from "@/components/content-items-wrapper/content-items-wrapper.component";
import { useEffect, useRef, useState } from "react";
import CollectionsWrapper from "@/components/collections-wrapper/collections-wrapper.component";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";
import { useSharedContext } from "@/context/SharedContext";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import CircularLoader from "@/components/circular-loader/circular-loader.component";

export default function Home() {
  const loadingRef = useRef(true);
  const router = useRouter();
  const gottenData = useRef(false);
  const [role, setRole] = useState("");
  const gotSearchConsoleData = useRef(false);
  const { currentUrl, setWebData, setPagesData, setQueryData, setWebDataPrev, setPagesDataPrev, setQueryDataPrev } =
    useSharedContext();

  useEffect(() => {
    const authorizationCode = getAuthorizationCode();
    const role = sessionStorage.getItem("role");

    if (!authorizationCode && !gottenData.current && !role) {
      // Redirect to the login page if a user isn't authorized yet
      if (loadingRef.current) {
        router.push("/login");
      }
    } else if (
      authorizationCode &&
      !gottenData.current &&
      currentUrl &&
      currentUrl != ""
    ) {
      // Get search console data if a user is authenticated
      if (loadingRef.current) {
        handleExecute(authorizationCode, currentUrl);
        loadingRef.current = false;
      }
    } else if (role) {
      setRole(role);
      loadingRef.current = false;
    }
  }, [currentUrl, loadingRef.current, gottenData.current]);

  // Handle getting search console data
  async function handleExecute(authorizationCode: any, websiteUrl: string) {
    try {
      const tokenResponse = await fetch("/api/exchangeCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: authorizationCode }),
      });
      const { accessToken, entries, refreshToken } = await tokenResponse.json();

      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem("entries", JSON.stringify(entries));

      gettingData(websiteUrl, accessToken, entries);
      gottenData.current = true;
      router.push("/");
    } catch (error) {
      alert(
        "Something went wrong while authenticating. Please try again later"
      );
    }
  }

  // Get data
  function gettingData(
    websiteUrl: string,
    accessToken?: string,
    passedEntries?: any
  ) {
    const pageDomains = JSON.parse(sessionStorage.getItem("entries") || "");
    const userAccessToken = sessionStorage.getItem("accessToken");
    if (
      (pageDomains != "" || passedEntries) &&
      (userAccessToken != "" || accessToken)
    ) {
      const currentToken = userAccessToken || accessToken || "";
      const entries = pageDomains || passedEntries || [""];
      let correctUrl = [];
      if (entries) {
        correctUrl = entries
          .filter((item: any) => item.siteUrl.includes(websiteUrl))
          .map((item: any) => item.siteUrl);
      }
      if (correctUrl.length == 0) {
        alert("The chosen domain isn't activated in your Search console.");
        return;
      }
      const today = new Date();
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate()
      );
      const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      fetchData(
        currentToken,
        correctUrl[0],
        startDate,
        endDate,
        "date",
        "webData",
        setWebData
      );
      fetchData(
        currentToken,
        correctUrl[0],
        startDate,
        endDate,
        "page",
        "pagesData",
        setPagesData
      );
      fetchData(
        currentToken,
        correctUrl[0],
        startDate,
        endDate,
        "query",
        "queryData",
        setQueryData
      );

      const prevStartDate = new Date(
        today.getFullYear(),
        today.getMonth() - 2,
        today.getDate()
      );

      fetchData(
        currentToken,
        correctUrl[0],
        prevStartDate,
        startDate,
        "date",
        "webDataPrev",
        setWebDataPrev
      );
      fetchData(
        currentToken,
        correctUrl[0],
        prevStartDate,
        startDate,
        "page",
        "pagesDataPrev",
        setPagesDataPrev
      );
      fetchData(
        currentToken,
        correctUrl[0],
        prevStartDate,
        startDate,
        "query",
        "queryDataPrev",
        setQueryDataPrev
      );
    }
  }
  
  // Fetch specific dimension type data
  async function fetchData(
    accessToken: string,
    correctUrl: string,
    startDate: any,
    endDate: any,
    dimension: string,
    storageType: string,
    saveData: (data: any) => void
  ) {
    const refreshToken = sessionStorage.getItem("refreshToken");
    try {
      const response = await fetch("/api/domainData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: accessToken,
          websiteUrl: correctUrl,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          dimension: [dimension],
          refreshToken: refreshToken,
        }),
      });

      const data = await response.json();
      saveData(data.rows);
      sessionStorage.setItem(storageType, JSON.stringify(data.rows)); // Store as back-up for when user refresh
      sessionStorage.setItem("role", "user");
      gotSearchConsoleData.current = true;
    } catch (error) {
      sessionStorage.setItem("role", "unauthorized");
      setRole("unauthorized");
      console.error("Error fetching search console data", error);
    }
  }

  // Utility function to get the authorization code from URL
  const getAuthorizationCode = () => {
    const url = window.location.href;
    return new URL(url).searchParams.get("code");
  };

  return loadingRef.current ? (
    <PopUpWrapper>
      <CircularLoader />
      <p>Loading...</p>
    </PopUpWrapper>
  ) : (
    <InnerWrapper
      className={classNames(styles.homeWrapper, "scrollbar noMargin")}
    >
      <h1>Welcome!</h1>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Website analytics"}
          smallTitle={"(Last month)"}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => router.push("/analytics")}>
              <p>See analytics</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        {role != "guest" && role != "unauthorized" && <DomainStatistics />}
        {role == "guest" && (
          <h5>You need to log in with Google for this feature</h5>
        )}
        {role == "unauthorized" && (
          <h5>
            You need to enable this domain in your Google Search console. Check{" "}
            <a
              href="https://www.youtube.com/watch?v=OT7gotTCR7s"
              target="_blank"
            >
              here
            </a>{" "}
            how to do this.
          </h5>
        )}
      </div>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Content projects"}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => router.push("/content")}>
              <p>See all projects</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        <ContentItemsWrapper small />
      </div>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Keyword collections"}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => router.push("/keywords")}>
              <p>See all collections</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        <CollectionsWrapper small />
      </div>
    </InnerWrapper>
  );
}
