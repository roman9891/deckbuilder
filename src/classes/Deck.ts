import { createDeckbuilderAutocomplete } from '../components/autocomplete.js'
import { createCardPreview } from '../components/card-preview.js'
import { TagEditor } from '../components/tag-editor.js'
import { Card } from './Card.js'
import { TagType } from './Tag.js'

interface FileInputEventTarget extends EventTarget {
    files: Blob[]
}

interface ParsedCardData {
    quantity: number
    name: string
}

export class Deck {
    public list: Card[]
    private commander: string

    constructor() {
        this.list = []
        createDeckbuilderAutocomplete(this)
        this.renderList()
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

        const importButton = document.querySelector('#import-button')
        importButton.addEventListener('change', this.loadDeck)

        const exportButton = document.querySelector('#export-button')
        exportButton.addEventListener('click', this.saveDeck)

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
            item.innerText = `${card.name} x ${card.quantity}`
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
            increaseQuantity.addEventListener('click', card.increaseQuantity)

            const decreaseQuantity = document.createElement('button')
            decreaseQuantity.innerText = '-'
            decreaseQuantity.addEventListener('click', card.decreaseQuantity)

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

    renderTagFilter = () => {
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

            if (!tags[key]) return

            const sortedTags = Array.from(tags[key]).sort()
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

    loadDeck = (e: Event) => {
        const reader = new FileReader()
        const deck = new Deck()
        const fileInputEventTarget = e.target as FileInputEventTarget
        const file = fileInputEventTarget.files[0]

        reader.readAsText(file)
        reader.addEventListener('load', async (e) => {
            const inputString = reader.result

            if (typeof inputString === 'string') {
                console.log(this)
                const parsedData = this.parseTxtFile(inputString)

                const promises = []

                parsedData.forEach((parsedCardData) => {
                    const param = encodeURIComponent(parsedCardData.name)
                    const promise = fetch(
                        `https://api.scryfall.com/cards/named?exact=${param}`
                    )
                    promises.push(promise)
                })

                const responses: Response[] = await Promise.all(promises)
                const data = await Promise.all(
                    responses.map((res) => res.json())
                )

                console.log(data)

                for (let cardData of data) {
                    deck.addCard(cardData)
                }
            }
        })
    }

    parseTxtFile(txtFileString: string) {
        const lines = txtFileString.trim().split('\n')
        const parsedData: ParsedCardData[] = []

        console.log({ lines, parsedData })

        lines.forEach((line) => {
            const match = line.match(/(\d+)\s+(.+)/)
            if (match) {
                const quantity = parseInt(match[1], 10)
                const name = match[2].trim()
                parsedData.push({ quantity, name })
            }
        })

        return parsedData
    }

    fetchCardName(parsedCardData: ParsedCardData) {
        // fetch card data based on name
    }

    saveDeck = () => {
        console.log('saving')

        const data = this.processDeckList()
        const blob = new Blob([data], { type: 'text/plain' })

        // Create a temporary URL for the blob
        const url = URL.createObjectURL(blob)

        // Create an anchor element to trigger the download
        const a = document.createElement('a')
        a.href = url
        a.download = 'myData.txt' // Specify the file name with the desired extension
        document.body.appendChild(a)

        // Trigger the click event to start the download
        a.click()

        // Clean up by revoking the object URL
        URL.revokeObjectURL(url)
    }

    processDeckList(): string {
        let textData = ''

        this.list.forEach((card) => {
            textData += `${card.quantity} ${card.name} \n`
        })

        return textData
    }
}
