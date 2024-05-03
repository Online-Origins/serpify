"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";

import { supabase } from "@/app/api/supabaseClient/route";
import { getKeywordMetrics } from "@/app/api/keywordMetrics/route";
import { useParams, useRouter } from "next/navigation";

import PageTitle from "@/components/page-title/page-title.component";
import Table from "@/components/table/table.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import Button from "@/components/ui/button/button.component";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";

export default function Collection({ params }: { params: { slug: string } }) {
  const activeCollection = params.slug;
  const router = useRouter();
  const [keywordsData, setKeywordsData] = useState<any[]>([]);
  const [shownKeywords, setShownKeywords] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [sorting, setSorting] = useState("potential");
  const getSelectedCollectionRef = useRef(false);
  const isGettingData = useRef(false);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editPopUpOpen, setEditPopUpOpen] = useState(false);

  useEffect(() => {
    if (!getSelectedCollectionRef.current && activeCollection != undefined) {
      getSelectedCollection();
      getSelectedCollectionRef.current = true;
    }
  }, [activeCollection]);

  async function getSelectedCollection() {
    const { data } = await supabase
      .from("collections")
      .select()
      .eq("id", activeCollection);
    if (data) {
      setSelectedCollection(data);
    }
  }

  useEffect(() => {
    if (selectedCollection.length > 0 && !isGettingData.current) {
      getKeywordsData();
      setNewCollectionName(selectedCollection[0].collection_name);
      isGettingData.current = true;
    }
  }, [selectedCollection]);

  useEffect(() => {
    if (keywordsData.length > 0) {
      showKeywords(sortKeywords(keywordsData));
    }
  }, [keywordsData, sorting]);

  function showKeywords(keywords: any) {
    let array: any[] = [];
    for (let x = 0; x < 20 && x < keywords.length; x++) {
      array.push(keywords[x]);
    }
    setShownKeywords(array);
  }

  async function getKeywordsData() {
    setLoading(true);
    const data = await getKeywordMetrics(
      selectedCollection[0].keywords,
      selectedCollection[0].language,
      selectedCollection[0].country
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
    setKeywordsData(updatedData);

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
      .eq("id", activeCollection);
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
    setKeywordsData(sortKeywords(array));
  }

  // Sort the keywords on the sorting type
  function sortKeywords(array:any) {
    if (sorting == "potential") {
      return array.sort(
        (a:any, b:any) => b.keywordMetrics.potential - a.keywordMetrics.potential
      );
    } else if (sorting == "competition") {
      return array.sort(
        (a:any, b:any) =>
          a.keywordMetrics.competitionIndex - b.keywordMetrics.competitionIndex
      );
    } else if (sorting == "searchVolume") {
      return array.sort(
        (a:any, b:any) =>
          b.keywordMetrics.avgMonthlySearches -
          a.keywordMetrics.avgMonthlySearches
      );
    } else {
      return array.sort((a:any, b:any) => {
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
  }

  async function deleteCollection(collectionId: number) {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collectionId);
    if (!error) {
      router.back();
    }
  }

  async function editTitle() {
    const { error } = await supabase
      .from("collections")
      .update({ collection_name: newCollectionName })
      .eq("id", selectedCollection[0].id);
    if (!error) {
      getSelectedCollection();
      setEditPopUpOpen(false)
    }
  }

  return (
    <InnerWrapper>
      {selectedCollection && selectedCollection.length > 0 && (
        <>
          <PageTitle
            editing={() => setEditPopUpOpen(true)}
            title={selectedCollection[0].collection_name}
            goBack={() => router.back()}
            buttons={
              <Button
                type={"outline"}
                onClick={() => deleteCollection(selectedCollection[0].id)}
              >
                <p>Delete</p>
                <DeleteOutlineRoundedIcon />
              </Button>
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
          {editPopUpOpen && (
            <PopUpWrapper>
              <PopUp
                title={"Edit collection title"}
                titleButtons={
                  <Button
                    type={"textOnly"}
                    onClick={() => setEditPopUpOpen(false)}
                  >
                    <p>Close</p>
                    <CloseRoundedIcon />
                  </Button>
                }
                buttons={
                  <Button
                    type={"solid"}
                    onClick={editTitle}
                    disabled={selectedCollection[0].collection_name == newCollectionName || newCollectionName == ""}
                  >
                    <p>Save</p>
                    <SaveOutlinedIcon />
                  </Button>
                }
              >
                <InputWrapper
                  type="text"
                  value={newCollectionName}
                  title="New title:"
                  onChange={(value: string) => setNewCollectionName(value)}
                />
              </PopUp>
            </PopUpWrapper>
          )}
        </>
      )}
    </InnerWrapper>
  );
}
