import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import CollectionsPage from "./collections";
import KeywordSearching from "./searching";
import Collection from "./collection";

export default function Keywords() {
  const [pages, setPages] = useState(["collections"]);
  const page = pages[pages.length - 1];
  const [activeCollection, setActiveCollection] = useState("");

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
    language: "",
    country: "",
    keywordLength: [],
  });

  if (page == "collections") {
    return (
      <CollectionsPage
        setPages={setPages}
        filters={searching}
        setFilters={setSearching}
        setActiveCollection={setActiveCollection}
      />
    );
  } else if (page == "search") {
    return (
      <KeywordSearching
        filters={searching}
        setPages={setPages}
        setFilters={setSearching}
      />
    );
  }  else if (page == "collection") {
    return (
      <Collection
        collectionId={activeCollection}
        setPages={setPages}
      />
    );
  } else {
    return null;
  }
}
