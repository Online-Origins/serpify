import React from "react";
import styles from "./popup.module.scss";

import PageTitle from "@/components/page-title/page-title.component";

export default function PopUp({
  buttons,
  title,
  titleButtons,
  children,
}: {
  buttons?: React.ReactNode;
  title: String;
  titleButtons?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.popUp}>
      <PageTitle title={title} buttons={titleButtons} />
      {children}
      <div className={styles.buttonWrapper}>{buttons}</div>
    </div>
  );
}
