"use client";
import ComponentWrapper from "@/components/ui/component-wrapper/component-wrapper.component";
import styles from "./menu-bar.module.scss";
import classNames from "classnames";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import TextFieldsRoundedIcon from "@mui/icons-material/TextFieldsRounded";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export default function MenuBar({
  active,
  setActive,
  smallNav,
  setSmallNav,
}: {
  active: string;
  setActive: any;
  smallNav: boolean;
  setSmallNav: any;
}) {
  return (
    <ComponentWrapper
      className={classNames(
        styles.menuBarWrapper,
        smallNav ? styles.smallMenu : ""
      )}
    >
      <div className={styles.topWrapper}>
        <div className={styles.logoWrapper}>
          <img
            src="/serpify-logo.svg"
            alt="Serpify logo"
            className={styles.logo}
          />
        </div>
        <div className={styles.mainMenu}>
          <h3>Tools</h3>
          <ul>
            <li
              className={active == "home" ? styles.active : ""}
              onClick={() => setActive("home")}
            >
              <HomeOutlinedIcon />
              <h4>Home</h4>
            </li>
            <li
              className={active == "keyword" ? styles.active : ""}
              onClick={() => setActive("keyword")}
            >
              <GridViewOutlinedIcon />
              <h4>Keyword search</h4>
            </li>
            <li
              className={active == "contentWriting" ? styles.active : ""}
              onClick={() => setActive("contentWriting")}
            >
              <TextFieldsRoundedIcon />
              <h4>Content writer</h4>
            </li>
            <li
              className={active == "analytics" ? styles.active : ""}
              onClick={() => setActive("analytics")}
            >
              <AssessmentOutlinedIcon />
              <h4>Website analytics</h4>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomNav}>
        <ul>
          <li onClick={() => setSmallNav(!smallNav)}>
            <ArrowForwardRoundedIcon
              className={!smallNav ? styles.arrowRotate : ""}
            />
            <h4>Close menu</h4>
          </li>
          <li
            className={active == "settings" ? styles.active : ""}
            onClick={() => setActive("settings")}
          >
            <SettingsOutlinedIcon />
            <h4>Settings</h4>
          </li>
        </ul>
      </div>
    </ComponentWrapper>
  );
}
