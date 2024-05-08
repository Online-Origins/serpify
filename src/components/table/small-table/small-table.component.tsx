import { getKeywordMetrics } from "@/app/api/keywordMetrics/route";
import styles from "./small-table.module.scss";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import IndicationIcon from "@/components/indication-icon/indication-icon.component";

export default function SmallTable({
  keywords,
  country,
  language,
}: {
  keywords: String[];
  country: String;
  language: String;
}) {
  const smallTableKeywords = getSmallTableKeywords();
  const [keywordsData, setKeywordsData] = useState<any>([]);
  const isGettingData = useRef(false);

  function getSmallTableKeywords() {
    let array = [];
    for (let x = 0; x < keywords.length && x < 5; x++) {
      array.push(keywords[x]);
    }
    return array;
  }

  useEffect(() => {
    if (!isGettingData.current) {
      getKeywordsData().then((data) => {
        const newData = data.map((keyword: any) => ({
          ...keyword,
          keywordMetrics: {
            ...keyword.keywordMetrics,
            potentialIndex: Math.ceil(
              potentialIndex(
                keyword.keywordMetrics.avgMonthlySearches,
                keyword.keywordMetrics.competitionIndex
              )
            ),
          },
        }));
        newData.sort(
          (a: any, b:any) =>
            b.keywordMetrics.potentialIndex - a.keywordMetrics.potentialIndex
        );
        setKeywordsData(newData);
      });
      isGettingData.current = true;
    }
  }, [getKeywordsData, potentialIndex]);

  async function getKeywordsData() {
    const data = await getKeywordMetrics(smallTableKeywords, language, country);
    return data;
  }

  function searchVolume(googleVolume: number) {
    switch (true) {
      case googleVolume >= 10 && googleVolume < 100:
        return "10 - 100";
      case googleVolume >= 100 && googleVolume < 1000:
        return "100 - 1K";
      case googleVolume >= 1000 && googleVolume < 10000:
        return "1K - 10K";
      case googleVolume >= 10000:
        return "10K - 100K";
      default:
        return googleVolume;
    }
  }

  function potentialIndex(googleVolume: number, competition: number) {
    const search = searchVolume(googleVolume);

    switch (true) {
      case search == "10 - 100":
        return (25 + (100 - competition)) / 2;
      case search == "100 - 1K":
        return (50 + (100 - competition)) / 2;
      case search == "1K - 10K":
        return (75 + (100 - competition)) / 2;
      case search == "10K - 100K":
        return (100 + (100 - competition)) / 2;
      default:
        return 0;
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
      case googleVolume >= 10000:
        return "extreme";
      default:
        return "low";
    }
  }

  return (
    <div className={styles.smallTable}>
      <div className={classNames(styles.row, styles.topRow)}>
        <div className={classNames(styles.item, styles.keyword)}>
          <p>Keyword</p>
        </div>
        <div className={classNames(styles.item, styles.searchVolume)}>
          <p>Search volume</p>
        </div>
        <div className={classNames(styles.item, styles.competition)}>
          <p>Competition</p>
        </div>
        <div className={classNames(styles.item, styles.potential)}>
          <p>Potential</p>
        </div>
      </div>
      {keywordsData
        ? keywordsData.map((keyword: any) => (
            <div className={styles.row} key={keyword.text}>
              <div className={classNames(styles.item, styles.keyword)}>
                <p>{keyword.text}</p>
              </div>
              <div className={classNames(styles.item, styles.searchVolume)}>
                <p>{searchVolume(keyword.keywordMetrics.avgMonthlySearches)}</p>
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
                <p>{keyword.keywordMetrics.potentialIndex.toString()}</p>

                <IndicationIcon
                  indication={Indexation(100 - keyword.keywordMetrics.potentialIndex)}
                />
              </div>
            </div>
          ))
        : ""}
    </div>
  );
}
