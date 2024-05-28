"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";

import { supabase } from "@/app/utils/supabaseClient/server";
import { useParams, useRouter } from "next/navigation";

import PageTitle from "@/components/page-title/page-title.component";
import Table from "@/components/table/table.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import Button from "@/components/ui/button/button.component";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import languageCodes from "@/json/language-codes.json";
import toneOfVoices from "@/json/tone-of-voice.json";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import CircularLoader from "@/components/circular-loader/circular-loader.component";

export default function Collection({ params }: { params: { slug: string } }) {
  const activeCollection = params.slug;
  const router = useRouter();
  const [keywordsData, setKeywordsData] = useState<any[]>([]);
  const [shownKeywords, setShownKeywords] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [sorting, setSorting] = useState("potential");
  const getSelectedCollectionRef = useRef(false);
  const isGettingData = useRef(false);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editPopUpOpen, setEditPopUpOpen] = useState(false);
  const [keywordAmount, setKeywordAmount] = useState([0, 20]);
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [chosenKeyword, setChosenKeyword] = useState("");
  const [popUpStep, setPopUpStep] = useState(1);
  const [keywordOptions, setKeywordOptions] = useState([]);
  const [chosenKeywords, setChosenKeywords] = useState([]);
  const [chosenLanguage, setChosenLanguage] = useState(languageCodes[0].id);
  const [toneOfVoice, setToneOfVoice] = useState(toneOfVoices[0].id);
  const [targetAudience, setTargetAudience] = useState("");
  const [contentTitle, setcontentTitle] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!getSelectedCollectionRef.current && activeCollection != undefined) {
      getSelectedCollection();
      getSelectedCollectionRef.current = true;
    }
  }, [activeCollection]);

  async function getSelectedCollection() {
    const { data } = await supabase
      .from("collections")
      .select()
      .eq("id", activeCollection);
    if (data) {
      setSelectedCollection(data);
      setChosenKeyword(data[0].keywords[0]);
    }
  }

  useEffect(() => {
    if (selectedCollection.length > 0 && !isGettingData.current) {
      getKeywordsData();
      setNewCollectionName(selectedCollection[0].collection_name);
      isGettingData.current = true;
    }
  }, [selectedCollection]);

  // Sort and show the keywords when there are keywords generated
  useEffect(() => {
    if (keywordsData.length > 0) {
      showKeywords(sortKeywords(keywordsData));
    }
  }, [keywordsData, sorting]);

  // Show keywords when keywordAmount changes
  useEffect(() => {
    showKeywords(keywordsData);
  }, [keywordAmount]);

  // Show an amount of keywords according to the "page"
  function showKeywords(keywords: any) {
    let array: any[] = [];
    for (
      let x = keywordAmount[0];
      x < keywordAmount[1] && x < keywords.length;
      x++
    ) {
      array.push(keywords[x]);
    }
    setShownKeywords(array);
  }

  async function getKeywordsData() {
    setLoading(true);
    const response = await fetch("/api/keywordMetrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        keywords: selectedCollection[0].keywords,
        language: selectedCollection[0].language,
        country: selectedCollection[0].country,
      }),
    });

    const data = await response.json();

    const updatedData = data.map((keyword: any) => ({
      ...keyword,
      keywordMetrics: {
        ...keyword.keywordMetrics,
        potential: Math.ceil(
          potentialIndex(
            keyword.keywordMetrics.avgMonthlySearches,
            keyword.keywordMetrics.competitionIndex
          )
        ),
      },
    }));
    setKeywordsData(updatedData);

    setLoading(false);

    let array: string[] = [];
    updatedData.map((keyword: any) => {
      array.push(keyword.text);
    });
    setSelectedKeywords(array);
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

  // Check if there has been a change in selected keywords
  function checkChangeKeywords() {
    let state = true;
    let array: string[] = [];
    keywordsData.map((collectionKeyword: any) => {
      array.push(collectionKeyword.text);
    });
    if (array.length != selectedKeywords.length) {
      state = false;
    }

    return state;
  }

  async function updateCollection() {
    const { error } = await supabase
      .from("collections")
      .update({ keywords: selectedKeywords })
      .eq("id", activeCollection);
    if (error) {
      console.log(error);
    }

    let array: any[] = [];
    keywordsData.map((keyword: any) => {
      selectedKeywords.map((selectedKeyword) => {
        if (keyword.text == selectedKeyword) {
          array.push(keyword);
        }
      });
    });
    setKeywordsData(sortKeywords(array));
  }

  // Sort the keywords on the sorting type
  function sortKeywords(array: any) {
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

  async function deleteCollection(collectionId: number) {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collectionId);
    if (!error) {
      router.back();
    }
  }

  async function editTitle() {
    const { error } = await supabase
      .from("collections")
      .update({ collection_name: newCollectionName })
      .eq("id", selectedCollection[0].id);
    if (!error) {
      getSelectedCollection();
      setEditPopUpOpen(false);
    }
  }

  function currentDate() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }

  async function createContent() {
    console.log(selectedCollection[0].collection_name)
    const inserting = await supabase
      .from("contentItems")
      .insert([
        {
          collection: selectedCollection[0].id,
          language: chosenLanguage,
          sub_keywords: chosenKeywords,
          tone_of_voice: toneOfVoice,
          target_audience: targetAudience,
          content_title: contentTitle,
          edited_on: currentDate(),
          status: "outlines",
          keyword: chosenKeyword,
        },
      ])
      .select();
    if (inserting.error) {
      console.log(inserting.error);
      alert("Something went wrong. Please try again!");
    } else {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("content_id", inserting.data[0].id);
      } else {
        // If neither localStorage nor sessionStorage is supported
        console.log("Web Storage is not supported in this environment.");
      }
      router.push("/content/create/outlines");
    }
  }

  async function generateTitle() {
    setGenerating(true);
    try {
      const language = languageCodes.find((lang) => lang.id === chosenLanguage); // Get the language that is combined to the chosen language
      const toneOfVoicebyId = toneOfVoices.find(
        (item) => item.id === toneOfVoice
      ); // Get the tone of voice that is combined to the chosen tone of voice

      const response = await fetch("/api/generateTitle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: chosenKeyword,
          toneofvoice: toneOfVoicebyId,
          language: language?.value,
        }),
      });

      const data = await response.json();
      setGenerating(false);
      setcontentTitle(data.generatedTitle.split('"').join("")); //Remove the "" around the generated title
    } catch (error: any) {
      alert("Something went wrong. Please try again");
      setGenerating(false);
    }
  }

  return (
    <InnerWrapper>
      {selectedCollection && selectedCollection.length > 0 && (
        <>
          <PageTitle
            editing={() => setEditPopUpOpen(true)}
            title={selectedCollection[0].collection_name}
            goBack={() => router.back()}
            buttons={
              <div className={styles.buttonsWrapper}>
                <Button
                  type={"outline"}
                  onClick={() => deleteCollection(selectedCollection[0].id)}
                >
                  <p>Delete</p>
                  <DeleteOutlineRoundedIcon />
                </Button>
                <Button
                  type={"solid"}
                  onClick={() => setPopUpOpen(true)}
                >
                  <p>Create content</p>
                  <ArrowForwardRoundedIcon />
                </Button>
              </div>
            }
          />
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
                  onClick={() => updateCollection()}
                  disabled={checkChangeKeywords()}
                >
                  <p>Save</p>
                  <SaveOutlinedIcon />
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
                  {keywordAmount[1] < keywordsData.length && (
                    <Button
                      type={"textOnly"}
                      onClick={() =>
                        setKeywordAmount([
                          keywordAmount[1],
                          keywordAmount[1] + 20,
                        ])
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
          {editPopUpOpen && (
            <PopUpWrapper>
              <PopUp
                title={"Edit collection title"}
                titleButtons={
                  <Button
                    type={"textOnly"}
                    onClick={() => setEditPopUpOpen(false)}
                  >
                    <p>Close</p>
                    <CloseRoundedIcon />
                  </Button>
                }
                buttons={
                  <Button
                    type={"solid"}
                    onClick={editTitle}
                    disabled={
                      selectedCollection[0].collection_name ==
                        newCollectionName || newCollectionName == ""
                    }
                  >
                    <p>Save</p>
                    <SaveOutlinedIcon />
                  </Button>
                }
              >
                <InputWrapper
                  type="text"
                  value={newCollectionName}
                  title="New title:"
                  onChange={(value: string) => setNewCollectionName(value)}
                />
              </PopUp>
            </PopUpWrapper>
          )}
        </>
      )}
      {popUpOpen && (
        <PopUpWrapper>
          <PopUp
            title={"New content"}
            titleButtons={
              <Button type={"textOnly"} onClick={() => setPopUpOpen(false)}>
                <p>Close</p>
                <CloseRoundedIcon />
              </Button>
            }
            buttons={
              popUpStep == 1 ? (
                <Button type={"solid"} onClick={() => setPopUpStep(2)}>
                  <p>Next</p>
                  <ArrowForwardRoundedIcon />
                </Button>
              ) : (
                <div className={styles.buttonsWrapper}>
                  <Button type={"outline"} onClick={() => setPopUpStep(1)}>
                    <ArrowBackRoundedIcon />
                    <p>Back</p>
                  </Button>
                  <Button
                    type={"solid"}
                    onClick={() => createContent()}
                    disabled={contentTitle == ""}
                  >
                    <p>Start creating</p>
                  </Button>
                </div>
              )
            }
          >
            {popUpStep == 1 && (
              <div className={styles.selectingKeywords}>
                <div className={styles.collectionWrapper}>
                  <h4>Collection:</h4>
                  <h5>{selectedCollection[0].collection_name}</h5>
                </div>
                <InputWrapper
                  type="dropdown"
                  title="Focus keyword:"
                  required={false}
                  value={chosenKeyword}
                  options={selectedCollection[0].keywords}
                  information="This will be the keyword your content is focused on."
                  onChange={(value: any) => setChosenKeyword(value)}
                  placeholder="Which collection do you want to use?"
                />
                <InputWrapper
                  type="vertMultiSelect"
                  title="Subkeywords to use:"
                  required={false}
                  options={selectedCollection[0].keywords.filter(
                    (option: string) => option != chosenKeyword
                  )}
                  defValue={chosenKeywords}
                  information="Keywords that help by enhancing the relevance, reach, and effectiveness of your main keyword strategy."
                  onChange={(value: any) => setChosenKeywords(value)}
                  placeholder="Which collection do you want to use?"
                />
              </div>
            )}
            {popUpStep == 2 && (
              <div className={styles.contentSettings}>
                <InputWrapper
                  type="autocomplete"
                  title="Language:"
                  required={false}
                  value={chosenLanguage}
                  options={languageCodes}
                  onChange={(value: any) =>
                    setChosenLanguage(
                      value != null ? value : languageCodes[0].id
                    )
                  }
                  placeholder="In what language should the keywords be?"
                />
                <InputWrapper
                  type="autocomplete"
                  title="Tone of voice:"
                  required={false}
                  value={toneOfVoice}
                  options={toneOfVoices}
                  onChange={(value: any) =>
                    setToneOfVoice(value != null ? value : toneOfVoices[0].id)
                  }
                  placeholder="How do you want to tell the information?"
                />
                <InputWrapper
                  type="text"
                  title="Target adience:"
                  required={false}
                  onChange={(value: any) => setTargetAudience(value)}
                  placeholder="Who do you want to target?"
                />
                <InputWrapper
                  type="generate"
                  title="Title of your content:"
                  required={true}
                  value={contentTitle}
                  onChange={(value: any) => setcontentTitle(value)}
                  placeholder="Insert title for the content (or generate with AI)"
                  generateTitle={() => generateTitle()}
                />
              </div>
            )}
            {generating && (
              <div className={styles.loader}>
                <CircularLoader />
              </div>
            )}
          </PopUp>
        </PopUpWrapper>
      )}
    </InnerWrapper>
  );
}
