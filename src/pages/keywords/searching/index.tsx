import PageTitle from "@/components/page-title/page-title.component";
import styles from "./index.module.scss";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import { SetStateAction, useEffect, useRef, useState } from "react";
import classNames from "classnames";

import { getGoogleKeywords } from "@/app/api/googleKeywords/route";
import TextInput from "@/components/ui/text-input/text-input.component";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";

export default function KeywordSearching({
  filters,
  setPages,
  setFilters,
}: {
  filters: any;
  setPages: any;
  setFilters: any;
}) {
  const [aiKeywords, setAiKeywords] = useState([]);
  const [generatedKeywords, setGeneratedKeywords] = useState<any[]>([]);
  const [shownKeywords, setShownKeywords] = useState<any[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<any[]>([]);

  const [sorting, setSorting] = useState("potential");

  const isKeywordsGenerated = useRef(false);

  // Generate keywords if the user filled in the subjects
  useEffect(() => {
    if (filters.subjects.length > 0 && !isKeywordsGenerated.current) {
      generateKeywords();
      isKeywordsGenerated.current = true;
    }
  }, [filters.subjects, generateKeywords]);

  async function generateKeywords() {
    try {
      const response = await fetch("/api/generateKeywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: filters.subjects,
          language: "Nederlands",
          wordsLength: ["shorttail", "longtail"],
        }),
      });

      const data = await response.json();

      const GoogleGeneratedKeywords = await getGoogleKeywords(
        [...filters.subjects, ...data.generatedKeywordsList],
        "1010" // Dutch language id
      );

      // Filter the keywords with data
      const filteredKeywords = GoogleGeneratedKeywords.filter(
        (keyword: any) =>
          keyword.hasOwnProperty("keywordIdeaMetrics") &&
          keyword.keywordIdeaMetrics.hasOwnProperty("avgMonthlySearches") &&
          keyword.keywordIdeaMetrics.hasOwnProperty("competitionIndex") &&
          keyword.keywordIdeaMetrics.avgMonthlySearches !== null &&
          keyword.keywordIdeaMetrics.competitionIndex !== null
      );

      const keywordsWithData = filteredKeywords.map((keywordData: any) => {
        let potential = null; // default value if keywordIdeaMetrics doesn't exist

        if (keywordData.keywordIdeaMetrics) {
          potential = potentialIndex(
            keywordData.keywordIdeaMetrics.avgMonthlySearches,
            keywordData.keywordIdeaMetrics.competitionIndex
          );

          // Add potential to keywordIdeaMetrics object
          keywordData.keywordIdeaMetrics.potential = potential;
        }

        return keywordData;
      });

      setGeneratedKeywords(keywordsWithData);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  }

  useEffect(() => {
    if (generatedKeywords.length > 0) {
      sortKeywords();
      showKeywords();
    }
  }, [generatedKeywords]);

  useEffect(() => {
    sortKeywords();
  }, [sorting]);

  function showKeywords() {
    let array: any[] = [];
    for (let x = 0; x < 20 && x < generatedKeywords.length; x++) {
      array.push(generatedKeywords[x]);
    }
    setShownKeywords(array);
  }

  function sortKeywords() {
    if (sorting == "potential") {
      generatedKeywords.sort(
        (a, b) =>
          b.keywordIdeaMetrics.potential - a.keywordIdeaMetrics.potential
      );
    } else if (sorting == "competition") {
      generatedKeywords.sort(
        (a, b) =>
          a.keywordIdeaMetrics.competitionIndex -
          b.keywordIdeaMetrics.competitionIndex
      );
    } else if (sorting == "searchVolume") {
      generatedKeywords.sort(
        (a, b) =>
          b.keywordIdeaMetrics.avgMonthlySearches -
          a.keywordIdeaMetrics.avgMonthlySearches
      );
    } else {
      generatedKeywords.sort((a, b) => {
        // Compare the text values
        if (a.text < b.text) {
          return -1;
        } else if (a.text > b.text) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    showKeywords();
  }

  function searchVolume(googleVolume: number) {
    switch (true) {
      case googleVolume >= 10 && googleVolume < 100:
        return "10 - 100";
      case googleVolume >= 100 && googleVolume < 1000:
        return "100 - 1K";
      case googleVolume >= 1000 && googleVolume < 10000:
        return "1K - 10K";
      case googleVolume >= 10000 && googleVolume < 100000:
        return "10K - 100K";
      default:
        return googleVolume;
    }
  }

  function competitionIndex(competitionIndex: number) {
    switch (true) {
      case competitionIndex >= 0 && competitionIndex < 25:
        return "extreme";
      case competitionIndex >= 25 && competitionIndex < 50:
        return "high";
      case competitionIndex >= 50 && competitionIndex < 75:
        return "medium";
      case competitionIndex >= 75 && competitionIndex < 100:
        return "low";
      default:
        return competitionIndex;
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

  function selecting(clickedKeyword: string) {
    if (!selectedKeywords.includes(clickedKeyword)) {
      setSelectedKeywords([...selectedKeywords, clickedKeyword]);
    } else {
      setSelectedKeywords(
        selectedKeywords.filter((index) => index !== clickedKeyword)
      );
    }
  }

  return (
    <InnerWrapper>
      <PageTitle
        title={"Search keywords"}
        goBack={() =>
          setPages((prevPages: any) => {
            // Create a new array with all elements except the last one
            return prevPages.slice(0, -1);
          })
        }
      />
      <div className={styles.filterWrapper}>
        <TextInput
          onChange={(value: any) => console.log(value)}
          className={styles.filterInput}
          currentValues={filters.subjects}
          icon={<SearchRoundedIcon />}
        />
        <h2>Filter</h2>
      </div>
      <div className={styles.keywordsTable}>
        <div className={styles.row}>
          <div className={classNames(styles.item, styles.select)}>
            <p>Select</p>
          </div>
          <div
            onClick={() => setSorting("keyword")}
            className={classNames(styles.item, styles.keyword)}
          >
            <p>Keyword</p>
            {sorting == "keyword" && <ArrowDownwardRoundedIcon />}
          </div>
          <div
            onClick={() => setSorting("searchVolume")}
            className={classNames(styles.item, styles.searchVolume)}
          >
            {sorting == "searchVolume" && <ArrowDownwardRoundedIcon />}
            <p>Search volume</p>
          </div>
          <div
            onClick={() => setSorting("competition")}
            className={classNames(styles.item, styles.competition)}
          >
            {sorting == "competition" && <ArrowUpwardRoundedIcon />}
            <p>Competition</p>
          </div>
          <div
            onClick={() => setSorting("potential")}
            className={classNames(styles.item, styles.potential)}
          >
            {sorting == "potential" && <ArrowDownwardRoundedIcon />}
            <p>Potential</p>
          </div>
        </div>
        {shownKeywords.length > 0 ? (
          shownKeywords.map((keyword) => (
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
                  {searchVolume(keyword.keywordIdeaMetrics.avgMonthlySearches)}
                  {/* {keyword.keywordIdeaMetrics.avgMonthlySearches} */}
                </p>
              </div>
              <div className={classNames(styles.item, styles.competition)}>
                <p>{keyword.keywordIdeaMetrics.competitionIndex}</p>
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
              </div>
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </InnerWrapper>
  );
}
