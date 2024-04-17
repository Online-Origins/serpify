import classNames from "classnames";
import styles from "./input-wrapper.module.scss";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Information from "@/components/information/information.component";
import { MenuItem, Select } from "@mui/material";

export default function InputWrapper({
  title,
  required,
  onChange,
  className,
  currentValues,
  icon,
  value,
  type,
  defValue,
  information,
  placeholder,
  options,
}: {
  title?: string;
  required?: boolean;
  onChange: any;
  className?: any;
  currentValues?: any;
  icon?: React.ReactNode;
  value?: any;
  type: string;
  defValue?: any;
  information?: string;
  placeholder?: string;
  options?: any;
}) {
  const handleChange = (length: string) => {
    if (defValue.includes(length)) {
      onChange(defValue.filter((item: string) => item !== length));
    } else {
      onChange([...defValue, length]);
    }
  };

  return (
    <div className={classNames(styles.wrapper, className)}>
      {title && (
        <div className={styles.titleWrapper}>
          <h4>
            {title}
            {required ? " *" : ""}
          </h4>
          {information && <Information information={information} />}
        </div>
      )}
      {type == "text" ? (
        <div className={styles.inputWrapper}>
          {currentValues && (
            <div className={styles.currentValues}>
              {currentValues.map((value: string) => (
                <p className={styles.value} key={value}>
                  {value} <CloseRoundedIcon />{" "}
                </p>
              ))}
            </div>
          )}
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
          />
          {icon && icon}
        </div>
      ) : type == "multiSelect" ? (
        <div className={styles.multiSelect}>
          <label>
            <input
              type="checkbox"
              checked={defValue.includes("shorttail")}
              onChange={() => handleChange("shorttail")}
            />
            <p>Short tail</p>
          </label>
          <label>
            <input
              type="checkbox"
              checked={defValue.includes("longtail")}
              onChange={() => handleChange("longtail")}
            />
            <p>Long tail</p>
          </label>
        </div>
      ) : type == "dropdown" && options ? (
        <Select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={styles.dropdown}
          variant="standard"
        >
          {options.map((option: any) => (
            <MenuItem key={option.criterionId} value={option.criterionId}>
              {option.value}
            </MenuItem>
          ))}
        </Select>
      ) : null}
    </div>
  );
}
