"use client";
import ComponentWrapper from "@/components/ui/component-wrapper/component-wrapper.component";
import classNames from "classnames";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import TextFieldsRoundedIcon from "@mui/icons-material/TextFieldsRounded";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./menu-bar.module.scss";
import InputWrapper from "../ui/input-wrapper/input-wrapper.component";

export default function MenuBar({
  setSmallNav,
  smallNav,
}: {
  setSmallNav: any;
  smallNav: boolean;
}) {
  const pathname = usePathname();
  const [domains, setDomains] = useState(["onlineorigins.nl"]);
  const [currentDomain, setCurrentDomain] = useState(domains[0]);

  useEffect(() => {
    if (pathname != "/") {
      setSmallNav(true);
    }
  }, [pathname, setSmallNav]);

  useEffect(() => {
    const webUrl = sessionStorage.getItem("websiteUrl");
    if (webUrl && webUrl != currentDomain) {
      sessionStorage.setItem("websiteUrl", currentDomain);
    } else if (!webUrl) {
      sessionStorage.setItem("websiteUrl", currentDomain);
    }
  }, [currentDomain]);

  return (
    <ComponentWrapper
      className={classNames(
        styles.menuBarWrapper,
        smallNav ? styles.smallMenu : ""
      )}
    >
      <div className={styles.topWrapper}>
        <div className={styles.topTopWrapper}>
          <div className={styles.logoWrapper}>
            <img
              src="/serpify-logo.svg"
              alt="Serpify logo"
              className={styles.logo}
            />
          </div>
          <InputWrapper
            type="dropdown"
            small
            value={currentDomain}
            onChange={(value: any) => setCurrentDomain(value)}
            options={domains}
            className={styles.dropdown}
            domainDropdown
          />
        </div>
        <div className={styles.mainMenu}>
          <h3>Tools</h3>
          <ul>
            <li>
              <Link href="/" className={pathname == "/" ? styles.active : ""}>
                <HomeOutlinedIcon />
                <h4>Home</h4>
              </Link>
            </li>
            <li>
              <Link
                className={pathname.includes("/keywords") ? styles.active : ""}
                href="/keywords"
              >
                <GridViewOutlinedIcon />
                <h4>Keyword search</h4>
              </Link>
            </li>
            <li>
              <Link
                className={pathname.includes("/content") ? styles.active : ""}
                href="/content"
              >
                <TextFieldsRoundedIcon />
                <h4>Content writer</h4>
              </Link>
            </li>
            <li>
              <Link
                className={pathname == "/analytics" ? styles.active : ""}
                href="/analytics"
              >
                <AssessmentOutlinedIcon />
                <h4>Website analytics</h4>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomNav}>
        <ul>
          <li onClick={() => setSmallNav(!smallNav)}>
            <a>
              <ArrowForwardRoundedIcon
                className={!smallNav ? styles.arrowRotate : ""}
              />
              <h4>Close menu</h4>
            </a>
          </li>
          <li className={pathname == "/settings" ? styles.active : ""}>
            <a>
              <SettingsOutlinedIcon />
              <h4>Settings</h4>
            </a>
          </li>
        </ul>
      </div>
    </ComponentWrapper>
  );
}
