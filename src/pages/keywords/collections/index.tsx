import Button from "@/components/ui/button/button.component";

import styles from "./index.module.scss";

import { useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import PageTitle from "@/components/page-title/page-title.component";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";
import { SubjectSharp } from "@mui/icons-material";

export default function CollectionsPage({
  setPage,
  filters,
  setFilters,
}: {
  setPage: any;
  filters: any;
  setFilters: any;
}) {
  const [popUpOpen, setPopUpOpen] = useState(false);

  const [subjectsInput, setSubjectsInput] = useState("");

  const startSearching = () => {

    const subjectArray = subjectsInput.split(",");
    
    setFilters((prevState: any) => ({
      ...prevState,
      subjects: subjectArray,
    }));

    setPage("search");
  };

  return (
    <div className={styles.wrapper}>
      <PageTitle
        title={"Keyword collections"}
        buttons={
          <Button type={"solid"} onClick={() => setPopUpOpen(true)}>
            <p>Start new research</p> <AddRoundedIcon />
          </Button>
        }
      />
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
            <input
              type="text"
              onChange={(event) => setSubjectsInput(event.target.value)}
            />
            <p>{filters.subjects}</p>
          </PopUp>
        </PopUpWrapper>
      )}
    </div>
  );
}
