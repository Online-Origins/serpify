import ContentItem from "../content-item/content-item.component";
import { useEffect, useRef, useState } from "react";
import InputWrapper from "../ui/input-wrapper/input-wrapper.component";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Information from "../information/information.component";

import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import classNames from "classnames";
import styles from "./content-items-wrapper.module.scss";
import { useSharedContext } from "@/context/SharedContext";
import { supabase } from "@/app/utils/supabaseClient/server";

export default function ContentItemsWrapper({ small }: { small?: boolean }) {
  const [shownContents, setShownContents] = useState<any[]>([]);
  const showingContentsRef = useRef(false);
  const [titleFilter, setTitleFilter] = useState("");
  const { currentUrl } = useSharedContext();
  const [contents, setContents] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);

  useEffect(() => {
    getContents();
    getCollections();
    getDomains();
  }, []);

  async function getContents() {
    const { data } = await supabase.from("contentItems").select();
    if (data) {
      data.sort(
        (a, b) =>
          new Date(b.edited_on).getTime() - new Date(a.edited_on).getTime()
      );
      setContents(data);
    }
  }

  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      setCollections(data);
    }
  }

  async function getDomains() {
    const { data } = await supabase.from("domains").select();
    if (data) {
      setDomains(data);
    }
  }

  useEffect(() => {
    if (currentUrl && domains.length > 0) {
      const currentDomainId = domains.find(
        (domain: any) => domain.domain == currentUrl
      );
      const domainContents = contents.filter(
        (content: any) => content.domain == currentDomainId.id
      );
      const filtered = domainContents.filter((content: any) =>
        content.content_title
          .toLocaleLowerCase()
          .includes(titleFilter.toLocaleLowerCase())
      );
      setShownContents(settingContents(filtered));
    }
  }, [currentUrl, domains, titleFilter]);

  function settingContents(con: any) {
    let array = [];
    if (small) {
      for (let x = 0; x < 3 && x < con.length; x++) {
        array.push(con[x]);
      }
    } else {
      array = con;
    }
    return sortContents(array);
  }

  function sortContents(array: any) {
    const sorted = array.sort((a: any, b: any) => {
      const dateA = new Date(a.date_edited);
      const dateB = new Date(b.date_edited);
      return dateB.getTime() - dateA.getTime(); // Sort descending, for ascending: dateA - dateB
    });
    return sorted;
  }

  return (
    <div
      className={classNames(styles.pageWrapper, !small && styles.bottomExtend)}
    >
      <div className={styles.topRowWrapper}>
        <div className={styles.wrappingInput}>
          {!small && (
            <InputWrapper
              className={styles.input}
              type="text"
              value={titleFilter}
              onChange={(value: string) => setTitleFilter(value)}
              icon={<SearchRoundedIcon />}
              placeholder="Search by content title"
            />
          )}
        </div>
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
              smallWrapper={small}
            />
          ))
        ) : (
          <h5>No contents found. Create a new one</h5>
        )}
      </div>
    </div>
  );
}
