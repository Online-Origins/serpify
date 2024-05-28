"use client";
import PageTitle from "@/components/page-title/page-title.component";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import Button from "@/components/ui/button/button.component";
import { ArrowForwardRounded } from "@mui/icons-material";
import ContentItemsWrapper from "@/components/content-items-wrapper/content-items-wrapper.component";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./utils/supabaseClient/server";
import CollectionsWrapper from "@/components/collections-wrapper/collections-wrapper.component";
import classNames from "classnames";
import { usePathname, useRouter } from "next/navigation";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import CircularLoader from "@/components/circular-loader/circular-loader.component";
import styles from "./page.module.scss";

export default function Home() {
  const loadingRef = useRef(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (loadingRef.current) {
      getCollections();
      getContents();
    }
  }, [loadingRef]);

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
      loadingRef.current = false;
    }
  }

  return (
    <InnerWrapper className={classNames(styles.homeWrapper, "scrollbar")}>
      <h1>Welcome!</h1>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Website analytics"}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => router.push("/content")}>
              <p>See analytics</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        <h5>Loading...</h5>
      </div>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Content projects"}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => router.push("/content")}>
              <p>See all projects</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        {!loadingRef.current ? (
          <ContentItemsWrapper
            contents={contents}
            collections={collections}
            small
          />
        ) : (
          <h5>Loading...</h5>
        )}
      </div>
      <div className={styles.toolWrapper}>
        <PageTitle
          title={"Keyword collections"}
          smallerHeader
          buttons={
            <Button type={"textOnly"} onClick={() => router.push("/keywords")}>
              <p>See all collections</p>
              <ArrowForwardRounded />
            </Button>
          }
        />
        {!loadingRef.current ? (
          <CollectionsWrapper collections={collections} small />
        ) : (
          <h5>Loading...</h5>
        )}
      </div>
    </InnerWrapper>
  );
}
