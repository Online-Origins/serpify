import styles from "./popup-wrapper.module.scss";

export default function PopUpWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.popUpWrapper}>
        {children}
    </div>
  );
}
