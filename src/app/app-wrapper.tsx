'use client';
import styles from "./index.module.scss";
import MenuBar from "@/components/menu-bar/menu-bar.component";
import ComponentWrapper from "@/components/ui/component-wrapper/component-wrapper.component";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
    const [smallNav, setSmallNav] = useState(pathname != "/");

  return (
    <body>
      <MenuBar smallNav={smallNav} setSmallNav={setSmallNav} />
      <ComponentWrapper
        className={classNames(
          styles.pagesWrapper,
          !smallNav && styles.smallerWrapper
        )}
      >
        <div className={styles.innerWrapper}>{children}</div>
      </ComponentWrapper>
    </body>
  );
}
