import KeyboardDoubleArrowUpRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowUpRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
import classNames from "classnames";
import styles from "./indication-icon.module.scss";

export default function IndicationIcon({ indication, competition }: { indication: any; competition?: boolean }) {
  // Switch to return the icon according to the indication
  switch (true) {
    case indication == "extreme":
      return <KeyboardDoubleArrowUpRoundedIcon className={classNames(styles.extreme, competition && styles.comp)} />;
    case indication == "high":
      return <KeyboardArrowUpRoundedIcon className={classNames(styles.high, competition && styles.comp)}  />;
    case indication == "medium":
      return <HorizontalRuleRoundedIcon className={classNames(styles.medium, competition && styles.comp)}  />;
    case indication == "low":
      return <KeyboardArrowDownRoundedIcon className={classNames(styles.low, competition && styles.comp)}  />;
  }
}
 