import { Box, Typography } from "@mui/material";
import React, { memo } from "react";
import { lightBlue } from "../../constants/color";
import moment from "moment";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";
import Avatar from "@mui/material/Avatar";
import ReactPlayer from "react-player";

const MessageComponent = ({ message, user }) => {
  const { sender, content, attachments = [], createdAt } = message;
  const sameSender = sender?._id === user?._id;
  const timeAgo = moment(createdAt).fromNow();
  const isUrl = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/;
    return urlRegex.test(text);
  };
  const renderPlayer = (url) => {
    return (
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="auto"
        style={{ marginTop: "8px", minWidth: "220px" }}
      />
    );
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: "-100%" }}
      whileInView={{ opacity: 1, x: 0 }}
      style={{
        alignSelf: sameSender ? "flex-end" : "flex-start",
        width: "fit-content",
        display: "flex",
        flexDirection: sameSender ? "row-reverse" : "row",
      }}
    >
      <Avatar
        alt={sender?.name}
        src={message?.sender?.avatar?.url}
        sx={{ height: "30px", width: "30px" }}
        style={{ margin: "0px 8px" }}
      />
      <Box sx={{ display: "flex" }}>
        <Box
          sx={{
            backgroundColor: "background.default",
            color: "black",
            padding: "0.5rem",

            borderRadius: "5px",
          }}
        >
          <Typography
            color="text.secondary"
            fontWeight={"600"}
            variant="caption"
          >
            {sender.name}
          </Typography>

          {isUrl(content) ? (
            renderPlayer(content)
          ) : (
            <Typography color="text.primary">{content}</Typography>
          )}
          {attachments.length > 0 &&
            attachments.map((attachment, index) => {
              const url = attachment?.url;
              const file = fileFormat(url);

              return (
                <Box key={index}>
                  <a
                    href={url}
                    target="_blank"
                    download
                    style={{
                      color: "black",
                    }}
                  >
                    {RenderAttachment(file, url)}
                  </a>
                </Box>
              );
            })}

          <Typography variant="caption" color={"text.secondary"}>
            {timeAgo}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default memo(MessageComponent);
