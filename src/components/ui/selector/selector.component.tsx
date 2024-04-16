import styles from "./selector.module.scss";
import classNames from "classnames";

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
