"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient/server";
import { useRouter } from "next/navigation";
import { useSharedContext } from "@/context/SharedContext";

import PageTitle from "@/components/page-title/page-title.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import Button from "@/components/ui/button/button.component";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import ContentItemsWrapper from "@/components/content-items-wrapper/content-items-wrapper.component";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import languageCodes from "@/json/language-codes.json";
import toneOfVoices from "@/json/tone-of-voice.json";
import CircularLoader from "@/components/circular-loader/circular-loader.component";
import styles from "./page.module.scss";

export default function ContentOverview() {
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [contents, setContents] = useState<any[]>([]);
  const getContentsRef = useRef(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [chosenCollection, setChosenCollection] = useState();
  const [chosenKeyword, setChosenKeyword] = useState("");
  const [popUpStep, setPopUpStep] = useState(1);
  const [keywordOptions, setKeywordOptions] = useState([]);
  const [chosenKeywords, setChosenKeywords] = useState([]);
  const [chosenLanguage, setChosenLanguage] = useState(languageCodes[0].id);
  const [toneOfVoice, setToneOfVoice] = useState(toneOfVoices[0].id);
  const [targetAudience, setTargetAudience] = useState("");
  const [contentTitle, setcontentTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const router = useRouter();
  const { currentUrl } = useSharedContext();
  const [currentDomain, setCurrentDomain] = useState();

  useEffect(() => {
    if (!getContentsRef.current) {
      getContents();
      getCollections();
      getContentsRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (collections.length > 0) {
      setChosenCollection(collections[0].id);
    }
  }, [collections]);

  useEffect(() => {
    const filtered = collections.filter(
      (collection) => collection.id === chosenCollection
    );
    if (filtered.length > 0) {
      setKeywordOptions(filtered[0].keywords);
      setChosenKeyword(filtered[0].keywords[0]);
    }
  }, [chosenCollection]);

  async function getContents() {
    const { data } = await supabase.from("contentItems").select();
    if (data) {
      data.sort(
        (a, b) =>
          new Date(b.edited_on).getTime() - new Date(a.edited_on).getTime()
      );
      setContents(data);
    }
  }

  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      const { domains } = await getDomains();
      if (domains) {
        const currentDomainId = domains.find(
          (domain: any) => domain.domain == currentUrl
        );
        setCurrentDomain(currentDomainId.id);
        const filteredCollections = data.filter((item: any) => item.domain == currentDomainId.id)
          const collectionsUpdatedKey = filteredCollections.map((collection) => ({
            ...collection,
            value: collection.collection_name,
          }));
          setCollections(collectionsUpdatedKey);
        }    
      }
  }

  async function getDomains() {
    const { data } = await supabase.from("domains").select();
    if (data) {
      return { domains: data };
    }
    return { domains: [] };
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
          toneofvoice: toneOfVoicebyId?.value,
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

  function currentDate() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }

  async function createContent() {
    const inserting = await supabase
      .from("contentItems")
      .insert([
        {
          collection: chosenCollection,
          language: chosenLanguage,
          sub_keywords: chosenKeywords,
          tone_of_voice: toneOfVoice,
          target_audience: targetAudience,
          content_title: contentTitle,
          edited_on: currentDate(),
          status: "outlines",
          keyword: chosenKeyword,
          domain: currentDomain
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
      getContentsRef.current = false;
    }
  }

  return (
    <InnerWrapper>
      <PageTitle
        title={"Content overview"}
        buttons={
          <Button type={"solid"} onClick={() => setPopUpOpen(true)}>
            <p>Create new content</p> <AddRoundedIcon />
          </Button>
        }
        information="
        Creating SEO content involves integrating targeted keywords, producing high-quality, relevant material, and optimizing structure to enhance visibility and engagement, ultimately boosting search engine rankings and user experience."
      />
      {getContentsRef.current ? <ContentItemsWrapper /> : <h5>Loading...</h5>}
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
                <InputWrapper
                  type="dropdown"
                  title="Keyword collection:"
                  required={false}
                  value={chosenCollection}
                  options={collections}
                  onChange={(value: any) => setChosenCollection(value)}
                  placeholder="Which collection do you want to use?"
                />
                <InputWrapper
                  type="dropdown"
                  title="Focus keyword:"
                  required={false}
                  value={chosenKeyword}
                  options={keywordOptions}
                  information="This will be the keyword your content is focused on."
                  onChange={(value: any) => setChosenKeyword(value)}
                  placeholder="Which collection do you want to use?"
                />
                <InputWrapper
                  type="vertMultiSelect"
                  title="Subkeywords to use:"
                  required={false}
                  options={keywordOptions.filter(
                    (option) => option != chosenKeyword
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
