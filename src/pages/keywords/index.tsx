import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import CollectionsPage from "./collections";
import KeywordSearching from "./searching";

import { getKeywordMetrics } from "@/app/api/keywordMetrics/route";

export default function Keywords() {
  const [pages, setPages] = useState(["collections"]);
  const page = pages[pages.length - 1];
  const [keywordsArray, setKeywordsArray] = useState([]);

  const [searching, setSearching] = useState({
    subjects: [],
    volume: [
      {
        min: 0,
        max: 100.0,
      },
    ],
    competition: [
      {
        min: 0,
        max: 100,
      },
    ],
    potential: [
      {
        min: 0,
        max: 100,
      },
    ],
  });

  // Start generating keywords
  useEffect(() => {
    if (searching.subjects.length > 0) {
      generateKeywords();
    }
  }, [searching.subjects]);

  // Reset the generated keywords
  useEffect(() => {
    if (pages[pages.length - 1] == "collections") {
      setKeywordsArray([]);
    }
  }, [pages]);

  async function generateKeywords() {
    console.log("Start generating with OpenAI");
    try {
      const response = await fetch("/api/generateKeywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: searching.subjects,
          language: "Nederlands",
          wordsLength: ["shorttail", "longtail"],
        }),
      });

      const data = await response.json();

      // googleAdsKeywords([...searching.subjects, ...data.generatedKeywordsList]);

      console.log(data.KeywordMetrics);
      setKeywordsArray(data.generatedKeywordsList);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  }

  async function googleAdsKeywords(keywords: any) {
    // console.log(keywords)
    console.log("Start generating with Google Ads");

  }

  if (page == "collections") {
    return (
      <CollectionsPage
        setPages={setPages}
        filters={searching}
        setFilters={setSearching}
      />
    );
  } else if (page == "search") {
    return (
      <KeywordSearching
        filters={searching}
        setPages={setPages}
        generatedKeywords={keywordsArray}
      />
    );
  } else {
    return null;
  }
}
