import { useState } from 'react'
import './App.css'
import PokemonView from './components/PokemonView';
import MainView from './components/MainView';
import Home from './components/Home';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PokemonInfo from './components/PokemonInfo';
import PokemonDetail from './components/PokemonDetail';
import PokemonLobby from './components/PokemonLobby';
import axios from 'axios';
import { CssBaseline } from '@mui/material';

const router = createBrowserRouter([{
  path: "/",
  element: <MainView />,
  children: [{
    index: true,
    path: "/",
    element: <Home />
  },
    {
    path: "/pokemon",
    element: <PokemonView />,
    loader: async () => {
      const data = await axios.get("http://localhost:3001/pokemon");
      return data.data;
    },
  }, {
    path: "/pokemon/:id",
    element: <PokemonInfo />,
    loader: async ({params}) => {
      const data = await axios.get(`http://localhost:3001/pokemon/${params.id}`);
      return data.data;
    }
  }, {
    path: "/pokemon/:id/:info",
    element: <PokemonDetail />
  }, {
    path: "/fight",
    element: <PokemonLobby />
  }]
}])

function App() {

  return (
    <div className="App">
      <CssBaseline />
      <RouterProvider router={router}> </RouterProvider>
    </div>
  )
}

export default App
