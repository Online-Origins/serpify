import styles from "./indication-icon.module.scss";

export default function IndicationIcon({ indication }: { indication: any }) {
  switch (true) {
    case indication == "extreme":
      return (
        <img
          className={styles.indicator}
          src="./extreme-icon.svg"
          alt="extreme icon"
        />
      );
    case indication == "high":
      return (
        <img
          className={styles.indicator}
          src="./high-icon.svg"
          alt="high icon"
        />
      );
    case indication == "medium":
      return (
        <img
          className={styles.indicator}
          src="./medium-icon.svg"
          alt="medium icon"
        />
      );
    case indication == "low":
      return (
        <img
          className={styles.indicator}
          src="./low-icon.svg"
          alt="low icon"
        />
      );
  }
}
