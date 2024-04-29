"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import PageTitle from "@/components/page-title/page-title.component";
import Button from "@/components/ui/button/button.component";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/api/supabaseClient/route";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import languageCodes from "@/json/language-codes.json";
import toneOfVoices from "@/json/tone-of-voice.json";
import Subtitle from "@/components/subtitle/subtitle.component";
import classNames from "classnames";

export default function CreateOutlines() {
  const router = useRouter();
  const [contentId, setContentId] = useState<any>("");
  const getContentRef = useRef(false);
  const generateTitlesRef = useRef(false);
  const [currentContent, setCurrentContent] = useState<any[]>([]);
  const [contentGeneratedOutlines, setContentGeneratedOutlines] = useState([]);

  useEffect(() => {
    if (contentId != "" && !getContentRef.current) {
      getContent();
      getContentRef.current = true;
    } else {
      const id = localStorage.getItem("content_id");
      setContentId(id);
    }
  });

  useEffect(() => {
    if (currentContent.length > 0 && !generateTitlesRef.current) {
      generateOutlines();
      generateTitlesRef.current = true;
    }
  }, [currentContent, generateTitlesRef]);

  async function getContent() {
    const { data } = await supabase
      .from("content-items")
      .select()
      .eq("id", contentId);
    if (data) {
      setCurrentContent(data);
    }
  }

  async function generateOutlines() {
    try {
      const language = languageCodes.find(
        (lang) => lang.id === currentContent[0].language
      ); // Get the language that is combined to the chosen language
      const toneOfVoice = toneOfVoices.find(
        (item) => item.id === currentContent[0].tone_of_voice
      ); // Get the tone of voice that is combined to the chosen tone of voice

      const response = await fetch("/api/generateContentOutlines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: currentContent[0].content_title,
          keywords: currentContent[0].keywords,
          language: language,
          audience: currentContent[0].target_audience,
          toneOfVoice: toneOfVoice,
        }),
      });

      const { generatedOutlines } = await response.json();
      const cleanOutlinesArray = JSON.parse(
        generatedOutlines.replace(/```json/g, "").replace(/[`]/g, "")
      );
      setContentGeneratedOutlines(cleanOutlinesArray);
    } catch (error) {
      console.log(error);
    }
  }

  const handleTitleChange = (id:number, newValue: string) => {
    setContentGeneratedOutlines((prevOutlines:any) => {
      return prevOutlines.map((outline: any) => {
        if (outline.id === id) {
          return { ...outline, title: newValue };
        }
        return outline;
      });
    });
  };

  return (
    <InnerWrapper>
      <PageTitle
        title={"Content outlines"}
        goBack={() => router.back()}
        buttons={
          <Button type={"solid"} onClick={() => console.log(true)} disabled>
            <p>Save</p> <SaveOutlinedIcon />
          </Button>
        }
      />
      {currentContent.length > 0 ? (
        <div className={classNames(styles.outlinesWrapper, "scrollbar")} >
          <h1>Title: {currentContent[0].content_title}</h1>
          <div className={styles.subtitlesWrapper}>
            {contentGeneratedOutlines.length > 0 &&
              contentGeneratedOutlines.map((title: any) => (
                <Subtitle key={title.id} title={title} onChange={(value:string, id:number) => handleTitleChange(id, value)} />
              ))}
          </div>
        </div>
      ) : (
        ""
      )}
    </InnerWrapper>
  );
}
