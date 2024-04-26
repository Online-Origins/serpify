import SmallTable from "../table/small-table/small-table.component";
import Button from "../ui/button/button.component";
import styles from "./collection-card.module.scss";
import { useRouter } from "next/navigation";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DotsMenu from "../dots-menu/dots-menu.component";

export default function CollectionCard({
  collection,
  shownCollections,
  setShownCollections,
}: {
  collection: any;
  shownCollections: any;
  setShownCollections: any;
}) {
  const router = useRouter();

  return (
    <div className={styles.collectionCard}>
      <div className={styles.cardTopWrapper}>
        <h5>{collection.collection_name}</h5>
        <DotsMenu collection={collection}
            shownCollections={shownCollections}
            setShownCollections={setShownCollections} />
      </div>
      <SmallTable
        keywords={collection.keywords}
        language={collection.language}
        country={collection.country}
      />
      <div className={styles.cardButtonWrapper}>
        <Button
          type={"textOnly"}
          onClick={() =>
            router.push(`/keywords/${encodeURIComponent(collection.id)}`)
          }
        >
          <p>See collection</p>
        </Button>
        <Button type={"solid"} onClick={() => console.log(true)}>
          <p>Create content</p>
          <ArrowForwardRoundedIcon />
        </Button>
      </div>
    </div>
  );
}
