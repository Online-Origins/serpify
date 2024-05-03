import styles from "./page-title.module.scss";
import classNames from "classnames";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

export default function PageTitle({
  buttons,
  title,
  goBack,
  editing,
}: {
  buttons?: React.ReactNode;
  title: String;
  goBack?: any;
  editing?: any;
}) {
  return (
    <div className={styles.topTitleWrapper}>
      <div className={styles.leftWrapper}>
        {goBack && (
          <div className={styles.arrowWrapper} onClick={() => goBack()}>
            <ArrowBackRoundedIcon />
          </div>
        )}
        <div onClick={editing ? editing : null} className={classNames(styles.titleWrapper, editing ? styles.editing : '')}>
          <h1>{title}</h1>
          {editing && <EditIcon />}
        </div>
      </div>
      <div className={styles.buttonWrapper}>{buttons}</div>
    </div>
  );
}
