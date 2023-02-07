import React from 'react'
import { syncGameStateAtomView, currentStateAtom, playCard, invertTicks } from '../atoms/gamelogic'
import { pokemonsAtom } from '../atoms/pokemons';
import { useAtomValue } from 'jotai'
import poke from "../assets/pokeball.png";

function PokemonCard ({pokemonAtom, hp}) {
  const pokemon = useAtomValue(pokemonAtom);
  const sprites = useAtomValue(pokemon.sprites);
  return (
    <div>
      <img src={sprites.state === "hasData" ? sprites.data.front_default : `${poke}`} alt={pokemon.name} />
      <p>{hp}</p>
    </div>
  );
}

export default function PokemonFight() {
  const pokemons = useAtomValue(pokemonsAtom);
  const currentState = useAtomValue(currentStateAtom);
  const gameState = useAtomValue(syncGameStateAtomView);

  const opponentLife = currentState === "host" ? gameState.clientLife : gameState.hostLife;
  const opponentBoard = currentState === "host" ? gameState.clientBoard : gameState.hostBoard;
  const opponentBoardHealth = currentState === "host" ? gameState.clientBoardHealth : gameState.hostBoardHealth;

  const playerLife = currentState === "host" ? gameState.hostLife : gameState.clientLife;
  const playerBoard = currentState === "host" ? gameState.hostBoard : gameState.clientBoard;
  const playerBoardHealth = currentState === "host" ? gameState.hostBoardHealth : gameState.clientBoardHealth;
  const playerHand = currentState === "host" ? gameState.hostHand : gameState.clientHand;

  return (
    <>
    <div>PokemonFight</div>
    <div style={{margin: 16}}>
      <p>Countdown: {gameState.countdown} Game board: </p>
      <p>Opponent Life: {opponentLife}</p>
      <div style={{display: 'flex', gap: 8, margin: 16}}>
        {opponentBoard.map((pokemonId, index) => <PokemonCard pokemonAtom={pokemons[pokemonId-1]} hp={opponentBoardHealth[index]} key={pokemonId} />)}
      </div>
      <div style={{display: 'flex', gap: 8, margin: 16}}>
        {playerBoard.map((pokemonId, index) => <PokemonCard pokemonAtom={pokemons[pokemonId-1]} hp={playerBoardHealth[index]} key={pokemonId} />)}
      </div>
    </div>
    <div style={{margin: 16}}>
      <div style={{display: 'flex', gap: 8, margin: 16}}>
        {playerHand.map((pokemonId) => <button key={pokemonId} onClick={() => playCard(pokemonId)}>
            <PokemonCard pokemonAtom={pokemons[pokemonId-1]} hp={null} />
          </button>
        )}
      </div>
      <p>Player&apos;s Life: {playerLife}</p>
    </div>
    <button onClick={invertTicks}>toggle ticks</button>

    {/* <pre>{JSON.stringify({...gameState, cardDeck: gameState.cardDeck.length}, ["cardDeck", "clientBoard", "clientBoardHealth", "clientHand", "clientLife", "countdown", "gamePhase", "hostBoard", "hostBoardHealth", "hostHand", "hostLife"], 3)}</pre> */}
    </>
  )
}
