import pokeballLogo from '../assets/pokeball.png'
import pokemonLogo from '../assets/pokemonfoto.png'
import { Link } from 'react-router-dom'

export default function Home() {
    
    return <>
    <div className='home-main-div'>
        <img src={`${pokemonLogo}`} className='pokemonLogo'/>
        <h1>Welcome to Pokefight</h1>
        <h2>Gotta catch &apos;em all</h2>
        <div className='tooltip'>
        <Link to='/fight'><img src={`${pokeballLogo}`} className='pokeballLogo' />
        <span className='tooltiptext'>I am ready for a challenge!</span>
        </Link>
        </div>
        </div>
    </>
}