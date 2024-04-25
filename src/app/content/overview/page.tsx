import styles from "./page.module.scss";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/app/api/supabaseClient/route";

import PageTitle from "@/components/page-title/page-title.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import Button from "@/components/ui/button/button.component";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import languageCodes from "@/json/language-codes.json";
import toneOfVoices from "@/json/tone-of-voice.json";
import ContentItem from "@/components/content-item/content-item.component";
import ContentItemsWrapper from "@/components/content-items-wrapper/content-items-wrapper.component";

export default function ContentOverview({ setPages }: { setPages: any }) {
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [contents, setContents] = useState<any[]>([]);
  const getContentsRef = useRef(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [chosenCollection, setChosenCollection] = useState();
  const [popUpStep, setPopUpStep] = useState(1);
  const [keywordOptions, setKeywordOptions] = useState([]);
  const [chosenKeywords, setChosenKeywords] = useState([]);
  const [chosenLanguage, setChosenLanguage] = useState(languageCodes[0].id);
  const [toneOfVoice, setToneOfVoice] = useState(toneOfVoices[0].id);
  const [targetAudience, setTargetAudience] = useState("");
  const [contentTitle, setcontentTitle] = useState("");

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
      setChosenKeywords(filtered[0].keywords);
    }
  }, [chosenCollection]);

  async function getContents() {
    const { data } = await supabase.from("content-items").select();
    if (data) {
      setContents(data);
    }
  }

  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      const collectionsUpdatedKey = data.map((collection) => ({
        ...collection,
        value: collection.collection_name,
      }));
      setCollections(collectionsUpdatedKey);
    }
  }

  async function generateTitle() {
    try {
      const language = languageCodes.find((lang) => lang.id === chosenLanguage); // Get the language that is combined to the chosen language

      const response = await fetch("/api/generateTitle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: chosenKeywords,
          toneofvoice: toneOfVoice,
          language: language?.value,
        }),
      });

      const data = await response.json();
      setcontentTitle(data.generatedTitle.split('"').join("")); //Remove the "" around the generated title
    } catch (error: any) {
      alert("Something went wrong. Please try again");
    }
  }

  async function createContent() {
    const { error } = await supabase.from("content-items").insert([
      {
        collection: chosenCollection,
        language: chosenLanguage,
        keywords: chosenKeywords,
        tone_of_voice: toneOfVoice,
        target_audience: targetAudience,
        content_title: contentTitle,
      },
    ]);
    if (error) {
      console.log(error);
      alert("Something went wrong. Please try again!")
    } else {
      setPopUpOpen(false);
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
      />
      {getContentsRef.current ? <ContentItemsWrapper contents={contents} collections={collections} /> : <h5>Loading...</h5>}
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
                  type="vertMultiSelect"
                  title="Keyword to use:"
                  required={false}
                  options={keywordOptions}
                  defValue={chosenKeywords}
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
                  onChange={(value: any) => setChosenLanguage(value != null ? value : languageCodes[0].id)}
                  placeholder="In what language should the keywords be?"
                />
                <InputWrapper
                  type="autocomplete"
                  title="Tone of voice:"
                  required={false}
                  value={toneOfVoice}
                  options={toneOfVoices}
                  onChange={(value: any) => setToneOfVoice(value != null ? value : toneOfVoices[0].id)}
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
          </PopUp>
        </PopUpWrapper>
      )}
    </InnerWrapper>
  );
}
