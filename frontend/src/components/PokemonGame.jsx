import React from 'react'
import { lobbyArray } from '../pocketbase/pb';
import { useAtomValue } from 'jotai';

export default function PokemonGame() {
  const lobby = useAtomValue(lobbyArray);
  console.log("New lobby in the PokemonGame: ", lobby)

  return (
    <div>
      This is game's lobby!
      <ul>
        {lobby.map(player => (
          <li key={player.id}>{player.name}: {player.status}, updated on {player.updated}. ID {player.id}</li>
        ))}
      </ul>
    </div>
  )
}
