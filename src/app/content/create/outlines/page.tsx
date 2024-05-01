"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import PageTitle from "@/components/page-title/page-title.component";
import Button from "@/components/ui/button/button.component";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/api/supabaseClient/route";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import languageCodes from "@/json/language-codes.json";
import toneOfVoices from "@/json/tone-of-voice.json";
import classNames from "classnames";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import CircularLoader from "@/components/circular-loader/circular-loader.component";
import DraggableSubtitle from "@/components/draggable-subtitle/draggable-subtitle.component";

export default function CreateOutlines() {
  const router = useRouter();
  const [contentId, setContentId] = useState<any>("");
  const getContentRef = useRef(false);
  const generateTitlesRef = useRef(false);
  const [generating, setGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState<any[]>([]);
  interface OutlineItem {
    id: number;
    type: string;
    title: string;
    subtitles: any[];
  }
  const [contentGeneratedOutlines, setContentGeneratedOutlines] = useState<
    OutlineItem[]
  >([]);
  const [selectedTitleType, setSelectedTitleType] = useState("h2");
  const [customTitle, setCustomTitle] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");

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
    if (
      currentContent.length > 0 &&
      !generateTitlesRef.current &&
      currentContent[0].outlines == null
    ) {
      generateOutlines();
      generateTitlesRef.current = true;
    } else if (
      currentContent.length > 0 &&
      currentContent[0].outlines != null
    ) {
      setContentGeneratedOutlines(currentContent[0].outlines);
      setUpdateTitle(currentContent[0].content_title);
    }
  }, [currentContent, generateTitlesRef]);

  function sortingOutlines(titles: any[]) {
    let array: any[] = [];
    titles.map((title: any, index: number) => {
      if (title.type == "h2") {
        array.push(title);
      } else if (title.type == "h3") {
        if (array.length > 0) {
          let lastIndex = array.length - 1;
          if (!array[lastIndex].subtitles) {
            array[lastIndex].subtitles = [];
          }
          array[lastIndex].subtitles.push(title);
        }
      } else if (title.type == "h4") {
        if (array.length > 0 && array[array.length - 1].subtitles) {
          let lastH3Index = array[array.length - 1].subtitles.length - 1;
          if (!array[array.length - 1].subtitles[lastH3Index].subtitles) {
            array[array.length - 1].subtitles[lastH3Index].subtitles = [];
          }
          array[array.length - 1].subtitles[lastH3Index].subtitles.push(title);
        }
      }
    });
    setContentGeneratedOutlines(array);
  }

  async function getContent() {
    const { data } = await supabase
      .from("content-items")
      .select()
      .eq("id", contentId);
    if (data) {
      setCurrentContent(data);
    }
  }

  async function generateOutlines(retryCount = 3) {
    setGenerating(true);
    try {
      const language = languageCodes.find(
        (lang) => lang.id == currentContent[0].language
      );
      const toneOfVoice = toneOfVoices.find(
        (item) => item.id == currentContent[0].tone_of_voice
      );

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
      sortingOutlines(cleanOutlinesArray);
      setGenerating(false);
    } catch (error) {
      console.log(error);
      if (retryCount > 0) {
        console.log(`Retrying... attempts left: ${retryCount}`);
        generateOutlines(retryCount - 1);
      } else {
        console.log("Max retry attempts reached.");
      }
    }
  }

  const handleTitleChange = (id: number, newValue: string, outlines: any) => {
    return outlines.map((outline: any) => {
      if (outline.id == id) {
        return { ...outline, title: newValue };
      } else if (outline.subtitles && outline.subtitles.length > 0) {
        // If the outline has subtitles, recursively update them
        return {
          ...outline,
          subtitles: handleTitleChange(id, newValue, outline.subtitles),
        };
      }
      return outline;
    });
  };

  const handleTitleChangeRecursive = (id: number, newValue: string) => {
    setContentGeneratedOutlines((prevOutlines: any) => {
      return handleTitleChange(id, newValue, prevOutlines);
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    if (result.type == "h2") {
      const items = Array.from(contentGeneratedOutlines);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setContentGeneratedOutlines(items);
    } else if (result.type == "h3") {
      const parentIndex = result.source.droppableId;
      const destinationParentIndex = result.destination.droppableId;
      const updatedOutlines = contentGeneratedOutlines.map((outline) => {
        if (outline.id == parentIndex) {
          if (parentIndex == destinationParentIndex) {
            const items = Array.from(outline.subtitles);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);
            return { ...outline, subtitles: items };
          } else {
            const parentOutline = contentGeneratedOutlines.filter(
              (outline) => outline.id == parentIndex
            );
            const updatedParent = parentOutline[0].subtitles.filter(
              (subtitle) => subtitle.id != result.draggableId
            );

            return { ...outline, subtitles: updatedParent };
          }
        } else if (outline.id == destinationParentIndex) {
          const destinationOutline = contentGeneratedOutlines.filter(
            (outline) => outline.id == destinationParentIndex
          );

          const parentOutline = contentGeneratedOutlines.filter(
            (outline) => outline.id == parentIndex
          );
          const draggable = parentOutline[0].subtitles.filter(
            (subtitle) => subtitle.id == result.draggableId
          );

          const destinationSubtitles = destinationOutline[0].subtitles;
          destinationSubtitles.splice(
            result.destination.index,
            0,
            draggable[0]
          );

          return { ...outline, subtitles: destinationSubtitles };
        }
        return outline;
      });

      setContentGeneratedOutlines(updatedOutlines);
    } else if (result.type == "h4") {
      const parentIndex = result.source.droppableId;
      const destinationParentIndex = result.destination.droppableId;
      const updatedOutlines = contentGeneratedOutlines.map((outline) => {
        const updatedSubtitles = outline.subtitles.map((subtitle) => {
          if (subtitle.id == parentIndex) {
            if (parentIndex == destinationParentIndex) {
              const items = Array.from(subtitle.subtitles);
              const [reorderedItem] = items.splice(result.source.index, 1);
              items.splice(result.destination.index, 0, reorderedItem);
              return { ...subtitle, subtitles: items };
            } else {
              return {
                ...subtitle,
                subtitles: subtitle.subtitles.filter(
                  (child: any) => child.id != result.draggableId
                ),
              };
            }
          } else if (subtitle.id == destinationParentIndex) {
            let parent: any = [];

            contentGeneratedOutlines.forEach((item) => {
              item.subtitles.forEach((subtitle) => {
                if (subtitle.id == parentIndex) {
                  parent = subtitle;
                }
              });
            });
            const draggable = parent.subtitles.filter(
              (subtitle:any) => subtitle.id == result.draggableId
            );
            const destinationSubtitles = subtitle.subtitles || [];
            destinationSubtitles.splice(result.destination.index, 0, draggable[0]);
            return {...subtitle, subtitles: destinationSubtitles}
          }
          return subtitle;
        });
        return { ...outline, subtitles: updatedSubtitles };
      });
      setContentGeneratedOutlines(updatedOutlines);
    }
  };

  function addNewTitle() {
    if (customTitle != "") {
      const generateUniqueId = (outlines: OutlineItem[]): number => {
        let maxId = 0;
        outlines.forEach((item) => {
          if (item.id > maxId) {
            maxId = item.id;
          }
          if (item.subtitles.length > 0) {
            const subMaxId = Math.max(...item.subtitles.map((sub) => sub.id));
            if (subMaxId > maxId) {
              maxId = subMaxId;
            }
            item.subtitles.forEach((subItem) => {
              if (subItem.subtitles && subItem.subtitles.length > 0) {
                const subsubMaxId = Math.max(
                  ...subItem.subtitles.map((subsub: any) => subsub.id)
                );
                if (subsubMaxId > maxId) {
                  maxId = subsubMaxId;
                }
              }
            });
          }
        });
        return maxId + 1;
      };

      const newId = generateUniqueId(contentGeneratedOutlines);
      const newOutlineItem: OutlineItem = {
        id: newId,
        type: selectedTitleType,
        title: customTitle,
        subtitles: [],
      };

      sortingOutlines([...contentGeneratedOutlines, newOutlineItem]);
      setSelectedTitleType("h2");
      setCustomTitle("");
    }
  }

  async function saveOutline() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let currentDate = `${year}-${month}-${day}`;
    const { error } = await supabase
      .from("content-items")
      .update({
        outlines: contentGeneratedOutlines,
        date_edited: currentDate,
        status: "Created outlines",
        content_title: updateTitle,
      })
      .eq("id", contentId);

    if (!error) {
      router.push("/content");
    }
  }

  return (
    <InnerWrapper>
      <PageTitle
        title={"Content outlines"}
        buttons={[
          <Button
            key={0}
            type={"outline"}
            onClick={() => {
              alert("Progress won't be saved");
              router.push("/content");
            }}
          >
            <p>Close</p> <CloseRoundedIcon />
          </Button>,
          <Button key={1} type={"solid"} onClick={() => saveOutline()}>
            <p>Save & close</p> <SaveOutlinedIcon />
          </Button>,
        ]}
      />
      {currentContent.length > 0 ? (
        <div className={styles.fullWrapper}>
          <div className={classNames(styles.outlinesWrapper, "scrollbar")}>
            <div className={styles.mainTitle}>
              <h1>Title:</h1>
              <input
                type="text"
                value={updateTitle}
                onChange={(event) => setUpdateTitle(event.target.value)}
              />
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="subtitlesList" type="h2">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={styles.subtitlesWrapper}
                  >
                    {contentGeneratedOutlines.length > 0
                      ? contentGeneratedOutlines.map((title: any, index) => (
                          <DraggableSubtitle
                            key={title.id}
                            title={title}
                            index={index}
                            handleTitleChange={handleTitleChangeRecursive}
                            setContentGeneratedOutlines={
                              setContentGeneratedOutlines
                            }
                            contentGeneratedOutlines={contentGeneratedOutlines}
                          />
                        ))
                      : ""}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className={styles.bottomWrapper}>
            <div className={styles.inputWrapper}>
              <div className={styles.leftWrapper}>
                <Dropdown>
                  <DropdownTrigger>
                    <div className={styles.dropdown}>
                      <h4>{selectedTitleType}</h4>
                      <KeyboardArrowDownRoundedIcon />
                    </div>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Static Actions"
                    disallowEmptySelection
                    selectionMode="single"
                    onAction={(key) => setSelectedTitleType(key.toString())}
                    className="typeDropdown"
                  >
                    <DropdownItem key="h2" textValue="h2">
                      <h4>H2</h4>
                    </DropdownItem>
                    <DropdownItem key="h3" textValue="h3">
                      <h4>H3</h4>
                    </DropdownItem>
                    <DropdownItem key="h4" textValue="h4">
                      <h4>H4</h4>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <input
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  type="text"
                  placeholder="Insert your own title"
                  onKeyDown={(e: any) => {
                    if (e.key == "Enter") {
                      addNewTitle();
                    }
                  }}
                />
              </div>
              <div className={styles.addIcon} onClick={() => addNewTitle()}>
                <AddRoundedIcon />
              </div>
            </div>
            <Button type={"outline"} onClick={() => generateOutlines()}>
              <p>Generate again</p>
              <AutoAwesomeIcon />
            </Button>
          </div>
        </div>
      ) : (
        ""
      )}
      {generating && (
        <PopUpWrapper>
          <CircularLoader />
        </PopUpWrapper>
      )}
    </InnerWrapper>
  );
}
