import { useEffect, useRef, useState } from "react";
import styles from "./collections-wrapper.module.scss";

import CollectionCard from "@/components/collection-card/collection-card.component";
import classNames from "classnames";

export default function CollectionsWrapper({
  collections,
  small,
  setCollections,
}: {
  collections: any;
  small?: boolean;
  setCollections: any;
}) {
  const [shownCollections, setShownCollections] = useState<any[]>([]);
  const [counter, setCounter] = useState(0);

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
        }
        setCounter(counter + 1);
      }, 1000);
    }
  }, [counter]);

  return (
    <div className={classNames(styles.collectionsWrapper, "scrollbar")}>
      {shownCollections.length > 0 ? (
        shownCollections.map((collection: any) => (
          <CollectionCard
            key={collection.id ? collection.id : collection.collection_name}
            collection={collection}
            shownCollections={shownCollections}
            setShownCollections={setShownCollections}
          />
        ))
      ) : (
        <h5>No collections found. Try creating one</h5>
      )}
    </div>
  );
}
