"use client";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import styles from "./page.module.scss";
import PageTitle from "@/components/page-title/page-title.component";
import { useEffect, useRef, useState } from "react";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";
import LineChart from "@/components/line-chart/line-chart.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";

export default function AnalyticsPage() {
  const gotData = useRef(false);
  const [domainAnalytics, setDomainAnalytics] = useState([]);
  const [chartType, setChartType] = useState("impressions");

  useEffect(() => {
    const domainData = sessionStorage.getItem("webData");
    if (!gotData.current && domainData && domainData.length > 0) {
      setDomainAnalytics(JSON.parse(domainData));
      gotData.current = true;
    }
  }, [gotData.current]);

  return (
    <InnerWrapper className={styles.analyticsWrapper}>
      <PageTitle
        title={"Website analytics"}
        information={
          "The entirety of our data and analytics infrastructure relies exclusively on Google's platform."
        }
      />{" "}
      <DomainStatistics />
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
        <h5>Analytics for pages</h5>
      </div>
    </InnerWrapper>
  );
}
