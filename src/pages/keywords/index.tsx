import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import CollectionsPage from "./collections";
import KeywordSearching from "./searching";

export default function Keywords() {
  const [page, setPage] = useState("collections");

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

  if (page == "collections") {
    return <CollectionsPage setPage={setPage} filters={searching} setFilters={setSearching} />;
  } else if (page == "search") {
    return <KeywordSearching filters={searching}/>;
  } else {
    return null;
  }
}
