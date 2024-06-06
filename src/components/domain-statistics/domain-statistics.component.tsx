import { useEffect, useRef, useState } from "react";
import Statistic from "../statistic/statistic.component";
import styles from "./domain-statistics.module.scss";
import { formatNumber } from "@/app/utils/formatNumber/formatNumber";
import { useSharedContext } from "@/context/SharedContext";

type AnalyticsData = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export default function DomainStatistics() {
  const [totalAnalytics, setTotalAnalytics] = useState<AnalyticsData | null>(
    null
  );
  const {webData} = useSharedContext();

  useEffect(() => {
    if (webData && webData.length > 0) {
      setTotalAnalytics({
        clicks: collectTotal("clicks", webData),
        impressions: collectTotal("impressions", webData),
        ctr: collectAverage("ctr", webData) * 100,
        position: collectAverage("position", webData),
      });
    } else {
      setTotalAnalytics(null);
    }
  }, [webData]);

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
    <h5>No analytics found.</h5>
  );
}
