import React from "react";
import classNames from "classnames";
import styles from "./inner-wrapper.module.scss";

export default function InnerWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: any;
}) {
  return (
    <div className={classNames(styles.wrapper, className)}>{children}</div>
  );
}
