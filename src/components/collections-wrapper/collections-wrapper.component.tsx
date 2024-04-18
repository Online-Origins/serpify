import styles from "./collections-wrapper.module.scss";

import CollectionCard from "@/components/collection-card/collection-card.component";

export default function CollectionsWrapper({collections, setActiveCollection, setPages} : {collections: any; setActiveCollection: any, setPages: any}) {
  return (
    <div className={styles.collectionsWrapper}>
      {collections.map((collection: any) => (
        <CollectionCard key={collection.id} collection={collection} setActiveCollection={setActiveCollection} setPages={setPages} />
      ))}
    </div>
  );
}
