import { createCardPreview } from '../components/card-preview.js'
import { TagEditor } from '../components/tag-editor.js'
import { Card } from './Card.js'
import { Tag, TagType } from './Tag.js'

export class Deck {
    public list: Card[]

    constructor() {
        this.list = []
    }
    addCard(cardData) {
        if (this.list.find((card) => card.name === cardData.name)) return
        const card = new Card(cardData, this)
        this.list.push(card)
        this.renderList()
        this.renderTagFilter()
    }
    setCommander = () => {}
    removeCard = () => {}
    import = () => {}
    export = () => {}
    renderList() {
        const decklistContainer = document.querySelector('#decklist-container')
        decklistContainer.innerHTML = ''

        this.list.forEach((card) => {
            const item = document.createElement('div')
            item.innerText = card.name
            item.addEventListener('click', (e) => {
                createCardPreview(card)

                const tagEditor = new TagEditor(
                    card,
                    document.querySelector('#tag-editor')
                )
                tagEditor.createTagEditor()
            })
            const removeButton = document.createElement('button')
            removeButton.innerText = 'x'

            item.append(removeButton)

            decklistContainer.append(item)
        })
    }

    renderTagFilter() {
        const tagFilterContainer = document.querySelector('#tag-filter')
        tagFilterContainer.innerHTML = ''

        const tags: { [key in TagType]?: Set<Tag> } = {}

        this.list.forEach((card) =>
            card.tags.forEach((tag) => {
                console.log(tag)
                if (!tags[tag.type]) tags[tag.type] = new Set()
                tags[tag.type].add(tag)
            })
        )
        console.log({ tags })

        Object.keys(tags).forEach((key) => {
            const div = document.createElement('div')
            div.innerText = key
            tags[key].forEach((tag) => {
                const tagButton = document.createElement('button')
                tagButton.innerText = tag.name
                div.append(tagButton)
            })
            tagFilterContainer.append(div)
        })
    }
}
