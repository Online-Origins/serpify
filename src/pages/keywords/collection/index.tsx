import { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";

import { supabase } from "@/app/api/supabaseClient/route";
import { getKeywordMetrics } from "@/app/api/keywordMetrics/route";

import PageTitle from "@/components/page-title/page-title.component";
import Table from "@/components/table/table.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import Button from "@/components/ui/button/button.component";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

export default function Collection({
  collectionId,
  setPages,
}: {
  collectionId: string;
  setPages: any;
}) {
  const [keywordsData, setKeywordsData] = useState<any[]>([]);
  const [shownKeywords, setShownKeywords] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [sorting, setSorting] = useState("potential");
  const getCollectionsRef = useRef(false);
  const isGettingData = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getCollectionsRef.current) {
      getSelectedCollection();
      getCollectionsRef.current = true;
    }
  }, []);

  async function getSelectedCollection() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      // Find the collection with the matching ID
      setSelectedCollection(
        data.find((collection) => collection.id === collectionId)
      );
    }
  }

  useEffect(() => {
    if (selectedCollection.keywords && !isGettingData.current) {
      getKeywordsData();
      isGettingData.current = true;
    }
  }, [selectedCollection]);

  useEffect(() => {
    sortKeywords();
  }, [sorting]);

  useEffect(() => {
    if(keywordsData.length > 0){
        sortKeywords();
        showKeywords();
    }
  }, [keywordsData])

  function showKeywords() {
    let array: any[] = [];
    for (let x = 0; x < 20 && x < keywordsData.length; x++) {
      array.push(keywordsData[x]);
    }
    setShownKeywords(array);
  }

  async function getKeywordsData() {
    setLoading(true);
    const data = await getKeywordMetrics(
      selectedCollection.keywords,
      selectedCollection.language,
      selectedCollection.country
    );

    const updatedData = data.map((keyword: any) => ({
      ...keyword,
      keywordMetrics: {
        ...keyword.keywordMetrics,
        potential: Math.ceil(
          potentialIndex(
            keyword.keywordMetrics.avgMonthlySearches,
            keyword.keywordMetrics.competitionIndex
          )
        ),
      },
    }));
    setKeywordsData(updatedData)
    
    setLoading(false);
    
    let array: string[] = [];
    updatedData.map((keyword: any) => {
      array.push(keyword.text);
    });
    setSelectedKeywords(array);
  }

  function searchVolume(googleVolume: number) {
    switch (true) {
      case googleVolume >= 10 && googleVolume < 100:
        return "10 - 100";
      case googleVolume >= 100 && googleVolume < 1000:
        return "100 - 1K";
      case googleVolume >= 1000 && googleVolume < 10000:
        return "1K - 10K";
      case googleVolume >= 10000 && googleVolume < 100000:
        return "10K - 100K";
      default:
        return googleVolume;
    }
  }

  function potentialIndex(googleVolume: number, competition: number) {
    const search = searchVolume(googleVolume);

    switch (true) {
      case search == "10 - 100":
        return (25 + (100 - competition)) / 2;
      case search == "100 - 1K":
        return (50 + (100 - competition)) / 2;
      case search == "1K - 10K":
        return (75 + (100 - competition)) / 2;
      case search == "10K - 100K":
        return (100 + (100 - competition)) / 2;
      default:
        return 0;
    }
  }

  // Check if there has been a change in selected keywords
  function checkChangeKeywords() {
    let state = true;
    let array: string[] = [];
    keywordsData.map((collectionKeyword: any) => {
      array.push(collectionKeyword.text);
    });
    if (array.length != selectedKeywords.length) {
      state = false;
    }

    return state;
  }

  async function updateCollection() {
    const { error } = await supabase
      .from("collections")
      .update({ keywords: selectedKeywords })
      .eq("id", collectionId);
    if (error) {
      console.log(error);
    }

    let array: any[] = [];
    keywordsData.map((keyword: any) => {
      selectedKeywords.map((selectedKeyword) => {
        if (keyword.text == selectedKeyword) {
          array.push(keyword);
        }
      });
    });
    setKeywordsData(array);
  }

  function sortKeywords() {
    if (sorting == "potential") {
      keywordsData.sort(
        (a, b) =>
          b.keywordMetrics.potential - a.keywordMetrics.potential
      );
    } else if (sorting == "competition") {
      keywordsData.sort(
        (a, b) =>
          a.keywordMetrics.competitionIndex -
          b.keywordMetrics.competitionIndex
      );
    } else if (sorting == "searchVolume") {
      keywordsData.sort(
        (a, b) =>
          b.keywordMetrics.avgMonthlySearches -
          a.keywordMetrics.avgMonthlySearches
      );
    } else {
      keywordsData.sort((a, b) => {
        // Compare the text values
        if (a.text < b.text) {
          return -1;
        } else if (a.text > b.text) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    showKeywords();
  }

  return (
    <InnerWrapper>
      <PageTitle
        title={selectedCollection.collection_name}
        goBack={() =>
          // Go back one page
          setPages((prevPages: any) => {
            // Create a new array with all elements except the last one
            return prevPages.slice(0, -1);
          })
        }
      />
      {!loading ? (
      <div className={styles.outerTableWrapper}>
        <Table
          shownKeywords={shownKeywords}
          sorting={sorting}
          setSorting={setSorting}
          selectedKeywords={selectedKeywords}
          setSelectedKeywords={setSelectedKeywords}
          searchVolume={searchVolume}
          potentialIndex={potentialIndex}
        />
        <div className={styles.buttonWrapper}>
          <Button
            type={"solid"}
            onClick={() => updateCollection()}
            disabled={checkChangeKeywords()}
          >
            <p>Save</p>
            <SaveOutlinedIcon />
          </Button>
        </div>
      </div>
      ) : (
        <h5>Loading...</h5>
      )}
    </InnerWrapper>
  );
}
