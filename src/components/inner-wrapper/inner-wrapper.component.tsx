import React from "react";
import styles from "./inner-wrapper.module.scss";
import classNames from "classnames";

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
