import styles from "./button.module.scss";
import classNames from "classnames";

export default function Button({
  children,
  type,
  link,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  type?: String;
  link?: String;
  onClick?: () => void;
  disabled?: boolean
}) {
  if (onClick) {
    return (
      <div onClick={!disabled ? onClick : undefined}
        className={classNames(styles.buttonWrapper, {
          [styles.outline]: type == "outline",
          [styles.solid]: type == "solid",
          [styles.textOnly]: type == "textOnly",
          [styles.disabled]: disabled,
        })}
      >
        {children}
      </div>
    );
  } else {

  }
}
