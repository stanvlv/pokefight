import React, { useState, useRef } from "react";
import { useAtomValue, useAtom } from "jotai";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  ListItemButton,
  Box,
} from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Stack } from "@mui/system";
import { useCallback } from "react";
import {
  lobbyArray,
  addMyself,
  myself,
  savedUserName,
} from "../pocketbase/lobby";
import { chatArrayAtom, writeToChat } from "../pocketbase/chat";
import { CSSGrid } from "./styled/commons";
import { useMemo } from "react";
import axios from "axios";

import {
  invitationsAtom,
  createInvitation,
  acceptInvitation,
} from "../atoms/gamelogic";
import { backendUrl } from "../pocketbase/pb";

export default function PokemonLobby() {
  const lobby = useAtomValue(lobbyArray);
  const chatArray = useAtomValue(chatArrayAtom);
  const invitations = useAtomValue(invitationsAtom);
  const [savedName, setSavedName] = useAtom(savedUserName);
  const myselfValue = useAtomValue(myself);
  const [userDialogOpened, setUserDialogOpened] = useState(savedName === null);
  const [userName, setUserName] = useState(savedName ?? "");
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const navigate = useNavigate();
  const bottomDiv = useRef(null);

  // condsole.log(`This is savedName const : ${savedName}`) // gives Stan
  // consodle.log(`this MYSELF VALUE : ${myselfValue}`) // object
  // consdole.log(` userName const : ${userName}`) // Stan

  // we need to reverse chatArray, because we want to show the latest message at the bottom
  const reversedChatArray = useMemo(() => {
    return chatArray.slice().reverse();
  }, [chatArray]);

  const getChatUsername = useCallback((chatMsg) => {
    if (chatMsg.expand?.sender) {
      return chatMsg.expand.sender.name;
    }
    const user = lobby.find((user) => user.id === chatMsg.sender);
    if (user) {
      return user.name;
    } else {
      return chatMsg.sender;
    }
  });

  const handleRegisterUser = async () => {
    // the register function now will try to post into users the new user
    // if the user exists in MongoDB it will throw an error and alert
    // if it is all good it will proceed and register you in the game
    try {
      const response = await axios
        .post(`${backendUrl}/users`, { nickname: userName })
        .then((res) => console.log(res.data));
      setSavedName(userName);
      setUserDialogOpened(false);
      addMyself(userName, "available");
    } catch (error) {
      console.error(error);
      if (error.response.status === 409) {
        alert("User already exists. Please choose a different name.");
      } else {
        alert("Something went wrong. Please try again later");
      }
    }
  };

  const handleChatMessageSubmit = (e) => {
    e.preventDefault();
    writeToChat(chatMessage);
    setChatMessage("");
  };

  const handleGameInvite = (inv) => {
    acceptInvitation(inv.id);
  };

  useEffect(() => {
    // if we have savedName, and myself is null, register with the saved name
    if (savedName && myselfValue === null) {
      console.log("readding myself");
      addMyself(savedName, "available");
    }
  }, []);

  useEffect(() => {
    const interv = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 300);
    return () => {
      clearInterval(interv);
    };
  }, []);

  useEffect(() => {
    bottomDiv.current?.scrollIntoView({ behavior: "smooth" });
  }, [reversedChatArray]);

  return (
    <>
      <CSSGrid sx={{ gap: 2, maxHeight: "90vh" }}>
        <Paper elevation={4} sx={{ minWidth: "20em" }}>
          <List>
            {lobby
              .filter((player) => Date.now() - player.updated < 10000)
              .map((player) => {
                const timeDiff = (currentTimestamp - player.updated) / 1000;
                return (
                  <ListItemButton key={player.id}>
                    <ListItemText
                      primary={`${player.name}`}
                      sx={{ flexGrow: 0, pr: 1 }}
                    />
                    <Chip
                      label={`${timeDiff}s`}
                      color={timeDiff < 7 ? "success" : "error"}
                      size="small"
                    ></Chip>
                    <Chip
                      label={`ping ${player.ping}ms`}
                      color={player.ping < 1000 ? "success" : "error"}
                      size="small"
                    ></Chip>
                  </ListItemButton>
                );
              })}
          </List>
          <List>
            {invitations.map((inv) => {
              const user = lobby.find((user) => user.id === inv.host);
              return (
                <ListItemButton
                  key={inv.id}
                  onClick={() => handleGameInvite(inv)}
                >
                  <ListItemText primary={`Invite from ${user.name}`} />
                </ListItemButton>
              );
            })}
          </List>
          <Box component="form" onSubmit={(e) => e.preventDefault()}>
            <Button onClick={createInvitation}>Create game invitation</Button>
          </Box>
        </Paper>
        <Paper elevation={4}>
          <Stack direction="column" sx={{ maxHeight: "100%", p: 1 }} gap={2}>
            <List sx={{ overflowY: "auto" }}>
              {reversedChatArray.map((msg) => {
                return (
                  <ListItem key={msg.id}>
                    <ListItemText
                      primary={`${getChatUsername(msg)}: ${msg.message}`}
                    />
                  </ListItem>
                );
              })}
              <div ref={bottomDiv}></div>
            </List>
            <Box component="form" onSubmit={handleChatMessageSubmit}>
              <TextField
                autoFocus
                fullWidth
                placeholder="message"
                variant="outlined"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
            </Box>
          </Stack>
        </Paper>
      </CSSGrid>
      <Dialog open={userDialogOpened}>
        <DialogTitle>Enter your name</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your name to register in the game lobby:
          </DialogContentText>
          <TextField
            autoFocus
            label="Name"
            fullWidth
            variant="standard"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={handleRegisterUser}>Register</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
