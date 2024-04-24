import PageTitle from "@/components/page-title/page-title.component";
import Information from "@/components/information/information.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";

import { getGoogleKeywords } from "@/app/api/googleKeywords/route";
import { supabase } from "@/app/api/supabaseClient/route";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import Table from "@/components/table/table.component";
import Button from "@/components/ui/button/button.component";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";
import Selector from "@/components/ui/selector/selector.component";

export default function KeywordSearching({
  filters,
  setPages,
  setFilters,
}: {
  filters: any;
  setPages: any;
  setFilters: any;
}) {
  const [generatedKeywords, setGeneratedKeywords] = useState<any[]>([]);
  const [shownKeywords, setShownKeywords] = useState<any[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<any[]>([]);
  const [sorting, setSorting] = useState("potential");
  const [subjectInput, setSubjectInput] = useState("");
  const isKeywordsGenerated = useRef(false);
  const [loading, setLoading] = useState(false);
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [collections, setCollections] = useState<{ collection_name: string }[]>(
    []
  );
  const [collectionToSave, setCollectionToSave] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [keywordAmount, setKeywordAmount] = useState([0, 20]);

  useEffect(() => {
    getCollections();
  }, []);

  async function getCollections() {
    const { data } = await supabase
      .from("collections")
      .select("collection_name");
    if (data) {
      setCollections(data);
    }
  }

  // Generate keywords if the user filled in the subjects
  useEffect(() => {
    if (filters.subjects.length > 0 && !isKeywordsGenerated.current) {
      generateKeywords();
      isKeywordsGenerated.current = true;
    }
  }, [filters.subjects, generateKeywords]);

  // Generate keywords
  async function generateKeywords() {
    setLoading(true);
    try {
      // Connect with GPT api
      const response = await fetch("/api/generateKeywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: filters.subjects,
          language: filters.language,
          wordsLength: filters.keywordLength,
        }),
      });

      const data = await response.json();

      // Generate keywords and data with the Google Ads api
      const GoogleGeneratedKeywords = await getGoogleKeywords(
        [...filters.subjects, ...data.generatedKeywordsList],
        filters.language,
        filters.country
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

      // Add the potential to the keywords
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

      // Map the array to rename keywordIdeaMetrics property
      const keywordsWithRenamedMetrics = keywordsWithData.map(
        (keyword: any) => ({
          ...keyword,
          keywordMetrics: keyword.keywordIdeaMetrics,
        })
      );

      // Filter the keywords to only get keywords with metrics
      const filterWithUserValue = keywordsWithRenamedMetrics.filter(
        (keyword: any) =>
          keyword.keywordMetrics.avgMonthlySearches >= filters.volume[0].min &&
          keyword.keywordMetrics.avgMonthlySearches <= filters.volume[0].max &&
          keyword.keywordMetrics.competitionIndex >=
            filters.competition[0].min &&
          keyword.keywordMetrics.competitionIndex <=
            filters.competition[0].max &&
          keyword.keywordMetrics.potential >= filters.potential[0].min &&
          keyword.keywordMetrics.potential <= filters.potential[0].max
      );

      // Filter the keywords according to the length og the keywords
      const filterkeywordLength = filterWithUserValue.filter((keyword: any) => {
        const wordCount = keyword.text.split(" ").length;
        const isShortTail = filters.keywordLength.includes("shorttail");
        const isLongTail = filters.keywordLength.includes("longtail");

        if (isShortTail && !isLongTail) {
          return wordCount <= 3;
        } else if (!isShortTail && isLongTail) {
          return wordCount > 3;
        } else {
          return keyword;
        }
      });

      setGeneratedKeywords(filterkeywordLength);
      setLoading(false);

    } catch (error: any) {
      alert("Something went wrong. Please try again");
      setPages((prevPages: any) => {
        // Create a new array with all elements except the last one
        return prevPages.slice(0, -1);
      });
    }
  }

  // Sort and show the keywords when there are keywords generated
  useEffect(() => {
    if (generatedKeywords.length > 0) {
      sortKeywords();
      showKeywords();
    }
  }, [generatedKeywords]);

  // Sort the keywords if the sorting type changes
  useEffect(() => {
    sortKeywords();
  }, [sorting]);

  // Show keywords when keywordAmount changes
  useEffect(() => {
    showKeywords();
  }, [keywordAmount]);

  // Show an amount of keywords according to the "page"
  function showKeywords() {
    let array: any[] = [];
    for (
      let x = keywordAmount[0];
      x < keywordAmount[1] && x < generatedKeywords.length;
      x++
    ) {
      array.push(generatedKeywords[x]);
    }
    setShownKeywords(array);
  }

  // Sort the keywords on the sorting type
  function sortKeywords() {
    if (sorting == "potential") {
      generatedKeywords.sort(
        (a, b) => b.keywordMetrics.potential - a.keywordMetrics.potential
      );
    } else if (sorting == "competition") {
      generatedKeywords.sort(
        (a, b) =>
          a.keywordMetrics.competitionIndex - b.keywordMetrics.competitionIndex
      );
    } else if (sorting == "searchVolume") {
      generatedKeywords.sort(
        (a, b) =>
          b.keywordMetrics.avgMonthlySearches -
          a.keywordMetrics.avgMonthlySearches
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

  // Translate search volume to understandable text
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

  // Calculate the potential
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
  
  // Add new subjects to the filters with user input
  function addNewSubjects() {
    if (subjectInput != "") {
      const subjectArray = subjectInput.split(",");

      setFilters((prevState: any) => ({
        ...prevState,
        subjects: [...prevState.subjects, ...subjectArray],
      }));
      setSubjectInput("");
      isKeywordsGenerated.current = false;
    }
  }

  // Create a new collection with selected keywords
  async function createKeywordCollection() {
    const { error } = await supabase.from("collections").insert([
      {
        collection_name: collectionToSave,
        keywords: selectedKeywords,
        language: filters.language,
        country: filters.country,
      },
    ]);
    if (error) {
      console.log(error);
    } else {
      setPopUpOpen(false);
      setPages((prevState: any) => [...prevState, "collections"]);
    }
  }

  // Add a new collection to the list of collections when an user creates a new one
  function addNewCollection() {
    setCollections((prevState: any) => [
      ...prevState,
      { collection_name: newCollection },
    ]);
    setCollectionToSave(newCollection);
    setNewCollection("");
  }

  // Update the subject filters when the user deletes a subject
  function updateSubjectFilters(value: string) {
    if (filters.subjects.length > 1) {
      setFilters((prevState: any) => ({
        ...prevState,
        subjects: [
          ...prevState.subjects.filter((subject: string) => subject != value),
        ],
      }));
      isKeywordsGenerated.current = false;
    } else {
      alert("You need at least one subject to search");
    }
  }

  return (
    <InnerWrapper>
      <PageTitle
        title={"Search keywords"}
        goBack={() =>
          setPages((prevPages: any) => {
            return prevPages.slice(0, -1);
          })
        }
      />
      <div className={styles.filterWrapper}>
        <InputWrapper
          type="text"
          value={subjectInput}
          onChange={(value: any) => setSubjectInput(value)}
          className={styles.filterInput}
          currentValues={filters.subjects}
          changeCurrentValues={(value: string) => updateSubjectFilters(value)}
          onKeyDown={(e: any) => {
            if (e.key == "Enter" && subjectInput != "") {
              addNewSubjects();
            }
          }}
          placeholder="Search more subjects..."
          icon={
            <div onClick={() => addNewSubjects()}>
              <SearchRoundedIcon />
            </div>
          }
        />
        <h2>Filter</h2>
      </div>
      {!loading ? (
        <div className={styles.outerTableWrapper}>
          <Table
            shownKeywords={shownKeywords}
            sorting={sorting}
            setSorting={setSorting}
            selectedKeywords={selectedKeywords}
            setSelectedKeywords={setSelectedKeywords}
            searchVolume={searchVolume}
            potentialIndex={potentialIndex}
          />
          <div className={styles.buttonWrapper}>
            <Button
              type={"solid"}
              onClick={() => setPopUpOpen(true)}
              disabled={selectedKeywords.length == 0}
            >
              <p>Save to</p> <AddRoundedIcon />
            </Button>
            <div className={styles.amountButtons}>
              {keywordAmount[0] > 0 && (
                <Button
                  type={"textOnly"}
                  onClick={() =>
                    setKeywordAmount([
                      keywordAmount[0] - 20,
                      keywordAmount[1] - 20,
                    ])
                  }
                >
                  <ArrowBackRoundedIcon />
                  <p>Previous</p>
                </Button>
              )}
              {keywordAmount[1] < generatedKeywords.length && (
                <Button
                  type={"textOnly"}
                  onClick={() =>
                    setKeywordAmount([keywordAmount[1], keywordAmount[1] + 20])
                  }
                >
                  <p>Next</p>
                  <ArrowForwardRoundedIcon />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <h5>Loading...</h5>
      )}
      {popUpOpen && (
        <PopUpWrapper>
          <PopUp
            title={"Keyword research"}
            titleButtons={
              <Button type={"textOnly"} onClick={() => setPopUpOpen(false)}>
                <p>Close</p>
                <CloseRoundedIcon />
              </Button>
            }
            buttons={
              <Button
                type={"solid"}
                onClick={() => createKeywordCollection()}
                disabled={collectionToSave == ""}
              >
                <p>Save</p>
                <SaveOutlinedIcon />
              </Button>
            }
          >
            <div>
              {collections.map((collection) => (
                <div
                  key={collection.collection_name}
                  className={styles.collection}
                >
                  <Selector
                    group={collectionToSave}
                    item={collection.collection_name}
                    selecting={(value: any) => setCollectionToSave(value)}
                  />
                  <p>{collection.collection_name}</p>
                </div>
              ))}
              <div className={styles.newCollectionInput}>
                <span
                  className={styles.iconWrapper}
                  onClick={() => addNewCollection()}
                >
                  <AddRoundedIcon />
                </span>
                <input
                  type="text"
                  placeholder="Name of new collection"
                  value={newCollection}
                  onChange={(event) => setNewCollection(event.target.value)}
                />
              </div>
            </div>
          </PopUp>
        </PopUpWrapper>
      )}
    </InnerWrapper>
  );
}
