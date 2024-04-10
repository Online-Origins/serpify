import styles from "./page-title.module.scss";
import classNames from "classnames";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

export default function PageTitle({
  buttons,
  title,
  goBack,
}: {
  buttons?: React.ReactNode;
  title: String;
  goBack?: any;
}) {
  return (
    <div className={styles.topTitleWrapper}>
      <div className={styles.leftWrapper}>
        {goBack && (
          <div className={styles.arrowWrapper} onClick={goBack}>
            <ArrowBackRoundedIcon />
          </div>
        )}
        <h1>{title}</h1>
      </div>
      <div className={styles.buttonWrapper}>{buttons}</div>
    </div>
  );
}
