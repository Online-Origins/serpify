import classNames from "classnames";
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
import { useState } from "react";
import CustomizedTooltip from "../custom-tooltip/custom-tooltip.component";
import styles from "./input-wrapper.module.scss";

export default function InputWrapper({
  title,
  required,
  onChange,
  className,
  icon,
  value,
  type,
  defValue,
  information,
  placeholder,
  options,
  generateTitle,
  onKeyDown,
  step,
  marks,
  small,
  domainDropdown,
  disabled
}: {
  title?: string;
  required?: boolean;
  onChange: any;
  className?: any;
  icon?: React.ReactNode;
  value?: any;
  type: string;
  defValue?: any;
  information?: string;
  placeholder?: string;
  options?: any;
  generateTitle?: any;
  onKeyDown?: any;
  step?: number;
  marks?: any;
  small?: boolean;
  domainDropdown?: boolean;
  disabled?: boolean;
}) {
  // Handle the change of the input value
  const handleChange = (value: string) => {
    if (defValue.includes(value)) {
      onChange(defValue.filter((item: string) => item !== value));
    } else {
      onChange([...defValue, value]);
    }
  };

  const [tooltipOpen, setTooltipOpen] = useState(true);

  // Return the input depending the type
  const handleType = (type: string) => {
    switch (true) {
      case type == "text":
        return (
          <div className={styles.inputWrapper}>
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
            disabled={disabled}
          >
            {options.map((option: any) => (
              <MenuItem
                key={option.id ? option.id : option}
                value={option.id ? option.id : option}
                className={styles.menuItem} 
              >
                {domainDropdown && (
                  <img
                    src={`http://www.google.com/s2/favicons?domain=https://${option}`}
                  />
                )}
                {option.value ? option.value : option}
              </MenuItem>
            ))}
          </Select>
        );
      case type == "vertMultiSelect":
        return (
          <div
            className={classNames(
              styles.multiSelect,
              styles.vertMultiSelect,
              "scrollbar"
            )}
          >
            {options.length > 0 ? options.map((option: string) => (
              <label key={option}>
                <input
                  type="checkbox"
                  checked={defValue.includes(option)}
                  onChange={() => handleChange(option)}
                />
                <p>{option}</p>
              </label>
            )) : <p>No options found</p>}
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
              <CustomizedTooltip
                onClick={() => setTooltipOpen(false)}
                open={tooltipOpen}
                placement="top"
                information="Generate a title with AI"
              >
                <AutoAwesomeIcon />
              </CustomizedTooltip>
            </div>
          </div>
        );
      case type == "slider":
        return (
          <div className={styles.sliderWrapper}>
            <Slider
              value={defValue}
              onChange={(event: Event, newValue: number | number[]) =>
                onChange(newValue as number[])
              }
              step={step}
              disableSwap
              marks={marks}
              className={styles.slider}
            />
          </div>
        );
      case type == "file":
        return (
          <input
            type="file"
            onChange={(e) => {
              if (!e.target.files) {
                return;
              }

              onChange(e.target.files[0]);
            }}
            accept="image/*"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={classNames(styles.wrapper, className, small && styles.small)}
    >
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
