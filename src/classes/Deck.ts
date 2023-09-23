import { createCardPreview } from '../components/card-preview.js'
import { TagEditor } from '../components/tag-editor.js'
import { Card } from './Card.js'
import { Tag, TagType } from './Tag.js'

export class Deck {
    public list: Card[]
    private commander: string

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

    setCommander = (cardName: string) => {
        this.commander = cardName
        this.renderList()
    }

    removeCard = (cardName: string) => {
        const index = this.list.findIndex((card) => card.name === cardName)
        this.list.splice(index, 1)
    }

    import = () => {}
    export = () => {}
    renderList() {
        const decklistContainer = document.querySelector('#decklist-container')
        decklistContainer.innerHTML = ''

        const commanderContainer = document.querySelector(
            '#commander-container'
        )
        commanderContainer.innerHTML = ''

        const filters = []
        document.querySelectorAll('.is-active').forEach((node) => {
            filters.push(node.innerHTML)
        })

        decklistContainer.textContent = `Filters: ${filters.join(' ')}`

        let listToRender = this.list

        if (filters.length) {
            listToRender = this.list.filter((card) => {
                for (let filter of filters) {
                    if (card.tags.find((tag) => tag.name === filter))
                        return true
                }
            })
        }

        listToRender.forEach((card) => {
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

            const increaseQuantity = document.createElement('button')
            increaseQuantity.innerText = '+'

            const decreaseQuantity = document.createElement('button')
            decreaseQuantity.innerText = '-'

            const setCommanderButton = document.createElement('button')
            setCommanderButton.innerText = '♔'
            setCommanderButton.addEventListener('click', () => {
                this.setCommander(card.name)
            })

            item.addEventListener('mouseover', (e) => {
                item.append(increaseQuantity, decreaseQuantity)
                if (
                    card.tags.find((tag) => tag.name === 'Creature') &&
                    card.tags.find((tag) => tag.name === 'Legendary')
                ) {
                    item.append(setCommanderButton)
                }
            })

            item.addEventListener('mouseleave', (e) => {
                item.querySelectorAll('button').forEach((node) =>
                    item.removeChild(node)
                )
            })

            if (this.commander && card.name === this.commander) {
                item.classList.toggle('is-commander')
                commanderContainer.append(item)
            } else {
                decklistContainer.append(item)
            }
        })
    }

    renderTagFilter() {
        const tagFilterContainer = document.querySelector('#tag-filter')
        tagFilterContainer.innerHTML = ''

        const tags: { [key in TagType]?: Set<string> } = {}

        this.list.forEach((card) =>
            card.tags.forEach((tag) => {
                if (!tags[tag.type]) tags[tag.type] = new Set()
                tags[tag.type].add(tag.name)
            })
        )

        const categoryOrder: TagType[] = [
            TagType.manaValue,
            TagType.color,
            TagType.superType,
            TagType.subType,
            TagType.keywords,
            TagType.user,
        ]

        categoryOrder.forEach((key) => {
            const div = document.createElement('div')
            div.innerText = key
            const sortedTags = Array.from(tags[key]).sort()
            console.log({ sortedTags })
            sortedTags.forEach((name: string) => {
                this.createTagButton(name, div)
            })
            tagFilterContainer.append(div)
        })
    }

    createTagButton(name: string, root: HTMLElement) {
        const tagButton = document.createElement('button')
        tagButton.addEventListener('click', (e) => {
            tagButton.classList.toggle('is-active')
            this.renderList()
        })
        tagButton.innerText = name
        root.append(tagButton)
    }
}
