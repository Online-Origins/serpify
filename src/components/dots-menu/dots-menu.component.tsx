import styles from "./dots-menu.module.scss";
import { useEffect, useRef, useState } from "react";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { supabase } from "@/app/api/supabaseClient/route";

export default function DotsMenu({
  collection,
  shownCollections,
  setShownCollections,
}: {
  collection: any;
  shownCollections: any;
  setShownCollections: any;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(event: any) {
      if (menu.current && !menu.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [menuOpen]);

  async function deleteCollection() {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collection.id);
    if (!error) {
      setShownCollections(shownCollections.filter((item:any) => item != collection))
    }
  }

  async function copyCollection() {
    const { data } = await supabase
      .from("collections")
      .select()
      .eq("id", collection.id);
    if (data) {
      const inserting = await supabase.from("collections").insert([
        {
          collection_name: data[0].collection_name,
          keywords: data[0].keywords,
          language: data[0].language,
          country: data[0].country,
        },
      ]).select();
      if (!inserting.error) {
        setShownCollections([...shownCollections, {...data[0], id: inserting.data[0].id}])
      }
    }
  }

  return (
    <div
      className={styles.menuWrapper}
      onClick={() => setMenuOpen(!menuOpen)}
      ref={menu}
    >
      <MoreVertIcon />
      {menuOpen && (
        <div className={styles.menu}>
          <p onClick={() => copyCollection()}>
            Duplicate <ContentCopyIcon />
          </p>
          <p onClick={() => deleteCollection()}>
            Delete <DeleteOutlineRoundedIcon />
          </p>
        </div>
      )}
    </div>
  );
}
