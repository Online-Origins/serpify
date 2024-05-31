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
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import CircularLoader from "@/components/circular-loader/circular-loader.component";
import styles from "./page.module.scss";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";

const websiteUrl = "onlineorigins.nl";

export default function Home() {
  const loadingRef = useRef(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const router = useRouter();
  const gotData = useRef(false);
  const [currentAccessToken, setCurrentAccessToken] = useState("");
  const [correctUrl, setCorrectUrl] = useState("");

  useEffect(() => {
    const authorizationCode = sessionStorage.getItem("authorizationCode");
    const data = sessionStorage.getItem("webData");

    if (!gotData.current && !data && authorizationCode) {
      handleExecute(authorizationCode);
      gotData.current = true;
    }
  }, [gotData.current]);

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

      setCurrentAccessToken(accessToken);
      setCorrectUrl(correctUrl[0]);
    } catch (error) {
      console.error(error);
    }
  }

  // Utility function to get the authorization code from URL
  const getAuthorizationCode = () => {
    const url = window.location.href;
    return new URL(url).searchParams.get("code");
  };

  useEffect(() => {
    const authorizationCode = getAuthorizationCode();

    if (loadingRef.current) {
      if (!authorizationCode) {
        if (!sessionStorage.getItem("authorizationCode")) {
          handleAuthorize();
        }
      } else {
        sessionStorage.setItem("authorizationCode", authorizationCode);
        router.push("/");
      }
      getCollections();
      getContents();
      loadingRef.current = false;
    }
  }, [loadingRef]);

  async function handleAuthorize() {
    try {
      const response = await fetch("/api/authorizeSearchConsole", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const authUrl = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.log("Error while authorizing", error);
    }
  }

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
    <InnerWrapper className={classNames(styles.homeWrapper, "scrollbar")}>
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
        <DomainStatistics
          accessToken={currentAccessToken}
          correctUrl={correctUrl}
        />
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
