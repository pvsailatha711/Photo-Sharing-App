import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import Switch from '@mui/material/Switch';

import "./styles.css";

function TopBar({contentTitle, advanceFeature, onToggle}) {
  const handleHomeClick = () => {
    window.location.href = "/photo-share.html";
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography className="buttonClick" variant="h5" color="inherit" sx={{ flexGrow: 1 }} onClick={handleHomeClick}>
          Adarsh Gella
        </Typography>

        <Typography className="buttonClick" variant="h5" color="inherit" onClick={handleHomeClick}>
          {contentTitle}
        </Typography>
        <div className="toggleSwitch">
          <Switch
            checked={advanceFeature}
            onChange={onToggle}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          Advanced Features
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
