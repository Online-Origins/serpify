"use client";
import ComponentWrapper from "@/components/ui/component-wrapper/component-wrapper.component";
import classNames from "classnames";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import TextFieldsRoundedIcon from "@mui/icons-material/TextFieldsRounded";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./menu-bar.module.scss";
import InputWrapper from "../ui/input-wrapper/input-wrapper.component";
import { supabase } from "@/app/utils/supabaseClient/server";
import { useSharedContext } from "@/context/SharedContext";

export default function MenuBar({
  setSmallNav,
  smallNav,
}: {
  setSmallNav: any;
  smallNav: boolean;
}) {
  const pathname = usePathname();
  const [currentDomain, setCurrentDomain] = useState<any>("");
  const loadedDomains = useRef(false);
  const {
    currentUrl,
    setCurrentUrl,
    webData,
    setWebData,
    pagesData,
    setPagesData,
    queryData,
    setQueryData,
    availableDomains,
    setAvailableDomains,
  } = useSharedContext();
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    const sessionWebData = sessionStorage.getItem("webData");
    const sessionPagesData = sessionStorage.getItem("pagesData");
    const sessionQueryData = sessionStorage.getItem("queryData");
    if (!webData) {
      if (sessionWebData) {
        setWebData(JSON.parse(sessionWebData));
      }
    }
    if (!pagesData) {
      if (sessionPagesData) {
        setPagesData(JSON.parse(sessionPagesData));
      }
    }
    if (!queryData) {
      if (sessionQueryData) {
        setQueryData(JSON.parse(sessionQueryData));
      }
    }
  }, [webData]);

  useEffect(() => {
    if (pathname != "/") {
      setSmallNav(true);
    }
  }, [pathname, setSmallNav]);

  useEffect(() => {
    if (currentUrl && currentUrl != currentDomain) {
      setCurrentUrl(currentDomain);
      const role = sessionStorage.getItem("role");
      if (role && role != "guest") {
        gettingData(currentDomain, undefined, undefined);
      }
    }
  }, [currentDomain]);

  function gettingData(
    websiteUrl: string,
    accessToken?: string,
    passedEntries?: any
  ) {
    const pageDomains = JSON.parse(sessionStorage.getItem("entries") || "");
    const userAccessToken = sessionStorage.getItem("accessToken");
    if (
      (pageDomains != "" || passedEntries) &&
      (userAccessToken != "" || accessToken)
    ) {
      const currentToken = userAccessToken || accessToken || "";
      const entries = pageDomains || passedEntries || [""];
      let correctUrl = [];
      if (entries) {
        correctUrl = entries
          .filter((item: any) => item.siteUrl.includes(websiteUrl))
          .map((item: any) => item.siteUrl);
      }
      if (correctUrl.length == 0) {
        alert("The chosen domain isn't activated in your Search console.");
        setWebData([]);
        setPagesData([]);
        setQueryData([]);
        return;
      } else {
        const today = new Date();
        const startDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          today.getDate()
        );
        const endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        fetchData(
          currentToken,
          correctUrl,
          startDate,
          endDate,
          "date",
          setWebData
        );
        fetchData(
          currentToken,
          correctUrl,
          startDate,
          endDate,
          "page",
          setPagesData
        );
        fetchData(
          currentToken,
          correctUrl,
          startDate,
          endDate,
          "query",
          setQueryData
        );
      }
    }
  }

  async function fetchData(
    accessToken: string,
    correctUrl: string,
    startDate: any,
    endDate: any,
    dimension: string,
    saveData: (data: any) => void
  ) {
    const refreshToken = sessionStorage.getItem("refreshToken");
    try {
      const response = await fetch("/api/domainData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: accessToken,
          websiteUrl: correctUrl,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          dimension: [dimension],
          refreshToken: refreshToken,
        }),
      });

      const data = await response.json();
      saveData(data.rows ? data.rows : []);
    } catch (error) {
      console.error("Error fetching search console data", error);
    }
  }

  useEffect(() => {
    if (!loadedDomains.current) {
      getDomains();
      loadedDomains.current = true;
    }
  }, [loadedDomains.current]);

  useEffect(() => {
    if (currentUrl && !availableDomains.includes(currentUrl)) {
      setCurrentDomain(availableDomains[0]);
    } else if (availableDomains.length > domains.length) {
      setCurrentDomain(availableDomains[availableDomains.length - 1]);
      setDomains(availableDomains);
    }
  }, [availableDomains]);

  async function getDomains() {
    const { data } = await supabase.from("domains").select();
    if (data) {
      const sorted = data.sort((a: any, b: any) => a.id - b.id);
      setAvailableDomains(sorted.map((domain: any) => domain.domain));
      setDomains(sorted.map((domain: any) => domain.domain));
      setCurrentDomain(sorted[0].domain);
      setCurrentUrl(sorted[0].domain);
    }
  }

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
            options={availableDomains}
            className={styles.dropdown}
            domainDropdown
            disabled={
              pathname != "/" &&
              pathname != "/keywords" &&
              pathname != "/content" &&
              pathname != "/analytics" &&
              pathname != "/settings"
            }
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
          <li>
            <Link
              className={pathname == "/settings" ? styles.active : ""}
              href="/settings"
            >
              <SettingsOutlinedIcon />
              <h4>Settings</h4>
            </Link>
          </li>
        </ul>
      </div>
    </ComponentWrapper>
  );
}
