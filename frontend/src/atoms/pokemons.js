import { atom } from "jotai";
import { atomFamily, splitAtom, loadable } from "jotai/utils";
import  deepEqual  from "fast-deep-equal";
import axios from "axios";

// This will contain an array of atoms, one for each pokemon
export const pokemonsAtom = atom(async (get) => {
  const response = await axios.get("http://localhost:3001/pokemon");
  // we create an atom for each pokemon in the array
  const value = response.data.map((pokemon) => {
    // this atom will actually hold the pokemon data
    const initialPokemonAtom = atom(pokemon);
    // But we return a derived atom that will fetch the sprite if it doesn't have one
    return atom((get) => {
      const pokemon = get(initialPokemonAtom);
      // if the pokemon doesn't have a sprite, fetch it
      if (!pokemon.sprites) {
        // create an atom that will fetch the sprite
        const spriteAtom = atom(async () => {
          console.log(`Fetching sprite for ${pokemon.name.english} (${pokemon.id})`);
          const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
          return response.data.sprites;
        });
        // to not block the UI, we use loadable to wrap the sprite atom
        const spriteLoadable = loadable(spriteAtom);
        pokemon.sprites = spriteLoadable;
      }
      return pokemon;
    })
  });
  // setValue(response.data);
  return value;
});

// This is a derived atom family that returns a paginated list of pokemons
export const paginatedAtom = atomFamily(({page, pageSize, paginateMe}) => {
  console.log("this should only run once per page", page, pageSize, paginateMe);
  return atom(async (get) => {
    const pokemons = await get(paginateMe);
    return pokemons.slice((page - 1) * pageSize, page * pageSize);
  });
}, deepEqual);

// This is a derived atom family that returns pokemons filtered by name
export const filteredPokemonsAtom = atomFamily((name) => {
  console.log("this should only run once per name", name);
  return atom(async (get) => {
    const pokemons = await get(pokemonsAtom);
    // filter pokemons by name
    return pokemons.filter((pokemon) => get(pokemon).name.english.toLowerCase().includes(name));
  });
});
