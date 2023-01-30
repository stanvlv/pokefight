import { useState } from 'react'
import './App.css'
import PokemonView from './components/PokemonView';

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PokemonInfo from './components/PokemonInfo';
import PokemonDetail from './components/PokemonDetail';
import MainView from './components/MainView';
import axios from 'axios';

const router = createBrowserRouter([{
  path: "/",
  element: <MainView />,
  children: [{
    index: true,
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
  }]
}])

function App() {

  return (
    <div className="App">
      <RouterProvider router={router}> </RouterProvider>
    </div>
  )
}

export default App
