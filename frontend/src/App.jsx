import "./App.css";
import PokemonView from "./components/PokemonView";
import MainView from "./components/MainView";
import Home from "./components/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PokemonInfo from "./components/PokemonInfo";
import PokemonDetail from "./components/PokemonDetail";
import Leaderboard from "./components/Leaderboard";
import axios from "axios";
import { CssBaseline } from "@mui/material";
import { pokemonsAtom } from "./atoms/pokemons";
import { useAtom, useAtomValue } from "jotai";
import { Suspense, useEffect } from "react";
import PokemonGame from './components/PokemonGame';
import { backendUrl } from "./pocketbase/pb";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainView />,
    children: [
      {
        index: true,
        path: "/",
        element: <Home />,
      },
      {
        path: "/pokemon",
        element: <Suspense fallback={<div>Loading...</div>}> <PokemonView /></Suspense>,
      },
      {
        path: "/pokemon/:id",
        element: <PokemonInfo />,
        loader: async ({ params }) => {
          const data = await axios.get(
            `${backendUrl}/pokemon/${params.id}`
          );
          return data.data;
        },
      },
      {
        path: "/pokemon/:id/:info",
        element: <PokemonDetail />,
      },
      {
        path: "/fight",
        element: <Suspense fallback={<div>Loading...</div>} ><PokemonGame /></Suspense>,
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />,
      },
    ],
  },
]);

function App() {
  // const [, setPokemons] = useAtom(pokemonsAtom);
  // const initialPokemons = useAtomValue(initialPokemonsAtom);

  // console.log("App rendered");

  // const value = useAtomValue(temporaryItem);

  // console.log("value: ", value);

  // useEffect(() => {
  //   setPokemons(initialPokemons.data);
  // }, [initialPokemons]);

  return (
    <div className="App">
      <CssBaseline />
      <RouterProvider router={router}> </RouterProvider>
    </div>
  );
}

export default App;
