import { atom } from "jotai";
import { atomFamily, splitAtom, loadable } from "jotai/utils";
import  deepEqual  from "fast-deep-equal";
import axios from "axios";

// This will contain an array of atoms, one for each pokemon
export const pokemonsAtom = atom([]);
// This is a flag to indicate whether the pokemons have been fetched or not
// Since we only ever use defaultStore, this flag can be global
let pokemonsArrived = false;

pokemonsAtom.onMount = (setValue) => {
  let active = true;
  console.log("Fetching pokemons")
  if (!pokemonsArrived) axios.get("http://localhost:3001/pokemon").then((response) => {
    if (active) {
      // we create an atom for each pokemon in the array
      setValue(response.data.map((pokemon) => {
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
      }));
      // setValue(response.data);
      pokemonsArrived = true;
    }
  });
  return () => {
    console.log("Unmounting pokemons");
    active = false;
  };
}

export const pokemonsAtomsAtom = splitAtom(pokemonsAtom);

// This is a derived atom family that returns a paginated list of pokemons
export const paginatedAtom = atomFamily(({page, pageSize, paginateMe}) => {
  return atom((get) => {
    const pokemons = get(paginateMe);
    return pokemons.slice((page - 1) * pageSize, page * pageSize);
  });
}, deepEqual);

// This is a derived atom family that returns pokemons filtered by name
export const filteredPokemonsAtom = atomFamily((name) => {
  return atom((get) => {
    const pokemons = get(pokemonsAtom);
    // filter pokemons by name
    return pokemons.filter((pokemon) => get(pokemon).name.english.toLowerCase().includes(name));
  });
});
