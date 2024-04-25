import { useEffect, useRef, useState } from "react";
import styles from "./collections-wrapper.module.scss";

import CollectionCard from "@/components/collection-card/collection-card.component";

export default function CollectionsWrapper({collections, small} : {collections: any; small?: boolean}) {
  const [shownCollections, setShownCollections] = useState<any[]>([]);
  const showingCollectionsRef = useRef(false)

  useEffect(() => {
    if (collections.length > 0 && showingCollectionsRef.current == false) {
      settingCollections();
      showingCollectionsRef.current = true;
    }
  }, [collections])

  const settingCollections = () => {
    let array = [];
    if(small) {
      for (let x = 0; x < 2 && x < collections.length; x++) {
        array.push (collections[x]);
      }
    } else {
      array = collections;
    }

    setShownCollections(array)    
  }

  return (
    <div className={styles.collectionsWrapper}>
      {shownCollections.map((collection: any) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
