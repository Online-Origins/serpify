import { useEffect, useRef, useState } from "react";

import CollectionCard from "@/components/collection-card/collection-card.component";
import classNames from "classnames";
import PopUpWrapper from "../ui/popup-wrapper/popup-wrapper.component";
import CircularLoader from "../circular-loader/circular-loader.component";
import styles from "./collections-wrapper.module.scss";
import { supabase } from "@/app/utils/supabaseClient/server";
import { useSharedContext } from "@/context/SharedContext";

export default function CollectionsWrapper({ small }: { small?: boolean }) {
  const [collections, setCollections] = useState<any[]>([]);
  const [shownCollections, setShownCollections] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const loadingRef = useRef(true);
  const { currentUrl } = useSharedContext();
  const [domainId, setDomainId] = useState();

  useEffect(() => {
    getCollections();
    getDomains();
  }, []);

  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      setCollections(data);
      console.log("collections: " + data)
    }
  }

  async function getDomains() {
    const { data } = await supabase.from("domains").select();
    if (data) {
      setDomains(data);
      console.log("domains: "+data)
    }
  }

  useEffect(() => {
    if (currentUrl && domains.length > 0) {
      const currentDomainId = domains.find(
        (domain: any) => domain.domain === currentUrl
      );

      if (currentDomainId && currentDomainId.id !== domainId && collections.length > 0) {
        setDomainId(currentDomainId.id);
        const domainCollections = collections.filter(
          (collection: any) => collection.domain === currentDomainId.id
        );
        setShownCollections([])
        setShownCollectionsWithDelay(settingCollections(domainCollections));
        loadingRef.current = false;
      }
    }
  }, [currentUrl, domains]);

  function settingCollections(col: any) {
    let array = [];
    if (small) {
      for (let x = 0; x < 3 && x < col.length; x++) {
        array.push(col[x]);
      }
    } else {
      array = col;
    }
    return array;
  }

  function setShownCollectionsWithDelay(arr: any[]) {
    arr.forEach((item, index) => {
      setTimeout(() => {
        setShownCollections(prevState => [...prevState, item]);
      }, index * 500); // Delay added for each item
    });
  }

  return (
    <div
      className={classNames(
        styles.collectionsWrapper,
        "scrollbar",
        small && styles.small
      )}
    >
      {shownCollections.length > 0 ? (
        shownCollections.map((collection: any) => (
          <CollectionCard
            key={collection.id ? collection.id : collection.collection_name}
            collection={collection}
            shownCollections={shownCollections}
            setShownCollections={setShownCollections}
            smallWrapper={small}
          />
        ))
      ) : (
        <h5>No Collections found.</h5>
      )}
      {loadingRef.current && (
        <PopUpWrapper>
          <CircularLoader />
          <p>Loading data...</p>
        </PopUpWrapper>
      )}
    </div>
  );
}
