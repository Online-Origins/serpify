import classNames from "classnames";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import styles from "./page-title.module.scss";
import Information from "../information/information.component";

export default function PageTitle({
  buttons,
  title,
  goBack,
  editing,
  smallerHeader,
  smallTitle,
  information
}: {
  buttons?: React.ReactNode;
  title: String;
  goBack?: any;
  editing?: any;
  smallerHeader?: boolean;
  smallTitle?: string;
  information?: string;
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
          {smallTitle && <h5>{smallTitle}</h5>}
          {editing && <EditIcon />}
          {information && <Information information={information} />}
        </div>
      </div>
      <div className={styles.buttonWrapper}>{buttons}</div>
    </div>
  );
}
