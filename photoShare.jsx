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
import SuccessPopup from "./components/UserSuccessPopup";


function PhotoShare() {
  const [contentTitle, setContentTitle] = useState("Home");
  const [advanceFeature, setAdvanceFeature] = useState(window.models.advanceModel().advanceFeature);
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSuccessPopupOpen, setSuccessPopupOpen] = useState(false);
  const [photoUploadMessage, setPhotoUploadMessage] = useState(false);

  useEffect(() => {
    async function fetchUserDetails() {
      const pathSegments = location.pathname.split('/');
      if (location.pathname.startsWith("/users/")) {
        const userDetails = await fetchAxios(`user/${pathSegments[2]}`);
        setContentTitle(`${userDetails.data.first_name} ${userDetails.data.last_name} `);
      } else if (location.pathname.startsWith("/photos/")) {
        const userDetails = await fetchAxios(`user/${pathSegments[2]}`);
        setContentTitle(`Photos of "${userDetails.data.first_name} ${userDetails.data.last_name}" `);
      } else {
        setContentTitle("Home ");
      }
    }
    fetchUserDetails();
  }, [location.pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetchAxios("/auth/check-session");
        setUser(response.data.user);
      } catch (err) {
        console.error("Session check failed:", err);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

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

  const handlePhotoUpload = async (formData) => {
    try {
      const response = await axios.post('/photos/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Photo uploaded successfully:', response.data);
      setPhotoUploadMessage('Photo uploaded Successfully!');
      setSuccessPopupOpen(true);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setPhotoUploadMessage('Photo uploaded Failed!');
      setSuccessPopupOpen(true);
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
          <Paper className="main-grid-item" style={{overflow: 'scroll'}}>
            <Routes>
              <Route
                path="/"
                
              />
              <Route path="/users" element={<UserList advanceFeature={advanceFeature} />} />
              <Route path="/users/:userId" element={<UserDetail userId={useParams()} advanceFeature={advanceFeature} />} />
              <Route path="/photos/:userId/:photoIndex?" element={<UserPhotos userId={useParams()} advanceFeature={advanceFeature} user={user} />} />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
      <SuccessPopup
        open={isSuccessPopupOpen}
        onClose={() => setSuccessPopupOpen(false)}
        photoUploadMessage={photoUploadMessage}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
  <HashRouter>
    <PhotoShare />
  </HashRouter>
);
