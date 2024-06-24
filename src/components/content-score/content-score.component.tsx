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
  const {contentKeyword, setContentKeyword, contentSubKeywords, setContentSubKeywords} = useSharedContext();
  const [goodOpen, setGoodOpen] = useState(true);
  const [minorOpen, setMinorOpen] = useState(true);
  const [warningOpen, setWarningOpen] = useState(true);
  const [keywordsOpen, setKeywordsOpen] = useState(false);
  const [chosenKeyword, setChosenKeyword] = useState<string>();
  const [chosenKeywords, setChosenKeywords] = useState<string[]>([]);
  const idCSS = "gradientId";
  const getContent = useRef(false);

  useEffect(() => {
    if (!getContent.current && contentKeyword) {
      setChosenKeyword(contentKeyword);
      setChosenKeywords(contentSubKeywords);
      getContent.current = true;
    }
  }, [contentKeyword]);

  const areArraysEqual = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false;
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  };

  async function saveKeywords() {
    const contentId = localStorage.getItem("content_id");

    const {error} = await supabase.from("contentItems").update({
      keyword: chosenKeyword,
      sub_keywords: chosenKeywords.sort(),
    }).eq("id", contentId);

    if (!error){
      setContentKeyword(chosenKeyword);
      setContentSubKeywords(chosenKeywords.sort());
      setKeywordsOpen(false);
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
              <Button type={"textOnly"} onClick={() => setKeywordsOpen(false)}>
                <p>Close</p>
                <CloseRounded />
              </Button>
            }
            buttons={
              <Button
                type={"solid"}
                onClick={() => saveKeywords()}
                disabled={areArraysEqual(chosenKeywords, contentSubKeywords)}
              >
                <p>Save</p>
                <SaveOutlined />
              </Button>
            }
          >
            <InputWrapper
              type="dropdown"
              title="Focus keyword:"
              required={false}
              value={chosenKeyword}
              options={[contentKeyword, ...contentSubKeywords]}
              information="This will be the keyword your content is focused on."
              onChange={(value: string) => {
                setChosenKeyword(value);
                setChosenKeywords([
                  ...chosenKeywords.filter((item: string) => item != value),
                ]);
              }}
              placeholder="Which collection do you want to use?"
            />
            <InputWrapper
              type="vertMultiSelect"
              title="Subkeywords to use:"
              required={false}
              options={[
                contentKeyword,
                ...contentSubKeywords,
              ].filter((option: string) => option != chosenKeyword)}
              defValue={chosenKeywords}
              information="Keywords that help by enhancing the relevance, reach, and effectiveness of your main keyword strategy."
              onChange={(value: any) => setChosenKeywords(value)}
              placeholder="Which collection do you want to use?"
            />
          </PopUp>
        </PopUpWrapper>
      )}
    </div>
  );
}
