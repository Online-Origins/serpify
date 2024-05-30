import Information from "../information/information.component";
import styles from "./statistic.module.scss";

export default function Statistic({
  title,
  information,
  amount,
}: {
  title: string;
  information: string;
  amount: any;
}) {
  return (
    <div className={styles.stat}>
      <div className={styles.cardTitle}>
        <h4>{title}</h4>
        <Information information={information} />
      </div>
      <h2>{amount}</h2>
    </div>
  );
}
