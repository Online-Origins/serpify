"use client";
import PageTitle from "@/components/page-title/page-title.component";
import styles from "./app-wrapper.module.scss";
import MenuBar from "@/components/menu-bar/menu-bar.component";
import ComponentWrapper from "@/components/ui/component-wrapper/component-wrapper.component";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ContentScore from "@/components/content-score/content-score.component";

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
          !smallNav && styles.smallerWrapper,
          pathname == "/content/create/writing" && styles.small
        )}
      >
        <div className={styles.innerWrapper}>{children}</div>
      </ComponentWrapper>
      {pathname == "/content/create/writing" && (
        <ComponentWrapper className={styles.scoreWrapper}>
          <ContentScore/>
        </ComponentWrapper>
      )}
    </body>
  );
}
