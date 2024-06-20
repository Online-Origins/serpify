"use client";
import classNames from "classnames";
import { CircularProgressbar } from "react-circular-progressbar";
import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import { useRouter } from "next/navigation";
import DotsMenu from "../dots-menu/dots-menu.component";
import { supabase } from "@/app/utils/supabaseClient/server";
import styles from "./content-item.module.scss";
import Link from "next/link";
import { getCurrentDateTime } from '@/app/utils/currentDateTime/dateUtils';

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
              edited_on: getCurrentDateTime(),
              collection: data[0].collection,
              language: data[0].language,
              tone_of_voice: data[0].tone_of_voice,
              content_title: data[0].content_title,
              sub_keywords: data[0].sub_keywords,
              keyword: data[0].keyword,
              target_audience: data[0].target_audience,
              outlines: data[0].outlines,
              domain: data[0].domain,
              type: data[0].type,
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
      alert("Something went wrong. Please try again later.");
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
        {getCollectionById(content.collection) != null ? (
          <Link
            href={`/keywords/${content.collection}`}
            className={styles.collectionLink}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {getCollectionById(content.collection).collection_name}
          </Link>
        ) : <p>No collection found</p>}
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
      <div className={classNames(styles.contentInfo)}>
        <p>{content.type.charAt(0).toUpperCase() + content.type.slice(1)}</p>
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
