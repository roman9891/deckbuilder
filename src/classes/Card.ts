import { Deck } from './Deck'

export class Card {
    public name: string
    public tags: string[]
    public imageLink: string

    constructor(cardData, public deck: Deck) {
        this.name = cardData.name
        this.imageLink = cardData.image_uris.normal
        this.tags = []
        const unparsedTypes: string = cardData.type_line
        const parsedTypes = unparsedTypes
            .split(' ')
            .filter((ele) => ele !== '—')

        parsedTypes.forEach((type) => this.tags.push(type))
    }

    addTag(name: string) {
        if (this.tags.find((tag) => tag === name)) return false
        this.tags.push(name)
        this.deck.renderTagFilter()
        return true
    }

    removeTag(name: string) {
        const index = this.tags.findIndex((tagName) => tagName === name)
        this.tags.splice(index, 1)
        this.deck.renderTagFilter()
    }
}
