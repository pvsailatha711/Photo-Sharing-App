import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Switch from '@mui/material/Switch';

import "./styles.css";

function TopBar({contentTitle, advanceFeature, onToggle, user, logout, onPhotoUpload}) {

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onPhotoUpload(file);
    }
  };
  
  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography className="buttonClick" variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
          {user?._id ? `Hi ${user.first_name}` : 'Please Login'}
        </Typography>

        <Typography className="buttonClick" variant="h5" color="inherit">
          {contentTitle}
        </Typography>
        {
          user?._id ? 
          (
            <>
              <Button variant="contained" component="label" style={{marginLeft: '10px'}}>
                Add Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              <button className="logout-button" onClick={() => {logout();}}>
                Log Out
              </button>
              <div className="toggleSwitch">
                <Switch
                  checked={advanceFeature}
                  onChange={onToggle}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                Advanced Features
              </div>
            </>
          )
          : ''
        }
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
