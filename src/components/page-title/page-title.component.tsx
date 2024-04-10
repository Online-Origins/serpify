import styles from "./page-title.module.scss";
import classNames from "classnames";

export default function PageTitle({
  buttons,
  title,
}: {
  buttons?: React.ReactNode;
  title: String;
}) {
  return (
    <div className={styles.topTitleWrapper}>
      <h1>{title}</h1>
      <div className={styles.buttonWrapper}>{buttons}</div>
    </div>
  );
}
