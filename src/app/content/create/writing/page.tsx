"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient/server";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import classNames from "classnames";
import { MenuItem, Select } from "@mui/material";
import Button from "@/components/ui/button/button.component";
import Placeholder from "@tiptap/extension-placeholder";
import { useRouter } from "next/navigation";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";
import CircularLoader from "@/components/circular-loader/circular-loader.component";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import styles from "./page.module.scss";
import { getCurrentDateTime } from "@/app/utils/currentDateTime/dateUtils";

import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatListBulletedRounded,
  FormatQuoteRounded,
  UndoRounded,
  RedoRounded,
  SaveOutlined,
  FormatListNumbered,
  InsertPhotoOutlined,
  LinkRounded,
  CloseRounded,
  ArrowForwardRounded,
  AutoAwesome,
  SendRounded,
  MoreVert,
  Expand,
  Spellcheck,
  Moving,
  CloseFullscreenRounded,
  ContentCopyRounded,
  CheckCircle,
} from "@mui/icons-material";

import toneOfVoices from "@/json/tone-of-voice.json";
import languages from "@/json/language-codes.json";
import { useSharedContext } from "@/context/SharedContext";
import { analyzeContent } from "@/app/utils/analyzeContent/analyzeContent";

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
  const [AiInput, setAiInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [openOptions, setOpenOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [bubbleDistance, setBubbleDistance] = useState(0);
  const [contentInfo, setContentInfo] = useState({
    html: "",
    sub_keywords: [""],
    keyword: "",
    language: "",
    title: "",
    type: "",
  });
  const [seoAnalysis, setSeoAnalysis] = useState<any>();
  const { setSharedData } = useSharedContext();
  const [copyMessage, setCopyMessage] = useState(false);

  // Hide the copy message after 2.5s
  useEffect(() => {
    if (copyMessage) {
      const timer = setTimeout(() => {
        setCopyMessage(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [copyMessage]);

  // If the editor updates then update the content score
  useEffect(() => {
    if (contentInfo.html && contentInfo.html != "") {
      getContentScore();
    }
  }, [contentInfo]);

  // Get the content score
  function getContentScore() {
    const contentJson = {
      title: contentInfo.title.replace(/[-_@#!'"]/g, " ").toLowerCase(), // Filter out punctuation marks
      htmlText: contentInfo.html
        .replace(/[-_@#!'"]/g, " ") // Filter out punctuation marks
        .toLowerCase(),
      subKeywords: contentInfo.sub_keywords,
      keyword: contentInfo.keyword,
      languageCode: contentInfo.language,
      type: contentInfo.type,
    };

    const { analyzedContent } = analyzeContent(contentJson);
    setSeoAnalysis(analyzedContent);
    setSharedData(analyzedContent);
  }

  // Close popup if the user clicks outside popup
  useEffect(() => {
    // Close menu when clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setOpenOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Get distance to top from bubble
    const handleMouseDown = () => {
      if (editorRef.current && optionsRef.current) {
        const parentRect = editorRef.current.getBoundingClientRect();
        const childRect = optionsRef.current.getBoundingClientRect();
        setBubbleDistance(childRect.top - parentRect.top);
      }
    };

    if (editorRef.current) {
      editorRef.current.addEventListener("click", handleMouseDown);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener("click", handleMouseDown);
      }
    };
  });

  // Set the tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        validate: (href) => /^https?:\/\//.test(href),
        openOnClick: "whenNotEditable",
        autolink: false,
      }),
      Placeholder.configure({
        placeholder: "Write something...",
        considerAnyAsEmpty: true,
        showOnlyCurrent: false,
      }),
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const h1Element = doc.querySelector("h1");

      setContentInfo((prevContentInfo) => ({
        ...prevContentInfo,
        html: html,
        title: h1Element ? h1Element.innerText : prevContentInfo.title,
      }));
    },
  });

  // Check what type of text is active in the editor and save it to the useState variable
  useEffect(() => {
    if (editor?.isActive("paragraph")) {
      setSelectedTextType("Paragraph");
    } else if (editor?.isActive("heading", { level: 1 })) {
      setSelectedTextType("Heading 1");
    } else if (editor?.isActive("heading", { level: 2 })) {
      setSelectedTextType("Heading 2");
    } else if (editor?.isActive("heading", { level: 3 })) {
      setSelectedTextType("Heading 3");
    } else if (editor?.isActive("heading", { level: 4 })) {
      setSelectedTextType("Heading 4");
    }
  });

  // Get content
  useEffect(() => {
    if (contentId != "" && !getContentRef.current) {
      getContent();
      getContentRef.current = true;
    } else {
      const id = localStorage.getItem("content_id");
      setContentId(id);
    }
  }, [contentId, getContentRef]);

  // Convert the outlines to html for the editor
  useEffect(() => {
    let content = "";
    if (
      currentContent.length > 0 &&
      !getOutlines.current &&
      !gotContent.current
    ) {
      if (currentContent[0].type != "custom") {
        content = `<h1>${currentContent[0].content_title}</h1>`;
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
      } else {
        if (currentContent[0].content_title) {
          content = `<h1>${currentContent[0].content_title}</h1><p></p>`;
        }
      }
      editor?.commands.setContent(content);

      const language = languages.find(
        (item) => item.id == currentContent[0].language
      );
      setContentInfo({
        title: currentContent[0].content_title,
        sub_keywords: currentContent[0].sub_keywords,
        keyword: currentContent[0].keyword,
        language: language ? language.languageCode : "",
        html: content,
        type: currentContent[0].type,
      });
      getOutlines.current = true;
    }
  }, [currentContent, getOutlines, editor]);

  //  get content items
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
      const language = languages.find((item) => item.id == data[0].language);
      setContentInfo({
        title: data[0].content_title,
        sub_keywords: data[0].sub_keywords,
        keyword: data[0].keyword,
        language: language ? language.languageCode : "",
        html: data[0].content ? data[0].content : " ",
        type: data[0].type,
      });
      setCurrentContent(data);
    }
  }

  // Change the text type
  function changeTextType(value: string) {
    if (value == "Paragraph") {
      editor?.chain().focus().setParagraph().run();
    } else if (value == "Heading 1") {
      editor?.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (value == "Heading 2") {
      editor?.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value == "Heading 3") {
      editor?.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (value == "Heading 4") {
      editor?.chain().focus().toggleHeading({ level: 4 }).run();
    }
    setSelectedTextType(value);
  }

  // Save the content in the database
  async function saveContent() {
    const { error } = await supabase
      .from("contentItems")
      .update({
        edited_on: getCurrentDateTime(),
        content: editor?.getHTML(),
        content_score: seoAnalysis.seoScore,
        content_title: contentInfo.title,
      })
      .eq("id", contentId);
    if (!error) {
      router.push("/content");
    }
  }

  // Set a link to the text
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

      if (!url.includes("https://" || "www")) {
        alert("Add a existing link");
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

  // Add image
  const onAddedFile = async (value: any) => {
    const base64 = await toBase64(value as File);
    setImageLink(base64 as string);
  };

  // convert added image to base64
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

  // Generate content if user used a prompt and it is not empty
  function AiContentChange() {
    if (AiInput == "") {
      return;
    }
    generateTitleContent(AiInput);
  }

  // Get the previous heading type that is connected to the paragraph
  const getPreviousHeading = () => {
    if (!editor || !editor.state) return null;

    const { state } = editor;
    const { $from } = state.selection;

    for (let pos = $from.pos - 1; pos >= 0; pos--) {
      const node = state.doc.nodeAt(pos);
      if (node && node.type.name === "heading") {
        return node.textContent;
      }
    }

    return null;
  };

  const handleGetPreviousHeading = () => {
    const previousHeading = getPreviousHeading();
    if (previousHeading) {
      return previousHeading;
    } else {
      return "";
    }
  };

  // Get active element in editor
  const getActiveNode = () => {
    if (!editor) {
      return;
    }
    const { state } = editor;
    const { from } = state.selection;
    const domAtPos = editor.view.domAtPos.bind(editor.view);
    let element = domAtPos(from).node;

    // If the current node is a text node, get its parent element
    if (element.nodeType === Node.TEXT_NODE && element.parentElement) {
      element = element.parentElement;
    }
    return element;
  };

  // Build the prompt for generating content, depending different variables
  async function generateTitleContent(AiInputPrompt?: string, option?: string) {
    try {
      setGenerating(true);
      const toneOfVoice = toneOfVoices.find(
        (item) => item.id == currentContent[0].tone_of_voice
      );
      const language = languages.find(
        (item) => item.id == currentContent[0].language
      );

      const currentNode = getActiveNode();

      let gptPrompt = "";
      // Prompt building for when the element is a paragraph
      if (currentNode?.nodeName.toLowerCase() == "p") {
        if (AiInputPrompt) {
          // If the user used his own prompt
          gptPrompt = `${AiInputPrompt}. `;
        } else if (option) {
          // If the user selected one of the options
          if (option == "grammar") {
            gptPrompt = `Correct the spelling and grammar of the text. `;
          } else if (option == "expand") {
            gptPrompt = `expand the current text. `;
          } else if (option == "shorten") {
            gptPrompt = `Shorten the current text. `;
          } else if (option == "improve") {
            gptPrompt = `Improve the current text. `;
          }
          setOpenOptions(false);
        } else {
          // Otherwise just generate a pragraph
          gptPrompt = `Generate the paragraph for a ${contentInfo.type} text. `;
        }

        if (!editor?.state.selection.empty) {
          // If the user made a selection from a paragraph
          const selection = editor?.state.selection;
          if (selection && !selection.empty && currentNode.textContent) {
            const selectedText = editor.state.doc.textBetween(
              selection.from,
              selection.to,
              "\n"
            );
            const notSelectedText = currentNode.textContent.replace(
              selectedText,
              ""
            );
            if (notSelectedText != "" && option != "grammar" && option != "expand") {
              // If the selected text is not the same as the whole text of the paragraph
              gptPrompt += `it will be an addition on the existing: "${notSelectedText}", and wil replace this: "${selectedText}". `;
            } else if (notSelectedText == "" && selectedText != currentNode.textContent) {
              // If the selected text is the same as the whole text of the paragraph
              gptPrompt += `The newly generated will replace this: "${currentNode.textContent}". `;
            } else {
              // If the user selected the option grammar
              gptPrompt += `The text is "${selectedText}". `;
            }
          }
        } else {
          // When the user didn't make a selection from a paragraph
          if (currentNode.textContent != "" && !option) {
            // The generated text needs to replace the text in te current element if the current element is not empty and if the user didn't chose the grammar option
            gptPrompt += `The newly generated will be an addition on the existing: "${currentNode.textContent}". `;
          } else if (currentNode.textContent == "") {
            gptPrompt += `It is for a ${
              contentInfo.type
            } text with the title "${contentInfo.title}" ${
              handleGetPreviousHeading() != "" &&
              handleGetPreviousHeading() != contentInfo.title
                ? `and will be about the following subtitle: "${handleGetPreviousHeading()}"`
                : ""
            }. `;
            if (
              currentContent[0].language ||
              currentContent[0].audience ||
              currentContent[0].keyword ||
              toneOfVoice
            ) {
              gptPrompt += `The content ${
                toneOfVoice ? `has a ${toneOfVoice.value} tone of voice,` : ""
              }${language ? `is in ${language.value},` : ""}${
                currentContent[0].audience
                  ? ` has the target audience "${currentContent[0].audience}",`
                  : ""
              }${
                currentContent[0].keyword
                  ? ` contains this focus keyword: "${currentContent[0].keyword}",`
                  : ""
              }${
                currentContent[0].sub_keywords.length > 0
                  ? ` contains these subkeywords: ${currentContent[0].sub_keywords.join(
                      ", "
                    )}`
                  : ""
              }. `;
            }
          } else {
            // If the user did chose the grammar option give the current element text to the api
            gptPrompt += `The text is: "${currentNode.textContent}". `;
          }
        }

        if (option && option != "shorten"){
          // Specify to the AI that only a string of the generated text is needed
          gptPrompt += `Only give back the text including the old text and not the subtitle.`;
        } else {
          gptPrompt += `Only give back the new text and not the subtitle.`;
        }

        // Prompt building for when the element is an header
      } else if (currentNode?.nodeName.toLowerCase().includes("h")) {
        if (AiInputPrompt) {
          // If the user used his own prompt
          gptPrompt = `${AiInputPrompt}. The current subtitle is: "${currentNode?.textContent}". Only give back an string of the generated subtitle. `;
        } else if (option) {
          // If the user selected one of the options
          // When the user didn't make a selection from a paragraph
          if (option == "grammar") {
            gptPrompt = `Correct the spelling and grammar of the subtitle: `;
          } else if (option == "expand") {
            gptPrompt = `expand the current subtitle: `;
          } else if (option == "shorten") {
            gptPrompt = `Shorten the current subtitle: `;
          } else if (option == "improve") {
            gptPrompt = `Improve the current subtitle: `;
          }
          gptPrompt += `"${currentNode?.textContent}".`;
          if (language) {
            gptPrompt += ` The language of the content is ${language.value}.`;
          }
          gptPrompt +=
            " Only give back the new subtitle and only the first letter of the string should be uppercase.";
          setOpenOptions(false);
        } else {
          gptPrompt = `Regenerate The subtitle: "${currentNode?.textContent}". Only give back an string of the generated subtitle. `;
        }
      }

      const response = await fetch("/api/generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: gptPrompt,
        }),
      });
      setAiInput("");

      const { generatedContent } = await response.json();
      // if (editor?.state.selection.empty) {
        if (currentNode instanceof HTMLElement) {
          currentNode.innerText = generatedContent;
        }
      // } else {
      //   // Add the new generated text into the current selected element of the editor
      //   editor
      //     ?.chain()
      //     .focus()
      //     .deleteSelection()
      //     .insertContent(generatedContent)
      //     .run();
      // }

      setGenerating(false);
    } catch (error) {
      console.log(error);
    }
  }

  // Get the subtitle for the paragraph
  const findPreviousHeader = (node: HTMLElement): HTMLElement | null => {
    let previousSibling = node.previousElementSibling;
    while (previousSibling) {
      if (previousSibling.tagName.match(/^H[1-6]$/)) {
        return previousSibling as HTMLElement;
      }
      previousSibling = previousSibling.previousElementSibling;
    }
    return null;
  };

  // Generate the text for each paragraph
  async function generateAllContent() {
    setGenerating(true);
    const toneOfVoice = toneOfVoices.find(
      (item) => item.id == currentContent[0].tone_of_voice
    );
    const language = languages.find(
      (item) => item.id == currentContent[0].language
    );
    try {
      if (editorRef.current) {
        const paragraphs = Array.from(editorRef.current.querySelectorAll("p"));
        for (const p of paragraphs) {
          const previousHeader = findPreviousHeader(p as HTMLElement);
          if (previousHeader) {
            let gptPrompt = `Generate a paragraph for a ${contentInfo.type} text. It is for a ${contentInfo.type} text with the title "${contentInfo.title}" and will be about the following subtitle: "${previousHeader.innerText}". `;
            if (
              currentContent[0].language ||
              currentContent[0].audience ||
              currentContent[0].keyword ||
              toneOfVoice
            ) {
              gptPrompt += `The content ${
                toneOfVoice ? `has a ${toneOfVoice.value} tone of voice,` : ""
              } ${language ? `is in ${language.value},` : ""} ${
                currentContent[0].audience
                  ? `has the target audience "${currentContent[0].audience}",`
                  : ""
              } ${
                currentContent[0].keyword
                  ? `contains this focus keyword ${currentContent[0].keyword},`
                  : ""
              } ${
                currentContent[0].sub_keywords.length > 0
                  ? `contains these subkeywords: ${currentContent[0].sub_keywords.join(
                      ", "
                    )}`
                  : ""
              }. `;
            }
            gptPrompt += `Don't include an introduction into the subject of the title and ${contentInfo.type} text, just only text for the subtitle. Only give back an string of the generated text and don't include the subtitle.`;
            const response = await fetch("/api/generateContent", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt: gptPrompt,
              }),
            });
            const { generatedContent } = await response.json();
            p.innerText = generatedContent;
          } else {
            alert("No subheaders found to generate text");
          }
        }
        setGenerating(false);
      }
    } catch (error) {
      console.error(error);
      setGenerating(false); // Ensure to set generating false in case of error
    }
  }

  return (
    <InnerWrapper className={styles.editorWrapper}>
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
              <MenuItem value="Heading 1">Heading 1</MenuItem>
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
              <FormatBold />
            </div>
            <div
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={classNames(
                styles.tool,
                editor?.isActive("italic") ? styles.activeTool : ""
              )}
            >
              <FormatItalic />
            </div>
            <div
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={classNames(
                styles.tool,
                editor?.isActive("strike") ? styles.activeTool : ""
              )}
            >
              <FormatStrikethrough />
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
              <FormatListBulletedRounded />
            </div>
            <div
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={classNames(
                styles.tool,
                editor?.isActive("orderedList") ? styles.activeTool : ""
              )}
            >
              <FormatListNumbered />
            </div>
            <div onClick={() => setLinkPopupOpen(true)} className={styles.tool}>
              <InsertPhotoOutlined />
            </div>
            <div
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={classNames(
                styles.tool,
                editor?.isActive("blockquote") ? styles.activeTool : ""
              )}
            >
              <FormatQuoteRounded />
            </div>
            <div
              onClick={() => setLink()}
              className={classNames(
                styles.tool,
                editor?.isActive("link") ? styles.activeTool : ""
              )}
            >
              <LinkRounded />
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
              <UndoRounded />
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
              <RedoRounded />
            </div>
          </div>
        </div>
        <div className={styles.buttonWrapper}>
          <Button
            key={2}
            type={"outline"}
            onClick={() => {
              alert("Progress won't be saved");
              router.push("/content");
            }}
          >
            <p>close</p> <CloseRounded />
          </Button>
          <Button key={1} type={"solid"} onClick={() => saveContent()}>
            <p>Save & close</p> <SaveOutlined />
          </Button>
        </div>
      </div>
      {currentContent.length > 0 && (
        <div ref={editorRef} className={classNames(styles.editor, "scrollbar")}>
          <EditorContent editor={editor} />
          {editor && (
            <BubbleMenu
              editor={editor}
              tippyOptions={{
                duration: 0,
                interactive: true,
                placement: "bottom-start",
                maxWidth: "none",
                appendTo: "parent",
                offset: [0, 8],
              }}
              shouldShow={({ editor }) => {
                // always show the bubble except when an image is selected
                return editor.isActive("image") ? false : true;
              }}
              className={styles.bubbleMenu}
            >
              <div className={styles.bubbleInput}>
                <Button type={"solid"} onClick={() => generateTitleContent()}>
                  <p>Generate text</p>
                  <AutoAwesome />
                </Button>
                <input
                  type="text"
                  placeholder="Or ask AI something specific to write for you..."
                  value={AiInput}
                  onChange={(event) => setAiInput(event.target.value)}
                  onKeyDown={(e: any) => {
                    if (e.key == "Enter" && AiInput != "") {
                      AiContentChange();
                    }
                  }}
                />
                <div onClick={() => AiContentChange()}>
                  <SendRounded />
                </div>
              </div>
              <div
                ref={optionsRef}
                className={styles.inputOptions}
                onMouseEnter={() => setOpenOptions(true)}
                onMouseLeave={() => setOpenOptions(false)}
              >
                <MoreVert />
                {openOptions && (
                  <div
                    className={classNames(
                      styles.optionsMenu,
                      bubbleDistance < 175 && styles.bottomPos
                    )}
                  >
                    <div className={styles.innerOptionsMenu}>
                      <p
                        onClick={() =>
                          generateTitleContent(undefined, "improve")
                        }
                      >
                        <Moving /> Improve
                      </p>
                      <p
                        onClick={() =>
                          generateTitleContent(undefined, "shorten")
                        }
                      >
                        <CloseFullscreenRounded /> Shorten
                      </p>
                      <p
                        onClick={() =>
                          generateTitleContent(undefined, "expand")
                        }
                      >
                        <Expand /> Expand
                      </p>
                      <p
                        onClick={() =>
                          generateTitleContent(undefined, "grammar")
                        }
                      >
                        <Spellcheck /> Correct spelling & grammar
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </BubbleMenu>
          )}
        </div>
      )}
      {currentContent.length > 0 && (
        <div className={styles.bottomButtons}>
          <Button type={"outline"} onClick={() => generateAllContent()}>
            <p>Generate all</p>
            <AutoAwesome />
          </Button>
          <Button
            type={"solid"}
            onClick={() => {
              if (editor) {
                const clipboardItem = new ClipboardItem({
                  "text/html": new Blob([editor?.getHTML()], {
                    type: "text/html",
                  }),
                });
                navigator.clipboard.write([clipboardItem]);
                setCopyMessage(true);
              }
            }}
          >
            <p>Copy content</p>
            <ContentCopyRounded />
          </Button>
        </div>
      )}
      {linkPopupOpen && (
        <PopUpWrapper>
          <PopUp
            title="Add image"
            titleButtons={
              <Button type={"textOnly"} onClick={() => setLinkPopupOpen(false)}>
                <p>Close</p>
                <CloseRounded />
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
      {generating && (
        <PopUpWrapper>
          <CircularLoader />
          <p>Generating text...</p>
        </PopUpWrapper>
      )}
      <div
        className={classNames(styles.copyMessage, copyMessage && styles.show)}
      >
        <CheckCircle />
        <h5>Content copied to clipboard</h5>
      </div>
    </InnerWrapper>
  );
}
