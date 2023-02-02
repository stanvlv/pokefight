import pokeballLogo from '../assets/pokeball.png'
import pokemonLogo from '../assets/pokemonfoto.png'

export default function Home() {
    
    return <>
    <div className='home-main-div'>
        <img src={`${pokemonLogo}`} className='pokemonLogo'/>
        <h1>Welcome to Pokefight</h1>
        <h2>Gotta catch &apos;em all</h2>
        <img src={`${pokeballLogo}`} className='pokeballLogo' />
        </div>
    </>
}