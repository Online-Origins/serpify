"use client";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import styles from "./page.module.scss";
import PageTitle from "@/components/page-title/page-title.component";
import { useEffect, useRef, useState } from "react";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";

const websiteUrl = "onlineorigins.nl";

export default function AnalyticsPage() {
  const gotData = useRef(false);
  const [currentAccessToken, setCurrentAccessToken] = useState("");
  const [correctUrl, setCorrectUrl] = useState("");

  useEffect(() => {
    const authorizationCode = sessionStorage.getItem("authorizationCode");
    const data = sessionStorage.getItem("webData");

    if (!gotData.current) {
      if (!data && authorizationCode) {
        handleExecute(authorizationCode);
      }
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

  return (
    <InnerWrapper>
      <PageTitle title={"Website analytics"} />
      <div className={styles.analyticsWrapper}>
        <DomainStatistics
          accessToken={currentAccessToken}
          correctUrl={correctUrl}
        />
      </div>
    </InnerWrapper>
  );
}
