"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";
import { supabase } from "@/app/utils/supabaseClient/server";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import classNames from "classnames";
import { ImageList, MenuItem, Select } from "@mui/material";
import Button from "@/components/ui/button/button.component";
import Placeholder from "@tiptap/extension-placeholder";
import { useRouter } from "next/navigation";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";

export default function Writing() {
  const router = useRouter();
  const [contentId, setContentId] = useState<any>("");
  const getContentRef = useRef(false);
  const getOutlines = useRef(false);
  const [currentContent, setCurrentContent] = useState<any[]>([]);
  const [selectedTextType, setSelectedTextType] = useState("Paragraph");
  const gotContent = useRef(false);
  const [linkPopupOpen, setLinkPopupOpen] = useState(false);
  const [imageLink, setImageLink] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        validate: href => /^https?:\/\//.test(href),
        openOnClick: "whenNotEditable",
        autolink: false,
      }),
      Placeholder.configure({
        placeholder: "Write something...",
        considerAnyAsEmpty: true,
        showOnlyCurrent: false,
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
      router.push("/content");
    }
  }

  const setLink = useCallback(() => {
    if (!editor?.isActive("link")) {
      const previousUrl = editor?.getAttributes("link").href;
      const url = window.prompt("URL", previousUrl);

      // cancelled
      if (url === null) {
        return;
      }

      // empty
      if (url === "") {
        editor?.chain().focus().extendMarkRange("link").unsetLink().run();

        return;
      }

      if (!url.includes("https://" || "www")){
        alert("Add a existing link")
        return;
      }

      // update link
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
  }, [editor]);

  const onAddedFile = async (value: any) => {
    const base64 = await toBase64(value as File);
    setImageLink(base64 as string);
  };

  const toBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <InnerWrapper className={styles.smallerWidth}>
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
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={classNames(
                styles.tool,
                editor?.isActive("orderedList") ? styles.activeTool : ""
              )}
            >
              <FormatListNumberedIcon />
            </div>
            <div
              onClick={() => setLinkPopupOpen(true)}
              className={styles.tool}
            >
              <InsertPhotoOutlinedIcon />
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
            <div
              onClick={() => setLink()}
              className={classNames(
                styles.tool,
                editor?.isActive("link") ? styles.activeTool : ""
              )}
            >
              <LinkRoundedIcon />
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

      {linkPopupOpen && (
        <PopUpWrapper>
          <PopUp
            title="Add image"
            titleButtons={
              <Button type={"textOnly"} onClick={() => setLinkPopupOpen(false)}>
                <p>Close</p>
                <CloseRoundedIcon />
              </Button>
            }
            buttons={
              <Button
                disabled={imageLink == ""}
                type={"solid"}
                onClick={() => {
                  editor?.chain().focus().setImage({ src: imageLink }).run();
                  setLinkPopupOpen(false);
                  setImageLink("");
                }}
              >
                <p>Use</p>
                <ArrowForwardRounded />
              </Button>
            }
          >
            <div className={styles.multiDropdown}>
              <InputWrapper
                type="text"
                title="Paste your image link:"
                onChange={(value: any) => setImageLink(value)}
              />
              <InputWrapper
                type="file"
                title="Or pick an image:"
                onChange={(value: any) => onAddedFile(value)}
              />
            </div>
          </PopUp>
        </PopUpWrapper>
      )}
    </InnerWrapper>
  );
}
