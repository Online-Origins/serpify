import classNames from "classnames";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import styles from "./page-title.module.scss";

export default function PageTitle({
  buttons,
  title,
  goBack,
  editing,
  smallerHeader,
}: {
  buttons?: React.ReactNode;
  title: String;
  goBack?: any;
  editing?: any;
  smallerHeader?: boolean;
}) {
  return (
    <div className={classNames(styles.topTitleWrapper, smallerHeader && styles.smallerHeader)}>
      <div className={styles.leftWrapper}>
        {goBack && (
          <div className={styles.arrowWrapper} onClick={() => goBack()}>
            <ArrowBackRoundedIcon />
          </div>
        )}
        <div onClick={editing ? editing : null} className={classNames(styles.titleWrapper, editing ? styles.editing : '')}>
          {!smallerHeader ? <h1>{title}</h1> : <h2>{title}</h2>}
          {editing && <EditIcon />}
        </div>
      </div>
      <div className={styles.buttonWrapper}>{buttons}</div>
    </div>
  );
}
