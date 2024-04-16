import styles from "./index.module.scss";

import { useEffect, useRef, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Slider } from "@mui/material";

import Button from "@/components/ui/button/button.component";
import PageTitle from "@/components/page-title/page-title.component";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";

import languageCodes from "@/json/language-codes.json";
import { supabase } from "@/app/api/supabaseClient/route";
import CollectionCard from "@/components/collection-card/collection-card.component";

export default function CollectionsPage({
  setPages,
  filters,
  setFilters,
}: {
  setPages: any;
  filters: any;
  setFilters: any;
}) {
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [moreFilters, setMoreFilters] = useState(false);

  const [subjectsInput, setSubjectsInput] = useState("");
  const [keywordsLanguage, setKeywordsLanguage] = useState(
    languageCodes[0].criterionId
  );
  const [keywordLength, setKeywordLength] = useState(["shorttail", "longtail"]);
  const [searchVolume, setSearchVolume] = useState<number[]>([0, 100]);
  const [competition, setCompetition] = useState<number[]>([0, 100]);
  const [potential, setPotential] = useState<number[]>([0, 100]);

  const getCollectionsRef = useRef(false);
  interface Collection {
    id: number;
    collection_name: string;
    keywords: [];
    // other properties
  }
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (!getCollectionsRef.current) {
      getCollections();
      getCollectionsRef.current = true;
    }
  }, []);

  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      setCollections(data);
    }
  }

  const startSearching = () => {
    const subjectArray = subjectsInput.split(",");

    setFilters((prevState: any) => ({
      ...prevState,
      subjects: subjectArray,
      language: keywordsLanguage,
      keywordLength: keywordLength,
      volume: [
        {
          min: searchVolumeTranslate(searchVolume[0]),
          max: searchVolumeTranslate(searchVolume[1]),
        },
      ],
      competition: [{ min: competition[0], max: competition[1] }],
      potential: [{ min: potential[0], max: potential[1] }],
    }));

    setPages((prevState: any) => [...prevState, "search"]);
  };

  function searchVolumeTranslate(filterValue: number) {
    switch (true) {
      case filterValue == 0:
        return 10;
      case filterValue == 25:
        return 100;
      case filterValue == 50:
        return 1000;
      case filterValue == 75:
        return 10000;
      case filterValue == 100:
        return 100000;
      default:
        return 0;
    }
  }

  return (
    <InnerWrapper>
      <PageTitle
        title={"Keyword collections"}
        buttons={
          <Button type={"solid"} onClick={() => setPopUpOpen(true)}>
            <p>Start new research</p> <AddRoundedIcon />
          </Button>
        }
      />
      {collections ? (
        <div className={styles.collectionsWrapper}>
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
      {popUpOpen && (
        <PopUpWrapper>
          <PopUp
            title={"Keyword research"}
            titleButtons={
              <Button type={"textOnly"} onClick={() => setPopUpOpen(false)}>
                <p>Close</p>
                <CloseRoundedIcon />
              </Button>
            }
            buttons={
              <Button
                type={"solid"}
                onClick={startSearching}
                disabled={subjectsInput == ""}
              >
                <p>Start searching</p>
                <SearchRoundedIcon />
              </Button>
            }
          >
            <InputWrapper
              type="text"
              title="Subjects:"
              required={true}
              onChange={(value: any) => setSubjectsInput(value)}
              placeholder="For what subject do you want keywords?"
            />
            {moreFilters && (
              <div className={styles.filters}>
                <InputWrapper
                  type="dropdown"
                  title="Language:"
                  required={false}
                  value={keywordsLanguage}
                  options={languageCodes}
                  onChange={(value: any) => setKeywordsLanguage(value)}
                  placeholder="In what language should the keywords be?"
                />
                <InputWrapper
                  type="multiSelect"
                  title="Length of the keywords:"
                  required={false}
                  onChange={(value: any) => setKeywordLength(value)}
                  defValue={keywordLength}
                  information="Search volume is the number of times, on average, that users enter a particular search query into a search engine each month."
                />
                <div className={styles.sliderWrapper}>
                  <h4>Search volume:</h4>
                  <Slider
                    defaultValue={[0, 100]}
                    onChange={(value: any) =>
                      setSearchVolume(value.target.value)
                    }
                    step={25}
                    disableSwap
                    marks={[
                      {
                        value: 0,
                        label: "10",
                      },
                      {
                        value: 25,
                        label: "100",
                      },
                      {
                        value: 50,
                        label: "1K",
                      },
                      {
                        value: 75,
                        label: "10K",
                      },
                      {
                        value: 100,
                        label: "100K",
                      },
                    ]}
                    className={styles.slider}
                  />
                </div>
                <div className={styles.sliderWrapper}>
                  <h4>Competition:</h4>
                  <Slider
                    defaultValue={[0, 100]}
                    onChange={(value: any) =>
                      setCompetition(value.target.value)
                    }
                    step={25}
                    disableSwap
                    marks={[
                      {
                        value: 0,
                        label: "0",
                      },
                      {
                        value: 25,
                        label: "25",
                      },
                      {
                        value: 50,
                        label: "50",
                      },
                      {
                        value: 75,
                        label: "75",
                      },
                      {
                        value: 100,
                        label: "100",
                      },
                    ]}
                    className={styles.slider}
                  />
                </div>
                <div className={styles.sliderWrapper}>
                  <h4>Potential:</h4>
                  <Slider
                    defaultValue={[0, 100]}
                    onChange={(value: any) => setPotential(value.target.value)}
                    step={25}
                    disableSwap
                    marks={[
                      {
                        value: 0,
                        label: "0",
                      },
                      {
                        value: 25,
                        label: "25",
                      },
                      {
                        value: 50,
                        label: "50",
                      },
                      {
                        value: 75,
                        label: "75",
                      },
                      {
                        value: 100,
                        label: "100",
                      },
                    ]}
                    className={styles.slider}
                  />
                </div>
              </div>
            )}
            <Button
              type={"textOnly"}
              onClick={() => setMoreFilters(!moreFilters)}
            >
              <p className={styles.underline}>
                {moreFilters ? "Close filters" : "More filters"}
              </p>
            </Button>
          </PopUp>
        </PopUpWrapper>
      )}
    </InnerWrapper>
  );
}
