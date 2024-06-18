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
  const gotData = useRef(false);
  const { currentUrl } = useSharedContext();
  const [domainId, setDomainId] = useState();
  const [currentDomain, setCurrentDomain] = useState();

  // Get collections and domains
  useEffect(() => {
    if (!gotData.current) {
      getCollections();
      getDomains();
      gotData.current = true;
    }
  }, []);

  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      setCollections(data);
    }
  }

  async function getDomains() {
    const { data } = await supabase.from("domains").select();
    if (data) {
      setDomains(data);
    }
  }

  // Get the domains that are linked to the currentUrl
  useEffect(() => {
    if (currentUrl && domains.length > 0) {
      const currentDomainId = domains.find(
        (domain: any) => domain.domain === currentUrl
      );

      if (
        currentDomainId &&
        currentDomainId.id !== domainId &&
        collections.length > 0
      ) {
        setDomainId(currentDomainId.id);
        setCurrentDomain(currentDomainId.id);
        const domainCollections = collections.filter(
          (collection: any) => collection.domain === currentDomainId.id
        );
        setShownCollections([]);
        setShownCollectionsWithDelay(settingCollections(domainCollections));
        loadingRef.current = false;
      }
    }
  }, [currentUrl, domains, collections]);

  // Set the collections to show
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

  // Show the collections with a delay to prevent errors from google ads api
  function setShownCollectionsWithDelay(arr: any[]) {
    let array: any[] = [];
    arr.forEach((item, index) => {
      setTimeout(() => {
        array.push(item);
        setShownCollections([...array]); // Using spread operator to create a new array
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
            currentDomain={currentDomain}
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
