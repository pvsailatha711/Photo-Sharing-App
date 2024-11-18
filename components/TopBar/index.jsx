import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import Switch from '@mui/material/Switch';

import "./styles.css";

function TopBar({contentTitle, advanceFeature, onToggle, user, logout}) {
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
