"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";
import { supabase } from "@/app/utils/supabaseClient/server";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import classNames from "classnames";
import { MenuItem, Select } from "@mui/material";
import Button from "@/components/ui/button/button.component";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Placeholder from "@tiptap/extension-placeholder";
import { useRouter } from "next/navigation";

export default function Writing() {
  const router = useRouter();
  const [contentId, setContentId] = useState<any>("");
  const getContentRef = useRef(false);
  const getOutlines = useRef(false);
  const [currentContent, setCurrentContent] = useState<any[]>([]);
  const [selectedTextType, setSelectedTextType] = useState("Paragraph");
  const gotContent = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something...",
        considerAnyAsEmpty: true,
        showOnlyCurrent: false
      }),
    ],
  });

  useEffect(() => {
    if (editor?.isActive("paragraph")) {
      setSelectedTextType("Paragraph");
    } else if (editor?.isActive("heading", { level: 2 })) {
      setSelectedTextType("Heading 2");
    } else if (editor?.isActive("heading", { level: 3 })) {
      setSelectedTextType("Heading 3");
    } else if (editor?.isActive("heading", { level: 4 })) {
      setSelectedTextType("Heading 4");
    }
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
    if (
      currentContent.length > 0 &&
      !getOutlines.current &&
      !gotContent.current
    ) {
      let content = "";

      currentContent[0].outlines.map((outline: any) => {
        content += `<${outline.type}>${outline.title}</${outline.type}><p></p>`;
        if (outline.subtitles) {
          outline.subtitles.map((subtitle: any) => {
            content += `<${subtitle.type}>${subtitle.title}</${subtitle.type}><p></p>`;
            if (subtitle.subtitles) {
              subtitle.subtitles.map((subsubtitle: any) => {
                content += `<${subsubtitle.type}>${subsubtitle.title}</${subsubtitle.type}><p></p>`;
              });
            }
          });
        }
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
      if (data[0].content) {
        gotContent.current = true;
        editor?.commands.setContent(data[0].content);
      }
      setCurrentContent(data);
    }
  }

  function changeTextType(value: string) {
    if (value == "Paragraph") {
      editor?.chain().focus().setParagraph().run();
    } else if (value == "Heading 2") {
      editor?.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value == "Heading 3") {
      editor?.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (value == "Heading 4") {
      editor?.chain().focus().toggleHeading({ level: 4 }).run();
    }
    setSelectedTextType(value);
  }

  function currentDate() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }

  async function saveContent() {
    const { error } = await supabase
      .from("contentItems")
      .update({
        edited_on: currentDate(),
        content: editor?.getHTML(),
      })
      .eq("id", contentId);
    if (!error) {
      router.push("/content")
    }
  }

  return (
    <InnerWrapper>
      <div className={styles.editorBar}>
        <div className={styles.tools}>
          <div className={styles.toolsWrapper}>
            <Select
              value={selectedTextType}
              onChange={(event) => changeTextType(event.target.value)}
              variant="standard"
              className={styles.typeDropdown}
            >
              <MenuItem value="Paragraph">Paragraph</MenuItem>
              <MenuItem value="Heading 2">Heading 2</MenuItem>
              <MenuItem value="Heading 3">Heading 3</MenuItem>
              <MenuItem value="Heading 4">Heading 4</MenuItem>
            </Select>
          </div>
          <div className={styles.toolsWrapper}>
            <div
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={classNames(
                styles.tool,
                editor?.isActive("bold") ? styles.activeTool : ""
              )}
            >
              <FormatBoldIcon />
            </div>
            <div
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={classNames(
                styles.tool,
                editor?.isActive("italic") ? styles.activeTool : ""
              )}
            >
              <FormatItalicIcon />
            </div>
            <div
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={classNames(
                styles.tool,
                editor?.isActive("strike") ? styles.activeTool : ""
              )}
            >
              <FormatStrikethroughIcon />
            </div>
          </div>
          <div className={styles.toolsWrapper}>
            <div
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={classNames(
                styles.tool,
                editor?.isActive("bulletList") ? styles.activeTool : ""
              )}
            >
              <FormatListBulletedRoundedIcon />
            </div>
            <div
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={classNames(
                styles.tool,
                editor?.isActive("blockquote") ? styles.activeTool : ""
              )}
            >
              <FormatQuoteRoundedIcon />
            </div>
          </div>
          <div className={styles.toolsWrapper}>
            <div
              onClick={() => editor?.chain().focus().undo().run()}
              className={classNames(
                styles.tool,
                !editor?.can().chain().focus().undo().run()
                  ? styles.disabled
                  : ""
              )}
            >
              <UndoRoundedIcon />
            </div>
            <div
              onClick={() => editor?.chain().focus().redo().run()}
              className={classNames(
                styles.tool,
                !editor?.can().chain().focus().redo().run()
                  ? styles.disabled
                  : ""
              )}
            >
              <RedoRoundedIcon />
            </div>
          </div>
        </div>
        <div className={styles.buttonWrapper}>
          <Button key={1} type={"solid"} onClick={() => saveContent()}>
            <p>Save & close</p> <SaveOutlinedIcon />
          </Button>
        </div>
      </div>
      {currentContent.length > 0 && (
        <div className={classNames(styles.editor, "scrollbar")}>
          <h1>{currentContent[0].content_title}</h1>
          <EditorContent editor={editor} />
        </div>
      )}
    </InnerWrapper>
  );
}
