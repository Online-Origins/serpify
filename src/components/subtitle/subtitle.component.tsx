import classNames from "classnames";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CustomizedTooltip from "../ui/custom-tooltip/custom-tooltip.component";
import { useEffect, useState } from "react";
import styles from "./subtitle.module.scss";
import { AutoAwesome, KeyboardArrowDownRounded } from "@mui/icons-material";
import CircularLoader from "../circular-loader/circular-loader.component";
import PopUpWrapper from "../ui/popup-wrapper/popup-wrapper.component";
import languageCodes from "@/json/language-codes.json";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";

export default function Subtitle({
  title,
  onChange,
  removeTitle,
  draggable,
  language,
  typeChange,
}: {
  draggable?: boolean;
  title: any;
  onChange: any;
  removeTitle: any;
  language: string;
  typeChange?: any;
}) {
  const [openTooltip, setOpenTooltip] = useState(true);
  const [loading, setLoading] = useState(false);

  // Close the tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpenTooltip(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Rephrase the title with OpenAI GPT
  async function rephraseTitle() {
    const languageValue = languageCodes.find(
      (lang) => lang.id.toString() == language
    );
    setLoading(true);
    try {
      const response = await fetch("/api/generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Rephrase this subtitle: ${title.title}. Keep the language in ${languageValue?.value} and only give back the subtitle.`,
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
        <Dropdown>
          <DropdownTrigger>
            <div className={styles.dropdown}>
              <h4>{title.type}</h4>
              <KeyboardArrowDownRounded />
            </div>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Static Actions"
            disallowEmptySelection
            selectionMode="single"
            onAction={(key) =>
              typeChange(
                title.id,
                parseInt(key.toString().replace("h", "")),
                parseInt(title.type.toString().replace("h", ""))
              )
            }
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
