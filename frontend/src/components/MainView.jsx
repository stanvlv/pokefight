import React from 'react'
import { Outlet } from 'react-router-dom'
import pokeballLogo from '../assets/pokeball.png'
import pokemonLogo from '../assets/pokemonfoto.png'

export default function MainView() {
  return (
    <div>
      <div className='home-main-div'>
        <img src={`${pokemonLogo}`} className='pokemonLogo'/>
        <h1>Welcome to Pokefight</h1>
        <h2>Gotta catch 'em all</h2>
        <img src={`${pokeballLogo}`} className='pokeballLogo' />
        </div>
        <Outlet />
    </div>
  )
}
