import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

function AppBarDown() {
  return (
    <Box
      sx={{ flexGrow: 1 }}
      style={{ position: "fixed", bottom: "0" , width: "100%"}}
    >
      <AppBar position="static">
        <Toolbar variant="">  
          <Typography variant="h8" color="inherit" component="div">PSAJ Corp.(no rights reserved.)</Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default AppBarDown;
