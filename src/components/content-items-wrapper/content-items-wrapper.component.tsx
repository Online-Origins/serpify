import styles from "./content-items-wrapper.module.scss";

import ContentItem from "../content-item/content-item.component";
import { useEffect, useRef, useState } from "react";
import InputWrapper from "../ui/input-wrapper/input-wrapper.component";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Information from "../information/information.component";

import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";

export default function ContentItemsWrapper({
  contents,
  collections,
  small,
}: {
  contents: any;
  collections: any;
  small?: boolean;
}) {
  const [shownContents, setShownContents] = useState<any[]>([]);
  const showingContentsRef = useRef(false);
  const [titleFilter, setTitleFilter] = useState("");

  useEffect(() => {
    if (showingContentsRef.current == false && contents.length > 0) {
      settingContents();
      showingContentsRef.current = true;
    }
  }, [contents]);

  function settingContents() {
    let array = [];
    if (small) {
      for (let x = 0; x < 2 && x < contents.length; x++) {
        array.push(contents[x]);
      }
    } else {
      array = contents;
    }
    setShownContents(sortContents(array));
  }

  function sortContents(array:any) {
    const sorted = array.sort((a: any, b: any) => {
      const dateA = new Date(a.date_edited);
      const dateB = new Date(b.date_edited);
      return dateB.getTime() - dateA.getTime(); // Sort descending, for ascending: dateA - dateB
    });
    return sorted;
  }

  useEffect(() => {
    if (contents.length > 0) {
      const filtered = contents.filter((content: any) =>
        content.content_title
          .toLocaleLowerCase()
          .includes(titleFilter.toLocaleLowerCase())
      );
      setShownContents(sortContents(filtered));
    }
  }, [titleFilter]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.topRowWrapper}>
        <InputWrapper
          className={styles.input}
          type="text"
          value={titleFilter}
          onChange={(value: string) => setTitleFilter(value)}
          icon={<SearchRoundedIcon />}
          placeholder="Search by content title"
        />
        <div className={styles.rowItem}>
          <h5>Content score:</h5>
          <Information information="A numerical value that ranges from 0 to 100, which is a metric used to show you how well optimized your content is in the eyes of Google." />
        </div>
        <div className={styles.rowItem}>
          <h5>Status:</h5>
        </div>
        <div className={styles.rowItem}>
          <h5>Date edited:</h5>
        </div>
      </div>
      <div className={styles.contentItemsWrapper}>
        {shownContents.length > 0 ? (
          shownContents.map((content: any) => (
            <ContentItem
              key={content.id}
              collections={collections}
              content={content}
              shownContents={shownContents}
              setShownContents={setShownContents}
              sortContents={sortContents}
            />
          ))
        ) : (
          <h5>No contents found. Create a new one</h5>
        )}
      </div>
    </div>
  );
}
