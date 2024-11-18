import React, { useEffect, useState } from "react";
import { Typography, Box, Card, CardMedia, CardContent, Divider, Button, TextField } from "@mui/material";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import fetchAxios from "../../lib/fetchAxiosData";
import "./styles.css";

function UserPhotos({ advanceFeature }) {
  const { userId, photoIndex } = useParams();
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(parseInt(photoIndex, 10) || 0);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUserPhotos = async () => {
      try {
        const response = await fetchAxios(`/photosOfUser/${userId}`);
        setPhotos(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUserPhotos();
  }, [userId]);

  const goToPhoto = (index) => {
    setCurrentPhotoIndex(index);
    navigate(`/photos/${userId}/${index}`);
  };

  const handleNext = () => {
    if (currentPhotoIndex < photos.length - 1) {
      goToPhoto(currentPhotoIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      goToPhoto(currentPhotoIndex - 1);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }
    try {
      const response = await axios.post(`/commentsOfPhoto/${photos[currentPhotoIndex]._id}`, { comment: newComment });
      setNewComment('');
      setCommentError('');
      setPhotos((prevPhotos) => {
        const updatedPhotos = [...prevPhotos];
        updatedPhotos[currentPhotoIndex].comments.push(response.data);
        return updatedPhotos;
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      setCommentError("Failed to add comment");
    }
  };

  if (!photos.length) {
    return <Typography>Loading photos...</Typography>;
  }

  const currentPhoto = photos[currentPhotoIndex];

  return (
    <Box padding={2} className="customBox">
      {currentPhotoIndex.toString()}
      {advanceFeature ? (
        <Box className="main-card">
          <Card key={currentPhoto._id} variant="outlined" sx={{ marginBottom: 2 }}>
          <CardMedia
              component="img"
              image={`/images/${currentPhoto.file_name}`}
              alt={`${currentPhoto.file_name}`}
              sx={{
                height: "300px",
                width: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                border: "1px solid #ddd",
                borderBottom: "none"
              }}
            />
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Uploaded on: {new Date(currentPhoto.date_time).toLocaleString()}
              </Typography>
              {currentPhoto.comments && currentPhoto.comments.length > 0 && (
                <Box marginTop={2}>
                  <Typography variant="h6">Comments</Typography>
                  <Divider />
                  {currentPhoto.comments.map((comment) => (
                    <Box key={comment._id} className="commentBox" marginTop={2} padding={2}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {new Date(comment.date_time).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textPrimary">
                        <Link to={`/users/${comment?.user._id}`} style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}>
                          {comment.user.first_name} {comment.user.last_name}
                        </Link>
                        : {comment.comment}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Box marginTop={2}>
                <TextField
                  label="Add a comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  fullWidth
                  variant="outlined"
                  error={Boolean(commentError)}
                  helperText={commentError}
                />
                <Button variant="contained" color="primary" onClick={handleAddComment} sx={{ marginTop: 1 }}>
                  Submit Comment
                </Button>
              </Box>
            </CardContent>
          </Card>
          <Box display="flex" justifyContent="space-between">
            <Button onClick={handlePrevious} disabled={currentPhotoIndex === 0}>Prev</Button>
            <Button onClick={handleNext} disabled={currentPhotoIndex === photos.length - 1}>Next</Button>
          </Box>
        </Box>
      ) : (
        photos.map((photo) => (
          <Card key={photo._id} variant="outlined" sx={{ marginBottom: 2 }} className="main-card">
            <CardMedia
              component="img"
              image={`/images/${photo.file_name}`}
              alt={`${photo.file_name}`}
              sx={{
                height: "300px",
                width: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                border: "1px solid #ddd",
                borderBottom: "none"
              }}
            />
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" className="uploadedOn">
                Uploaded on: {new Date(photo.date_time).toLocaleString()}
              </Typography>
              {photo.comments && photo.comments.length > 0 && (
                <Box marginTop={2}>
                  <Typography variant="h6">Comments</Typography>
                  <Divider />
                  {photo.comments.map((comment) => (
                    <Box key={comment._id} className="commentBox" marginTop={2} padding={2}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {new Date(comment.date_time).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textPrimary">
                        <Link to={`/users/${comment?.user?._id}`} style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}>
                          {comment?.user?.first_name} {comment?.user?.last_name}
                        </Link>
                        : {comment.comment}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Box marginTop={2}>
                <TextField
                  label="Add a comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  fullWidth
                  variant="outlined"
                  error={Boolean(commentError)}
                  helperText={commentError}
                />
                <Button variant="contained" color="primary" onClick={() => handleAddComment(photo._id)} sx={{ marginTop: 1 }}>
                  Submit Comment
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}

export default UserPhotos;
