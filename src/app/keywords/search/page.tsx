"use client";
import PageTitle from "@/components/page-title/page-title.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/app/utils/supabaseClient/server";
import languageCodes from "@/json/language-codes.json";
import countryCodes from "@/json/country-codes.json";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import Table from "@/components/table/table.component";
import Button from "@/components/ui/button/button.component";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";
import Selector from "@/components/ui/selector/selector.component";
import { useRouter } from "next/navigation";
import CircularLoader from "@/components/circular-loader/circular-loader.component";
import styles from "./page.module.scss";

export default function KeywordSearching() {
  const router = useRouter();
  const filterInterface = {
    subjects: [""],
    volume: {
      min: 10,
      max: 100000,
    },

    competition: {
      min: 0,
      max: 100,
    },

    potential: {
      min: 0,
      max: 100,
    },

    country: "",
    language: "",
    keywordLength: [""],
  };
  const [filters, setFilters] = useState(filterInterface);
  const getFiltersRef = useRef(false);
  const [generatedKeywords, setGeneratedKeywords] = useState<any[]>([]);
  const [shownKeywords, setShownKeywords] = useState<any[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<any[]>([]);
  const [sorting, setSorting] = useState("potential");
  const [subjectInput, setSubjectInput] = useState("");
  const isKeywordsGenerated = useRef(false);
  const [loading, setLoading] = useState(false);
  const [collectionsPopUpOpen, setCollectionsPopUpOpen] = useState(false);
  const [collections, setCollections] = useState<{ collection_name: string }[]>(
    []
  );
  const [collectionToSave, setCollectionToSave] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [keywordAmount, setKeywordAmount] = useState([0, 15]);
  const [filterPopUpOpen, setFilterPopUpOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (showAlert) {
      if (newCollection != "") {
        setShowAlert(false);
      }
    }
  }, [showAlert, newCollection]);

  useEffect(() => {
    if (!getFiltersRef.current) {
      const filters = localStorage?.getItem("filters");
      if (filters != null) {
        setFilters(JSON.parse(filters));
      }
      getFiltersRef.current = true;
    }
  }, [getFiltersRef]);

  function searchVolumeFiltering(volume: number) {
    switch (true) {
      case volume == 10:
        return 0;
      case volume == 100:
        return 25;
      case volume == 1000:
        return 50;
      case volume == 10000:
        return 75;
      case volume == 100000:
        return 100;
      default:
        return 0;
    }
  }

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
    if (!isKeywordsGenerated.current && filters.subjects[0] != "") {
      generateKeywords();
      isKeywordsGenerated.current = true;
    }
  }, [filters.subjects]);

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

      const { generatedKeywordsList } = await response.json();

      const response2 = await fetch("/api/googleKeywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          keywords: Array.from(
            new Set([...filters.subjects, ...generatedKeywordsList.keywords])
          ),
          language: filters.language,
          country: filters.country,
        }),
      });
      const GoogleGeneratedKeywords = await response2.json();

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
          keyword.keywordMetrics.avgMonthlySearches >= filters.volume.min &&
          (filters.volume.max != 100000
            ? keyword.keywordMetrics.avgMonthlySearches <= filters.volume.max
            : true) &&
          keyword.keywordMetrics.competitionIndex >= filters.competition.min &&
          keyword.keywordMetrics.competitionIndex <= filters.competition.max &&
          keyword.keywordMetrics.potential >= filters.potential.min &&
          keyword.keywordMetrics.potential <= filters.potential.max
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
      isKeywordsGenerated.current = false;
      throw error;
    }
  }

  // Sort and show the keywords when there are keywords generated
  useEffect(() => {
    if (generatedKeywords.length > 0) {
      showKeywords(sortKeywords(generatedKeywords));
    }
  }, [generatedKeywords, sorting]);

  // Show keywords when keywordAmount changes
  useEffect(() => {
    showKeywords(generatedKeywords);
  }, [keywordAmount]);

  // Show an amount of keywords according to the "page"
  function showKeywords(keywords: any) {
    let array: any[] = [];
    if (keywordAmount[0] == 0) {
      keywords.map((keyword: any) => {
        filters.subjects.map((subject) => {
          if (subject == keyword.text) {
            array.push(keyword);
          }
        });
      });
    }
    for (
      let x = keywordAmount[0];
      x < keywordAmount[1] && x < keywords.length;
      x++
    ) {
      if (!filters.subjects.includes(keywords[x].text)) {
        array.push(keywords[x]);
      }
    }
    setShownKeywords(array);
  }

  // Sort the keywords on the sorting type
  function sortKeywords(array: any) {
    setKeywordAmount([0, 15]);
    if (sorting == "potential") {
      return array.sort(
        (a: any, b: any) =>
          b.keywordMetrics.potential - a.keywordMetrics.potential
      );
    } else if (sorting == "competition") {
      return array.sort(
        (a: any, b: any) =>
          a.keywordMetrics.competitionIndex - b.keywordMetrics.competitionIndex
      );
    } else if (sorting == "searchVolume") {
      return array.sort(
        (a: any, b: any) =>
          b.keywordMetrics.avgMonthlySearches -
          a.keywordMetrics.avgMonthlySearches
      );
    } else {
      return array.sort((a: any, b: any) => {
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
      case googleVolume >= 10000:
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
      const cleanArray = subjectArray.map((subject) =>
        subject.replace(/[&\/\\#+()$~%.";:*?<>{}[\]]/g, "")
      );

      setFilters((prevState: any) => ({
        ...prevState,
        subjects: [...prevState.subjects, ...cleanArray],
      }));
      setSubjectInput("");
      setKeywordAmount([0, 15]);
      isKeywordsGenerated.current = false;
    }
  }

  // Create a new collection with selected keywords
  async function createKeywordCollection() {
    const { data } = await supabase
      .from("collections")
      .select()
      .eq("collection_name", collectionToSave);
    if (data != undefined) {
      if (data?.length > 0) {
        // Merge the existing with the new keywords
        const combinedArray = selectedKeywords
          .map((keyword: any) => keyword.text)
          .concat(data[0].keywords);
        const uniqueArray = Array.from(new Set(combinedArray));

        const { error } = await supabase
          .from("collections")
          .update({ keywords: uniqueArray })
          .eq("collection_name", collectionToSave);
        if (error) {
          console.log(error);
        } else {
          setCollectionsPopUpOpen(false);
          router.push("/keywords");
        }
      } else {
        selectedKeywords.sort(
          (a: any, b: any) =>
            b.keywordMetrics.potential - a.keywordMetrics.potential
        );
        const { error } = await supabase.from("collections").insert([
          {
            collection_name: collectionToSave,
            keywords: selectedKeywords.map((keyword: any) => keyword.text),
            language: filters.language,
            country: filters.country,
          },
        ]);
        if (error) {
          console.log(error);
        } else {
          setCollectionsPopUpOpen(false);
          router.push("/keywords");
        }
      }
    }
  }

  // Add a new collection to the list of collections when an user creates a new one
  function addNewCollection() {
    if (newCollection == "") {
      setShowAlert(true);
    } else {
      setCollections((prevState: any) => [
        ...prevState,
        { collection_name: newCollection },
      ]);
      setCollectionToSave(newCollection);
      setNewCollection("");
    }
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

  function saveFilters() {
    setFilters((prevState: any) => ({
      ...prevState,
      language: filters.language,
      country: filters.country,
      keywordLength: filters.keywordLength,
      volume: {
        min: filters.volume.min,
        max: filters.volume.max,
      },
      competition: {
        min: filters.competition.min,
        max: filters.competition.max,
      },

      potential: { min: filters.potential.min, max: filters.potential.max },
    }));
    isKeywordsGenerated.current = false;
    setFilterPopUpOpen(false);
  }

  function searchVolumeTranslate(filterValue: number) {
    switch (true) {
      case filterValue == 0:
        return 10;
      case filterValue == 25:
        return 100;
      case filterValue == 50:
        return 1000;
      case filterValue == 75:
        return 10000;
      case filterValue == 100:
        return 100000;
      default:
        return 10;
    }
  }

  return (
    <InnerWrapper>
      <PageTitle title={"Search keywords"} goBack={() => router.back()} />
      <div className={styles.topWrapper}>
        <div className={styles.filterWrapper}>
          <div className={styles.inputWrapping}>
            <InputWrapper
              type="text"
              value={subjectInput}
              onChange={(value: any) => setSubjectInput(value)}
              className={styles.filterInput}
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
          </div>
          <Button type={"solid"} onClick={() => setFilterPopUpOpen(true)}>
            <p>Filter</p>
            <TuneRoundedIcon />
          </Button>
        </div>
        <div className={styles.subjects}>
          <h5>Subjects:</h5>
          {filters.subjects &&
            filters.subjects.map((value: string) => (
              <div key={value} className={styles.value}>
                <p>{value}</p>
                <div onClick={() => updateSubjectFilters(value)}>
                  <CloseRoundedIcon />
                </div>
              </div>
            ))}
        </div>
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
            searchSubjects={filters?.subjects}
          />
          <div className={styles.buttonWrapper}>
            <Button
              type={"solid"}
              onClick={() => setCollectionsPopUpOpen(true)}
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
                      keywordAmount[0] - 15,
                      keywordAmount[1] - 15,
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
                    setKeywordAmount([keywordAmount[1], keywordAmount[1] + 15])
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
        <PopUpWrapper>
          <CircularLoader />
          <p>Loading keywords...</p>
        </PopUpWrapper>
      )}
      {collectionsPopUpOpen && (
        <PopUpWrapper>
          <PopUp
            title={"Keyword research"}
            titleButtons={
              <Button
                type={"textOnly"}
                onClick={() => setCollectionsPopUpOpen(false)}
              >
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
                {showAlert && <p className="error">Name can&quot;t be empty!</p>}
              </div>
            </div>
          </PopUp>
        </PopUpWrapper>
      )}
      {filterPopUpOpen && (
        <PopUpWrapper>
          <PopUp
            title={"Filter"}
            titleButtons={
              <Button
                type={"textOnly"}
                onClick={() => setFilterPopUpOpen(false)}
              >
                <p>Close</p>
                <CloseRoundedIcon />
              </Button>
            }
            buttons={
              <Button type={"solid"} onClick={() => saveFilters()}>
                <p>Save filters</p>
              </Button>
            }
          >
            <div className={styles.filters}>
              <div className={styles.multiDropdown}>
                <InputWrapper
                  type="autocomplete"
                  title="Country:"
                  required={false}
                  value={filters.country}
                  options={countryCodes}
                  onChange={(value: any) => {
                    setFilters((prevFilters) => ({
                      ...prevFilters,
                      country: value != null ? value : countryCodes[0].id,
                    }));
                  }}
                  placeholder="Which country do you want to target?"
                />
                <InputWrapper
                  type="autocomplete"
                  title="Language:"
                  required={false}
                  value={filters.language}
                  options={languageCodes}
                  onChange={(value: any) => {
                    setFilters((prevFilters) => ({
                      ...prevFilters,
                      language: value != null ? value : languageCodes[0].id,
                    }));
                  }}
                  placeholder="In what language should the keywords be?"
                />
              </div>
              <InputWrapper
                type="multiSelect"
                title="Length of the keywords:"
                required={false}
                onChange={(value: any) =>
                  value.length == 0
                    ? alert("You need to select at least one")
                    : setFilters((prevFilters) => ({
                        ...prevFilters,
                        keywordLength:
                          value != null ? value : ["shorttail", "longtail"],
                      }))
                }
                defValue={filters.keywordLength}
                information="Short-tail keywords are broad, general, and popular terms with high search volume and competition. Longtail keywords are more specific, niche, and targeted multi-word terms with lower search volume and lower competition."
              />
              <InputWrapper
                type="slider"
                title="Search volume:"
                information="Search volume is the number of times, on average, that users enter a particular search query into a search engine each month."
                defValue={[
                  searchVolumeFiltering(filters.volume.min),
                  searchVolumeFiltering(filters.volume.max),
                ]}
                onChange={(value: any) => {
                  setFilters((prevFilters) => ({
                    ...prevFilters,
                    volume: {
                      min: searchVolumeTranslate(value[0]),
                      max: searchVolumeTranslate(value[1]),
                    },
                  }));
                }}
                step={25}
                marks={[
                  {
                    value: 0,
                    label: "10",
                  },
                  {
                    value: 25,
                    label: "100",
                  },
                  {
                    value: 50,
                    label: "1K",
                  },
                  {
                    value: 75,
                    label: "10K",
                  },
                  {
                    value: 100,
                    label: "100K",
                  },
                ]}
              />
              <InputWrapper
                type="slider"
                title="Competition:"
                information="The degree of competition of the position for a keyword."
                defValue={[filters.competition.min, filters.competition.max]}
                onChange={(value: any) => {
                  setFilters((prevFilters) => ({
                    ...prevFilters,
                    competition: {
                      min: value[0],
                      max: value[1],
                    },
                  }));
                }}
                step={25}
                marks={[
                  {
                    value: 0,
                    label: "0",
                  },
                  {
                    value: 25,
                    label: "25",
                  },
                  {
                    value: 50,
                    label: "50",
                  },
                  {
                    value: 75,
                    label: "75",
                  },
                  {
                    value: 100,
                    label: "100",
                  },
                ]}
              />
              <InputWrapper
                type="slider"
                title="Potential:"
                information="The ability of a particular keyword or key phrase to drive traffic, engagement, or conversions."
                defValue={[filters.potential.min, filters.potential.max]}
                onChange={(value: any) => {
                  setFilters((prevFilters) => ({
                    ...prevFilters,
                    potential: {
                      min: value[0],
                      max: value[1],
                    },
                  }));
                }}
                step={25}
                marks={[
                  {
                    value: 0,
                    label: "0",
                  },
                  {
                    value: 25,
                    label: "25",
                  },
                  {
                    value: 50,
                    label: "50",
                  },
                  {
                    value: 75,
                    label: "75",
                  },
                  {
                    value: 100,
                    label: "100",
                  },
                ]}
              />
            </div>
          </PopUp>
        </PopUpWrapper>
      )}
    </InnerWrapper>
  );
}
