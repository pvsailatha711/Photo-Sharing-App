import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams, useLocation } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
// import fetchModel from "./lib/fetchModelData";
import fetchAxios from "./lib/fetchAxiosData";

function UserDetailRoute() {
  const { userId } = useParams();
  // Commenting this to check isssues in console
  // console.log("UserDetailRoute: userId is:", userId);
  return <UserDetail userId={userId} />;
}

// function UserPhotosRoute() {
//   const { userId } = useParams();
//   return <UserPhotos userId={userId} />;
// }

function PhotoShare() {
  const [contentTitle, setContentTitle] = useState("Home");
  const [advanceFeature, setAdvanceFeature] = useState(window.models.advanceModel().advanceFeature);
  const location = useLocation();

  useEffect(() => {
    async function fetchUserDetails() {
      let id_from_route = location.pathname.split('/');
      if (location.pathname.startsWith("/users/")) {
        // let userDetails = await window.models.userModel(id_from_route[2]);
        const userDetails = await fetchAxios(`user/${id_from_route[2]}`);
        const userName = `${userDetails.data.first_name + ' ' + userDetails.data.last_name} |`;
        setContentTitle(userName);
      } else if (location.pathname.startsWith("/photos/")) {
        // let userDetails = await window.models.userModel(id_from_route[2]);
        const userDetails = await fetchAxios(`user/${id_from_route[2]}`);
        const userName = `${userDetails.data.first_name + ' ' + userDetails.data.last_name}`;
        setContentTitle(`Photos of "${userName}" |`);
      } else {
        setContentTitle("Home |");
      }
    }
    fetchUserDetails();
  }, [location.pathname]);

  const toggleAdvanceFeature = () => {
    setAdvanceFeature(!advanceFeature);
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} style={{
            position: 'sticky',
            top: '0px'
          }}>
          <TopBar contentTitle={contentTitle} advanceFeature={advanceFeature} onToggle={toggleAdvanceFeature} />
        </Grid>
        <div className="main-topbar-buffer" />
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            <UserList advanceFeature={advanceFeature} />
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Routes>
              <Route
                path="/"
                element={(
                  <div style={{
                    backgroundImage: 'url("https://t3.ftcdn.net/jpg/06/84/59/22/360_F_684592278_xAceXmIN3m7d3AKj52NDAOuXaeRvEJVC.jpg")',
                    backgroundSize: 'cover',
                    minHeight: '87vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      padding: '30px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      maxWidth: '600px'
                    }}>
                      <Typography variant="h4" style={{ color: '#333', fontWeight: 'bold' }}>
                        Photographs open doors into the past, but they also allow a look into the future.
                      </Typography>
                      <Typography variant="h5" style={{ color: '#777', fontStyle: 'italic', marginTop: '10px' }}>
                        - Sally Mann
                      </Typography>
                    </div>
                  </div>
                )}
              />
              <Route path="/users" element={<UserList advanceFeature={advanceFeature} />} />
              <Route path="/users/:userId" element={<UserDetailRoute />} />
              <Route path="/photos/:userId/:photoIndex?" element={<UserPhotos userId={useParams()} advanceFeature={advanceFeature} />} />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
  <HashRouter>
    <PhotoShare />
  </HashRouter>
);
