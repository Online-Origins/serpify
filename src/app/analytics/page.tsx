"use client";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import PageTitle from "@/components/page-title/page-title.component";
import { use, useEffect, useRef, useState } from "react";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";
import LineChart from "@/components/line-chart/line-chart.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import classNames from "classnames";
import Information from "@/components/information/information.component";
import Button from "@/components/ui/button/button.component";
import {
  ArrowForwardRounded,
  ArrowBackRounded,
  ArrowUpwardRounded,
  ArrowDownwardRounded,
} from "@mui/icons-material";
import styles from "./page.module.scss";
import Link from "next/link";
import { useSharedContext } from "@/context/SharedContext";

export default function AnalyticsPage() {
  const gotData = useRef(false);
  const [shownPages, setShownPages] = useState<any[]>([]);
  const [shownKeywords, setShownKeywords] = useState<any[]>([]);
  const [pagesAmount, setPagesAmount] = useState([0, 10]);
  const [keywordsAmount, setKeywordsAmount] = useState([0, 10]);
  const [chartType, setChartType] = useState("impressions");
  const [role, setRole] = useState("");
  const [keywordSorting, setKeywordSorting] = useState("clicks");
  const [pagesSorting, setPagesSorting] = useState("clicks");
  const { pagesData, webData, queryData, currentUrl } = useSharedContext();

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    if (!gotData.current) {
      if (role) {
        setRole(role);
      }
    }
  }, [gotData.current]);

  useEffect(() => {
    if (pagesData && pagesData.length > 0) {
      showPages(sortPages(pagesData));
    }
  }, [pagesData, pagesAmount, pagesSorting]);

  useEffect(() => {
    if (queryData && queryData.length > 0) {
      showKeywords(sortKeywords(queryData));
    }
  }, [queryData, keywordsAmount, keywordSorting]);

  function showPages(pages: any) {
    let array: any[] = [];
    for (let x = pagesAmount[0]; x < pagesAmount[1] && x < pages.length; x++) {
      array.push(pages[x]);
    }
    setShownPages(array);
  }

  function showKeywords(keywords: any) {
    let array: any[] = [];
    for (
      let x = keywordsAmount[0];
      x < keywordsAmount[1] && x < keywords.length;
      x++
    ) {
      array.push(keywords[x]);
    }
    setShownKeywords(array);
  }

  function sortKeywords(array: any) {
    if (keywordSorting == "position") {
      return array.sort((a: any, b: any) => a.position - b.position);
    } else if (keywordSorting == "impressions") {
      return array.sort((a: any, b: any) => b.impressions - a.impressions);
    } else if (keywordSorting == "ctr") {
      return array.sort((a: any, b: any) => b.ctr - a.ctr);
    } else {
      return array.sort((a: any, b: any) => b.clicks - a.clicks);
    }
  }

  function sortPages(array: any) {
    if (pagesSorting == "impressions") {
      return array.sort((a: any, b: any) => b.impressions - a.impressions);
    } else if (pagesSorting == "ctr") {
      return array.sort((a: any, b: any) => b.ctr - a.ctr);
    } else {
      return array.sort((a: any, b: any) => b.clicks - a.clicks);
    }
  }

  return (
    <InnerWrapper className={styles.analyticsWrapper}>
      <PageTitle
        title={"Website analytics"}
        information={
          "Website Analytics involves tracking and analyzing web traffic data to understand user behavior, improve site performance, and optimize content for better engagement and conversion rates. The entirety of our data and analytics infrastructure relies exclusively on Google's platform."
        }
        smallTitle="(Last month)"
      />
      {role != "guest" && role != "unauthorized" && (
        <div
          className={classNames(styles.innerAnalytics, "scrollbar noMargin")}
        >
          <DomainStatistics />
          {pagesData && (
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
                <LineChart data={webData} type={chartType} />
              </div>
              <div className={styles.analyticsItem}>
                <div className={styles.titleWrapper}>
                  <h3>Pages</h3>
                  <div className={styles.tableButtons}>
                    {pagesAmount[0] > 0 && (
                      <Button
                        type={"textOnly"}
                        onClick={() =>
                          setPagesAmount([
                            pagesAmount[0] - 10,
                            pagesAmount[1] - 10,
                          ])
                        }
                      >
                        <ArrowBackRounded />
                        <p>Prev.</p>
                      </Button>
                    )}
                    {pagesAmount[1] < pagesData.length && (
                      <Button
                        type={"textOnly"}
                        onClick={() =>
                          setPagesAmount([pagesAmount[1], pagesAmount[1] + 10])
                        }
                      >
                        <p>Next</p>
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
                    <div
                      className={classNames(
                        styles.item,
                        styles.clicks,
                        pagesSorting == "clicks" && styles.sorting
                      )}
                      onClick={() => setPagesSorting("clicks")}
                    >
                      <ArrowDownwardRounded />
                      <p>Clicks</p>
                    </div>
                    <div
                      className={classNames(
                        styles.item,
                        styles.impressions,
                        pagesSorting == "impressions" && styles.sorting
                      )}
                      onClick={() => setPagesSorting("impressions")}
                    >
                      <ArrowDownwardRounded />
                      <p>Impressions</p>
                    </div>
                    <div
                      className={classNames(
                        styles.item,
                        styles.ctr,
                        pagesSorting == "ctr" && styles.sorting
                      )}
                      onClick={() => setPagesSorting("ctr")}
                    >
                      <ArrowDownwardRounded />
                      <p>CTR</p>
                    </div>
                  </div>
                  {pagesData.length > 0 &&
                    shownPages.map((page: any) => (
                      <div className={styles.row} key={page.keys[0]}>
                        <div className={classNames(styles.item, styles.page)}>
                          <Link href={page.keys[0]} target="_blank">
                            {page.keys[0]
                              .replace(`https://`, "")
                              .replace(`www.`, "")
                              .replace(currentUrl, "")}
                          </Link>
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
              </div>
            </div>
          )}
          {queryData && (
            <div className={styles.analyticsItem}>
              <div className={styles.titleWrapper}>
                <h3>Keyword performance</h3>
                <div className={styles.tableButtons}>
                  {keywordsAmount[0] > 0 && (
                    <Button
                      type={"textOnly"}
                      onClick={() =>
                        setKeywordsAmount([
                          keywordsAmount[0] - 10,
                          keywordsAmount[1] - 10,
                        ])
                      }
                    >
                      <ArrowBackRounded />
                      <p>Prev.</p>
                    </Button>
                  )}
                  {keywordsAmount[1] < queryData.length && (
                    <Button
                      type={"textOnly"}
                      onClick={() =>
                        setKeywordsAmount([
                          keywordsAmount[1],
                          keywordsAmount[1] + 10,
                        ])
                      }
                    >
                      <p>Next</p>
                      <ArrowForwardRounded />
                    </Button>
                  )}
                </div>
              </div>
              <div className={classNames(styles.pagesTable, styles.keywords)}>
                <div className={classNames(styles.firstRow, styles.row)}>
                  <div className={classNames(styles.item, styles.page)}>
                    <p>Keyword</p>
                  </div>
                  <div
                    className={classNames(
                      styles.item,
                      styles.position,
                      keywordSorting == "position" && styles.sorting
                    )}
                    onClick={() => setKeywordSorting("position")}
                  >
                    <ArrowUpwardRounded />
                    <p>Avg. position</p>
                  </div>
                  <div
                    className={classNames(
                      styles.item,
                      styles.clicks,
                      keywordSorting == "clicks" && styles.sorting
                    )}
                    onClick={() => setKeywordSorting("clicks")}
                  >
                    <ArrowDownwardRounded />
                    <p>Clicks</p>
                  </div>
                  <div
                    className={classNames(
                      styles.item,
                      styles.impressions,
                      keywordSorting == "impressions" && styles.sorting
                    )}
                    onClick={() => setKeywordSorting("impressions")}
                  >
                    <ArrowDownwardRounded />
                    <p>Impressions</p>
                  </div>
                  <div
                    className={classNames(
                      styles.item,
                      styles.ctr,
                      keywordSorting == "ctr" && styles.sorting
                    )}
                    onClick={() => setKeywordSorting("ctr")}
                  >
                    <ArrowDownwardRounded />
                    <p>CTR</p>
                  </div>
                </div>
                {queryData.length > 0 &&
                  shownKeywords.map((keyword: any) => (
                    <div className={styles.row} key={keyword.keys[0]}>
                      <div className={classNames(styles.item, styles.page)}>
                        <p>{keyword.keys[0]}</p>
                      </div>
                      <div className={classNames(styles.item, styles.position)}>
                        <p>{keyword.position.toFixed(1)}</p>
                      </div>
                      <div className={classNames(styles.item, styles.clicks)}>
                        <p>{keyword.clicks}</p>
                      </div>
                      <div
                        className={classNames(styles.item, styles.impressions)}
                      >
                        <p>{keyword.impressions}</p>
                      </div>
                      <div className={classNames(styles.item, styles.ctr)}>
                        <p>{(keyword.ctr * 100).toFixed(1)} %</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
      {role == "guest" && (
        <h5>You need to log in with Google for this feature</h5>
      )}
      {role == "unauthorized" && (
        <h5>
          You need to enable this domain in your Google Search console. Check{" "}
          <a href="https://www.youtube.com/watch?v=OT7gotTCR7s" target="_blank">here</a> how to
          do this.
        </h5>
      )}
    </InnerWrapper>
  );
}
