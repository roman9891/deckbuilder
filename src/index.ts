import { Deck } from './classes/Deck.js'
import { createDeckbuilderAutocomplete } from './components/autocomplete.js'

const deck = new Deck()

createDeckbuilderAutocomplete(deck)
