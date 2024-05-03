import SmallTable from "../table/small-table/small-table.component";
import Button from "../ui/button/button.component";
import styles from "./collection-card.module.scss";
import { useRouter } from "next/navigation";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DotsMenu from "../dots-menu/dots-menu.component";
import { supabase } from "@/app/api/supabaseClient/route";

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

  async function deleteCollection() {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collection.id);
    if (!error) {
      setShownCollections(
        shownCollections.filter((item: any) => item != collection)
      );
    }
  }

  async function copyCollection() {
    const { data } = await supabase
      .from("collections")
      .select()
      .eq("id", collection.id);
    if (data) {
      const inserting = await supabase
        .from("collections")
        .insert([
          {
            collection_name: data[0].collection_name,
            keywords: data[0].keywords,
            language: data[0].language,
            country: data[0].country,
          },
        ])
        .select();
      if (!inserting.error) {
        setShownCollections([
          ...shownCollections,
          { ...data[0], id: inserting.data[0].id },
        ]);
      }
    }
  }

  return (
    <div className={styles.collectionCard}>
      <div className={styles.cardTopWrapper}>
        <h5>{collection.collection_name}</h5>
        <DotsMenu
          deleteFunction={() => deleteCollection()}
          copyFunction={() => copyCollection()}
        />
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
