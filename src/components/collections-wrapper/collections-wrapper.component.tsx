import { useEffect, useRef, useState } from "react";
import styles from "./collections-wrapper.module.scss";

import CollectionCard from "@/components/collection-card/collection-card.component";
import classNames from "classnames";
import PopUpWrapper from "../ui/popup-wrapper/popup-wrapper.component";
import CircularLoader from "../circular-loader/circular-loader.component";

export default function CollectionsWrapper({
  collections,
  small,
}: {
  collections: any;
  small?: boolean;
}) {
  const [shownCollections, setShownCollections] = useState<any[]>([]);
  const loadingRef = useRef(true);

  useEffect(() => {
    if(loadingRef.current && collections.length > 0){
      let array: any[] = [];
      for (let x = 0; x < (small ? 3 : collections.length); x++){
        array.push(collections[x]);
      }
      setShownCollections(array)
      loadingRef.current = false;
    }
  }, [loadingRef.current])

  return (
    <div className={classNames(styles.collectionsWrapper, "scrollbar")}>
      {shownCollections.length > 0 &&
        shownCollections
          .filter((collection) => collection) // Filter out undefined or null collections
          .map((collection: any) => (
            <CollectionCard
              key={collection.id ? collection.id : collection.collection_name}
              collection={collection}
              shownCollections={shownCollections}
              setShownCollections={setShownCollections}
              smallWrapper={small}
            />
          ))}
      {loadingRef.current && (
        <PopUpWrapper>
          <CircularLoader />
          <p>Loading collections...</p>
        </PopUpWrapper>
      )}
    </div>
  );
}
