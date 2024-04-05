import ComponentWrapper from "../ui/component-wrapper/component-wrapper.component";
import styles from "./menu-bar.module.scss";

export default function MenuBar() {
  return (
    <ComponentWrapper className={styles.menuBarWrapper}>
      <div className={styles.logoWrapper}>
        <img
          src="/serpify-logo.svg"
          alt="Serpify logo"
          className={styles.logo}
        />
      </div>
    </ComponentWrapper>
  );
}
