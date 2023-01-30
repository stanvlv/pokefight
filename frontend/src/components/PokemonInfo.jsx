import React from 'react'
import { useLoaderData } from 'react-router-dom'

export default function PokemonInfo() {
  const data = useLoaderData();

  console.log(data);
  return (
    <div>
      <p>Name: {data.name.english}</p>
      <p>Types: {data.type.join(", ")}</p>
      <p>Base stats:</p>
      <ul>
        <li>HP: {data.base.HP}</li>
        <li>Attack: {data.base.Attack}</li>
        <li>Defence: {data.base.Defense}</li>
        <li>Speed: {data.base.Speed}</li>
        <li>Special attack: {data.base["Sp. Attack"]}</li>
        <li>Special defence: {data.base["Sp. Defense"]}</li>
      </ul>
      <a href="/">back</a>
    </div>
  )
}
