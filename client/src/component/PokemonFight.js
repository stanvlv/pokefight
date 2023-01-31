import React, { useState, useEffect } from "react";
import axios from "axios";
import pickachuSound from "./Pikaaaa.mp3";

function PokemonFight() {
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    axios
      .get("https://pokeapi.co/api/v2/pokemon?limit=807")
      .then((response) => {
        const pokemons = response.data.results;
        const randomIndex1 = Math.floor(Math.random() * pokemons.length);
        const randomIndex2 = Math.floor(Math.random() * pokemons.length);
        setPokemon1(pokemons[randomIndex1]);
        setPokemon2(pokemons[randomIndex2]);
      });
  }, []);

  const handleCompare = () => {
    const sound = new Audio(pickachuSound);
    sound.play();
    axios.get(pokemon1.url).then((response) => {
      const pokemon1Attack = response.data.stats.find(
        (stat) => stat.stat.name === "attack"
      ).base_stat;
      axios.get(pokemon2.url).then((response) => {
        const pokemon2Attack = response.data.stats.find(
          (stat) => stat.stat.name === "attack"
        ).base_stat;
        if (pokemon1Attack > pokemon2Attack) {
          setResult(pokemon1.name + " won!");
        } else if (pokemon2Attack > pokemon1Attack) {
          setResult(pokemon2.name + " won!");
        } else {
          setResult("Draw");
        }
      });
    });
  };

  const handleReset = () => {
    setPokemon1(null);
    setPokemon2(null);
    setResult("");
    axios
      .get("https://pokeapi.co/api/v2/pokemon?limit=807")
      .then((response) => {
        const pokemons = response.data.results;
        const randomIndex1 = Math.floor(Math.random() * pokemons.length);
        const randomIndex2 = Math.floor(Math.random() * pokemons.length);
        setPokemon1(pokemons[randomIndex1]);
        setPokemon2(pokemons[randomIndex2]);
      });
  };

  return (
    <div>
      {pokemon1 && pokemon2 ? (
        <>
          <p>{pokemon1.name}</p>
          <p>{pokemon2.name}</p>
          <button onClick={handleCompare}>Compare</button>
          <button onClick={handleReset}>Reset</button>
          <p>{result}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default PokemonFight;
