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
    setWebData,
    setPagesData,
    setQueryData,
    availableDomains,
    setAvailableDomains,
    setWebDataPrev,
    setPagesDataPrev,
    setQueryDataPrev,
    analyticsPeriod,
    setAnalyticsPeriod,
    userRole,
    setUserRole,
  } = useSharedContext();
  const [domains, setDomains] = useState<string[]>([]);

  // Check the pathname and change the menu to a smaller version
  useEffect(() => {
    if (pathname != "/") {
      setSmallNav(true);
    }
  }, [pathname, setSmallNav]);

  // Update the current url if the current domain changes
  // Also get the data from the domain
  useEffect(() => {
    if (currentUrl) {
      if (currentUrl != currentDomain) {
        setCurrentUrl(currentDomain);
        const pageDomains = sessionStorage.getItem("entries");
        if (pageDomains) {
          const entries = JSON.parse(pageDomains) || [""];
          let correctUrl = [];
          if (entries) {
            correctUrl = entries
              .filter((item: any) => item.siteUrl.includes(currentDomain))
              .map((item: any) => item.siteUrl);
          }
          if (correctUrl.length == 0) {
            alert("The chosen domain isn't activated in your Search console.");
            setUserRole("unauthorized");
          } else {
            setUserRole("user");
          }
        }
      }
      if (userRole && userRole != "guest" && userRole != "unauthorized") {
        getData();
      } else if (!userRole) {
        const role = sessionStorage.getItem("role");
        setUserRole(role);
      }
    }
  }, [currentDomain, analyticsPeriod, userRole]);

  function getData() {
    const today = new Date();
    if (analyticsPeriod == "Last month") {
      today.setDate(today.getDate() - 1);
      const startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      const prevStartDate = new Date(startDate);
      prevStartDate.setMonth(today.getMonth() - 2);
      gettingData(currentDomain, startDate, today, prevStartDate);
    } else if (analyticsPeriod == "Last week") {
      today.setDate(today.getDate() - 1);
      const startDate = new Date(today); // Create a new Date object based on 'today'
      startDate.setDate(today.getDate() - 8);
      const prevStartDate = new Date(startDate); // Create a new Date object based on 'startDate'
      prevStartDate.setDate(startDate.getDate() - 8);
      gettingData(currentDomain, startDate, today, prevStartDate);
    } else if (analyticsPeriod == "Last 2 weeks") {
      today.setDate(today.getDate() - 1);
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 15);
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(startDate.getDate() - 15);
      gettingData(currentDomain, startDate, today, prevStartDate);
    } else if (analyticsPeriod == "Last 6 months") {
      today.setDate(today.getDate() - 1);
      const startDate = new Date();
      startDate.setMonth(today.getMonth() - 6);
      const prevStartDate = new Date();
      prevStartDate.setMonth(startDate.getMonth() - 6);
      gettingData(currentDomain, startDate, today, prevStartDate);
    } else if (analyticsPeriod == "Last year") {
      today.setDate(today.getDate() - 1);
      const startDate = new Date();
      startDate.setFullYear(today.getFullYear() - 1);
      const prevStartDate = new Date();
      prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
      gettingData(currentDomain, startDate, today, prevStartDate);
    }
  }

  useEffect(() => {
    if (!analyticsPeriod) {
      setAnalyticsPeriod("Last month");
    }
  }, [analyticsPeriod]);

  // Get the data from search console
  function gettingData(
    websiteUrl: string,
    startDate: any,
    endDate: any,
    prevStartDate: any
  ) {
    const pageDomains = JSON.parse(sessionStorage.getItem("entries") || "");
    const userAccessToken = sessionStorage.getItem("accessToken");
    if (pageDomains != "" && userAccessToken != "") {
      const currentToken = userAccessToken || "";
      const entries = pageDomains || [""];
      let correctUrl = [];
      if (entries) {
        correctUrl = entries
          .filter((item: any) => item.siteUrl.includes(websiteUrl))
          .map((item: any) => item.siteUrl);
      }
      if (correctUrl.length == 0) {
        setWebData([]);
        setPagesData([]);
        setQueryData([]);
        return;
      } else {
        fetchData(
          currentToken,
          correctUrl[0],
          startDate,
          endDate,
          "date",
          setWebData
        );
        fetchData(
          currentToken,
          correctUrl[0],
          startDate,
          endDate,
          "page",
          setPagesData
        );
        fetchData(
          currentToken,
          correctUrl[0],
          startDate,
          endDate,
          "query",
          setQueryData
        );

        // Get the data for the 30 days before the last 30 days

        fetchData(
          currentToken,
          correctUrl[0],
          prevStartDate,
          startDate,
          "date",
          setWebDataPrev
        );
        fetchData(
          currentToken,
          correctUrl[0],
          prevStartDate,
          startDate,
          "page",
          setPagesDataPrev
        );
        fetchData(
          currentToken,
          correctUrl[0],
          prevStartDate,
          startDate,
          "query",
          setQueryDataPrev
        );
      }
    }
  }

  // Fetch the data for each dimension and save it correctly
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

  // Get the domains from the database
  useEffect(() => {
    if (!loadedDomains.current) {
      getDomains();
      loadedDomains.current = true;
    }
  }, [loadedDomains.current]);

  // Check it when the available domains change
  useEffect(() => {
    if (currentUrl && !availableDomains.includes(currentUrl)) {
      // The current url is deleted from the available domains
      setCurrentDomain(availableDomains[0]);
      setDomains(availableDomains);
    } else if (availableDomains.length > domains.length) {
      // A domain is added to the platform
      setCurrentDomain(availableDomains[availableDomains.length - 1]);
      setDomains(availableDomains);
    }
  }, [availableDomains]);

  // Get domains and sort them by id
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
