"use client";
import { useEffect, useState } from "react";
import PageTitle from "../page-title/page-title.component";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import {
  ArrowForwardIosRounded,
  CircleRounded,
  CloseRounded,
  CheckRounded,
} from "@mui/icons-material";
import classNames from "classnames";
import CustomizedTooltip from "../ui/custom-tooltip/custom-tooltip.component";
import GradientSVG from "@/components/gradient-svg/gradient-svg.component";
import styles from "./content-score.module.scss";

export default function ContentScore({ contentScore }: { contentScore: any }) {
  const [goodOpen, setGoodOpen] = useState(true);
  const [minorOpen, setMinorOpen] = useState(true);
  const [warningOpen, setWarningOpen] = useState(true);
  const [keywordsOpen, setKeywordsOpen] = useState(true);
  const idCSS = "hello";

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
                rotation: -.25,
                pathColor: `url(#${idCSS})`,
                trailColor: "#FAF6FF",
                pathTransitionDuration: 0.4
              })}
            />
          </div>
          <div
            className={classNames(
              styles.points,
              goodOpen && styles.open
            )}
          >
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
          <div
            className={classNames(
              styles.points,
              minorOpen && styles.open
            )}
          >
            <div
              className={styles.pointsHeader}
              onClick={() => setMinorOpen(!minorOpen)}
            >
              <h4>
                Minor warnings: {contentScore.points.minorWarnings.length}
              </h4>
              <ArrowForwardIosRounded />
            </div>
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
          <div
            className={classNames(
              styles.points,
              keywordsOpen && styles.open,
              contentScore.subKeywordDensity.length > 4 && styles.long
            )}
          >
            <div
              className={styles.pointsHeader}
              onClick={() => setKeywordsOpen(!keywordsOpen)}
            >
              <h4>Keywords</h4>
              <ArrowForwardIosRounded />
            </div>
            {[
              ...[contentScore.keywordDensity],
              ...contentScore.subKeywordDensity,
            ].map((keyword: any, index: number) => (
              <CustomizedTooltip
                information={`${
                  index == 0 ? "Focus keyword" : "Subkeyword"
                } density: ${keyword.density.toFixed(2)}%`}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
