"use client";
import PageTitle from "@/components/page-title/page-title.component";
import styles from "./page.module.scss";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import Button from "@/components/ui/button/button.component";
import { ArrowForwardRounded } from "@mui/icons-material";
import ContentItemsWrapper from "@/components/content-items-wrapper/content-items-wrapper.component";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./utils/supabaseClient/server";
import CollectionsWrapper from "@/components/collections-wrapper/collections-wrapper.component";
import classNames from "classnames";

export default function Home() {
  const getCollectionsRef = useRef(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);

  useEffect(() => {
    if (!getCollectionsRef.current) {
      getCollections();
      getContents();
      getCollectionsRef.current = true;
    }
  }, [getCollectionsRef]);

  async function getContents() {
    const { data } = await supabase.from("contentItems").select();
    if (data) {
      data.sort((a,b) => new Date(b.edited_on).getTime() - new Date(a.edited_on).getTime())
      setContents(data);
    }
  }

  async function getCollections() {
    const { data } = await supabase.from("collections").select();
    if (data) {
      console.log(data);
      setCollections(data);
    }
  }

  return (
    <InnerWrapper className={classNames(styles.homeWrapper, "scrollbar")}>
      <h1>Welcome!</h1>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Content projects"}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => console.log("hello")}>
              <p>See all projects</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        {getCollectionsRef.current ? (
          <ContentItemsWrapper contents={contents} collections={collections} small />
        ) : (
          <h5>Loading...</h5>
        )}
      </div>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Keyword collections"}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => console.log("hello")}>
              <p>See all collections</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        {getCollectionsRef.current ? (
          <CollectionsWrapper collections={collections} small />
        ) : (
          <h5>Loading...</h5>
        )}
      </div>
    </InnerWrapper>
  );
}
