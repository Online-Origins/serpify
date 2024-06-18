import classNames from "classnames";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import Information from "@/components/information/information.component";
import IndicationIcon from "../indication-icon/indication-icon.component";
import Selector from "../ui/selector/selector.component";
import { useEffect, useRef, useState } from "react";
import styles from "./table.module.scss";

export default function Table({
  shownKeywords,
  sorting,
  setSorting,
  selectedKeywords,
  setSelectedKeywords,
  searchVolume,
  potentialIndex,
  searchSubjects,
}: {
  shownKeywords: any;
  sorting?: any;
  setSorting?: any;
  selectedKeywords?: any;
  setSelectedKeywords?: any;
  searchVolume?: any;
  potentialIndex?: any;
  searchSubjects?: any;
}) {
  const tableRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const parentScrollRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(false);

  // Update the selection when a user clicks the select button
  function selecting(clickedKeyword: any) {
    if (
      !selectedKeywords.find(
        (keyword: any) => keyword.text == clickedKeyword.text
      )
    ) {
      setSelectedKeywords([...selectedKeywords, clickedKeyword]);
    } else {
      setSelectedKeywords(
        selectedKeywords.filter(
          (index: any) => index.text != clickedKeyword.text
        )
      );
    }
  }

  // Convert the value to an indexation
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
  
  // Convert the value to an indexation specific for the search volume
  function searchVolumeIndication(googleVolume: number) {
    switch (true) {
      case googleVolume < 100:
        return "low";
      case googleVolume >= 100 && googleVolume < 1000:
        return "medium";
      case googleVolume >= 1000 && googleVolume < 10000:
        return "high";
      case googleVolume >= 10000:
        return "extreme";
      default:
        return "low";
    }
  }

  // Reset the scrollposition when the keywords to show are changed
  useEffect(() => {
    if (shownKeywords.length > 0 && parentScrollRef.current) {
      parentScrollRef.current.scrollTop = 0;
    }
  }, [shownKeywords]);

  // Check if scroll is neccessary
  useEffect(() => {
    if (shownKeywords.length > 0 && scrollRef.current && tableRef.current) {
      const scrollRefHeight = scrollRef.current.offsetHeight;
      const tableRefHeight = tableRef.current.offsetHeight;

      // Check if the height of scrollRef is greater than the height of tableRef
      if (scrollRefHeight > tableRefHeight) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    }
  }, [shownKeywords]);

  return (
    <div className={styles.keywordsTable} ref={tableRef}>
      <div className={classNames(styles.row, styles.topRow)}>
        <div className={classNames(styles.item, styles.select)}>
          <p>Select</p>
        </div>
        <div
          onClick={() =>
            setSorting(sorting == "keyword" ? "keywordRev" : "keyword")
          }
          className={classNames(
            styles.item,
            styles.keyword,
            sorting == "keyword" && styles.activeSort,
            sorting == "keywordRev" && styles.activeSortRev
          )}
        >
          <p>Keyword</p>
          <ArrowDownwardRoundedIcon />
        </div>
        <div
          onClick={() =>
            setSorting(
              sorting == "searchVolume" ? "searchVolumeRev" : "searchVolume"
            )
          }
          className={classNames(
            styles.item,
            styles.searchVolume,
            sorting == "searchVolume" && styles.activeSort,
            sorting == "searchVolumeRev" && styles.activeSortRev
          )}
        >
          <ArrowDownwardRoundedIcon />
          <p>Search volume</p>
          <Information information="The number of times, on average, that users enter a particular search query into a search engine each month." />
        </div>
        <div
          onClick={() =>
            setSorting(
              sorting == "competition" ? "competitionRev" : "competition"
            )
          }
          className={classNames(
            styles.item,
            styles.competition,
            sorting == "competition" && styles.activeSort,
            sorting == "competitionRev" && styles.activeSortRev
          )}
        >
          <ArrowUpwardRoundedIcon />
          <p>Competition</p>
          <Information information="A difficulty metric representing how easy or difficult it will be to rank on Google's organic search results for a specific keyword." />
        </div>
        <div
          onClick={() =>
            setSorting(sorting == "potential" ? "potentialRev" : "potential")
          }
          className={classNames(
            styles.item,
            styles.potential,
            sorting == "potential" && styles.activeSort,
            sorting == "potentialRev" && styles.activeSortRev
          )}
        >
          <ArrowDownwardRoundedIcon />
          <p>Potential</p>
          <Information information="The ability of a particular keyword or key phrase to drive traffic, engagement, or conversions." />
        </div>
      </div>
      <div
        className={classNames(
          styles.tableContentWrapper,
          "scrollbar",
          scroll && styles.scroll
        )}
        ref={parentScrollRef}
      >
        <div className={styles.tableContent} ref={scrollRef}>
          {shownKeywords.length > 0 ? (
            shownKeywords.map((keyword: any) => (
              <div className={styles.row} key={keyword.text}>
                <div className={classNames(styles.item, styles.select)}>
                  <Selector
                    group={selectedKeywords}
                    item={keyword}
                    selecting={(value: any) => selecting(value)}
                  />
                </div>
                <div className={classNames(styles.item, styles.keyword)}>
                  <p>{keyword.text}</p>
                  {searchSubjects && searchSubjects.includes(keyword.text) ? (
                    <p className={styles.subject}>Subject</p>
                  ) : null}
                </div>
                <div className={classNames(styles.item, styles.searchVolume)}>
                  <p>
                    {searchVolume(keyword.keywordMetrics.avgMonthlySearches)}
                  </p>
                  <IndicationIcon
                    indication={searchVolumeIndication(
                      keyword.keywordMetrics.avgMonthlySearches
                    )}
                  />
                </div>
                <div className={classNames(styles.item, styles.competition)}>
                  <p>{keyword.keywordMetrics.competitionIndex}</p>
                  <IndicationIcon
                    indication={Indexation(
                      100 - keyword.keywordMetrics.competitionIndex
                    )}
                    competition
                  />
                </div>
                <div className={classNames(styles.item, styles.potential)}>
                  <p>
                    {Math.ceil(
                      potentialIndex(
                        keyword.keywordMetrics.avgMonthlySearches,
                        keyword.keywordMetrics.competitionIndex
                      )
                    ).toString()}
                  </p>
                  <IndicationIcon
                    indication={Indexation(
                      100 -
                        Math.ceil(
                          potentialIndex(
                            keyword.keywordMetrics.avgMonthlySearches,
                            keyword.keywordMetrics.competitionIndex
                          )
                        )
                    )}
                  />
                </div>
              </div>
            ))
          ) : (
            <p>Could not find any matching keywords. please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
