"use client";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import styles from "./page.module.scss";
import PageTitle from "@/components/page-title/page-title.component";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/button/button.component";

export default function AnalyticsPage() {
  const websiteUrl = "onlineorigins.nl";

  async function handleAuthorize() {
    try {
      const response = await fetch("/api/authorizeSearchConsole", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const authUrl = await response.json();
      window.location.href = authUrl;
    } catch {}
  }

  async function handleExecute() {
    const url = window.location.href;
    const authorizationCode = new URL(url).searchParams.get("code");

    if (authorizationCode) {
      try {
        const tokenResponse = await fetch("/api/exchangeCode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: authorizationCode }),
        });
        const { accessToken, entries } = await tokenResponse.json();
        let correctUrl = [""];
        if (entries) {
          correctUrl = entries
            .filter((item: any) => item.siteUrl.includes(websiteUrl))
            .map((item: any) => item.siteUrl);
        }

        if (accessToken) {
          try {
            const response = await fetch("/api/searchConsoleData", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                accessToken: accessToken,
                websiteUrl: correctUrl[0],
              }),
            });

            const data = await response.json();
            console.log(data);
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Authorize first");
    }
  }

  return (
    <InnerWrapper>
      <PageTitle title={"Website analytics"} />
      <Button type={"solid"} onClick={() => handleAuthorize()}>
        <p>Authorize</p>
      </Button>
      <Button type={"solid"} onClick={() => handleExecute()}>
        <p>execute</p>
      </Button>
    </InnerWrapper>
  );
}
