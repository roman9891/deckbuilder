import { Card } from './Card.js'

export class Deck {
    public list: Card[]

    constructor() {
        this.list = []
    }
    addCard(cardname) {
        if (this.list.find((card) => card.name === cardname)) return
        this.list.push(new Card(cardname))
    }
    setCommander = () => {}
    removeCard = () => {}
    import = () => {}
    export = () => {}
}
