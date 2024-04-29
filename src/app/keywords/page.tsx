'use client';
import styles from "./page.module.scss";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Button from "@/components/ui/button/button.component";
import PageTitle from "@/components/page-title/page-title.component";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import CollectionsWrapper from "@/components/collections-wrapper/collections-wrapper.component";

import languageCodes from "@/json/language-codes.json";
import countryCodes from "@/json/country-codes.json";
import { supabase } from "@/app/api/supabaseClient/route";

export default function CollectionsPage() {
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [moreFilters, setMoreFilters] = useState(false);
  const [subjectsInput, setSubjectsInput] = useState("");
  const [keywordsLanguage, setKeywordsLanguage] = useState(languageCodes[0].id);
  const [keywordsCountry, setKeywordsCountry] = useState(countryCodes[0].id);
  const [keywordLength, setKeywordLength] = useState(["shorttail", "longtail"]);
  const [searchVolume, setSearchVolume] = useState<number[]>([0, 100]);
  const [competition, setCompetition] = useState<number[]>([0, 100]);
  const [potential, setPotential] = useState<number[]>([0, 100]);
  const getCollectionsRef = useRef(false)
  const [collections, setCollections] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!getCollectionsRef.current) {
      getCollections();
      getCollectionsRef.current = true
    }
  }, [getCollectionsRef]);

  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      setCollections(data);
    }
  }

  const startSearching = () => {
    const subjectArray = subjectsInput.split(",");
    const cleanArray = subjectArray.map((subject) =>
      subject.replace(/[&\/\\#+()$~%.";:*?<>{}[\]]/g, "")
    );

    try {
      localStorage.setItem(
        "filters",
        JSON.stringify({
          subjects: cleanArray,
          language: keywordsLanguage,
          country: keywordsCountry,
          keywordLength: keywordLength,
          volume: [
            {
              min: searchVolumeTranslate(searchVolume[0]),
              max: searchVolumeTranslate(searchVolume[1]),
            },
          ],
          competition: [{ min: competition[0], max: competition[1] }],
          potential: [{ min: potential[0], max: potential[1] }],
        })
      );
      router.push("/keywords/search");
    } catch (error) {
      console.log(error);
    }
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
      {collections.length > 0 ?
        <CollectionsWrapper collections={collections} /> : <h5>No collections found.</h5>}
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
                <div className={styles.multiDropdown}>
                  <InputWrapper
                    type="autocomplete"
                    title="Country:"
                    required={false}
                    value={keywordsCountry}
                    options={countryCodes}
                    onChange={(value: any) =>
                      setKeywordsCountry(
                        value != null ? value : countryCodes[0].id
                      )
                    }
                    placeholder="Which country do you want to target?"
                  />
                  <InputWrapper
                    type="autocomplete"
                    title="Language:"
                    required={false}
                    value={keywordsLanguage}
                    options={languageCodes}
                    onChange={(value: any) =>
                      setKeywordsLanguage(
                        value != null ? value : languageCodes[0].id
                      )
                    }
                    placeholder="In what language should the keywords be?"
                  />
                </div>
                <InputWrapper
                  type="multiSelect"
                  title="Length of the keywords:"
                  required={false}
                  onChange={(value: any) =>
                    value.length == 0
                      ? alert("You need to select at least one")
                      : setKeywordLength(value)
                  }
                  defValue={keywordLength}
                  information="Short-tail keywords are broad, general, and popular terms with high search volume and competition. Longtail keywords are more specific, niche, and targeted multi-word terms with lower search volume and lower competition."
                />
                <InputWrapper
                  type="slider"
                  title="Search volume:"
                  information="Search volume is the number of times, on average, that users enter a particular search query into a search engine each month."
                  defValue={[0, 100]}
                  onChange={(value: any) => setSearchVolume(value)}
                  step={25}
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
                />
                <InputWrapper
                  type="slider"
                  title="Competition:"
                  information="The degree of competition of the position for a keyword."
                  defValue={[0, 100]}
                  onChange={(value: any) => setCompetition(value)}
                  step={25}
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
                />
                <InputWrapper
                  type="slider"
                  title="Potential:"
                  information="The ability of a particular keyword or key phrase to drive traffic, engagement, or conversions."
                  defValue={[0, 100]}
                  onChange={(value: any) => setPotential(value)}
                  step={25}
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
                />
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
