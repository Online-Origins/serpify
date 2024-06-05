"use client";
import PageTitle from "@/components/page-title/page-title.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import Button from "@/components/ui/button/button.component";
import { ArrowForwardRounded } from "@mui/icons-material";
import ContentItemsWrapper from "@/components/content-items-wrapper/content-items-wrapper.component";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./utils/supabaseClient/server";
import CollectionsWrapper from "@/components/collections-wrapper/collections-wrapper.component";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";
import { useSharedContext } from "@/context/SharedContext";

export default function Home() {
  const loadingRef = useRef(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const router = useRouter();
  const gottenData = useRef(false);
  const [role, setRole] = useState("");
  const gotSearchConsoleData = useRef(false);
  const {
    currentUrl,
    webData,
    setWebData,
    setPagesData,
    setQueryData,
  } = useSharedContext();

  useEffect(() => {
    const authorizationCode = getAuthorizationCode();
    const role = sessionStorage.getItem("role");

    if (!authorizationCode && !gottenData.current && !role) {
      if (loadingRef.current) {
        router.push("/login");
      }
    } else if (
      authorizationCode &&
      !gottenData.current &&
      currentUrl &&
      currentUrl != ""
    ) {
      if (loadingRef.current) {
        handleExecute(authorizationCode, currentUrl);
        sessionStorage.setItem("role", "user");
      }
    }
  }, [currentUrl, loadingRef.current, gottenData.current]);

  useEffect(() => {
    if (gotSearchConsoleData.current || (webData && webData.length > 0)) {
      getCollections();
      getContents();
      loadingRef.current = true;
    }
  }, [gotSearchConsoleData.current, webData]);

  async function handleExecute(authorizationCode: any, websiteUrl: string) {
    try {
      const tokenResponse = await fetch("/api/exchangeCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: authorizationCode }),
      });
      const { accessToken, entries } = await tokenResponse.json();

      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("entries", JSON.stringify(entries));

      gettingData(websiteUrl, accessToken, entries);
      gottenData.current = true;
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  }

  function gettingData(
    websiteUrl: string,
    accessToken?: string,
    passedEntries?: any
  ) {
    const pageDomains = JSON.parse(sessionStorage.getItem("entries") || "");
    const userAccessToken = sessionStorage.getItem("accessToken");
    if (
      (pageDomains != "" || passedEntries) &&
      (userAccessToken !="" || accessToken)
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
        correctUrl,
        startDate,
        endDate,
        "date",
        "webData",
        setWebData
      );
      fetchData(
        currentToken,
        correctUrl,
        startDate,
        endDate,
        "page",
        "pagesData",
        setPagesData
      );
      fetchData(
        currentToken,
        correctUrl,
        startDate,
        endDate,
        "query",
        "queryData",
        setQueryData
      );
    }
  }

  async function fetchData(
    accessToken: string,
    correctUrl: string,
    startDate: any,
    endDate: any,
    dimension: string,
    storageType: string,
    saveData: (data: any) => void
  ) {
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
        }),
      });

      const data = await response.json();
      saveData(data.rows);
      sessionStorage.setItem(storageType, JSON.stringify(data.rows)); // Store as back-up for when user refresh
      gotSearchConsoleData.current = true;
    } catch (error) {
      console.error("Error fetching search console data", error);
    }
  }

  // Utility function to get the authorization code from URL
  const getAuthorizationCode = () => {
    const url = window.location.href;
    return new URL(url).searchParams.get("code");
  };

  async function getContents() {
    const { data } = await supabase.from("contentItems").select();
    if (data) {
      data.sort(
        (a, b) =>
          new Date(b.edited_on).getTime() - new Date(a.edited_on).getTime()
      );
      setContents(data);
    }
  }

  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      setCollections(data);
    }
  }

  return (
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
        {role != "guest" ? (
          <DomainStatistics />
        ) : (
          <h5>You need to log in with Google for this feature</h5>
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
        <ContentItemsWrapper
          contents={contents}
          collections={collections}
          small
        />
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
        <CollectionsWrapper collections={collections} small />
      </div>
    </InnerWrapper>
  );
}
