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
  DropdownSection,
  DropdownItem,
} from "@nextui-org/dropdown";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import languageCodes from "@/json/language-codes.json";
import toneOfVoices from "@/json/tone-of-voice.json";
import Subtitle from "@/components/subtitle/subtitle.component";
import classNames from "classnames";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import CircularLoader from "@/components/circular-loader/circular-loader.component";

export default function CreateOutlines() {
  const router = useRouter();
  const [contentId, setContentId] = useState<any>("");
  const getContentRef = useRef(false);
  const generateTitlesRef = useRef(false);
  const [generating, setGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState<any[]>([]);
  interface OutlineItem {
    id: number;
    type: string; // Assuming type can be 'h2', 'h3', or 'h4'
    title: string;
  }
  const [contentGeneratedOutlines, setContentGeneratedOutlines] = useState<
    OutlineItem[]
  >([]);
  const [selectedTitleType, setSelectedTitleType] = useState("h2");
  const [customTitle, setCustomTitle] = useState("");

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

  async function generateOutlines(retryCount = 3) {
    setGenerating(true);
    try {
      const language = languageCodes.find(
        (lang) => lang.id === currentContent[0].language
      );
      const toneOfVoice = toneOfVoices.find(
        (item) => item.id === currentContent[0].tone_of_voice
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
      setContentGeneratedOutlines(cleanOutlinesArray);
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

  const handleTitleChange = (id: number, newValue: string) => {
    setContentGeneratedOutlines((prevOutlines: any) => {
      return prevOutlines.map((outline: any) => {
        if (outline.id === id) {
          return { ...outline, title: newValue };
        }
        return outline;
      });
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(contentGeneratedOutlines);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContentGeneratedOutlines(items); // Update the state with the new order
  };

  function addNewTitle() {
    if (customTitle != "") {
      const newId = contentGeneratedOutlines.length + 1;
      const newOutlineItem: OutlineItem = {
        id: newId,
        type: selectedTitleType,
        title: customTitle,
      };
      setContentGeneratedOutlines((prevOutlines) => [
        ...prevOutlines,
        newOutlineItem,
      ]);
      setSelectedTitleType("h2");
      setCustomTitle("");
    }
  }

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
        <div className={styles.fullWrapper}>
          <div className={classNames(styles.outlinesWrapper, "scrollbar")}>
            <h1>Title: {currentContent[0].content_title}</h1>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="subtitles">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={styles.subtitlesWrapper}
                  >
                    {contentGeneratedOutlines.length > 0
                      ? contentGeneratedOutlines.map((title: any, index) => (
                          <Draggable
                            key={title.id}
                            draggableId={title.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Subtitle
                                  key={title.id}
                                  title={title}
                                  onChange={(value: string, id: number) =>
                                    handleTitleChange(id, value)
                                  }
                                />
                              </div>
                            )}
                          </Draggable>
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
