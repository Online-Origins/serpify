"use client";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import styles from "./page.module.scss";
import PageTitle from "@/components/page-title/page-title.component";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Statistic from "@/components/statistic/statistic.component";
import {formatNumber} from "@/app/utils/formatNumber/formatNumber";

const websiteUrl = "onlineorigins.nl";

type AnalyticsData = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export default function AnalyticsPage() {
  const gotData = useRef(false);
  const router = useRouter();
  const [domainAnalytics, setDomainAnalytics] = useState<any[]>([]);
  const [totalAnalytics, setTotalAnalytics] = useState<AnalyticsData | null>(
    null
  );

  // Utility function to get the authorization code from URL
  const getAuthorizationCode = () => {
    const url = window.location.href;
    return new URL(url).searchParams.get("code");
  };

  useEffect(() => {
    const authorizationCode = getAuthorizationCode();
    const data = localStorage.getItem("webData");

    if (!gotData.current) {
      if (data && data.length > 0) {
        setDomainAnalytics(JSON.parse(data));
      } else {
        if (authorizationCode) {
          handleExecute();
        } else {
          handleAuthorize();
        }
      }
      gotData.current = true;
    }
  }, []);

  useEffect(() => {
    if (domainAnalytics.length > 0) {
      setTotalAnalytics({
        clicks: collectTotal("clicks", domainAnalytics),
        impressions: collectTotal("impressions", domainAnalytics),
        ctr: collectAverage("ctr", domainAnalytics) * 100,
        position: collectAverage("position", domainAnalytics),
      });
    }
  }, [domainAnalytics]);

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

  async function handleExecute() {
    const authorizationCode = getAuthorizationCode();
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
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      if (accessToken) {
        try {
          const response = await fetch("/api/searchConsoleData", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accessToken: accessToken,
              websiteUrl: correctUrl[0],
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0],
            }),
          });

          const data = await response.json();
          localStorage.setItem("webData", JSON.stringify(data.rows));
          router.push("/analytics");
        } catch (error) {
          console.error("Error fetching search console data", error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  function collectTotal(key: string, data: any[]) {
    let totalAmount = 0;
    data.forEach((item: any) => {
      totalAmount += item[key] || 0;
    });
    return totalAmount;
  }

  function collectAverage(key: string, data: any[]) {
    let totalAmount = 0;
    data.forEach((item: any) => {
      totalAmount += item[key] || 0;
    });
    return totalAmount / data.length;
  }

  return (
    <InnerWrapper>
      <PageTitle title={"Website analytics"} />
      {totalAnalytics && (
        <div className={styles.analyticsWrapper}>
          <div className={styles.statsOverview}>
            <Statistic
              title="Total impressions"
              amount={formatNumber(totalAnalytics.impressions)}
              information="How many times a user saw a link to your site in search results."
            />
            <Statistic
              title="Total clicks"
              amount={formatNumber(totalAnalytics.clicks)}
              information="How many times a user saw a link to your site in search results."
            />
            <Statistic
              title="Average CTR"
              amount={`${totalAnalytics.ctr.toFixed(2)}%`}
              information="How many times a user saw a link to your site in search results."
            />
            <Statistic
              title="Average position"
              amount={totalAnalytics.position.toFixed(1)}
              information="How many times a user saw a link to your site in search results."
            />
          </div>
        </div>
      )}
    </InnerWrapper>
  );
}
