import React, { useEffect, useState } from "react";
import { Typography, Button, Box } from "@mui/material";
import { Link, useParams } from "react-router-dom";
// import fetchModel from "../../lib/fetchModelData";
import fetchAxios from "../../lib/fetchAxiosData";

import "./styles.css";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const fetchedUser = window.models.userModel(userId);
  //   setUser(fetchedUser);
  // }, [userId]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetchAxios(`/user/${userId}`);
        setUser(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUsers();
  }, [userId]);

  if (!user) {
    return <Typography>Loading user details...</Typography>;
  }

  return (
    <Box className="userDetail-container">
      <Typography variant="h3" className="userDetail-header">
        {user.first_name} {user.last_name}
      </Typography>
      <Typography variant="subtitle1" className="userDetail-subtitle">
        {user.occupation} - {user.location}
      </Typography>
      <Typography
        variant="h5"
        className="userDetail-description"
        dangerouslySetInnerHTML={{ __html: user.description }}
      />

      <Button
        variant="outlined"
        className="userDetail-button"
        component={Link}
        to={`/photos/${userId}`}
      >
        View Photos
      </Button>
    </Box>
  );
}

export default UserDetail;

