import { useEffect, useState } from "react";
import styles from "./collections-wrapper.module.scss";

import CollectionCard from "@/components/collection-card/collection-card.component";

export default function CollectionsWrapper({collections, setActiveCollection, setPages, small} : {collections: any; setActiveCollection: any, setPages: any, small?: boolean}) {
  const [shownCollections, setShownCollections] = useState<any[]>([]);

  useEffect(() => {
    if (collections.length > 0) {
      settingCollections();
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
        <CollectionCard key={collection.id} collection={collection} setActiveCollection={setActiveCollection} setPages={setPages} />
      ))}
    </div>
  );
}
