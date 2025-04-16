import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { SportsEsportsOutlined as GameIcon } from '@mui/icons-material';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <GameIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Boardgame Tracker
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/games">
            Games
          </Button>
          <Button color="inherit" component={Link} to="/players">
            Players
          </Button>
          <Button color="inherit" component={Link} to="/game-plays">
            Play Log
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;