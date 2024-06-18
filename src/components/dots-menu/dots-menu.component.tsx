import { useState } from "react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Menu, MenuItem } from "@mui/material";

export default function DotsMenu({
  deleteFunction,
  copyFunction,
}: {
  deleteFunction: () => void;
  copyFunction: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Function to handle click on menu
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  // Function to handle closing
  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  // Function to copy parent element
  const handleDuplicate = (event: React.MouseEvent<HTMLElement>) => {
    copyFunction();
    handleClose(event);
  };

  // Function to delete parent element
  const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
    deleteFunction();
    handleClose(event);
  };

  return (
    <div>
      <div onClick={handleClick} style={{cursor: "pointer"}}>
        <MoreVertIcon />
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{ marginTop: 32 }}
      >
        <MenuItem onClick={handleDuplicate}>
          Duplicate <ContentCopyIcon />
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          Delete <DeleteOutlineRoundedIcon />
        </MenuItem>
      </Menu>
    </div>
  );
}