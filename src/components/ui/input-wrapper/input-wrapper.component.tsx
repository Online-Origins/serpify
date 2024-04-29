import classNames from "classnames";
import styles from "./input-wrapper.module.scss";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Information from "@/components/information/information.component";
import {
  Autocomplete,
  Fade,
  MenuItem,
  Select,
  Slider,
  TextField,
  Tooltip,
  TooltipProps,
  styled,
  tooltipClasses,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useState } from "react";

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

  const [tooltipOpen, setTooltipOpen] = useState(true);
  const CustomToolTip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: "#0E141C",
      borderRadius: 8,
      border: "solid 1px #8848E1",
      padding: 8,
      marginRight: 16,
      boxShadow: "3px 6px 10px rgba(98, 16, 204, .05)",
    },
    [`& .${tooltipClasses.arrow}`]: {
      fontSize: 20,
      marginLeft: 8,

      "&:before": {
        backgroundColor: theme.palette.common.white,
        fontSize: "large",
        border: "solid 1px #8848E1",
      },
    },
  }));

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
            className={classNames(
              styles.multiSelect,
              styles.vertMultiSelect,
              "scrollbar"
            )}
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
              <CustomToolTip
                onClick={() => setTooltipOpen(false)}
                open={tooltipOpen}
                placement="top"
                title={<p>Generate a title with AI</p>}
                arrow
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
              >
                <AutoAwesomeIcon />
              </CustomToolTip>
            </div>
          </div>
        );
      case type == "slider":
        return (
          <div className={styles.sliderWrapper}>
            <Slider
              defaultValue={defValue}
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
