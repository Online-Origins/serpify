"use client";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import styles from "./page.module.scss";
import PageTitle from "@/components/page-title/page-title.component";
import { useEffect, useRef, useState } from "react";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";
import LineChart from "@/components/line-chart/line-chart.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import classNames from "classnames";
import Information from "@/components/information/information.component";
import Button from "@/components/ui/button/button.component";

import { ArrowForwardRounded, ArrowBackRounded } from "@mui/icons-material";

export default function AnalyticsPage() {
  const gotData = useRef(false);
  const [domainAnalytics, setDomainAnalytics] = useState([]);
  const [pagesAnalytics, setPagesAnalytics] = useState([]);
  const [shownPages, setShownPages] = useState<any[]>([]);
  const [pagesAmount, setPagesAmount] = useState([0, 9]);
  const [chartType, setChartType] = useState("impressions");
  const [role, setRole] = useState("");

  useEffect(() => {
    const domainData = sessionStorage.getItem("webData");
    const pagesData = sessionStorage.getItem("pagesData");
    const role = sessionStorage.getItem("role");
    if (!gotData.current) {
      if (role) {
        setRole(role);
      }
      if (
        domainData &&
        domainData.length > 0 &&
        pagesData &&
        pagesData.length > 0
      ) {
        setDomainAnalytics(JSON.parse(domainData));
        setPagesAnalytics(JSON.parse(pagesData));
        gotData.current = true;
      }
    }
  }, [gotData.current]);

  useEffect(() => {
    if (pagesAnalytics.length > 0) {
      showPages(pagesAnalytics);
    }
  }, [pagesAnalytics]);

  // Show keywords when keywordAmount changes
  useEffect(() => {
    showPages(pagesAnalytics);
  }, [pagesAmount]);

  function showPages(pages: any) {
    let array: any[] = [];
    for (let x = pagesAmount[0]; x < pagesAmount[1] && x < pages.length; x++) {
      array.push(pages[x]);
    }
    setShownPages(array);
  }

  return (
    <InnerWrapper className={styles.analyticsWrapper}>
      <PageTitle
        title={"Website analytics"}
        information={
          "The entirety of our data and analytics infrastructure relies exclusively on Google's platform."
        }
      />{" "}
      {role != "guest" ? (
        <div className={styles.innerAnalytics}>
          <DomainStatistics />
          <div className={styles.horizontal}>
            <div className={styles.analyticsItem}>
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
            <div className={styles.analyticsItem}>
              <div className={styles.titleWrapper}>
                <h3>Pages</h3>
                <div className={styles.tableButtons}>
                  {pagesAmount[0] > 0 && (
                    <Button
                      type={"textOnly"}
                      onClick={() =>
                        setPagesAmount([pagesAmount[0] - 9, pagesAmount[1] - 9])
                      }
                    >
                      <ArrowBackRounded />
                      {/* <p>Previous</p> */}
                    </Button>
                  )}
                  {pagesAmount[1] < pagesAnalytics.length && (
                    <Button
                      type={"textOnly"}
                      onClick={() =>
                        setPagesAmount([pagesAmount[1], pagesAmount[1] + 9])
                      }
                    >
                      {/* <p>Next</p> */}
                      <ArrowForwardRounded />
                    </Button>
                  )}
                </div>
              </div>
              <div className={styles.pagesTable}>
                <div className={classNames(styles.firstRow, styles.row)}>
                  <div className={classNames(styles.item, styles.page)}>
                    <p>Page</p>
                  </div>
                  <div className={classNames(styles.item, styles.clicks)}>
                    <p>Clicks</p>
                    <Information information="How often a user clicked through to your site from the Google result pages." />
                  </div>
                  <div className={classNames(styles.item, styles.impressions)}>
                    <p>Impressions</p>
                    <Information information="How many times a user saw a link to your site in search results." />
                  </div>
                  <div className={classNames(styles.item, styles.ctr)}>
                    <p>CTR</p>
                    <Information information="(Click Through Rate) Percentage of impressions that led to a click." />
                  </div>
                </div>
                {pagesAnalytics.length > 0 && (
                  <div className={styles.innerTable}>
                    {shownPages.map((page: any) => (
                      <div className={styles.row} key={page.keys[0]}>
                        <div className={classNames(styles.item, styles.page)}>
                          <p>
                            {page.keys[0].replace(
                              "https://onlineorigins.nl",
                              ""
                            )}
                          </p>
                        </div>
                        <div className={classNames(styles.item, styles.clicks)}>
                          <p>{page.clicks}</p>
                        </div>
                        <div
                          className={classNames(
                            styles.item,
                            styles.impressions
                          )}
                        >
                          <p>{page.impressions}</p>
                        </div>
                        <div className={classNames(styles.item, styles.ctr)}>
                          <p>{(page.ctr * 100).toFixed(1)} %</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <h5>You need to log in with Google for this feature</h5>
      )}
    </InnerWrapper>
  );
}
