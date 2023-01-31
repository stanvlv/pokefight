const express = require("express")
const pokedex = require('./pokedex.json')

const app = express()

const PORT = 3002
app.use(express.json())

app.get('/', (req, res) => {
    res.send('PokeFight')
})

app.get('/pokemon', (req, res) => {
    res.send(pokedex)
})

app.get('/pokemon/:id', (req, res) => {
    const { id } = req.params
    const pokemon = pokedex.find(poke => poke.id === parseInt(id))
    res.send(pokemon)
})

app.listen(PORT, (req, res) => {
    console.log(`Server is running on: http://localhost:${PORT}`)
})
