import classNames from "classnames";
import styles from "./selector.module.scss";

export default function Selector({
  group,
  item,
  selecting,
  string,
}: {
  group: any;
  item: any;
  selecting?: any;
  string?: boolean;
}) {
  return (
    <div
      className={classNames(
        styles.selector,
        group.includes(item) && styles.selected,
        (!string && group.find((keyword:any) => keyword.text == item.text)) && styles.selected
      )}
      onClick={() => selecting(item)}
    ></div>
  );
}
