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
import { usePathname, useRouter } from "next/navigation";
import styles from "./page.module.scss";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";

const websiteUrl = "onlineorigins.nl";

export default function Home() {
  const loadingRef = useRef(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const router = useRouter();
  const gottenData = useRef(false);
  const [webData, setWebData] = useState([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    if (!gottenData.current) {
      const sessionWebData = sessionStorage.getItem("webData");
      if (sessionWebData) {
        gottenData.current = true;
      }
    }
  });

  useEffect(() => {
    const authorizationCode = getAuthorizationCode();
    const role = sessionStorage.getItem("role");

    if (!authorizationCode && !gottenData.current && !role) {
      if (loadingRef.current) {
        router.push("/login");
      }
    } else if (authorizationCode && !gottenData.current){
      if (loadingRef.current){
        handleExecute(authorizationCode);
        sessionStorage.setItem("role", "user");
        loadingRef.current = false;
      }
    } else if(!authorizationCode && gottenData.current || role == "guest"){
      if (loadingRef.current){
        if (role){
          setRole(role);
        }
        getCollections();
        getContents();
        loadingRef.current = false;
      }
    }
  }, [loadingRef.current, gottenData.current]);

  async function handleExecute(authorizationCode: any) {
    try {
      const tokenResponse = await fetch("/api/exchangeCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: authorizationCode }),
      });
      const { accessToken, entries } = await tokenResponse.json();

      let correctUrl = [""];
      if (entries) {
        correctUrl = entries
          .filter((item: any) => item.siteUrl.includes(websiteUrl))
          .map((item: any) => item.siteUrl);
      }

      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 0);
      const endDate = new Date(today.getFullYear(), today.getMonth(), 1);

      fetchData(
        accessToken,
        correctUrl[0],
        startDate,
        endDate,
        "date",
        "webData"
      );
      fetchData(
        accessToken,
        correctUrl[0],
        startDate,
        endDate,
        "page",
        "pagesData"
      );
      fetchData(
        accessToken,
        correctUrl[0],
        startDate,
        endDate,
        "query",
        "queryData"
      );

      sessionStorage.removeItem("authorizationCode");
      router.push("/")
      loadingRef.current = true;
      gottenData.current = true;
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchData(
    accessToken: string,
    correctUrl: string,
    startDate: any,
    endDate: any,
    dimension: string,
    storageType: string
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
      sessionStorage.setItem(storageType, JSON.stringify(data.rows));
      if (storageType == "webData") {
        setWebData(data.rows);
      }
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
    <InnerWrapper className={classNames(styles.homeWrapper, "scrollbar noMargin")}>
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
        {role != "guest" ? <DomainStatistics firstLoadData={webData} /> : <h5>You need to log in with Google for this feature</h5>}
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
        {!loadingRef.current ? (
          <ContentItemsWrapper
            contents={contents}
            collections={collections}
            small
          />
        ) : (
          <h5>Loading...</h5>
        )}
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
        {!loadingRef.current ? (
          <CollectionsWrapper collections={collections} small />
        ) : (
          <h5>Loading...</h5>
        )}
      </div>
    </InnerWrapper>
  );
}
