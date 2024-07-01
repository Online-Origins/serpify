"use client";
import { useEffect, useRef, useState } from "react";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import PageTitle from "@/components/page-title/page-title.component";
import Button from "@/components/ui/button/button.component";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient/server";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
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
import CustomizedTooltip from "@/components/ui/custom-tooltip/custom-tooltip.component";
import { ArrowForwardRounded } from "@mui/icons-material";
import styles from "./page.module.scss";
import { getCurrentDateTime } from "@/app/utils/currentDateTime/dateUtils";

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

  // Get the content
  useEffect(() => {
    if (contentId != "" && !getContentRef.current) {
      getContent();
      getContentRef.current = true;
    } else {
      if (typeof localStorage !== "undefined") {
        const id = localStorage.getItem("content_id");
        setContentId(id);
      } else {
        // If neither localStorage nor sessionStorage is supported
        console.log("Web Storage is not supported in this environment.");
      }
    }
  }, [getContentRef, contentId]);

  // Generate the outlines for the content or use the ones from the database if there are outlines in the database
  useEffect(() => {
    if (
      currentContent.length > 0 &&
      !generateTitlesRef.current &&
      currentContent[0].outlines == null
    ) {
      generateOutlines();
      setUpdateTitle(currentContent[0].content_title);
      generateTitlesRef.current = true;
    } else if (
      currentContent.length > 0 &&
      currentContent[0].outlines != null
    ) {
      setContentGeneratedOutlines(currentContent[0].outlines);
      setUpdateTitle(currentContent[0].content_title);
    }
  }, [currentContent, generateTitlesRef]);

  // Sort the outlines. H4's are being placed in H3's, and H3's are being placed inside H2's
  function sortingOutlines(titles: any[]) {
    let array: any[] = [];
    titles.map((title: any, index: number) => {
      if (title.type == "h2") {
        array.push(title);
      } else {
        if (array.length > 0) {
          let lastIndex = array.length - 1;
          if (!array[lastIndex].subtitles) {
            array[lastIndex].subtitles = [];
          }
          array[lastIndex].subtitles.push(title);
        }
      }
    });
    setContentGeneratedOutlines(array);
  }

  // Get the current content
  async function getContent() {
    const { data } = await supabase
      .from("contentItems")
      .select()
      .eq("id", contentId);
    if (data) {
      setCurrentContent(data);
    }
  }

  // Generate the outlines
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
          sub_keywords: currentContent[0].sub_keywords,
          keyword: currentContent[0].keyword,
          language: language?.value,
          audience: currentContent[0].target_audience,
          toneOfVoice: toneOfVoice?.value,
          type: currentContent[0].type,
        }),
      });

      const { generatedOutlines } = await response.json();
      sortingOutlines(generatedOutlines.subtitles);
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

  // If an title is changed it should correctly be updated
  const handleTitleChangeRecursive = (id: number, newValue: string) => {
    setContentGeneratedOutlines((prevOutlines: any) => {
      return handleTitleChange(id, newValue, prevOutlines);
    });
  };

  // Organize the subtitles when a users stops dragging a subtitle
  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    if (result.type == "h2") {
      const items = Array.from(contentGeneratedOutlines);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setContentGeneratedOutlines(items);
    } else {
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
    }
  };

  // Add a new subtitle from the user input
  function addNewTitle() {
    if (customTitle != "") {
      const generateUniqueId = (outlines: OutlineItem[]): number => {
        let maxId = 0;
        outlines.forEach((item) => {
          if (item.id > maxId) {
            maxId = item.id;
          }
          if (item.subtitles && item.subtitles.length > 0) {
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

  // Save the outlines in the database
  async function saveOutline() {
    const { error } = await supabase
      .from("contentItems")
      .update({
        outlines: contentGeneratedOutlines,
        edited_on: getCurrentDateTime(),
        status: "outlines",
        content_title: updateTitle,
      })
      .eq("id", contentId);

    if (!error) {
      router.push("/content");
    }
  }

  // Generate a new subtitle
  async function generateNewTitle() {
    try {
      const language = languageCodes.find(
        (lang) => lang.id.toString() === currentContent[0].language
      ); // Get the language that is combined to the chosen language
      const toneOfVoicebyId = toneOfVoices.find(
        (item) => item.id.toString() === currentContent[0].tone_of_voice
      ); // Get the tone of voice that is combined to the chosen tone of voice

      const response = await fetch("/api/generateSubTitle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sub_keywords: currentContent[0].sub_keywords,
          keyword: currentContent[0].keyword,
          toneofvoice: toneOfVoicebyId?.value,
          language: language?.value,
          type: selectedTitleType,
          title: currentContent[0].content_title,
          subtitles: contentGeneratedOutlines,
        }),
      });

      const data = await response.json();
      setGenerating(false);
      setCustomTitle(data.generatedTitle.split('"').join("")); //Remove the "" around the generated title
    } catch (error: any) {
      alert("Something went wrong. Please try again");
      setGenerating(false);
    }
  }

  // Go to the next step of creating content, and save the outlines
  async function nextContentStep() {
    const { error } = await supabase
      .from("contentItems")
      .update({
        status: "writing",
        outlines: contentGeneratedOutlines,
        edited_on: getCurrentDateTime(),
        content_title: updateTitle,
      })
      .match({ id: currentContent[0].id });
    if (!error) {
      router.push("/content/create/writing");
    }
  }

  function typeChange(id: number, newType: number, oldType: number) {
    const outlines = [...contentGeneratedOutlines]; // Create a shallow copy of the array

    // Helper function to find an item recursively and return its parent and index
    function findItemAndParent(
      outlines: any,
      id: any,
      parent = null,
      parentIndex = -1
    ) {
      for (let i = 0; i < outlines.length; i++) {
        if (outlines[i].id == id) {
          if (!parent) {
            console.log(i)
            return { item: outlines[i], index: i, parent };
          } else {
            console.log(parentIndex)
            return { item: outlines[i], index: parentIndex + 1, parent };
          }
        }
        if (outlines[i].subtitles && outlines[i].subtitles.length > 0) {
          const result: any = findItemAndParent(
            outlines[i].subtitles,
            id,
            outlines[i],
            parent ? parentIndex : i
          );
          if (result) {
            return result;
          }
        }
      }
      return null;
    }

    const { item, index, parent } = findItemAndParent(outlines, id) || {};

    if (!item) {
      throw new Error("ID not found in the array");
    }

    if (oldType == 2) {
      // Find the previous h2 element
      let previousH2Index = -1;
      for (let i = index - 1; i >= 0; i--) {
        if (outlines[i].type == "h2") {
          previousH2Index = i;
          break;
        }
      }

      if (previousH2Index == -1) {
        return;
      }

      // Change the type of the element with the given ID and get its subtitles
      const updatedElement = {
        ...item,
        type: `h${newType}`,
        subtitles: [],
      };
      const elementSubtitles = item.subtitles || [];

      // Add the updated element and its subtitles to the subtitles array of the previous h2 element
      const updatedPreviousH2Element = {
        ...outlines[previousH2Index],
        subtitles: [
          ...(outlines[previousH2Index].subtitles || []),
          ...elementSubtitles,
          updatedElement,
        ].sort((a: any, b: any) => a.id - b.id),
      };

      // Create a new array with the updated elements
      const newOutlines = [
        ...outlines.slice(0, previousH2Index),
        updatedPreviousH2Element,
        ...outlines.slice(previousH2Index + 1, index),
        ...outlines.slice(index + 1),
      ];

      setContentGeneratedOutlines(newOutlines);
    } else {
      if (!parent) {
        throw new Error("Parent not found for the item with oldType 3");
      }

      if (newType != 2) {
        // Update the type to "h4"
        const updatedElement = { ...item, type: `h${newType}` };

        // Find the parent subtitle array and replace the updated element
        const updatedSubtitles = parent.subtitles.map((subtitle: any) =>
          subtitle.id === id ? updatedElement : subtitle
        );

        // Update the parent with new subtitles
        const updatedParent = { ...parent, subtitles: updatedSubtitles };

        // Function to update the outlines array recursively
        const updateOutlines = (outlines: any, updatedParent: any) => {
          return outlines.map((outline: any) => {
            if (outline.id === updatedParent.id) {
              return updatedParent;
            }
            return outline;
          });
        };

        const newOutlines = updateOutlines(outlines, updatedParent);
        setContentGeneratedOutlines(newOutlines);
      } else if (newType == 2) {
        // Change the type of the element with the given ID to "h2"
        const updatedElement = { ...item, type: "h2" };

        // Remove the element from its parent's subtitles
        const updatedSubtitles = parent.subtitles.filter(
          (subtitle: any) => subtitle.id !== id
        );

        // Update the parent with the new subtitles
        const updatedParent = { ...parent, subtitles: updatedSubtitles };

        // Function to update the outlines array recursively
        const updateOutlines = (outlines: any, updatedParent: any) => {
          return outlines.map((outline: any) => {
            if (outline.id === updatedParent.id) {
              return updatedParent;
            }
            if (outline.subtitles && outline.subtitles.length > 0) {
              return {
                ...outline,
                subtitles: updateOutlines(outline.subtitles, updatedParent),
              };
            }
            return outline;
          });
        };

        let newOutlines = updateOutlines(outlines, updatedParent);

        // Add the updated element to the main array at the appropriate position
        newOutlines = [
          ...newOutlines.slice(0, index),
          updatedElement,
          ...newOutlines.slice(index),
        ];

        setContentGeneratedOutlines(newOutlines);
      }
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
              <h2>Title:</h2>
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
                            language={currentContent[0].language}
                            typeChange={typeChange}
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
              <CustomizedTooltip
                information="Generate a title with AI"
                placement={"top"}
              >
                <div
                  className={styles.generateIcon}
                  onClick={() => generateNewTitle()}
                >
                  <AutoAwesomeIcon />
                </div>
              </CustomizedTooltip>
              <div className={styles.addIcon} onClick={() => addNewTitle()}>
                <AddRoundedIcon />
              </div>
            </div>
            <div className={styles.buttonWrapper}>
              <Button type={"outline"} onClick={() => generateOutlines()}>
                <p>Generate again</p>
                <AutoAwesomeIcon />
              </Button>
              <Button type={"solid"} onClick={() => nextContentStep()}>
                <p>Write content</p>
                <ArrowForwardRounded />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {generating && (
        <PopUpWrapper>
          <CircularLoader />
          <p>Generating outlines...</p>
        </PopUpWrapper>
      )}
    </InnerWrapper>
  );
}
