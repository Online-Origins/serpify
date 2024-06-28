"use client";
import PageTitle from "@/components/page-title/page-title.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import Button from "@/components/ui/button/button.component";
import { ArrowForwardRounded } from "@mui/icons-material";
import ContentItemsWrapper from "@/components/content-items-wrapper/content-items-wrapper.component";
import { useEffect, useRef, useState } from "react";
import CollectionsWrapper from "@/components/collections-wrapper/collections-wrapper.component";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import DomainStatistics from "@/components/domain-statistics/domain-statistics.component";
import { useSharedContext } from "@/context/SharedContext";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import CircularLoader from "@/components/circular-loader/circular-loader.component";

export default function Home() {
  const loadingRef = useRef(true);
  const router = useRouter();
  const gottenData = useRef(false);
  const [role, setRole] = useState("");
  const { currentUrl, analyticsPeriod, setUserRole } = useSharedContext();

  useEffect(() => {
    const authorizationCode = getAuthorizationCode();
    const role = sessionStorage.getItem("role");

    if (!authorizationCode && !gottenData.current && !role) {
      // Redirect to the login page if a user isn't authorized yet
      if (loadingRef.current) {
        router.push("/login");
      }
    } else if (
      authorizationCode &&
      !gottenData.current &&
      currentUrl &&
      currentUrl != ""
    ) {
      // Get search console data if a user is authenticated
      if (loadingRef.current) {
        handleExecute(authorizationCode);
        loadingRef.current = false;
      }
    } else if (role) {
      setRole(role);
      loadingRef.current = false;
    }
  }, [currentUrl, loadingRef.current, gottenData.current]);

  // Handle getting search console data
  async function handleExecute(authorizationCode: any) {
    try {
      const tokenResponse = await fetch("/api/exchangeCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: authorizationCode }),
      });
      const { accessToken, entries, refreshToken } = await tokenResponse.json();

      sessionStorage.setItem("role", "user");
      setUserRole("user")
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem("entries", JSON.stringify(entries));

      gottenData.current = true;
      router.push("/");
    } catch (error) {
      alert(
        "Something went wrong while authenticating. Please try again later"
      );
    }
  }

  // Utility function to get the authorization code from URL
  const getAuthorizationCode = () => {
    const url = window.location.href;
    return new URL(url).searchParams.get("code");
  };

  return loadingRef.current ? (
    <PopUpWrapper>
      <CircularLoader />
      <p>Loading...</p>
    </PopUpWrapper>
  ) : (
    <InnerWrapper
      className={classNames(styles.homeWrapper, "scrollbar noMargin")}
    >
      <h1>Welcome!</h1>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Website analytics"}
          smallTitle={`(${analyticsPeriod})`}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => router.push("/analytics")}>
              <p>See analytics</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        {role != "guest" && role != "unauthorized" && <DomainStatistics />}
        {role == "guest" && (
          <h5>You need to log in with Google for this feature</h5>
        )}
      </div>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Content projects"}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => router.push("/content")}>
              <p>See all projects</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        <ContentItemsWrapper small />
      </div>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Keyword collections"}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => router.push("/keywords")}>
              <p>See all collections</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        <CollectionsWrapper small />
      </div>
    </InnerWrapper>
  );
}
