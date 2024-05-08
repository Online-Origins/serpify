import styles from "./table.module.scss";
import classNames from "classnames";

import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";

import Information from "@/components/information/information.component";
import IndicationIcon from "../indication-icon/indication-icon.component";
import Selector from "../ui/selector/selector.component";

export default function Table({
  shownKeywords,
  sorting,
  setSorting,
  selectedKeywords,
  setSelectedKeywords,
  searchVolume,
  potentialIndex,
}: {
  shownKeywords: any;
  sorting?: any;
  setSorting?: any;
  selectedKeywords?: any;
  setSelectedKeywords?: any;
  searchVolume?: any;
  potentialIndex?: any;
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

  return (
    <div className={styles.keywordsTable}>
      <div className={classNames(styles.row, styles.topRow)}>
        <div className={classNames(styles.item, styles.select)}>
          <p>Select</p>
        </div>
        <div className={classNames(styles.tableContent, "scrollbar")}>
          {shownKeywords.length > 0 ? 
            shownKeywords.map((keyword: any) => (
              <div className={styles.row} key={keyword.text}>
                <div className={classNames(styles.item, styles.select)}>
                  <Selector
                    group={selectedKeywords}
                    item={keyword.text}
                    selecting={(value: any) => selecting(value)}
                  />
                </div>
                <div className={classNames(styles.item, styles.keyword)}>
                  <p>{keyword.text}</p>
                </div>
                <div className={classNames(styles.item, styles.searchVolume)}>
                  <p>
                    {searchVolume(
                      keyword.keywordMetrics.avgMonthlySearches
                    )}
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
                    )
                  }
                  </p>
                </div>
              </div>
            ))
           : <p>Could not find any matching keywords. please try again.</p>
          }
        </div>
      </div>
    </div>
  );
}
