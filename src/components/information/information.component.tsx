import CustomizedTooltip from '../ui/custom-tooltip/custom-tooltip.component';
import styles from './information.module.scss'; 

export default function Information({ information }: { information: string }) {
  return (
    <CustomizedTooltip
    information={information}
    >
      <img className={styles.icon} src="/info-icon.svg" alt="Information icon" />
    </CustomizedTooltip>
  );
}
