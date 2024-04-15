import styles from "./information.module.scss";

export default function Information({information} : {information: string}) {
  return (
    <div className={styles.informationWrapper}>
      <img src="/info-icon.svg" alt="Information icon" />
      <div className={styles.textWrapper}>
        <p>{information}</p>
      </div>
    </div>
  );
}
