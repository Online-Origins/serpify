import SmallTable from "../table/small-table/small-table.component";
import Button from "../ui/button/button.component";
import { useRouter } from "next/navigation";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DotsMenu from "../dots-menu/dots-menu.component";
import { supabase } from "@/app/utils/supabaseClient/server";
import PopUpWrapper from "../ui/popup-wrapper/popup-wrapper.component";
import PopUp from "../ui/popup/popup.component";
import { useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import languageCodes from "@/json/language-codes.json";
import toneOfVoices from "@/json/tone-of-voice.json";
import InputWrapper from "../ui/input-wrapper/input-wrapper.component";
import CircularLoader from "../circular-loader/circular-loader.component";
import styles from "./collection-card.module.scss";
import { AutoAwesome } from "@mui/icons-material";

export default function CollectionCard({
  collection,
  shownCollections,
  setShownCollections,
  smallWrapper,
  currentDomain,
}: {
  collection: any;
  shownCollections: any;
  setShownCollections: any;
  smallWrapper?: boolean;
  currentDomain: any;
}) {
  const router = useRouter();
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [chosenKeyword, setChosenKeyword] = useState(collection.keywords[0]);
  const [popUpStep, setPopUpStep] = useState(1);
  const [chosenKeywords, setChosenKeywords] = useState([]);
  const [chosenLanguage, setChosenLanguage] = useState(languageCodes[0].id);
  const [toneOfVoice, setToneOfVoice] = useState(toneOfVoices[0].id);
  const [targetAudience, setTargetAudience] = useState("");
  const [contentTitle, setcontentTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [possibleTitles, setPossibleTitles] = useState<string[]>([]);

  // Delete a collection
  async function deleteCollection() {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collection.id);
    if (!error) {
      setShownCollections(
        shownCollections.filter((item: any) => item != collection)
      );
    }
  }

  // Copy a collection
  async function copyCollection() {
    const { data } = await supabase
      .from("collections")
      .select()
      .eq("id", collection.id);
    if (data) {
      const inserting = await supabase
        .from("collections")
        .insert([
          {
            collection_name: data[0].collection_name,
            keywords: data[0].keywords,
            language: data[0].language,
            country: data[0].country,
            domain: data[0].domain,
          },
        ])
        .select();
      if (
        !inserting.error &&
        (smallWrapper ? shownCollections.length < 3 : true)
      ) {
        setShownCollections([
          ...shownCollections,
          { ...data[0], id: inserting.data[0].id },
        ]);
      }
    }
  }

  // Get the current date
  function currentDate() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }

  // Create content
  async function createContent() {
    const inserting = await supabase
      .from("contentItems")
      .insert([
        {
          collection: collection.id,
          language: chosenLanguage,
          sub_keywords: chosenKeywords,
          tone_of_voice: toneOfVoice,
          target_audience: targetAudience,
          content_title: contentTitle,
          edited_on: currentDate(),
          status: "outlines",
          keyword: chosenKeyword,
          domain: currentDomain,
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

  // Generate a title
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

      // Generate 3 more titles to let the user chose
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

  return (
    <div className={styles.collectionCard}>
      <div className={styles.cardTopWrapper}>
        <h5>{collection.collection_name}</h5>
        <DotsMenu
          deleteFunction={() => deleteCollection()}
          copyFunction={() => copyCollection()}
        />
      </div>
      <SmallTable
        keywords={collection.keywords}
        language={collection.language}
        country={collection.country}
      />
      <div className={styles.cardButtonWrapper}>
        <Button
          type={"textOnly"}
          onClick={() =>
            router.push(`/keywords/${encodeURIComponent(collection.id)}`)
          }
        >
          <p>See collection</p>
        </Button>
        <Button type={"solid"} onClick={() => setPopUpOpen(true)}>
          <p>Create content</p>
          <ArrowForwardRoundedIcon />
        </Button>
      </div>

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
                  <h5>{collection.collection_name}</h5>
                </div>
                <InputWrapper
                  type="dropdown"
                  title="Focus keyword:"
                  required={false}
                  value={chosenKeyword}
                  options={collection.keywords}
                  information="This will be the keyword your content is focused on."
                  onChange={(value: any) => {setChosenKeyword(value); setChosenKeywords([])}}
                  placeholder="Which collection do you want to use?"
                />
                <InputWrapper
                  type="vertMultiSelect"
                  title="Subkeywords to use:"
                  required={false}
                  options={collection.keywords.filter(
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
                {possibleTitles.length > 0 && (
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
    </div>
  );
}
