import classNames from "classnames";
import styles from "./subtitle.module.scss";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

export default function Subtitle({
  title,
  onChange,
  removeTitle,
}: {
  title: any;
  onChange: any;
  removeTitle: any;
}) {
  return (
    <div
      className={classNames(styles.subtitle, {
        [styles.h2]: title.type == "h2",
        [styles.h3]: title.type == "h3",
        [styles.h4]: title.type == "h4",
      })}
    >
      <DragIndicatorIcon />
      <div className={styles.type}>
        <h4>{title.type}</h4>
      </div>
      <input
        type="text"
        value={title.title}
        className={styles.title}
        onChange={(event) => onChange(event.target.value, title.id)}
      />
      <div className={styles.delete} onClick={() => removeTitle(title.id)}>
        <DeleteOutlineRoundedIcon />
      </div>
    </div>
  );
}
