import styles from "./table.module.scss";
import classNames from "classnames";
import { useState } from "react";

import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";

import Information from "@/components/information/information.component";
import IndicationIcon from "../indication-icon/indication-icon.component";

export default function Table({
  shownKeywords,
  sorting,
  setSorting,
  selectedKeywords,
  setSelectedKeywords,
  searchVolume,
  potentialIndex,
  small,
}: {
  shownKeywords: any;
  sorting: any;
  setSorting: any;
  selectedKeywords: any;
  setSelectedKeywords: any;
  searchVolume: any;
  potentialIndex: any;
  small: boolean;
}) {
  function selecting(clickedKeyword: string) {
    if (!selectedKeywords.includes(clickedKeyword)) {
      setSelectedKeywords([...selectedKeywords, clickedKeyword]);
    } else {
      setSelectedKeywords(
        selectedKeywords.filter((index: any) => index !== clickedKeyword)
      );
    }
  }

  function Indexation(indexNum: number) {
    switch (true) {
      case indexNum >= 0 && indexNum < 25:
        return "extreme";
      case indexNum >= 25 && indexNum < 50:
        return "high";
      case indexNum >= 50 && indexNum < 75:
        return "medium";
      case indexNum >= 75 && indexNum < 100:
        return "low";
      default:
        return "low";
    }
  }

  function searchVolumeIndication(googleVolume: number) {
    switch (true) {
      case googleVolume >= 10 && googleVolume < 100:
        return "low";
      case googleVolume >= 100 && googleVolume < 1000:
        return "medium";
      case googleVolume >= 1000 && googleVolume < 10000:
        return "high";
      case googleVolume >= 10000 && googleVolume < 100000:
        return "extreme";
      default:
        return "low";
    }
  }

  if (!small) {
    return (
      <div className={styles.keywordsTable}>
        <div className={classNames(styles.row, styles.topRow)}>
          <div className={classNames(styles.item, styles.select)}>
            <p>Select</p>
          </div>
          <div
            onClick={() => setSorting("keyword")}
            className={classNames(
              styles.item,
              styles.keyword,
              sorting == "keyword" && styles.activeSort
            )}
          >
            <p>Keyword</p>
            <ArrowDownwardRoundedIcon />
          </div>
          <div
            onClick={() => setSorting("searchVolume")}
            className={classNames(
              styles.item,
              styles.searchVolume,
              sorting == "searchVolume" && styles.activeSort
            )}
          >
            <ArrowDownwardRoundedIcon />
            <p>Search volume</p>
            <Information information="The number of times, on average, that users enter a particular search query into a search engine each month." />
          </div>
          <div
            onClick={() => setSorting("competition")}
            className={classNames(
              styles.item,
              styles.competition,
              sorting == "competition" && styles.activeSort
            )}
          >
            <ArrowUpwardRoundedIcon />
            <p>Competition</p>
            <Information information="A difficulty metric representing how easy or difficult it will be to rank on Google's organic search results for a specific keyword." />
          </div>
          <div
            onClick={() => setSorting("potential")}
            className={classNames(
              styles.item,
              styles.potential,
              sorting == "potential" && styles.activeSort
            )}
          >
            <ArrowDownwardRoundedIcon />
            <p>Potential</p>
            <Information information="The ability of a particular keyword or key phrase to drive traffic, engagement, or conversions." />
          </div>
        </div>
        <div className={styles.tableContent}>
          {shownKeywords.length > 0 ? (
            shownKeywords.map((keyword: any) => (
              <div className={styles.row} key={keyword.text}>
                <div className={classNames(styles.item, styles.select)}>
                  <div
                    className={classNames(
                      styles.selector,
                      selectedKeywords.includes(keyword.text) && styles.selected
                    )}
                    onClick={() => selecting(keyword.text)}
                  ></div>
                </div>
                <div className={classNames(styles.item, styles.keyword)}>
                  <p>{keyword.text}</p>
                </div>
                <div className={classNames(styles.item, styles.searchVolume)}>
                  <p>
                    {searchVolume(
                      keyword.keywordIdeaMetrics.avgMonthlySearches
                    )}
                  </p>
                  <IndicationIcon
                    indication={searchVolumeIndication(
                      keyword.keywordIdeaMetrics.avgMonthlySearches
                    )}
                  />
                </div>
                <div className={classNames(styles.item, styles.competition)}>
                  <p>{keyword.keywordIdeaMetrics.competitionIndex}</p>
                  <IndicationIcon
                    indication={Indexation(
                      100 - keyword.keywordIdeaMetrics.competitionIndex
                    )}
                  />
                </div>
                <div className={classNames(styles.item, styles.potential)}>
                  <p>
                    {Math.ceil(
                      potentialIndex(
                        keyword.keywordIdeaMetrics.avgMonthlySearches,
                        keyword.keywordIdeaMetrics.competitionIndex
                      )
                    ).toString()}
                  </p>
                  <IndicationIcon
                    indication={Indexation(
                      100 -
                        Math.ceil(
                          potentialIndex(
                            keyword.keywordIdeaMetrics.avgMonthlySearches,
                            keyword.keywordIdeaMetrics.competitionIndex
                          )
                        )
                    )}
                  />
                </div>
              </div>
            ))
          ) : (
            <p>Couldn't find any matching keywords. please try again.</p>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.smallTable}>
        <h5>Small table</h5>
      </div>
    );
  }
}
