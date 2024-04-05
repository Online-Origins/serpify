import MenuBar from "@/components/menu-bar/menu-bar.component";
import Home from "@/pages/home";
import "@/styles/global.scss";

import styles from "./index.module.scss";
import ComponentWrapper from "@/components/ui/component-wrapper/component-wrapper.component";

export default function Page() {
  return (
    <main>
      <MenuBar />
      <ComponentWrapper className={styles.pagesWrapper}>
        <div className={styles.innerWrapper}>
          <Home />
        </div>
      </ComponentWrapper>
    </main>
  );
}
