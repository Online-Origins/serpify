import classNames from "classnames";
import styles from "./content-item.module.scss";
import { CircularProgressbar } from "react-circular-progressbar";
import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function ContentItem({
  content,
  collections,
}: {
  content: any;
  collections: any;
}) {
  const getCollectionTitle = (id: string) => {
    const collection = collections.filter(
      (collection: any) => collection.id === id
    );
    if (collection.length > 0) {
      return collection[0].collection_name;
    } else {
      return "";
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  return (
    <div className={styles.content}>
      <div className={styles.titleWrapper}>
        <h4>{content.content_title}</h4>
        <p>{getCollectionTitle(content.collection)}</p>
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
        <p>{content.status}</p>
      </div>
      <div className={classNames(styles.contentInfo)}>
        <p>{formatDate(content.date_edited)}</p>
      </div>
      <div className={styles.iconsWrapper}>
        <div className={styles.editIcon}>
          <BorderColorRoundedIcon />
        </div>
        <div>
          <MoreVertIcon />
        </div>
      </div>
    </div>
  );
}
