import * as React from "react";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { SentimentSatisfiedAlt as SentimentSatisfiedAltIcon } from "@mui/icons-material";
import data from "@emoji-mart/data/sets/15/apple.json";
import Picker from "@emoji-mart/react";
import Fingerprint from "@mui/icons-material/Fingerprint";

export default function Emoji({ onSelectEmoji, inputRef }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleEmojiSelect = React.useCallback(
    (emoji) => {
      onSelectEmoji(emoji.native);
      handleClose();
      setTimeout(() => {
        if (inputRef.current) {
          try {
            inputRef.current.focus();
          } catch (error) {
            console.error("Failed to focus input:", error);
          }
        }
      }, 0);
    },
    [onSelectEmoji, handleClose, inputRef]
  );
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  return (
    <>
      <IconButton variant="outlined" onClick={handleClick} color="error">
        <SentimentSatisfiedAltIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Picker
          onEmojiSelect={handleEmojiSelect}
          data={data}
          emojiSize={30}
          perLine={7}
          previewPosition="none"
          navPosition="bottom"
          maxFrequentRows={0}
          set="apple"
          autoFocus={true}
        />
      </Popover>
    </>
  );
}
