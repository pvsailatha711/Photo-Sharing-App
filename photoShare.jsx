import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams, useLocation } from "react-router-dom";
import axios from 'axios';

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import fetchAxios from "./lib/fetchAxiosData";
import LoginRegister from './components/LoginRegister';

function UserDetailRoute() {
  const { userId } = useParams();
  return <UserDetail userId={userId} />;
}


function PhotoShare() {
  const [contentTitle, setContentTitle] = useState("Home");
  const [advanceFeature, setAdvanceFeature] = useState(window.models.advanceModel().advanceFeature);
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUserDetails() {
      const pathSegments = location.pathname.split('/');
      if (location.pathname.startsWith("/users/")) {
        const userDetails = await fetchAxios(`user/${pathSegments[2]}`);
        setContentTitle(`${userDetails.data.first_name} ${userDetails.data.last_name} |`);
      } else if (location.pathname.startsWith("/photos/")) {
        const userDetails = await fetchAxios(`user/${pathSegments[2]}`);
        setContentTitle(`Photos of "${userDetails.data.first_name} ${userDetails.data.last_name}" |`);
      } else {
        setContentTitle("Home |");
      }
    }
    fetchUserDetails();
  }, [location.pathname]);

  const toggleAdvanceFeature = () => {
    setAdvanceFeature(!advanceFeature);
  };

  const handleLogin = async (login_name, password) => {
    try {
      const response = await axios.post('/admin/login', { login_name, password });
      setUser(response.data);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/admin/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (!user) {
    return (
      <div>
        <div>
          <TopBar user={user} logout={handleLogout} />
        </div>
        <LoginRegister onLogin={handleLogin} />
      </div>
    );
  }

  const handlePhotoUpload = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const response = await axios.post('/photos/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Photo uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} style={{ position: 'sticky', top: '0px' }}>
          <TopBar contentTitle={contentTitle} advanceFeature={advanceFeature} onToggle={toggleAdvanceFeature} user={user} logout={handleLogout} onPhotoUpload={handlePhotoUpload} />
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
              <Route path="/photos/:userId/:photoIndex?" element={<UserPhotos userId={useParams()} advanceFeature={advanceFeature} user={user} />} />
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
