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
import { AutoAwesome } from "@mui/icons-material";
import { getCurrentDateTime } from '@/app/utils/currentDateTime/dateUtils';

export default function ContentOverview() {
  const [popUpOpen, setPopUpOpen] = useState(false);
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
  const [possibleTitles, setPossibleTitles] = useState<string[]>([]);
  const [contentType, setContentType] = useState("Blog");
  const [customKeyword, setCustomKeyword] = useState<String>();
  const [customSubKeywords, setCustomSubKeywords] = useState<String[]>([]);
  const typesOfContent = [
    "Blog",
    "Product category",
    "Company service",
    "Custom",
  ];

  // Get the collections when the currentUrl changes
  useEffect(() => {
    if (currentUrl) {
      getCollections();
    }
  }, [currentUrl]);

  // Set the chosen collection to make content with to the first one when there are collections
  useEffect(() => {
    if (collections.length > 0) {
      setChosenCollection(collections[0].id);
    }
  }, [collections]);

  // Set the keywordOptions and chosenKeyword to the first one of the keywords if the chosenCollection is set
  useEffect(() => {
    const filtered = collections.filter(
      (collection) => collection.id === chosenCollection
    );
    if (filtered.length > 0) {
      setKeywordOptions(filtered[0].keywords);
      setChosenKeyword(filtered[0].keywords[0]);
    }
  }, [chosenCollection]);

  // Get collections from database
  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      const { domains } = await getDomains();
      if (domains) {
        const currentDomainId = domains.find(
          (domain: any) => domain.domain == currentUrl
        );
        setCurrentDomain(currentDomainId.id);
        const filteredCollections = data.filter(
          (item: any) => item.domain == currentDomainId.id
        );
        const collectionsUpdatedKey = filteredCollections.map((collection) => ({
          ...collection,
          value: collection.collection_name,
        }));
        setCollections(collectionsUpdatedKey);
      }
    }
  }

  // Get domains from database
  async function getDomains() {
    const { data } = await supabase.from("domains").select();
    if (data) {
      return { domains: data };
    }
    return { domains: [] };
  }

  // Generate a title for a blog
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

      // Generate 3 extra titles to give the user more options
      let possibleTitles = [];

      while (possibleTitles.length < 3) {
        const possibleRespone = await fetch("/api/generateTitle", {
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
        const possibleData = await possibleRespone.json();
        possibleTitles.push(possibleData.generatedTitle.split('"').join(""));
      }
      setPossibleTitles(possibleTitles);
      setGenerating(false);
      setcontentTitle(data.generatedTitle.split('"').join("")); //Remove the "" around the generated title
    } catch (error: any) {
      alert("Something went wrong. Please try again");
      setGenerating(false);
    }
  }

  // Get current date
  function currentDate() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }

  // Add content to the database and open the outlines step
  async function createContent() {
    const inserting = await supabase
      .from("contentItems")
      .insert([
        {
          collection: contentType.toLowerCase() != "custom" ? chosenCollection : null,
          language: chosenLanguage,
          keyword: contentType.toLowerCase() != "custom" ? chosenKeyword : (customKeyword ? customKeyword : null),
          sub_keywords: contentType.toLowerCase() != "custom" ? chosenKeywords : (customSubKeywords.length > 0 ? customSubKeywords : []),
          tone_of_voice: toneOfVoice,
          target_audience: targetAudience,
          content_title: contentTitle,
          edited_on: getCurrentDateTime(),
          status: contentType.toLowerCase() == "custom" ? "writing" : "outlines",
          domain: currentDomain,
          type: contentType.toLowerCase(),
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

      if(contentType.toLowerCase() == "custom"){
        router.push("/content/create/writing");
      } else {
        router.push("/content/create/outlines");
      }
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
        information="Creating SEO content involves integrating targeted keywords, producing high-quality, relevant material, and optimizing structure to enhance visibility and engagement, ultimately boosting search engine rankings and user experience."
      />
      <ContentItemsWrapper />
      {popUpOpen && (
        <PopUpWrapper>
          <PopUp
            title={"New content"}
            titleButtons={
              <Button
                type={"textOnly"}
                onClick={() => {
                  setPopUpOpen(false);
                  setcontentTitle("");
                  setPopUpStep(1);
                }}
              >
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
                    disabled={
                      contentType.toLowerCase() != "custom"
                        ? toneOfVoice == null || contentTitle == ""
                        : contentTitle == ""
                    }
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
                  title="Type of content:"
                  required={false}
                  value={contentType}
                  options={typesOfContent}
                  onChange={(value: any) => setContentType(value)}
                />
                {contentType.toLowerCase() != "custom" ? (
                  <>
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
                      onChange={(value: any) => {
                        setChosenKeyword(value);
                        setChosenKeywords([]);
                      }}
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
                  </>
                ) : (
                  <>
                    <InputWrapper
                      type="text"
                      title="Keyword: **"
                      required={false}
                      onChange={(value: any) => setCustomKeyword(value)}
                      placeholder="Enter your keyword"
                    />
                    <InputWrapper
                      type="text"
                      title="Sub keywords: **"
                      required={false}
                      onChange={(value: any) => setCustomSubKeywords(value)}
                      placeholder="Enter your keywords and devide them by a comma"
                    />
                    <p style={{ fontSize: 12 }}>
                      ** You can keep this empty if you really want to start blank. It can help creating better content when filling this in.
                    </p>
                  </>
                )}
              </div>
            )}
            {popUpStep == 2 && (
              <div className={styles.contentSettings}>
                <InputWrapper
                  type="autocomplete"
                  title={`Language: ${contentType.toLowerCase() == "custom" ? "**" : ""}`} 
                  required={contentType.toLowerCase() != "custom"}
                  value={chosenLanguage}
                  options={languageCodes}
                  onChange={(value: any) =>
                    setChosenLanguage(
                      contentType.toLowerCase() != "custom"
                        ? value != null
                          ? value
                          : languageCodes[0].id
                        : value
                    )
                  }
                  placeholder="In what language should the keywords be?"
                />
                <InputWrapper
                  type="autocomplete"
                  title={`Tone of voice: ${contentType.toLowerCase() == "custom" ? "**" : ""}`}
                  required={contentType.toLowerCase() != "custom"}
                  value={toneOfVoice}
                  options={toneOfVoices}
                  onChange={(value: any) =>
                    setToneOfVoice(
                      contentType.toLowerCase() != "custom"
                        ? value != null
                          ? value
                          : toneOfVoices[0].id
                        : value
                    )
                  }
                  placeholder="How do you want to tell the information?"
                />
                <InputWrapper
                  type="text"
                  title={`Target adience: ${contentType.toLowerCase() == "custom" ? "**" : ""}`}
                  required={false}
                  onChange={(value: any) => setTargetAudience(value)}
                  placeholder="Who do you want to target?"
                />
                <InputWrapper
                  type={contentType == "Blog" ? "generate" : "text"}
                  title={`Title of your content:`}
                  required={true}
                  value={contentTitle}
                  onChange={(value: any) => setcontentTitle(value)}
                  placeholder={`Insert the title of your ${contentType.toLowerCase()} ${
                    contentType.toLowerCase() == "blog"
                      ? "(or generate with AI)"
                      : "content"
                  }`}
                  generateTitle={() => generateTitle()}
                />
                {contentType.toLowerCase() == "custom" && (
                  <p style={{ fontSize: 12 }}>
                    ** You can keep this empty if you really want to start blank. It can help creating better content when filling this in.
                  </p>
                )}
                {possibleTitles.length > 0 &&
                  contentType.toLowerCase() == "blog" && (
                    <div className={styles.possibleTitles}>
                      <h5>Possible titles:</h5>
                      {possibleTitles.map((title: string) => (
                        <div
                          key={title}
                          className={styles.possibleTitle}
                          onClick={() => {
                            setcontentTitle(title);
                            setPossibleTitles(
                              possibleTitles.filter(
                                (item: string) => item != title
                              )
                            );
                          }}
                        >
                          <AutoAwesome />
                          <p>{title}</p>
                        </div>
                      ))}
                    </div>
                  )}
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
