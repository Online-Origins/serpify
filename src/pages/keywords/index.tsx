import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import CollectionsPage from "./collections";
import KeywordSearching from "./searching";

export default function Keywords() {
  const [pages, setPages] = useState(["collections"]);
  const page = pages[pages.length - 1];

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
    return (
      <CollectionsPage
        setPages={setPages}
        filters={searching}
        setFilters={setSearching}
      />
    );
  } else if (page == "search") {
    return <KeywordSearching filters={searching} setPages={setPages} />;
  } else {
    return null;
  }
}
