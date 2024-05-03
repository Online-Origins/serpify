"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";
import { supabase } from "@/app/api/supabaseClient/route";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import PageTitle from "@/components/page-title/page-title.component";

export default function Writing() {
  const [contentId, setContentId] = useState<any>("");
  const getContentRef = useRef(false);
  const [currentContent, setCurrentContent] = useState<any[]>([]);

  useEffect(() => {
    if (contentId != "" && !getContentRef.current) {
      getContent();
      getContentRef.current = true;
    } else {
      const id = localStorage.getItem("content_id");
      setContentId(id);
    }
  });

  async function getContent() {
    const { data } = await supabase
      .from("contentItems")
      .select()
      .eq("id", contentId);
    if (data) {
      setCurrentContent(data);
    }
  }
  return (
    <InnerWrapper>
      {currentContent.length > 0 && <h1>{currentContent[0].content_title}</h1>}
    </InnerWrapper>
  );
}
