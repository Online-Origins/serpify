"use client";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import PageTitle from "@/components/page-title/page-title.component";
import { useEffect, useRef, useState } from "react";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";
import LineChart from "@/components/line-chart/line-chart.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import classNames from "classnames";
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
import { formatNumber } from "../utils/formatNumber/formatNumber";

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
  const {
    pagesData,
    webData,
    queryData,
    currentUrl,
    pagesDataPrev,
    webDataPrev,
    queryDataPrev,
    analyticsPeriod,
    setAnalyticsPeriod,
  } = useSharedContext();

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    if (!gotData.current) {
      if (role) {
        setRole(role);
      }
    }
  }, [gotData.current]);

  // Update pages to show when an other domain is chosen (when an other domain is chosen the pagesData will update), when the sorting is updated or when a user wants to see the next 10 pages
  useEffect(() => {
    if (pagesData && pagesData.length > 0) {
      showPages(sortPages(pagesData));
    }
  }, [pagesData, pagesAmount, pagesSorting]);

  // Update keywords to show when an other domain is chosen (when an other domain is chosen the queryData will update), when the sorting is updated or when a user wants to see the next 10 keywords
  useEffect(() => {
    if (queryData && queryData.length > 0) {
      showKeywords(sortKeywords(queryData));
    }
  }, [queryData, keywordsAmount, keywordSorting]);

  // Show a list of specific pages
  function showPages(pages: any) {
    let array: any[] = [];
    for (let x = pagesAmount[0]; x < pagesAmount[1] && x < pages.length; x++) {
      array.push(pages[x]);
    }
    setShownPages(array);
  }

  // Show a list of specific keywords
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

  // Sort the keywords
  function sortKeywords(array: any) {
    if (keywordSorting == "position") {
      return array.sort((a: any, b: any) => a.position - b.position);
    } else if (keywordSorting == "positionRev") {
      return array.sort((a: any, b: any) => b.position - a.position);
    } else if (keywordSorting == "impressions") {
      return array.sort((a: any, b: any) => b.impressions - a.impressions);
    } else if (keywordSorting == "impressionsRev") {
      return array.sort((a: any, b: any) => a.impressions - b.impressions);
    } else if (keywordSorting == "ctr") {
      return array.sort((a: any, b: any) => b.ctr - a.ctr);
    } else if (keywordSorting == "ctrRev") {
      return array.sort((a: any, b: any) => a.ctr - b.ctr);
    } else if (keywordSorting == "clicksRev") {
      return array.sort((a: any, b: any) => a.clicks - b.clicks);
    } else {
      return array.sort((a: any, b: any) => b.clicks - a.clicks);
    }
  }

  // Sort the pages
  function sortPages(array: any) {
    if (pagesSorting == "impressions") {
      return array.sort((a: any, b: any) => b.impressions - a.impressions);
    } else if (pagesSorting == "impressionsRev") {
      return array.sort((a: any, b: any) => a.impressions - b.impressions);
    } else if (pagesSorting == "ctr") {
      return array.sort((a: any, b: any) => b.ctr - a.ctr);
    } else if (pagesSorting == "ctrRev") {
      return array.sort((a: any, b: any) => a.ctr - b.ctr);
    } else if (pagesSorting == "clicksRev") {
      return array.sort((a: any, b: any) => a.clicks - b.clicks);
    } else {
      return array.sort((a: any, b: any) => b.clicks - a.clicks);
    }
  }

  function getDifference(item: any, previous: any, type: string): number {
    if (previous) {
      const previousItem = previous.find(
        (previousItem: any) => previousItem.keys[0] == item.keys[0]
      );
      if (previousItem) {
        return item[type] - previousItem[type];
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  return (
    <InnerWrapper className={styles.analyticsWrapper}>
      <PageTitle
        title={"Website analytics"}
        information={
          "Website analytics involves tracking and analyzing web traffic data to understand user behavior, improve site performance, and optimize content for better engagement and conversion rates. The entirety of our data and analytics infrastructure relies exclusively on Google's platform."
        }
        buttons={
          <InputWrapper
            className={styles.analyticsInput}
            type="dropdown"
            options={[
              "Last week",
              "Last 2 weeks",
              "Last month",
              "Last 6 months",
              "Last year"
            ]}
            value={analyticsPeriod}
            onChange={(value: string) => setAnalyticsPeriod(value)}
          />
        }
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
                <LineChart
                  data={webData}
                  type={chartType}
                  dataPrev={webDataPrev}
                />
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
                        pagesSorting == "clicks" && styles.sorting,
                        pagesSorting == "clicksRev" && styles.sortingRev
                      )}
                      onClick={() =>
                        setPagesSorting(
                          pagesSorting == "clicks" ? "clicksRev" : "clicks"
                        )
                      }
                    >
                      <ArrowDownwardRounded />
                      <p>Clicks</p>
                    </div>
                    <div
                      className={classNames(
                        styles.item,
                        styles.impressions,
                        pagesSorting == "impressions" && styles.sorting,
                        pagesSorting == "impressionsRev" && styles.sortingRev
                      )}
                      onClick={() =>
                        setPagesSorting(
                          pagesSorting == "impressions"
                            ? "impressionsRev"
                            : "impressions"
                        )
                      }
                    >
                      <ArrowDownwardRounded />
                      <p>Impressions</p>
                    </div>
                    <div
                      className={classNames(
                        styles.item,
                        styles.ctr,
                        pagesSorting == "ctr" && styles.sorting,
                        pagesSorting == "ctrRev" && styles.sortingRev
                      )}
                      onClick={() =>
                        setPagesSorting(
                          pagesSorting == "ctr" ? "ctrRev" : "ctr"
                        )
                      }
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
                              .replace(`http://`, "")
                              .replace(`www.`, "")
                              .replace(currentUrl, "")}
                          </Link>
                        </div>
                        <div className={classNames(styles.item, styles.clicks)}>
                          {getDifference(page, pagesDataPrev, "clicks") !=
                            0 && (
                            <p
                              className={
                                getDifference(page, pagesDataPrev, "clicks") < 0
                                  ? styles.bad
                                  : styles.good
                              }
                            >
                              {formatNumber(
                                getDifference(page, pagesDataPrev, "clicks")
                              )}
                              {getDifference(page, pagesDataPrev, "clicks") <
                              0 ? (
                                <ArrowDownwardRounded />
                              ) : (
                                <ArrowUpwardRounded />
                              )}
                            </p>
                          )}
                          <p>{formatNumber(page.clicks)}</p>
                        </div>
                        <div
                          className={classNames(
                            styles.item,
                            styles.impressions
                          )}
                        >
                          {getDifference(page, pagesDataPrev, "impressions") !=
                            0 && (
                            <p
                              className={
                                getDifference(
                                  page,
                                  pagesDataPrev,
                                  "impressions"
                                ) < 0
                                  ? styles.bad
                                  : styles.good
                              }
                            >
                              {formatNumber(
                                getDifference(
                                  page,
                                  pagesDataPrev,
                                  "impressions"
                                )
                              )}
                              {getDifference(
                                page,
                                pagesDataPrev,
                                "impressions"
                              ) < 0 ? (
                                <ArrowDownwardRounded />
                              ) : (
                                <ArrowUpwardRounded />
                              )}
                            </p>
                          )}
                          <p>{formatNumber(page.impressions)}</p>
                        </div>
                        <div className={classNames(styles.item, styles.ctr)}>
                          {!(getDifference(page, pagesDataPrev, "ctr") * 100)
                            .toFixed(1)
                            .includes("0.0") && (
                            <p
                              className={
                                getDifference(page, pagesDataPrev, "ctr") < 0
                                  ? styles.bad
                                  : styles.good
                              }
                            >
                              {(
                                getDifference(page, pagesDataPrev, "ctr") * 100
                              ).toFixed(1)}
                              {getDifference(page, pagesDataPrev, "ctr") < 0 ? (
                                <ArrowDownwardRounded />
                              ) : (
                                <ArrowUpwardRounded />
                              )}
                            </p>
                          )}
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
                      keywordSorting == "position" && styles.sorting,
                      keywordSorting == "positionRev" && styles.sortingRev
                    )}
                    onClick={() =>
                      setKeywordSorting(
                        keywordSorting == "position"
                          ? "positionRev"
                          : "position"
                      )
                    }
                  >
                    <ArrowUpwardRounded />
                    <p>Avg. position</p>
                  </div>
                  <div
                    className={classNames(
                      styles.item,
                      styles.clicks,
                      keywordSorting == "clicks" && styles.sorting,
                      keywordSorting == "clicksRev" && styles.sortingRev
                    )}
                    onClick={() =>
                      setKeywordSorting(
                        keywordSorting == "clicks" ? "clicksRev" : "clicks"
                      )
                    }
                  >
                    <ArrowDownwardRounded />
                    <p>Clicks</p>
                  </div>
                  <div
                    className={classNames(
                      styles.item,
                      styles.impressions,
                      keywordSorting == "impressions" && styles.sorting,
                      keywordSorting == "impressionsRev" && styles.sortingRev
                    )}
                    onClick={() =>
                      setKeywordSorting(
                        keywordSorting == "impressions"
                          ? "impressionsRev"
                          : "impressions"
                      )
                    }
                  >
                    <ArrowDownwardRounded />
                    <p>Impressions</p>
                  </div>
                  <div
                    className={classNames(
                      styles.item,
                      styles.ctr,
                      keywordSorting == "ctr" && styles.sorting,
                      keywordSorting == "ctrRev" && styles.sortingRev
                    )}
                    onClick={() =>
                      setKeywordSorting(
                        keywordSorting == "ctr" ? "ctrRev" : "ctr"
                      )
                    }
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
                        {(getDifference(keyword, queryDataPrev, "position").toFixed(1).replace("-", "")) !=
                          "0.0" && (
                          <p
                            className={
                              getDifference(
                                keyword,
                                queryDataPrev,
                                "position"
                              ) > 0
                                ? styles.bad
                                : styles.good
                            }
                          >
                            {getDifference(
                              keyword,
                              queryDataPrev,
                              "position"
                            ).toFixed(1)}
                            {getDifference(keyword, queryDataPrev, "position") <
                            0 ? (
                              <ArrowDownwardRounded />
                            ) : (
                              <ArrowUpwardRounded />
                            )}
                          </p>
                        )}
                        <p>{keyword.position.toFixed(1)}</p>
                      </div>
                      <div className={classNames(styles.item, styles.clicks)}>
                        {getDifference(keyword, queryDataPrev, "clicks") !=
                          0 && (
                          <p
                            className={
                              getDifference(keyword, queryDataPrev, "clicks") <
                              0
                                ? styles.bad
                                : styles.good
                            }
                          >
                            {formatNumber(
                              getDifference(keyword, queryDataPrev, "clicks")
                            )}
                            {getDifference(keyword, queryDataPrev, "clicks") <
                            0 ? (
                              <ArrowDownwardRounded />
                            ) : (
                              <ArrowUpwardRounded />
                            )}
                          </p>
                        )}
                        <p>{formatNumber(keyword.clicks)}</p>
                      </div>
                      <div
                        className={classNames(styles.item, styles.impressions)}
                      >
                        {getDifference(keyword, queryDataPrev, "impressions") !=
                          0 && (
                          <p
                            className={
                              getDifference(
                                keyword,
                                queryDataPrev,
                                "impressions"
                              ) < 0
                                ? styles.bad
                                : styles.good
                            }
                          >
                            {formatNumber(
                              getDifference(
                                keyword,
                                queryDataPrev,
                                "impressions"
                              )
                            )}
                            {getDifference(
                              keyword,
                              queryDataPrev,
                              "impressions"
                            ) < 0 ? (
                              <ArrowDownwardRounded />
                            ) : (
                              <ArrowUpwardRounded />
                            )}
                          </p>
                        )}
                        <p>{formatNumber(keyword.impressions)}</p>
                      </div>
                      <div className={classNames(styles.item, styles.ctr)}>
                        {!(getDifference(keyword, queryDataPrev, "ctr") * 100)
                          .toFixed(1)
                          .includes("0.0") && (
                          <p
                            className={
                              getDifference(keyword, queryDataPrev, "ctr") < 0
                                ? styles.bad
                                : styles.good
                            }
                          >
                            {(
                              getDifference(keyword, queryDataPrev, "ctr") * 100
                            ).toFixed(1)}
                            {getDifference(keyword, queryDataPrev, "ctr") <
                            0 ? (
                              <ArrowDownwardRounded />
                            ) : (
                              <ArrowUpwardRounded />
                            )}
                          </p>
                        )}
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
    </InnerWrapper>
  );
}
