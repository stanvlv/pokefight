import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

function AppBarDown() {
  return (
    <Box
      sx={{ flexGrow: 1 }}
      style={{ position: "fixed", bottom: "0", width: "100%" }}
    >
      <AppBar position="static">
        <Toolbar variant="dense">
        PSAJ Corp.(no rights reserved.)  
          <Typography variant="h6" color="inherit" component="div"></Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default AppBarDown;
