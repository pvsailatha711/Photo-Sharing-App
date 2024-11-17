import React from "react";
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Avatar } from "@mui/material";
import { useNavigate } from 'react-router-dom';

function CommentsPopup({ open, onClose, comments }) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Comments on your Pictures</DialogTitle>
      <DialogContent>
        <List>
          {comments.map((comment, index) => (
            <ListItem
              key={index}
              onClick={() => {
                onClose();
                navigate(`/photos/${comment.photoId}/${comment.photoIndex}`);
              }}
              style={{border: '1px solid black', marginBottom: '10px'}}
            >
              <Avatar style={{cursor: 'pointer'}} src={`/images/${comment.thumbnailUrl}`} alt="Photo thumbnail" />
              <ListItemText
                onClick={() => {
                    onClose();
                    navigate(`/photos/${comment.photoId}/${comment.photoIndex}`);
                }}
                style={{paddingLeft: '10px', cursor: 'pointer'}} primary={comment.text}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default CommentsPopup;
