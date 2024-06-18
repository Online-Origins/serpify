"use client";
import classNames from "classnames";
import { CircularProgressbar } from "react-circular-progressbar";
import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import { useRouter } from "next/navigation";
import DotsMenu from "../dots-menu/dots-menu.component";
import { supabase } from "@/app/utils/supabaseClient/server";
import styles from "./content-item.module.scss";

export default function ContentItem({
  content,
  collections,
  shownContents,
  setShownContents,
  sortContents,
  smallWrapper,
}: {
  content: any;
  collections: any;
  shownContents: any;
  setShownContents: any;
  sortContents: any;
  smallWrapper?: boolean;
}) {
  const router = useRouter();

  // Set the current content id and route to the status of the content when a user clicks a content item
  function onEditClick() {
    localStorage.setItem("content_id", content.id);
    router.push(`/content/create/${content.status}`);
  }

  // Get a collection by the id linked in the content
  const getCollectionById = (id: string) => {
    const collection = collections.filter(
      (collection: any) => collection.id === id
    );
    if (collection.length > 0) {
      return collection[0];
    } else {
      return null;
    }
  };
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Delete a content item
  async function deleteContent() {
    const { error } = await supabase
      .from("contentItems")
      .delete()
      .eq("id", content.id);
    if (!error) {
      setShownContents(shownContents.filter((item: any) => item != content));
    }
  }

  // Copy a content item with the current date
  async function copyContent() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    const currentDate = `${year}-${month}-${day}`;
    try {
      const { data } = await supabase
        .from("contentItems")
        .select()
        .eq("id", content.id);
      if (data) {
        const inserting = await supabase
          .from("contentItems")
          .insert([
            {
              content_score: data[0].content_score,
              status: data[0].status,
              edited_on: currentDate,
              collection: data[0].collection,
              language: data[0].language,
              tone_of_voice: data[0].tone_of_voice,
              content_title: data[0].content_title,
              sub_keywords: data[0].sub_keywords,
              keyword: data[0].keyword,
              target_audience: data[0].target_audience,
              outlines: data[0].outlines,
              domain: data[0].domain,
            },
          ])
          .select();
        if (
          !inserting.error &&
          (smallWrapper ? shownContents.length < 3 : true)
        ) {
          setShownContents(sortContents([...shownContents, inserting.data[0]]));
        }
      }
    } catch (error) {
      alert("Something went wrong. Please try again later.")
    }
  }

  // Translate the status from the database to understandable text
  function translateStatus(status: string) {
    if (status == "writing") {
      return "Writing content";
    } else if (status == "outlines") {
      return "Creating outlines";
    }
    return status;
  }

  return (
    <div className={styles.content} onClick={() => onEditClick()}>
      <div className={styles.titleWrapper}>
        <h4>{content.content_title}</h4>
        <p
          className={classNames(
            getCollectionById(content.collection) != null &&
              styles.collectionLink
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (getCollectionById(content.collection) != null) {
              router.push(`/keywords/${content.collection}`);
            }
          }}
        >
          {getCollectionById(content.collection) != null
            ? getCollectionById(content.collection).collection_name
            : "Collection not found"}
        </p>
      </div>
      <div className={classNames(styles.contentInfo)}>
        <div className={styles.meterWrapper}>
          <h5>{content.content_score}</h5>
          <CircularProgressbar
            value={content.content_score}
            circleRatio={0.5}
            strokeWidth={15}
            className={styles.score}
            styles={{
              root: {
                transform: "rotate(0.75turn)",
              },
              path: { stroke: "#6210CC", strokeLinecap: "butt" },
              trail: { stroke: "#FAF6FF", strokeLinecap: "butt" },
            }}
          />
        </div>
      </div>
      <div className={classNames(styles.contentInfo)}>
        <p>{translateStatus(content.status)}</p>
      </div>
      <div className={classNames(styles.contentInfo)}>
        <p>{formatDate(content.edited_on)}</p>
      </div>
      <div className={styles.iconsWrapper}>
        <div className={styles.editIcon} onClick={() => onEditClick()}>
          <BorderColorRoundedIcon />
        </div>
        <div id="dotsMenu">
          <DotsMenu
            deleteFunction={() => deleteContent()}
            copyFunction={() => copyContent()}
          />
        </div>
      </div>
    </div>
  );
}
