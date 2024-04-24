import classNames from "classnames";
import styles from "./input-wrapper.module.scss";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Information from "@/components/information/information.component";
import {
  Autocomplete,
  MenuItem,
  Select,
  Slider,
  TextField,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

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
  generateTitle,
  changeCurrentValues,
  onKeyDown,
  step,
  marks,
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
  generateTitle?: any;
  changeCurrentValues?: any;
  onKeyDown?: any;
  step?: number;
  marks?: any;
}) {
  const handleChange = (value: string) => {
    if (defValue.includes(value)) {
      onChange(defValue.filter((item: string) => item !== value));
    } else {
      onChange([...defValue, value]);
    }
  };

  const handleType = (type: string) => {
    switch (true) {
      case type == "text":
        return (
          <div className={styles.inputWrapper}>
            {currentValues && (
              <div className={styles.currentValues}>
                {currentValues.map((value: string) => (
                  <div key={value} className={styles.value}>
                    <p>{value}</p>
                    <div onClick={() => changeCurrentValues(value)}>
                      <CloseRoundedIcon />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => (onKeyDown ? onKeyDown(e) : "")}
            />
            {icon && icon}
          </div>
        );
      case type == "multiSelect":
        return (
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
        );
      case type == "autocomplete":
        return (
          <Autocomplete
            value={options.find((option: any) => option.id === value) || null}
            onChange={(event, newValue) => {
              onChange(newValue ? newValue.id : null);
            }}
            className={styles.autocomplete}
            options={options}
            getOptionLabel={(option) => option.value} // specify which property to use as the label
            renderInput={(params) => (
              <TextField {...params} variant="standard" />
            )}
          />
        );
      case type == "dropdown":
        return (
          <Select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={styles.dropdown}
            variant="standard"
          >
            {options.map((option: any) => (
              <MenuItem
                key={option.id ? option.id : option}
                value={option.id ? option.id : option}
              >
                {option.value ? option.value : option}
              </MenuItem>
            ))}
          </Select>
        );
      case type == "vertMultiSelect":
        return (
          <div
            className={classNames(styles.multiSelect, styles.vertMultiSelect)}
          >
            {options.map((option: string) => (
              <label key={option}>
                <input
                  type="checkbox"
                  checked={defValue.includes(option)}
                  onChange={() => handleChange(option)}
                />
                <p>{option}</p>
              </label>
            ))}
          </div>
        );
      case type == "generate":
        return (
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
            />
            <div
              onClick={() => generateTitle()}
              className={styles.generateIcon}
            >
              <AutoAwesomeIcon />
            </div>
          </div>
        );
      case type == "slider":
        return (
          <div className={styles.sliderWrapper}>
            <Slider
              defaultValue={defValue}
              onChange={(value: any) => handleChange(value.target.value)}
              step={step}
              disableSwap
              marks={marks}
              className={styles.slider}
            />
          </div>
        );
      default:
        return null;
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
      {handleType(type)}
    </div>
  );
}
