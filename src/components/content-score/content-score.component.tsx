"use client";
import { useEffect, useState } from "react";
import PageTitle from "../page-title/page-title.component";
import styles from "./content-score.module.scss";
import { CircularProgressbar } from "react-circular-progressbar";

import { KeyboardArrowUpRounded, CircleRounded } from "@mui/icons-material";
import classNames from "classnames";

export default function ContentScore({ contentScore }: { contentScore: any }) {
  const [goodOpen, setGoodOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(true);
  const [minorOpen, setMinorOpen] = useState(false);

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
            <h1>{Math.ceil(contentScore.seoScore)}</h1>
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
          <div className={classNames(styles.points,
                goodOpen && styles.open)}>
            <div
              className={styles.pointsHeader}
              onClick={() => setGoodOpen(!goodOpen)}
            >
              <h4>Good points: {contentScore.messages.goodPoints.length}</h4>
              <KeyboardArrowUpRounded />
            </div>
            {contentScore.messages.goodPoints.map(
                (point: string, index: number) => (
                  <p className={styles.good} key={index}>
                    <CircleRounded />
                    {point}
                  </p>
                )
              )}
          </div>
          <div className={classNames(styles.points,
                minorOpen && styles.open)}>
            <div
              className={styles.pointsHeader}
              onClick={() => setMinorOpen(!minorOpen)}
            >
              <h4>
                Minor warnings: {contentScore.messages.minorWarnings.length}
              </h4>
              <KeyboardArrowUpRounded />
            </div>
            {contentScore.messages.minorWarnings.map(
                (point: string, index: number) => (
                  <p className={styles.minor} key={index}>
                    <CircleRounded />
                    {point}
                  </p>
                )
              )}
          </div>
          <div className={classNames(styles.points,
                warningOpen && styles.open)}>
            <div
              className={styles.pointsHeader}
              onClick={() => setWarningOpen(!warningOpen)}
            >
              <h4>
                Warnings: {contentScore.messages.warnings.length}
              </h4>
              <KeyboardArrowUpRounded />
            </div>
            {contentScore.messages.warnings.map(
                (point: string, index: number) => (
                  <p className={styles.warning} key={index}>
                    <CircleRounded />
                    {point}
                  </p>
                )
              )}
          </div>
        </div>
      )}
    </div>
  );
}
