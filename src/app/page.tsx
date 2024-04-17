"use client";
import MenuBar from "@/components/menu-bar/menu-bar.component";
import ComponentWrapper from "@/components/ui/component-wrapper/component-wrapper.component";
import Home from "@/pages/home";
import Keywords from "@/pages/keywords";

import styles from "./index.module.scss";

import { useEffect, useState } from "react";
import classNames from "classnames";

export default function Page() {
  const [active, setActive] = useState("home");
  const [smallNav, setSmallNav] = useState(false);

  useEffect(() => {
    if (active != "home") {
      setSmallNav(true);
    }
  }, [active]);

  return (
    <main>
      <MenuBar
        active={active}
        setActive={setActive}
        smallNav={smallNav}
        setSmallNav={setSmallNav}
      />
      <ComponentWrapper
        className={classNames(
          styles.pagesWrapper,
          !smallNav && styles.smallerWrapper
        )}
      >
        <div className={styles.innerWrapper}>
          {active == "home" && <Home />}
          {active == "keyword" && <Keywords />}
        </div>
      </ComponentWrapper>
    </main>
  );
}
