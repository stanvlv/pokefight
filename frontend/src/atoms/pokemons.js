import { atom } from "jotai";
import { atomFamily, splitAtom } from "jotai/utils";
import  deepEqual  from "fast-deep-equal";
import axios from "axios";

export const initialPokemonsAtom = atom(async () => axios.get("http://localhost:3001/pokemon"));

export const pokemonsAtom = atom([]);

export const pokemonsAtomsAtom = splitAtom(pokemonsAtom);

// This is a derived atom family that returns a paginated list of pokemons
export const paginatedAtom = atomFamily(({page, pageSize, paginateMe}) => {
  return atom((get) => {
    const pokemons = get(paginateMe);
    return pokemons.slice((page - 1) * pageSize, page * pageSize);
  }, (get, set, newPokemons) => {
    const pokemons = get(paginateMe);
    set(paginateMe, [
      ...pokemons.slice(0, (page - 1) * pageSize),
      ...newPokemons,
      ...pokemons.slice(page * pageSize),
    ]);
  });
}, deepEqual);

// This is a derived atom family that returns pokemons filtered by name
// all hail the mighty github copilot
export const filteredPokemonsAtom = atomFamily((name) => {
  return atom((get) => {
    const pokemons = get(pokemonsAtom);
    // filter pokemons by name
    return pokemons.filter((pokemon) => pokemon.name.english.toLowerCase().includes(name));
  }, (get, set, newPokemons) => {
    const pokemons = get(pokemonsAtom);
    // assumption: newPokemons is a subset of pokemons with new data
    set(pokemonsAtom, pokemons.map((pokemon) => {
      // if the pokemon is in newPokemons, return the new data
      const newPokemon = newPokemons.find((newPokemon) => newPokemon.id === pokemon.id);
      // otherwise, return the old data
      return newPokemon || pokemon;
    }));
  });
});
