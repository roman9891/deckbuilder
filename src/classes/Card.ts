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
    card_faces: {
        image_uris: { normal: string }
        type_line: string
    }[]
    color_identity: string[]
}

export class Card {
    public name: string
    public tags: Tag[]
    public imageLink: string
    public quantity: number

    constructor(cardData: CardData, public deck: Deck) {
        this.name = cardData.name
        // TODO
        if (cardData.card_faces) {
            const manaValue = new Tag(
                cardData.cmc.toString(),
                TagType.manaValue
            )
            const colors = cardData.color_identity.map(
                (color) => new Tag(color, TagType.color)
            )
            const frontTypes = this.parseTypeLine(
                cardData.card_faces[0].type_line
            )
            const backTypes = this.parseTypeLine(
                cardData.card_faces[1].type_line
            )
            const keywords = cardData.keywords.map(
                (keyword) => new Tag(keyword, TagType.keywords)
            )

            this.tags = [
                manaValue,
                ...colors,
                ...keywords,
                ...frontTypes.superTypes,
                ...frontTypes.subTypes,
                ...backTypes.superTypes,
                ...backTypes.subTypes,
            ]

            this.imageLink = cardData.card_faces[0].image_uris.normal
        } else {
            this.tags = [...this.parseNativeTags(cardData)]
            this.imageLink = cardData.image_uris.normal
        }
        this.quantity = 1
    }

    increaseQuantity = () => {
        this.quantity++
        this.deck.renderList()
    }

    decreaseQuantity = () => {
        if (this.quantity === 1) {
            this.deck.removeCard(this.name)
        } else {
            this.quantity--
        }
        this.deck.renderList()
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

        const types = this.parseTypeLine(cardData.type_line)

        const keywords = cardData.keywords.map(
            (keyword) => new Tag(keyword, TagType.keywords)
        )

        const tags: Tag[] = [
            manaValue,
            ...colors,
            ...types.superTypes,
            ...types.subTypes,
            ...keywords,
        ]

        return tags
    }

    parseTypeLine(typeLine: string): { superTypes: Tag[]; subTypes: Tag[] } {
        let superTypes: Tag[]
        let subTypes: Tag[]

        if (typeLine.includes('—')) {
            let [superTypesJoined, subTypesJoined] = typeLine.split('—')
            superTypes = superTypesJoined
                .split(' ')
                .filter((term) => term)
                .map((type) => new Tag(type, TagType.superType))
            subTypes = subTypesJoined
                .split(' ')
                .filter((term) => term)
                .map((type) => new Tag(type, TagType.subType))
        } else {
            superTypes = typeLine
                .split(' ')
                .map((type) => new Tag(type, TagType.superType))
        }

        return {
            superTypes,
            subTypes,
        }
    }
}
