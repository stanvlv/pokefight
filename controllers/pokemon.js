const pokedex = require("../pokedex.json");
const Pokemon = require("../models/pokemon");


// database is moved from json file to MongoDB 
// it is being extracted from there

const getPokemons = async (req, res) => {
  try {
    const pokemons = await Pokemon.find({});
    res.json(pokemons);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getPokemon = async (req, res) => {
  const { id } = req.params;
  try {
    const pokemon = await Pokemon.findOne({ id: id });
    if (!pokemon) {
      return res.status(404).send("Pokemon not found");
    }
    res.json(pokemon);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getPokemonInfo = async (req, res) => {
  const { id, info } = req.params;
  try {
    const pokemon = await Pokemon.findOne({ id: id });
    if (!pokemon) {
      return res.status(404).send("Pokemon not found");
    }
    if (info === "name") {
      res.send(pokemon.name);
    } else if (info === "type") {
      res.send(pokemon.type);
    } else if (info === "base") {
      res.send(pokemon.base);
    } else {
      res.status(400).send("Something went wrong");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getPokemons,
  getPokemon,
  getPokemonInfo,
};
