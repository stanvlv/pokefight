import React from 'react'
import { useLoaderData } from 'react-router-dom'
import PokemonDetail from './PokemonDetail';

export default function PokemonView() {
  const data = useLoaderData();
  // 

  return (
    <div>
      <ol>
        {data.map(pok => (<li key={pok.id}>
          <a href={`/pokemon/${pok.id}`}>{pok.name.english}</a>
        </li>))}
      </ol>
    </div>
  )
}
