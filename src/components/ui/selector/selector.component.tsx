import classNames from "classnames";
import styles from "./selector.module.scss";

export default function Selector({
  group,
  item,
  selecting,
}: {
  group: any;
  item: any;
  selecting?: any;
}) {
  return (
    <div
      className={classNames(
        styles.selector,
        group.includes(item) && styles.selected
      )}
      onClick={() => selecting(item)}
    ></div>
  );
}
