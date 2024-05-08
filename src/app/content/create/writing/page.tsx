"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";
import { supabase } from "@/app/utils/supabaseClient/server"
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import { useEditor, EditorContent, EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function Writing() {
  const [contentId, setContentId] = useState<any>("");
  const getContentRef = useRef(false);
  const getOutlines = useRef(false);
  const [currentContent, setCurrentContent] = useState<any[]>([]);

  const editor = useEditor({
    extensions: [StarterKit],
  });

  useEffect(() => {
    if (contentId != "" && !getContentRef.current) {
      getContent();
      getContentRef.current = true;
    } else {
      const id = localStorage.getItem("content_id");
      setContentId(id);
    }
  }, [contentId, getContentRef]);

  useEffect(() => {
    if (currentContent.length > 0 && !getOutlines.current) {
      let content = "";

      currentContent[0].outlines.map((outline: any) => {
        content += `<${outline.type}>${outline.title}</${outline.type}><p></p>`;
      });
      editor?.commands.setContent(content);

      getOutlines.current = true;
    }
  }, [currentContent, getOutlines, editor]);

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
      {currentContent.length > 0 && (
        <div className={styles.editor}>
          <h1>{currentContent[0].content_title}</h1>
          <EditorContent editor={editor} />
        </div>
      )}
    </InnerWrapper>
  );
}
