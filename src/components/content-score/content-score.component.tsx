"use client";
import { useState } from "react";
import PageTitle from "../page-title/page-title.component";
import styles from "./content-score.module.scss";
import { CircularProgressbar } from "react-circular-progressbar";

import {
  ArrowForwardIosRounded,
  CircleRounded,
  CloseRounded,
  CheckRounded,
} from "@mui/icons-material";
import classNames from "classnames";
import CustomizedTooltip from "../ui/custom-tooltip/custom-tooltip.component";

export default function ContentScore({ contentScore }: { contentScore: any }) {
  const [goodOpen, setGoodOpen] = useState(false);
  const [minorOpen, setMinorOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [keywordsOpen, setKeywordsOpen] = useState(true);

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
            <h1>{contentScore.seoScore.toFixed(0)}</h1>
            <CircularProgressbar
              value={contentScore.seoScore}
              circleRatio={0.5}
              strokeWidth={15}
              className={styles.score}
              styles={{
                root: {
                  transform: "rotate(0.75turn)",
                },
                path: { stroke: "#6210CC", strokeLinecap: "butt" },
                trail: { stroke: "#FAF6FF", strokeLinecap: "butt" },
              }}
            />
          </div>
          <div className={classNames(styles.points, goodOpen && styles.open)}>
            <div
              className={styles.pointsHeader}
              onClick={() => setGoodOpen(!goodOpen)}
            >
              <h4>Good points: {contentScore.messages.goodPoints.length}</h4>
              <ArrowForwardIosRounded />
            </div>
            {contentScore.messages.goodPoints.map(
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
          <div className={classNames(styles.points, minorOpen && styles.open)}>
            <div
              className={styles.pointsHeader}
              onClick={() => setMinorOpen(!minorOpen)}
            >
              <h4>
                Minor warnings: {contentScore.messages.minorWarnings.length}
              </h4>
              <ArrowForwardIosRounded />
            </div>
            {contentScore.messages.minorWarnings.map(
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
          <div
            className={classNames(styles.points, warningOpen && styles.open)}
          >
            <div
              className={styles.pointsHeader}
              onClick={() => setWarningOpen(!warningOpen)}
            >
              <h4>Warnings: {contentScore.messages.warnings.length}</h4>
              <ArrowForwardIosRounded />
            </div>
            {contentScore.messages.warnings.map(
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
          <div
            className={classNames(styles.points, keywordsOpen && styles.open)}
          >
            <div
              className={styles.pointsHeader}
              onClick={() => setKeywordsOpen(!keywordsOpen)}
            >
              <h4>Keywords</h4>
              <ArrowForwardIosRounded />
            </div>
            {contentScore.subKeywordDensity.map(
              (keyword: any, index: number) => (
                <CustomizedTooltip
                  information={`Keyword density: ${keyword.density.toFixed(
                    2
                  )}%`}
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
                      <CheckRounded />
                    ) : (
                      <CloseRounded />
                    )}
                  </div>
                </CustomizedTooltip>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
