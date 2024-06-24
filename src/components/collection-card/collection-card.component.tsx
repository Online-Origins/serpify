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
import { AutoAwesome, GridViewOutlined } from "@mui/icons-material";
import { getCurrentDateTime } from "@/app/utils/currentDateTime/dateUtils";

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
  const [contentType, setContentType] = useState("Blog");
  const [customKeyword, setCustomKeyword] = useState<String>();
  const [customSubKeywords, setCustomSubKeywords] = useState<String[]>([]);
  const [customWithCollection, setCustomWithCollection] = useState(false);
  const typesOfContent = [
    "Blog",
    "Product category",
    "Company service",
    "Custom",
  ];

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

  // Create content
  async function createContent() {
    const inserting = await supabase
      .from("contentItems")
      .insert([
        {
          collection:
            contentType.toLowerCase() != "custom" || customWithCollection
              ? collection.id
              : null,
          language: chosenLanguage,
          keyword:
            contentType.toLowerCase() != "custom" || customWithCollection
              ? chosenKeyword
              : customKeyword
              ? customKeyword
              : null,
          sub_keywords:
            contentType.toLowerCase() != "custom" || customWithCollection
              ? chosenKeywords
              : customSubKeywords.length > 0
              ? customSubKeywords
              : [],
          tone_of_voice: toneOfVoice,
          target_audience: targetAudience,
          content_title: contentTitle,
          edited_on: getCurrentDateTime(),
          status:
            contentType.toLowerCase() == "custom" ? "writing" : "outlines",
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
      if (contentType.toLowerCase() == "custom") {
        router.push("/content/create/writing");
      } else {
        router.push("/content/create/outlines");
      }
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
              <Button
                type={"textOnly"}
                onClick={() => {
                  setPopUpOpen(false);
                  setcontentTitle("");
                  setPopUpStep(1);
                  setContentType("Blog");
                }}
              >
                <p>Close</p>
                <CloseRoundedIcon />
              </Button>
            }
            buttons={
              popUpStep == 1 ? (
                <div className={styles.buttonsWrapper}>
                  {contentType.toLowerCase() == "custom" ? (
                    customWithCollection ? (
                      <Button
                        type={"textOnly"}
                        onClick={() => {
                          setCustomWithCollection(false);
                          setChosenKeywords([]);
                        }}
                      >
                        <p>Use custom keywords</p>
                      </Button>
                    ) : (
                      <Button
                        type={"textOnly"}
                        onClick={() => {
                          setCustomWithCollection(true);
                          setCustomKeyword("");
                          setCustomSubKeywords([]);
                        }}
                      >
                        <p>Use a keyword collection</p>
                        <GridViewOutlined />
                      </Button>
                    )
                  ) : (
                    <p></p>
                  )}
                  <Button type={"solid"} onClick={() => setPopUpStep(2)}>
                    <p>Next</p>
                    <ArrowForwardRoundedIcon />
                  </Button>
                </div>
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
                {contentType.toLowerCase() != "custom" ||
                customWithCollection ? (
                  <>
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
                      options={collection.keywords.filter(
                        (option: string) => option != chosenKeyword
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
                      title="Keywords: **"
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
                      ** You can keep this empty if you really want to start
                      blank. It can help creating better content when filling
                      this in.
                    </p>
                  </>
                )}
              </div>
            )}
            {popUpStep == 2 && (
              <div className={styles.contentSettings}>
                <InputWrapper
                  type="autocomplete"
                  title={`Language: ${
                    contentType.toLowerCase() == "custom" ? "**" : ""
                  }`}
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
                  title={`Tone of voice: ${
                    contentType.toLowerCase() == "custom" ? "**" : ""
                  }`}
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
                  title={`Target adience: ${
                    contentType.toLowerCase() == "custom" ? "**" : ""
                  }`}
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
                    ** You can keep this empty if you really want to start
                    blank. It can help creating better content when filling this
                    in.
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
    </div>
  );
}
