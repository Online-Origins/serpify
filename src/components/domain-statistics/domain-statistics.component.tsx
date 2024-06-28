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
  const [totalAnalyticsPrev, setTotalAnalyticsPrev] =
    useState<AnalyticsData | null>(null);
  const { webData, webDataPrev, userRole } = useSharedContext();

  // Set the analytics if the webdata is updated
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

  useEffect(() => {
    if (webDataPrev && webDataPrev.length > 0) {
      setTotalAnalyticsPrev({
        clicks: collectTotal("clicks", webDataPrev),
        impressions: collectTotal("impressions", webDataPrev),
        ctr: collectAverage("ctr", webDataPrev) * 100,
        position: collectAverage("position", webDataPrev),
      });
    } else {
      setTotalAnalyticsPrev({
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
      });
    }
  }, [webDataPrev]);

  // Get the total
  function collectTotal(key: string, data: any[]) {
    let totalAmount = 0;
    data.forEach((item: any) => {
      totalAmount += item[key] || 0;
    });
    return totalAmount;
  }

  // Get the average
  function collectAverage(key: string, data: any[]) {
    let totalAmount = 0;
    data.forEach((item: any) => {
      totalAmount += item[key] || 0;
    });
    return totalAmount / data.length;
  }

  // If statement to check if there are analytics
  return totalAnalytics ? (
    <div className={styles.statsOverview}>
      <Statistic
        title="Total impressions"
        amount={formatNumber(totalAnalytics.impressions)}
        diffAmount={
          totalAnalyticsPrev &&
          formatNumber(
            totalAnalytics.impressions - totalAnalyticsPrev.impressions
          )
        }
        information="How many times a user saw a link to your site in search results."
      />
      <Statistic
        title="Total clicks"
        amount={formatNumber(totalAnalytics.clicks)}
        diffAmount={
          totalAnalyticsPrev &&
          totalAnalytics.clicks - totalAnalyticsPrev.clicks
        }
        information="How often a user clicked through to your site from the Google result pages."
      />
      <Statistic
        title="Average CTR"
        amount={`${totalAnalytics.ctr.toFixed(2)}%`}
        diffAmount={
          totalAnalyticsPrev &&
          (totalAnalytics.ctr - totalAnalyticsPrev.ctr).toFixed(2)
        }
        information="(Click Through Rate) Percentage of impressions that led to a click."
      />
      <Statistic
        title="Average position"
        amount={totalAnalytics.position.toFixed(1)}
        diffAmount={
          totalAnalyticsPrev &&
          (totalAnalytics.position - totalAnalyticsPrev.position).toFixed(1)
        }
        information="Average position for your site in search results, using the highest position for your site when it appears in search results."
      />
    </div>
  ) : userRole == "unauthorized" ? (
    <h5>
      You need to enable this domain in your Google Search console. Check{" "}
      <a href="https://www.youtube.com/watch?v=OT7gotTCR7s" target="_blank">
        here
      </a>{" "}
      how to do this.
    </h5>
  ) : (
    <h5>No analytics found</h5>
  );
}
