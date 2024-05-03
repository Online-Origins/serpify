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
  const [counter, setCounter] = useState(0);
  const loadingRef = useRef(true);

  useEffect(() => {
    if (collections.length > 0) {
      let array = shownCollections;
      setTimeout(() => {
        if (
          array.length < collections.length &&
          !array.includes(collections[counter])
        ) {
          array.push(collections[counter]);
          setShownCollections(array);
          loadingRef.current = true;
        } else if (array.length >= collections.length) {
          loadingRef.current = false;
        }
        setCounter(counter + 1);
      }, 1000);
    }
  }, [counter]);

  return (
    <div className={classNames(styles.collectionsWrapper, "scrollbar")}>
      {shownCollections.length > 0 ?
        shownCollections
          .filter((collection) => collection) // Filter out undefined or null collections
          .map((collection: any) => (
            <CollectionCard
              key={collection.id ? collection.id : collection.collection_name}
              collection={collection}
              shownCollections={shownCollections}
              setShownCollections={setShownCollections}
            />
          )) : <h5>No collections found</h5>}
      {!small && loadingRef.current &&
        <PopUpWrapper>
          <CircularLoader />
          <p>Loading collections...</p>
        </PopUpWrapper>
      }
    </div>
  );
}
