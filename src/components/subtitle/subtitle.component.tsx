import classNames from "classnames";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CustomizedTooltip from "../ui/custom-tooltip/custom-tooltip.component";
import { useEffect, useState } from "react";
import styles from "./subtitle.module.scss";
import { AutoAwesome } from "@mui/icons-material";
import CircularLoader from "../circular-loader/circular-loader.component";
import PopUpWrapper from "../ui/popup-wrapper/popup-wrapper.component";

export default function Subtitle({
  title,
  onChange,
  removeTitle,
  draggable,
  language,
}: {
  draggable?: boolean;
  title: any;
  onChange: any;
  removeTitle: any;
  language: string;
}) {
  const [openTooltip, setOpenTooltip] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpenTooltip(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  async function rephraseTitle() {
    setLoading(true);
    try {
      const response = await fetch("/api/generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Rephrase this subtitle: ${title.title}. Keep it in the language with the code ${language} and only give back the subtitle.`,
        }),
      });

      const { generatedContent } = await response.json();
      onChange(generatedContent, title.id);
      setLoading(false);
    } catch (error) {
      alert("Something went wrong while generating. Please try again.");
    }
  }

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
      {loading && (
        <PopUpWrapper>
          <CircularLoader />
          <p>Loading subtitle...</p>
        </PopUpWrapper>
      )}
      <div className={styles.generate} onClick={() => rephraseTitle()}>
        <AutoAwesome />
      </div>
      <div className={styles.delete} onClick={() => removeTitle(title.id)}>
        <DeleteOutlineRoundedIcon />
      </div>
    </div>
  );
}
