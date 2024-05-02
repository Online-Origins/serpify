import classNames from "classnames";
import styles from "./subtitle.module.scss";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CustomizedTooltip from "../ui/custom-tooltip/custom-tooltip.component";
import { useEffect, useState } from "react";

export default function Subtitle({
  title,
  onChange,
  removeTitle,
  draggable,
}: {
  draggable?: boolean;
  title: any;
  onChange: any;
  removeTitle: any;
}) {
  const [openTooltip, setOpenTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpenTooltip(false);
    }, 5000); // 5000 milliseconds = 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={classNames(styles.subtitle, {
        [styles.h2]: title.type == "h2",
        [styles.h3]: title.type == "h3",
        [styles.h4]: title.type == "h4",
      })}
    >
      {draggable &&
        (title.id == 1 ? (
          <CustomizedTooltip
            open={openTooltip}
            information="Drag me to any position in the content you would like"
          >
            <DragIndicatorIcon />
          </CustomizedTooltip>
        ) : (
          <DragIndicatorIcon />
        ))}
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
