"use client";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import styles from "./page.module.scss";
import PageTitle from "@/components/page-title/page-title.component";
import { useEffect, useRef, useState } from "react";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";
import LineChart from "@/components/line-chart/line-chart.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";

const websiteUrl = "onlineorigins.nl";

export default function AnalyticsPage() {
  const gotData = useRef(false);
  const [domainAnalytics, setDomainAnalytics] = useState([]);
  const [currentAccessToken, setCurrentAccessToken] = useState("");
  const [correctUrl, setCorrectUrl] = useState("");
  const [chartType, setChartType] = useState("impressions");

  useEffect(() => {
    const authorizationCode = sessionStorage.getItem("authorizationCode");
    const data = sessionStorage.getItem("webData");

    if (!gotData.current) {
      if (!data && authorizationCode) {
        handleExecute(authorizationCode);
      }
      gotData.current = true;
    } else if (data && data.length > 0) {
      setDomainAnalytics(JSON.parse(data));
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
    <InnerWrapper className={styles.analyticsWrapper}>
      <PageTitle
        title={"Website analytics"}
        information={
          "The entirety of our data and analytics infrastructure relies exclusively on Google's platform."
        }
      />{" "}
      <DomainStatistics
        accessToken={currentAccessToken}
        correctUrl={correctUrl}
      />
      <div className={styles.horizontal}>
        <div className={styles.chartWrapper}>
          <div className={styles.titleWrapper}>
            <h3>Performance</h3>
            <InputWrapper
              type="dropdown"
              small
              value={chartType}
              onChange={(value: any) => setChartType(value)}
              options={["impressions", "clicks", "ctr", "position"]}
            />
          </div>
          <LineChart data={domainAnalytics} type={chartType} />
        </div>
        <h5>Hello</h5>
      </div>
    </InnerWrapper>
  );
}
