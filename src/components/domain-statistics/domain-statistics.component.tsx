import { useEffect, useRef, useState } from "react";
import Statistic from "../statistic/statistic.component";
import styles from "./domain-statistics.module.scss";
import { formatNumber } from "@/app/utils/formatNumber/formatNumber";

type AnalyticsData = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export default function DomainStatistics({
  accessToken,
  correctUrl,
}: {
  accessToken?: string;
  correctUrl?: string;
}) {
  const [domainAnalytics, setDomainAnalytics] = useState<any[]>([]);
  const [totalAnalytics, setTotalAnalytics] = useState<AnalyticsData | null>(
    null
  );
  const gotData = useRef(false);

  useEffect(() => {
    const data = sessionStorage.getItem("webData");
    if (!gotData.current && accessToken != "") {
      if (!data) {
        domainData();
      }
      gotData.current = true;
    } else if (data && data.length > 0) {
      setDomainAnalytics(JSON.parse(data));
    }
  }, [gotData.current, accessToken]);

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

  async function domainData() {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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
        }),
      });

      const data = await response.json();
      sessionStorage.setItem("webData", JSON.stringify(data.rows));
      setDomainAnalytics(data);
    } catch (error) {
      console.error("Error fetching search console data", error);
    }
  }

  return totalAnalytics ? (
    <div className={styles.statsOverview}>
      <Statistic
        title="Total impressions"
        amount={formatNumber(totalAnalytics.impressions)}
        information="How many times a user saw a link to your site in search results."
      />
      <Statistic
        title="Total clicks"
        amount={formatNumber(totalAnalytics.clicks)}
        information="How often a user clicked through to your site from the Google result pages."
      />
      <Statistic
        title="Average CTR"
        amount={`${totalAnalytics.ctr.toFixed(2)}%`}
        information="(Click Through Rate) Percentage of impressions that led to a click."
      />
      <Statistic
        title="Average position"
        amount={totalAnalytics.position.toFixed(1)}
        information="Average position for your site in search results, using the highest position for your site when it appears in search results."
      />
    </div>
  ) : (
    <h5>Loading...</h5>
  );
}
