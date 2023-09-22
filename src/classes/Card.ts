import { Deck } from './Deck.js'
import { Tag, TagType } from './Tag.js'

interface CardData {
    name: string
    cmc: number
    type_line: string
    colors: string[]
    keywords: string[]
    image_uris: {
        normal: string
    }
    card_faces: { image_uris: { normal: string } }[]
}

export class Card {
    public name: string
    public tags: Tag[]
    public imageLink: string

    constructor(cardData: CardData, public deck: Deck) {
        this.name = cardData.name
        // TODO
        if (cardData.card_faces) {
            this.tags = []
            this.imageLink = ''
        } else {
            this.tags = [...this.parseNativeTags(cardData)]
            this.imageLink = cardData.image_uris.normal
        }
    }

    addTag(name: string) {
        if (this.tags.find((tag) => tag.name === name)) return false
        const tag = new Tag(name, TagType.user)
        this.tags.push(tag)
        this.deck.renderTagFilter()
        return tag
    }

    removeTag(name: string) {
        const index = this.tags.findIndex((tag) => tag.name === name)
        this.tags.splice(index, 1)
        this.deck.renderTagFilter()
    }

    parseNativeTags(cardData: CardData): Tag[] {
        const manaValue = new Tag(cardData.cmc.toString(), TagType.manaValue)
        const colors = cardData.colors.map(
            (color) => new Tag(color, TagType.color)
        )
        let superTypes: Tag[]
        let subTypes: Tag[]
        if (cardData.type_line.includes('—')) {
            let [superTypesJoined, subTypesJoined] =
                cardData.type_line.split('—')
            superTypes = superTypesJoined
                .split(' ')
                .filter((term) => term)
                .map((type) => new Tag(type, TagType.superType))
            subTypes = subTypesJoined
                .split(' ')
                .filter((term) => term)
                .map((type) => new Tag(type, TagType.subType))
        } else {
            superTypes = cardData.type_line
                .split(' ')
                .map((type) => new Tag(type, TagType.superType))
        }
        const keywords = cardData.keywords.map(
            (keyword) => new Tag(keyword, TagType.keywords)
        )

        const tags = [manaValue, ...colors, ...superTypes, ...keywords]

        if (!subTypes) return tags

        return tags.concat(subTypes)
    }
}
