import classNames from "classnames";
import styles from "./subtitle.module.scss";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

export default function Subtitle({ title, onChange }: { title: any, onChange: any }) {
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
      <input type="text" value={title.title} className={styles.title} onChange={(event) => onChange(event.target.value, title.id)} />
    </div>
  );
}
