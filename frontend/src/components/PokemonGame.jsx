import React, { useState } from 'react'
import { lobbyArray, addMyself, savedUserName, myself } from '../pocketbase/pb';
import { useAtomValue, useAtom } from 'jotai';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField, Typography, Button } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PokemonGame() {
  const lobby = useAtomValue(lobbyArray);
  const [savedName, setSavedName] = useAtom(savedUserName);
  const myselfValue = useAtomValue(myself);
  const [userDialogOpened, setUserDialogOpened] = useState(savedName === null);
  const [userName, setUserName] = useState(savedName ?? "");
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const navigate = useNavigate();

  const handleRegisterUser = () => {
    setSavedName(userName);
    setUserDialogOpened(false);
    addMyself(userName, 'available');
  }

  useEffect(() => {
    // if we have savedName, and myself is null, register with the saved name
    if (savedName && myselfValue === null) {
      console.log("readding myself");
      addMyself(savedName, 'available');
    }
  }, [])

  useEffect(() => {
    const interv = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 300);
    return () => {
      clearInterval(interv);
    };
  }, []);

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
              <li key={player.id}>{player.name}: {player.status}, updated {(currentTimestamp - player.updated) / 1000}s ago. ID {player.id}</li>
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
          <Button onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={handleRegisterUser}>Register</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
