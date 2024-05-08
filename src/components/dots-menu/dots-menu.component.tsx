import styles from "./dots-menu.module.scss";
import { useEffect, useRef, useState } from "react";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { supabase } from "@/app/utils/supabaseClient/server"

export default function DotsMenu({
  deleteFunction,
  copyFunction,
}: {
  deleteFunction: any;
  copyFunction: any;
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

  return (
    <div
      className={styles.menuWrapper}
      onClick={(e) => {e.stopPropagation() ;setMenuOpen(!menuOpen)}}
      ref={menu}
    >
      <MoreVertIcon />
      {menuOpen && (
        <div className={styles.menu}>
          <p onClick={() => copyFunction()}>
            Duplicate <ContentCopyIcon />
          </p>
          <p onClick={() => deleteFunction()}>
            Delete <DeleteOutlineRoundedIcon />
          </p>
        </div>
      )}
    </div>
  );
}
