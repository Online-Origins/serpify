import classNames from "classnames";
import Information from "../information/information.component";
import styles from "./statistic.module.scss";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

export default function Statistic({
  title,
  information,
  amount,
  diffAmount,
}: {
  title: string;
  information: string;
  amount: any;
  diffAmount?: any;
}) {
  return (
    <div className={styles.stat}>
      <div className={styles.cardTitle}>
        <h4>{title}</h4>
        <Information information={information} />
      </div>
      <div className={styles.horizontal}>
        <h2>{amount}</h2>
        {diffAmount ? (
          <div className={classNames(styles.difference, diffAmount.toString().includes("-") && !title.includes("position") ? styles.bad : !diffAmount.toString().includes("-") && title.includes("position") ? styles.bad : styles.good)}>
            {diffAmount.toString().includes("-") ? <ArrowDownward/> : <ArrowUpward/>}
            <h5>{diffAmount}</h5>
          </div>
        ): null}
      </div>
    </div>
  );
}
