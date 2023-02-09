import React from 'react'
import { currentStateAtom } from '../atoms/gamelogic'
import { pokemonsAtom } from '../atoms/pokemons';
import { useAtomValue } from 'jotai'
import PokemonLobby from './PokemonLobby';
import PokemonFight from './PokemonFight';

export default function PokemonGame() {
	const currentState = useAtomValue(currentStateAtom);
	const pokemons = useAtomValue(pokemonsAtom);
  return currentState === "idle" ? <PokemonLobby /> : <PokemonFight />;
}
