import SmallTable from "../table/small-table/small-table.component";
import Button from "../ui/button/button.component";
import styles from "./collection-card.module.scss";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function CollectionCard({collection, setActiveCollection, setPages} : {collection:any; setActiveCollection:any, setPages:any}) {
  function seeCollection(id:any) {
    setPages("collection");
    setActiveCollection(id);
  }

  return (
    <div className={styles.collectionCard}>
      <div className={styles.cardTopWrapper}>
        <h5>{collection.collection_name}</h5>
        <div className={styles.menu} onClick={() => console.log(true)}>
          <MoreVertIcon />
        </div>
      </div>
      <SmallTable keywords={collection.keywords} language={collection.language} country={collection.country} />
      <div className={styles.cardButtonWrapper}>
        <Button type={"textOnly"} onClick={() => seeCollection(collection.id)}>
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
