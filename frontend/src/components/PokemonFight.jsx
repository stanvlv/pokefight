import React, { useRef, useEffect } from 'react'
import { syncGameStateAtomView, currentStateAtom, playCard, invertTicks, recentCombatLogAtom, resetGameState } from '../atoms/gamelogic'
import { pokemonsAtom } from '../atoms/pokemons';
import { useAtomValue } from 'jotai'
import poke from "../assets/pokeball.png";
import { Box, Button, Grid, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { CSSGrid } from './styled/commons';

function PokemonCard ({pokemonAtom, hp}) {
  const pokemon = useAtomValue(pokemonAtom);
  const sprites = useAtomValue(pokemon.sprites);
  return (
    <Box sx={{border: "1px solid black", borderRadius: 3, maxHeight: 150}}>
      <img src={sprites.state === "hasData" ? sprites.data.front_default : `${poke}`} alt={pokemon.name} height="100" />
      <p style={{textAlign: "center"}}>{hp} / {pokemon.base.HP}</p>
    </Box>
  );
}

function PokemonButton ({pokemonAtom, onClick}) {
  const pokemon = useAtomValue(pokemonAtom);
  const sprites = useAtomValue(pokemon.sprites);
  return <button onClick={onClick}>
    <Box sx={{border: "1px solid black", borderRadius: 3, maxHeight: 150}}>
      <img src={sprites.state === "hasData" ? sprites.data.front_default : `${poke}`} alt={pokemon.name} height="100" />
    </Box>
  </button>
}

export default function PokemonFight() {
  const pokemons = useAtomValue(pokemonsAtom);
  const currentState = useAtomValue(currentStateAtom);
  const gameState = useAtomValue(syncGameStateAtomView);
  const recentCombatLog = useAtomValue(recentCombatLogAtom);
  const bottomDiv = useRef(null);

  const opponentLife = currentState === "host" ? gameState.clientLife : gameState.hostLife;
  const opponentBoard = currentState === "host" ? gameState.clientBoard : gameState.hostBoard;
  const opponentBoardHealth = currentState === "host" ? gameState.clientBoardHealth : gameState.hostBoardHealth;

  const playerLife = currentState === "host" ? gameState.hostLife : gameState.clientLife;
  const playerBoard = currentState === "host" ? gameState.hostBoard : gameState.clientBoard;
  const playerBoardHealth = currentState === "host" ? gameState.hostBoardHealth : gameState.clientBoardHealth;
  const playerHand = currentState === "host" ? gameState.hostHand : gameState.clientHand;

  const winState = gameState.winState;

  const resultMessage = winState === "none" ? null : winState === "draw" ? "Draw!" : winState === currentState ? "You win!" : "You lose!";

  useEffect(() => {
    bottomDiv.current?.scrollIntoView({ behavior: "smooth" });
  }, [recentCombatLog]);

  return (
    <>
    <div>PokemonFight</div>
    <CSSGrid colTemplate="1fr fit-content(30%)">
      <Paper elevation={2}>
        {
          resultMessage ? (
            <>
              <Typography variant='h3'>{resultMessage}</Typography>
              <Button onClick={resetGameState}>yes</Button>
            </>
          ) : (
            <>    
              <Typography variant='h4'>Countdown: {gameState.countdown}, winstate: {winState}</Typography>
              <Typography variant='h5'>Opponent Life: {opponentLife}</Typography>
              <Box sx={{display: 'flex', gap: 1, margin: 2, minHeight: 180}}>
                {opponentBoard.map((pokemonId, index) => <PokemonCard pokemonAtom={pokemons[pokemonId-1]} hp={opponentBoardHealth[index]} key={pokemonId} />)}
              </Box>
              <Box sx={{display: 'flex', gap: 1, margin: 2, minHeight: 180}}>
                {playerBoard.map((pokemonId, index) => <PokemonCard pokemonAtom={pokemons[pokemonId-1]} hp={playerBoardHealth[index]} key={pokemonId} />)}
              </Box>
              <Box sx={{display: 'flex', gap: 1, margin: 2, minHeight: 180}}>
                {gameState.gamePhase === "playCards" ? playerHand.map((pokemonId) => <PokemonButton pokemonAtom={pokemons[pokemonId-1]} onClick={() => playCard(pokemonId)} key={pokemonId}/>
                ) : <Typography variant='h4'>FIGHT! (there supposed to be animations)</Typography>}
              </Box>
              <Typography variant='h5'>Player Life: {playerLife}</Typography>
            </>
          )
        }
      </Paper>
      <Paper elevation={2}>
        <Typography variant='h3'>Recent combat log:</Typography>
        <List sx={{ overflowY: "auto" }}>
          {recentCombatLog.map((msg, index) => {
            return (
              <ListItem key={index}>
                <ListItemText
                  primary={msg}
                />
              </ListItem>
            );
          })}
          <div ref={bottomDiv}></div>
          </List>
      </Paper>
    </CSSGrid>
    <button onClick={invertTicks}>toggle ticks</button>

    {/* <pre>{JSON.stringify({...gameState, cardDeck: gameState.cardDeck.length}, ["cardDeck", "clientBoard", "clientBoardHealth", "clientHand", "clientLife", "countdown", "gamePhase", "hostBoard", "hostBoardHealth", "hostHand", "hostLife"], 3)}</pre> */}
    </>
  )
}
