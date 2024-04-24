import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Fade from "@mui/material/Fade";
import { styled } from '@mui/material/styles';
import styles from './information.module.scss'; 

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
      border: "solid 1px #8848E1"
    },
  }
}));

export default function Information({ information }: { information: string }) {
  return (
    <CustomToolTip
      title={<p className={styles.info}>{information}</p>}
      arrow
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
    >
      <img className={styles.icon} src="/info-icon.svg" alt="Information icon" />
    </CustomToolTip>
  );
}
