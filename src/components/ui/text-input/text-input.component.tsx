import classNames from "classnames";
import styles from "./text-input.module.scss";

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function TextInput({
  title,
  required,
  onChange,
  className,
  currentValues,
  icon,
}: {
  title?: string;
  required?: boolean;
  onChange: any;
  className?: any;
  currentValues?: any;
  icon?: React.ReactNode;
}) {
  return (
    <div className={classNames(styles.wrapper, className)}>
      {title && <h4>{title}{required ? " *" : ""}</h4>}
      <div className={styles.inputWrapper}>
        {currentValues &&
            <div className={styles.currentValues}>
                {currentValues.map((value: string) => 
                    <p className={styles.value} key={value}>{value} <CloseRoundedIcon /> </p>
                )}
            </div>
        }
        <input type="text" onChange={(event) => onChange(event.target.value)} />
        {icon &&
            icon
        }
      </div>
    </div>
  );
}
