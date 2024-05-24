"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";
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
import { SeoCheck } from "seord";

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
} from "@mui/icons-material";

import toneOfVoices from "@/json/tone-of-voice.json";
import languages from "@/json/language-codes.json";
import { useSharedContext } from "@/context/SharedContext";

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
  });
  const [seoAnalysis, setSeoAnalysis] = useState<any>();
  const { setSharedData } = useSharedContext();

  // If the editor updates then update the content score
  useEffect(() => {
    if (contentInfo.html && contentInfo.html != "") {
      getContentScore();
    }
  }, [contentInfo]);

  async function getContentScore() {
    const contentJson = {
      title: contentInfo.title.replace(/[-_@#!'"]/g, " ").toLowerCase(), // Filter out punction marks
      htmlText: contentInfo.html
        .replace(/[-_@#!'"]/g, " ") // Filter out punction marks
        .toLowerCase()
        .replace(/<h1>.*?<\/h1>/, ""), // Filter out the h1
      subKeywords: contentInfo.sub_keywords,
      keyword: contentInfo.keyword,
      metaDescription: "",
      languageCode: contentInfo.language,
      countryCode: "",
    };

    // const seoCheck = new SeoCheck(contentJson); // Later add the website domain of the project
    // const result = await seoCheck.analyzeSeo();
    // filterSeoCheck(result);
  }

  // function filterSeoCheck(result: any) {
  //   let analysis = result;

  //   // Filter out the points removal when there is no meta description
  //   // If meta description is added to the tool then remove this
  //   for (let x = 0; x < analysis.messages.warnings.length; x++) {
  //     if (
  //       analysis.messages.warnings[x].toLowerCase().includes("meta description")
  //     ) {
  //       analysis.seoScore = analysis.seoScore + 2;
  //     }
  //   }

  //   // Filter and add custom messages
  //   analysis.messages.warnings = analysis.messages.warnings.filter(
  //     (item: string) =>
  //       !item.toLowerCase().includes("density of sub keyword") &&
  //       !item.toLowerCase().includes("keyword density") &&
  //       !item.toLowerCase().includes("meta description") &&
  //       !item.toLowerCase().includes("internal links") //If there is a website domain remove this filter
  //   );
  //   analysis.messages.minorWarnings = analysis.messages.minorWarnings.filter(
  //     (item: string) =>
  //       !item.toLowerCase().includes("density of sub keyword") &&
  //       !item.toLowerCase().includes("keyword density")
  //   );
  //   analysis.messages.goodPoints = analysis.messages.goodPoints.filter(
  //     (item: string) =>
  //       !item.toLowerCase().includes("density of sub keyword") &&
  //       !item.toLowerCase().includes("keyword density")
  //   );
  //   if (analysis.wordCount < 300) {
  //     analysis.seoScore = analysis.seoScore - 30;
  //     analysis.messages.warnings.push("Not enough words. Try adding more");
  //   } else if (analysis.wordCount < 500) {
  //     analysis.seoScore = analysis.seoScore - 15;
  //     analysis.messages.warnings.push("Not enough words. Try adding more");
  //   } else if (analysis.wordCount < 650) {
  //     analysis.seoScore = analysis.seoScore - 5;
  //     analysis.messages.minorWarnings.push(
  //       "Decent amount of words. Try adding some more"
  //     );
  //   } else if (analysis.wordCount > 1000 && analysis.seoScore < 92) {
  //     analysis.messages.goodPoints.push("Good amount of words used.");
  //     analysis.seoScore = analysis.seoScore + 5;
  //   }
  //   analysis.messages.minorWarnings = analysis.messages.minorWarnings.filter(
  //     (item: string) => !item.toLowerCase().includes(`tag "`)
  //   );
  //   analysis.messages.goodPoints = analysis.messages.goodPoints.filter(
  //     (item: string) =>
  //       !item.toLowerCase().includes(`tag "`) &&
  //       !item.toLowerCase().includes("a keyword ")
  //   );
  //   analysis.messages.goodPoints = analysis.messages.goodPoints.map(
  //     (item: string) => item.replace(/this./g, "").replace(/sub./g, "")
  //   );

  //   const expectedLinks = Math.floor(analysis.wordCount / 300);

  //   if (analysis.totalLinks <= (expectedLinks / 4).toFixed(0)) {
  //     analysis.seoScore -= 5;
  //   } else if (
  //     analysis.totalLinks < expectedLinks &&
  //     analysis.totalLinks > (expectedLinks / 4).toFixed(0)
  //   ) {
  //     analysis.seoScore -= 2;
  //     analysis.messages.warnings = analysis.messages.warnings.filter(
  //       (item: string) => !item.toLowerCase().includes("outbound links")
  //     );
  //     analysis.messages.minorWarnings.push(
  //       `Decent amount of outbound links made: ${analysis.totalLinks}. Try adding some more`
  //     );
  //   } else if (analysis.totalLinks >= expectedLinks) {
  //     analysis.messages.goodPoints.push(
  //       `Good amount of outbound links: ${analysis.totalLinks}`
  //     );
  //   }

  //   // Update the content score
  //   for (let x = 0; x < analysis.subKeywordDensity.length; x++) {
  //     if (
  //       analysis.subKeywordDensity[x].density >= 1 &&
  //       analysis.subKeywordDensity[x].density <= 2
  //     ) {
  //       analysis.seoScore = analysis.seoScore + 2;
  //     } else {
  //       analysis.seoScore = analysis.seoScore - 2;
  //     }
  //   }

  //   setSeoAnalysis(analysis);
  //   setSharedData(analysis);
  // }

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
      let content = `<h1>${currentContent[0].content_title}</h1>`;
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

      const language = languages.find(
        (item) => item.id == currentContent[0].language
      );
      setContentInfo({
        title: currentContent[0].content_title,
        sub_keywords: currentContent[0].sub_keywords,
        keyword: currentContent[0].keyword,
        language: language ? language.languageCode : "",
        html: content,
      });
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
      const language = languages.find((item) => item.id == data[0].language);
      setContentInfo({
        title: data[0].content_title,
        sub_keywords: data[0].sub_keywords,
        keyword: data[0].keyword,
        language: language ? language.languageCode : "",
        html: data[0].content,
      });
      setCurrentContent(data);
    }
  }

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
        content_score: Math.floor(seoAnalysis.seoScore),
        content_title: contentInfo.title,
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

  function AiContentChange() {
    if (AiInput == "") {
      return;
    }
    generateTitleContent(AiInput);
  }

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

  async function generateTitleContent(AiInputPrompt?: string, option?: string) {
    try {
      setGenerating(true);
      const toneOfVoice = toneOfVoices.find(
        (item) => item.id == currentContent[0].tone_of_voice
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
            gptPrompt = `Correct the spelling and grammar of the text: `;
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
          gptPrompt = `Generate the paragraph for a blog. `;
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
            if (notSelectedText != "" && option != "grammar") {
              // If the selected text is not the same as the whole text of the paragraph
              gptPrompt += `The text will be an addition on the existing text: "${notSelectedText}", and wil replace this text: "${selectedText}". `;
            } else if (notSelectedText == "") {
              // If the selected text is the same as the whole text of the paragraph
              gptPrompt += `The newly generated will replace this text: "${currentNode.textContent}". `;
            } else if (option == "grammar") {
              // If the user selected the option grammar
              gptPrompt += `"${selectedText}". `;
            }
          }
        } else {
          // When the user didn't make a selection from a paragraph
          if (currentNode.textContent != "" && option != "grammar") {
            // The generated text needs to replace the text in te current element if the current element is not empty and if the user didn't chose the grammar option
            gptPrompt += `The newly generated will replace this text: "${currentNode.textContent}". `;
          } else if (currentNode.textContent == "") {
            gptPrompt += `The text is for a blog with the title "${
              contentInfo.title
            }" and will be about the following subtitle: "${handleGetPreviousHeading()}". The text has a ${
              toneOfVoice?.value
            } tone of voice, is in the language with the code ${
              currentContent[0].language
            }${
              currentContent[0].audience
                ? `, has the target audience "${currentContent[0].audience}",`
                : ","
            } and contains this keyword: "${currentContent[0].keyword}" and these subkeywords: ${currentContent[0].sub_keywords.join(
              ","
            )}. `;
          } else if (option == "grammar") {
            // If the user did chose the grammar option give the current element text to the api
            gptPrompt += `"${currentNode.textContent}". `;
          }
        }

        // Specify to the AI that only a string of the generated text is needed
        gptPrompt += `Only give back an string of the generated text and don't include the subtitle.`;

        // Prompt building for when the element is an header
      } else if (currentNode?.nodeName.toLowerCase().includes("h")) {
        if (AiInputPrompt) {
          // If the user used his own prompt
          gptPrompt = `${AiInputPrompt}. The current subtitle is: "${currentNode?.textContent}". Only give back an string of the generated subtitle. `;
        } else if (option) {
          // If the user selected one of the options
          if (!editor?.state.selection.empty) {
            // If the user made a selection from a header
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

              if (notSelectedText != "") {
                // If the selected text is not the same as the whole text of the header
                if (option == "grammar") {
                  gptPrompt = `Correct the spelling and grammar of the text: "${selectedText}"`;
                } else if (option == "expand") {
                  gptPrompt = `Expand the text: "${selectedText}"`;
                } else if (option == "shorten") {
                  gptPrompt = `Shorten the text: "${selectedText}"`;
                } else if (option == "improve") {
                  gptPrompt = `Improve the text: "${selectedText}"`;
                }
                gptPrompt += `, which is part of the subtitle: "${currentNode?.textContent}". Only give back the updated text part and not the whole subitle.`;
              } else {
                // If the selected text is the same as the whole text of the header
                if (option == "grammar") {
                  gptPrompt = `Correct the spelling and grammar of the subtitle: `;
                } else if (option == "expand") {
                  gptPrompt = `expand the current subtitle: `;
                } else if (option == "shorten") {
                  gptPrompt = `Shorten the current subtitle: `;
                } else if (option == "improve") {
                  gptPrompt = `Improve the current subtitle: `;
                }
                gptPrompt += `"${currentNode?.textContent}". Only give back the new subtitle.`;
              }
            }
          } else {
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
            gptPrompt += `"${currentNode?.textContent}". Only give back the new sutbtitle.`;
          }
          setOpenOptions(false);
        } else {
          gptPrompt = `Regenerate The subtitle: "${currentNode?.textContent}". Only give back an string of the generated subtitle. `
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

      if (editor?.state.selection.empty) {
        // Replace the user selected text
        replaceText(generatedContent);
      } else {
        // Add the new generated text into the current selected element of the editor
        editor
          ?.chain()
          .focus()
          .deleteSelection()
          .insertContent(generatedContent)
          .run();
      }

      setGenerating(false);
    } catch (error) {
      console.log(error);
    }
  }

  const replaceText = (newContent: string) => {
    if (!editor) return;

    const { state, dispatch } = editor.view;
    const { selection } = state;
    const { $from, $to } = selection;

    // Get the start and end positions of the current paragraph
    const startPos = $from.start($from.depth);
    const endPos = $to.end($to.depth);

    // Replace the entire content of the paragraph with new text
    dispatch(
      state.tr.replaceWith(startPos, endPos, state.schema.text(newContent))
    );
  };

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

  async function generateAllContent() {
    setGenerating(true);
    const toneOfVoice = toneOfVoices.find(
      (item) => item.id == currentContent[0].tone_of_voice
    );
    try {
      if (editorRef.current) {
        const paragraphs = Array.from(editorRef.current.querySelectorAll("p"));
        for (const p of paragraphs) {
          const previousHeader = findPreviousHeader(p as HTMLElement);
          if (previousHeader) {
            const response = await fetch("/api/generateContent", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt: `Generate the paragraph for a blog. The text is for a blog with the title "${
                  contentInfo.title
                }" and will be about the following subtitle: "${
                  previousHeader.innerText
                }". The text has a ${
                  toneOfVoice?.value
                } tone of voice, is in the language with the code ${
                  currentContent[0].language
                }${
                  currentContent[0].audience
                    ? `, has the target audience "${currentContent[0].audience}",`
                    : ","
                } and contains this keyword: "${currentContent[0].keyword}" and these subkeywords: ${currentContent[0].sub_keywords.join(
                  ","
                )}. Only give back an string of the generated text and don't include the subtitle.`,
              }),
            });
            const { generatedContent } = await response.json();
            p.innerText = generatedContent;
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
                onClick={() => setOpenOptions(!openOptions)}
              >
                <MoreVert />
                {openOptions && (
                  <div
                    className={classNames(
                      styles.optionsMenu,
                      bubbleDistance < 175 && styles.bottomPos
                    )}
                  >
                    <p
                      onClick={() => generateTitleContent(undefined, "improve")}
                    >
                      <Moving /> Improve
                    </p>
                    <p
                      onClick={() => generateTitleContent(undefined, "shorten")}
                    >
                      <CloseFullscreenRounded /> Shorten
                    </p>
                    <p
                      onClick={() => generateTitleContent(undefined, "expand")}
                    >
                      <Expand /> Expand
                    </p>
                    <p
                      onClick={() => generateTitleContent(undefined, "grammar")}
                    >
                      <Spellcheck /> Correct spelling & grammar
                    </p>
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
    </InnerWrapper>
  );
}
