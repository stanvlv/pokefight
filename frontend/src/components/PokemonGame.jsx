import React, { useState } from 'react'
import { lobbyArray, addMyself } from '../pocketbase/pb';
import { useAtomValue } from 'jotai';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField, Typography, Button } from '@mui/material';

export default function PokemonGame() {
  const lobby = useAtomValue(lobbyArray);
  const [userDialogOpened, setUserDialogOpened] = useState(true);
  const [userName, setUserName] = useState("");

  const handleRegisterUser = () => {
    setUserDialogOpened(false);
    addMyself(userName, 'available');
  }

  return (
    <>
      <Grid container gap={2}>
        <Grid item xs={12} >
          <Typography variant='body1'>
            This is game's lobby!
          </Typography>
        </Grid>
        <Grid item xs={6} >
          <ul>
            {lobby
              .filter(player => Date.now() - player.updated < 10000)
              .map(player => (
              <li key={player.id}>{player.name}: {player.status}, updated {(Date.now() - player.updated) / 1000}s ago. ID {player.id}</li>
            ))}
          </ul>
        </Grid>
        <Grid item xs={6}>

        </Grid>
      </Grid>
      <Dialog open={userDialogOpened}>
        <DialogTitle>Enter your name</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your name to register in the game lobby:
          </DialogContentText>
          <TextField autoFocus label='Name' fullWidth variant='standard' value={userName} onChange={(e) => setUserName(e.target.value)}/>
        </DialogContent>
        <DialogActions>
          <Button>Back</Button>
          <Button onClick={handleRegisterUser}>Register</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
