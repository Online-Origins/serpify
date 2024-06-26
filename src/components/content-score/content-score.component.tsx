"use client";
import { useEffect, useRef, useState } from "react";
import PageTitle from "../page-title/page-title.component";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import {
  ArrowForwardIosRounded,
  CircleRounded,
  CloseRounded,
  CheckRounded,
  BorderColorRounded,
  SaveOutlined,
  DeleteOutlineRounded,
} from "@mui/icons-material";
import classNames from "classnames";
import CustomizedTooltip from "../ui/custom-tooltip/custom-tooltip.component";
import GradientSVG from "@/components/gradient-svg/gradient-svg.component";
import styles from "./content-score.module.scss";
import Button from "../ui/button/button.component";
import PopUpWrapper from "../ui/popup-wrapper/popup-wrapper.component";
import PopUp from "../ui/popup/popup.component";
import InputWrapper from "../ui/input-wrapper/input-wrapper.component";
import { useSharedContext } from "@/context/SharedContext";
import { supabase } from "@/app/utils/supabaseClient/server";

export default function ContentScore({ contentScore }: { contentScore: any }) {
  const {
    contentKeyword,
    setContentKeyword,
    contentSubKeywords,
    setContentSubKeywords,
    currentUrl,
    contentCollection,
    setContentCollection,
  } = useSharedContext();
  const [goodOpen, setGoodOpen] = useState(true);
  const [minorOpen, setMinorOpen] = useState(true);
  const [warningOpen, setWarningOpen] = useState(true);
  const [keywordsOpen, setKeywordsOpen] = useState(false);
  const [chosenKeyword, setChosenKeyword] = useState<string>();
  const [customKeywords, setCustomKeywords] = useState<string>("");
  const [chosenKeywords, setChosenKeywords] = useState<string[]>([]);
  const [collectionKeywords, setCollectionKeywords] = useState<string[]>([]);
  const [type, setType] = useState<string>("");
  const idCSS = "gradientId";
  const getContent = useRef(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [chosenCollection, setChosenCollection] = useState(1);
  const [keywordOptions, setKeywordOptions] = useState([]);

  useEffect(() => {
    if (!getContent.current && localStorage) {
      const contentId = localStorage.getItem("content_id");
      getContentItem(contentId);
      getContent.current = true;
    }
    
    if (contentKeyword && contentKeyword != "") {
      setChosenKeyword(contentKeyword);
      setChosenKeywords(contentSubKeywords);
    } else {
      setChosenKeyword(collectionKeywords[0]);
      setChosenKeywords(collectionKeywords);
    }
  }, [contentKeyword, contentSubKeywords]);

  useEffect(() => {
    if (currentUrl) {
      getCollections();
    }
  }, [currentUrl]);

  // Set the keywordOptions and chosenKeyword to the first one of the keywords if the chosenCollection is set
  useEffect(() => {
    const filtered = collections.filter(
      (collection) => collection.id === chosenCollection
    );
    if (filtered.length > 0) {
      if (filtered[0].keywords && filtered[0].keywords.length > 0) {
        setKeywordOptions(filtered[0].keywords);
        setChosenKeyword(filtered[0].keywords[0]);
      } else {
        setChosenKeyword('')
        setKeywordOptions([]);
      }
    }
  }, [chosenCollection]);

  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      const { domains } = await getDomains();
      if (domains) {
        const currentDomainId = domains.find(
          (domain: any) => domain.domain == currentUrl
        );
        const filteredCollections = data.filter(
          (item: any) => item.domain == currentDomainId.id
        );
        const collectionsUpdatedKey = filteredCollections.map((collection) => ({
          ...collection,
          value: collection.collection_name,
        }));

        collectionsUpdatedKey.push({ id: 1, value: "------" });

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

  const areArraysEqual = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false;
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  };

  // Save the new keywords for the content
  async function saveKeywords() {
    setContentKeyword(chosenKeyword);
    setContentSubKeywords(
      chosenKeywords.length > 0
        ? type == "custom" && customKeywords != ""
          ? [...chosenKeywords.sort(), ...customKeywords.split(", ")]
          : chosenKeywords.sort()
        : customKeywords != ""
        ? customKeywords.split(", ")
        : []
    );
    setKeywordsOpen(false);
    setCustomKeywords("");
    if (chosenCollection != 1){
      setContentCollection(chosenCollection);
    }
  }

  // Reset all variables when deleting a collection
  async function deleteKeywords() {
    setContentKeyword(null);
    setContentSubKeywords([]);
    // Which focus and subkeywords the user chose
    setChosenKeyword("");
    setChosenKeywords([]);
    // Subkeywords from text inputfield -> custom
    setCustomKeywords("");
    setKeywordsOpen(false);
    // Current collection related
    setChosenCollection(1);
    setCollectionKeywords([]);
    setContentCollection(null);
  }

  async function getContentItem(contentId: any) {
    const { data } = await supabase
      .from("contentItems")
      .select()
      .eq("id", contentId);

    if (data && data[0].collection) {
      getCollectionKeywords(data[0].collection);
      setType(data[0].type.toLowerCase());
    } else if (data && data[0].type.toLowerCase() == "custom") {
      setType("custom");
    }
  }

  async function getCollectionKeywords(collectionId: number) {
    const { data } = await supabase
      .from("collections")
      .select()
      .eq("id", collectionId);
    if (data) {
      setCollectionKeywords(data[0].keywords);
    }
  }

  return (
    <div className={styles.contentScore}>
      <PageTitle title={"Content score"} smallerHeader />
      {contentScore && (
        <div className={classNames(styles.analysis, "scrollbar")}>
          <div className={styles.horizontal}>
            <h5>Word count: </h5>
            <h5>{contentScore.wordCount}</h5>
          </div>
          <div className={styles.horizontal}>
            <h5>Link count:</h5>
            <h5>{contentScore.totalLinks}</h5>
          </div>
          <div className={styles.meterWrapper}>
            <GradientSVG />
            <h1>{contentScore.seoScore}</h1>
            <CircularProgressbar
              value={contentScore.seoScore}
              circleRatio={0.5}
              strokeWidth={15}
              className={styles.score}
              styles={buildStyles({
                rotation: -0.25,
                pathColor: `url(#${idCSS})`,
                trailColor: "#FAF6FF",
                pathTransitionDuration: 0.4,
              })}
            />
          </div>
          <div className={classNames(styles.points, goodOpen && styles.open)}>
            <div
              className={styles.pointsHeader}
              onClick={() => setGoodOpen(!goodOpen)}
            >
              <h4>Good points: {contentScore.points.goodPoints.length}</h4>
              <ArrowForwardIosRounded />
            </div>
            <div className={styles.pointsList}>
              {contentScore.points.goodPoints.map(
                (point: string, index: number) => (
                  <div className={styles.pointWrapper} key={index}>
                    <p className={styles.good}>
                      <CircleRounded />
                      {point}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
          <div className={classNames(styles.points, minorOpen && styles.open)}>
            <div
              className={styles.pointsHeader}
              onClick={() => setMinorOpen(!minorOpen)}
            >
              <h4>
                Minor warnings: {contentScore.points.minorWarnings.length}
              </h4>
              <ArrowForwardIosRounded />
            </div>
            <div className={styles.pointsList}>
              {contentScore.points.minorWarnings.map(
                (point: string, index: number) => (
                  <div className={styles.pointWrapper} key={index}>
                    <p className={styles.minor}>
                      <CircleRounded />
                      {point}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
          <div
            className={classNames(
              styles.points,
              warningOpen && styles.open,
              contentScore.points.warnings.length > 5 && styles.long
            )}
          >
            <div
              className={styles.pointsHeader}
              onClick={() => setWarningOpen(!warningOpen)}
            >
              <h4>Warnings: {contentScore.points.warnings.length}</h4>
              <ArrowForwardIosRounded />
            </div>
            <div className={styles.pointsList}>
              {contentScore.points.warnings.map(
                (point: string, index: number) => (
                  <div className={styles.pointWrapper} key={index}>
                    <p className={styles.warning}>
                      <CircleRounded />
                      {point}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
          <div
            className={classNames(
              styles.points,
              styles.keywords,
              contentScore.subKeywordDensity.length > 4 && styles.long
            )}
          >
            <div className={styles.pointsHeader}>
              <h4>Keywords</h4>
              <Button type={"textOnly"} onClick={() => setKeywordsOpen(true)}>
                <p>Edit</p>
                <BorderColorRounded />
              </Button>
            </div>
            <div className={styles.pointsList}>
              {contentScore.keywordDensity ? (
                [
                  ...[contentScore.keywordDensity],
                  ...contentScore.subKeywordDensity,
                ].map((keyword: any, index: number) => (
                  <CustomizedTooltip
                    information={`${
                      index == 0 ? "Focus keyword" : "Subkeyword"
                    } density is: ${keyword.density}%. This is ${
                      keyword.density < 1
                        ? "to low. Try to mention the keyword more."
                        : keyword.density > 2
                        ? "to high. Try to mention it less."
                        : "good!"
                    }`}
                    key={index}
                  >
                    <div
                      className={classNames(
                        styles.pointWrapper,
                        keyword.density <= 2 && keyword.density >= 1
                          ? styles.good
                          : styles.warning
                      )}
                    >
                      <p>{keyword.keyword}</p>
                      {keyword.density <= 2 && keyword.density >= 1 ? (
                        <p className={styles.density}>
                          {keyword.density}% <CheckRounded />
                        </p>
                      ) : (
                        <p className={styles.density}>
                          {keyword.density}% <CloseRounded />
                        </p>
                      )}
                    </div>
                  </CustomizedTooltip>
                ))
              ) : (
                <p>No keywords found</p>
              )}
            </div>
          </div>
        </div>
      )}
      {keywordsOpen && (
        <PopUpWrapper>
          <PopUp
            title={"Edit keywords"}
            titleButtons={
              <Button
                type={"textOnly"}
                onClick={() => {
                  setKeywordsOpen(false);
                  setChosenKeyword(contentKeyword);
                  setChosenKeywords(contentSubKeywords);
                }}
              >
                <p>Close</p>
                <CloseRounded />
              </Button>
            }
            buttons={
              <div className={styles.buttonsWrapper}>
                {type == "custom" && contentKeyword ? (
                  <Button type={"textOnly"} onClick={() => deleteKeywords()}>
                    <p>delete keywords</p>
                    <DeleteOutlineRounded />
                  </Button>
                ) : (
                  <p></p>
                )}
                <Button
                  type={"solid"}
                  onClick={() => saveKeywords()}
                  disabled={
                    contentKeyword
                      ? areArraysEqual(chosenKeywords, contentSubKeywords) &&
                        customKeywords == "" &&
                        chosenKeyword == contentKeyword
                      : chosenKeyword == undefined || chosenKeyword == ""
                  }
                >
                  <p>Save</p>
                  <SaveOutlined />
                </Button>
              </div>
            }
          >
            {contentKeyword || collectionKeywords.length > 0 ? (
              <>
                <InputWrapper
                  type="dropdown"
                  title="Focus keyword:"
                  required={false}
                  value={chosenKeyword}
                  options={
                    keywordOptions && keywordOptions.length > 0
                      ? keywordOptions
                      : Array.from(
                          new Set([
                            ...(contentKeyword ? [contentKeyword] : []),
                            ...collectionKeywords,
                            ...contentSubKeywords,
                          ])
                        )
                  }
                  information="This will be the keyword your content is focused on."
                  onChange={(value: string) => {
                    setChosenKeyword(value);
                    setChosenKeywords([
                      ...chosenKeywords.filter((item: string) => item != value),
                    ]);
                  }}
                />
                {(contentSubKeywords.length > 0 || keywordOptions.length > 0 || collectionKeywords.filter((option: string) => option != chosenKeyword).length > 0) && (
                  <InputWrapper
                    type="vertMultiSelect"
                    title="Subkeywords to use: "
                    required={false}
                    options={
                      keywordOptions && keywordOptions.length > 0
                        ? keywordOptions.filter(
                            (option: string) => option != chosenKeyword
                          )
                        : Array.from(
                            new Set([
                              ...(contentKeyword ? [contentKeyword] : []),
                              ...collectionKeywords,
                              ...contentSubKeywords,
                            ])
                          ).filter((option: string) => option != chosenKeyword)
                    }
                    defValue={chosenKeywords}
                    information="Keywords that help by enhancing the relevance, reach, and effectiveness of your main keyword strategy."
                    onChange={(value: any) => setChosenKeywords(value)}
                  />
                )}
                {type == "custom" &&
                  keywordOptions &&
                  keywordOptions.length == 0 && (
                    <>
                    <InputWrapper
                      type="text"
                      title="Add subkeywords: "
                      required={false}
                      onChange={(value: any) => setCustomKeywords(value)}
                      placeholder="Enter your subkeywords and devide them by a comma"
                    />
                    <p style={{marginTop: -8, fontSize: 12}}>*Enter your subjects and devide them by a comma</p>
                    </>
                  )}
              </>
            ) : (
              <>
                <InputWrapper
                  type="dropdown"
                  title="Keyword collection:"
                  required={false}
                  value={chosenCollection}
                  options={collections ? collections : null}
                  onChange={(value: any) => setChosenCollection(value)}
                  placeholder="Which collection do you want to use?"
                />
                {chosenCollection != 1 && chosenKeyword != null ? (
                  <>
                    <InputWrapper
                      type="dropdown"
                      title="Focus keyword:"
                      required={false}
                      value={chosenKeyword}
                      options={keywordOptions}
                      information="This will be the keyword your content is focused on."
                      onChange={(value: string) => {
                        setChosenKeyword(value);
                        setChosenKeywords([
                          ...chosenKeywords.filter(
                            (item: string) => item != value
                          ),
                        ]);
                      }}
                    />
                    {keywordOptions && keywordOptions.length > 1 && (
                      <InputWrapper
                        type="vertMultiSelect"
                        title="Subkeywords to use:"
                        required={false}
                        options={keywordOptions.filter(
                          (option: string) => option != chosenKeyword
                        )}
                        defValue={chosenKeywords}
                        information="Keywords that help by enhancing the relevance, reach, and effectiveness of your main keyword strategy."
                        onChange={(value: any) => setChosenKeywords(value)}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <h5>Or</h5>
                    <InputWrapper
                      type="text"
                      title="Focus keyword:"
                      required={false}
                      onChange={(value: any) => setChosenKeyword(value)}
                      placeholder="Enter your focus keyword"
                    />
                    <InputWrapper
                      type="text"
                      title="Subkeywords:"
                      required={false}
                      onChange={(value: any) => setCustomKeywords(value)}
                      placeholder="Enter your subkeywords and devide them by a comma"
                    />
                  </>
                )}
              </>
            )}
          </PopUp>
        </PopUpWrapper>
      )}
    </div>
  );
}
