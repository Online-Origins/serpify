"use client";
import "@/styles/global.scss";
import MenuBar from "@/components/menu-bar/menu-bar.component";
import ComponentWrapper from "@/components/ui/component-wrapper/component-wrapper.component";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ContentScore from "@/components/content-score/content-score.component";
import { useSharedContext } from "@/context/SharedContext";
import styles from "./app-wrapper.module.scss";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [smallNav, setSmallNav] = useState(pathname != "/");
  const login = pathname == "/login";
  const { sharedData } = useSharedContext();

  return (
    <body>
      {!login && <MenuBar smallNav={smallNav} setSmallNav={setSmallNav} />}
      <ComponentWrapper
        className={classNames(
          styles.pagesWrapper,
          !smallNav && styles.smallerWrapper,
          pathname.includes("/content/create/writing") && styles.small,
          "scrollbar"
        )}
      >
        <div className={styles.innerWrapper}>{children}</div>
      </ComponentWrapper>
      {pathname.includes("/content/create/writing") && (
        <ComponentWrapper
          className={classNames(styles.scoreWrapper, "scrollbar")}
        >
            <ContentScore contentScore={sharedData} />
        </ComponentWrapper>
      )}
    </body>
  );
}
