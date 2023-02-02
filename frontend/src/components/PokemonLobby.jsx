import React, { useState } from 'react'
import { useAtomValue, useAtom } from 'jotai';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField, Typography, Button, Paper, List, ListItem, ListItemText, Chip, ListItemButton, Box } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack } from '@mui/system';
import { useCallback } from 'react';
import { lobbyArray, addMyself, myself, savedUserName } from '../pocketbase/lobby';
import { chatArrayAtom, writeToChat } from '../pocketbase/chat';
import { CSSGrid } from './styled/commons';

export default function () {
  const lobby = useAtomValue(lobbyArray);
  const chatArray = useAtomValue(chatArrayAtom);
  const [savedName, setSavedName] = useAtom(savedUserName);
  const myselfValue = useAtomValue(myself);
  const [userDialogOpened, setUserDialogOpened] = useState(savedName === null);
  const [userName, setUserName] = useState(savedName ?? "");
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const navigate = useNavigate();

  const getChatUsername = useCallback((chatMsg) => {
    if (chatMsg.expand?.sender) {
      return chatMsg.expand.sender.name;
    }
    const user = lobby.find(user => user.id === chatMsg.sender);
    if (user) {
      return user.name;
    } else {
      return chatMsg.sender;
    }
  })

  const handleRegisterUser = () => {
    setSavedName(userName);
    setUserDialogOpened(false);
    addMyself(userName, 'available');
  }

  const handleChatMessageSubmit = (e) => {
    e.preventDefault();
    writeToChat(chatMessage);
    setChatMessage("");
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
      <Typography variant='body1'>
        This is game's lobby!
      </Typography>
      <CSSGrid sx={{gap: 2, gridTemplateRows: "900px"}}>
        <Paper elevation={4} sx={{minWidth: "20em"}}>
          <List>
            {lobby
              .filter(player => Date.now() - player.updated < 10000)
              .map(player => {
                const timeDiff = (currentTimestamp - player.updated) / 1000;
                return (
                <ListItemButton key={player.id}>
                  <ListItemText primary={`${player.name}`} sx={{flexGrow: 0, pr: 1}}/>
                  <Chip label={`${timeDiff}s`} color={timeDiff < 7 ? 'success' : 'error'} size="small"></Chip>
                  <Chip label={`ping ${player.ping}ms`} color={player.ping < 1000 ? 'success' : 'error'} size="small"></Chip>
                </ListItemButton>
                )
            })}
          </List>
        </Paper>
        <Paper elevation={4} sx={{}}>
          <Stack direction="column" sx={{maxHeight: "100%", p: 1}} gap={2}>
            <Box component="form" onSubmit={handleChatMessageSubmit}>
              <TextField autoFocus fullWidth label='message' variant='standard' value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
            </Box>
            <List sx={{overflowY: "scroll"}}>
              {
                chatArray.map(msg => {
                  return (
                    <ListItem key={msg.id}>
                      <ListItemText primary={`${getChatUsername(msg)}: ${msg.message}`} />
                    </ListItem>
                  )
                })
              }
            </List>
          </Stack>
        </Paper>
      </CSSGrid>
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
