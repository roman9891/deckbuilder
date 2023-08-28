import { Deck } from '../classes/Deck.js'

const createAutoComplete = (
    root: Element,
    renderOption: Function,
    onOptionSelect: Function,
    inputValue: Function,
    fetchData: Function
) => {
    root.innerHTML = `
        <label><b>Search</b></label>
        <input class="input">
        <div class="dropdown">
            <div class="dropdown-menu">
                <div class="dropdown-content results"></div>
            </div>
        </div>
    `
    const input = root.querySelector('input')
    const dropdown = root.querySelector('.dropdown')
    const resultsWrapper = root.querySelector('.results')

    const onInput = async (e) => {
        resultsWrapper.innerHTML = ''
        const items = await fetchData(e.target.value)

        if (!items.length) {
            dropdown.classList.remove('is-active')
            return
        }

        dropdown.classList.add('is-active')

        for (let item of items) {
            const option = document.createElement('a')

            option.classList.add('dropdown-item')
            option.innerHTML = renderOption(item)
            option.addEventListener('click', () => {
                dropdown.classList.remove('is-active')
                input.value = inputValue(item)
                onOptionSelect(item)
            })

            resultsWrapper.appendChild(option)
        }
    }

    input.addEventListener('input', debounce(onInput, 500))

    document.addEventListener('click', (e) => {
        const target = e.target as Node
        if (!root.contains(target)) dropdown.classList.remove('is-active')
    })
}

const debounce = (func, delay = 1000) => {
    let timeoutID

    return (...args) => {
        if (timeoutID) clearTimeout(timeoutID)

        timeoutID = setTimeout(() => {
            func.apply(null, args)
        }, delay)
    }
}

export const createDeckbuilderAutocomplete = (deck: Deck) => {
    const searchBar = document.querySelector('#search-box')

    const renderOption = (card) => {
        return `
                <div>${card.name}</div>
            `
    }
    const onOptionSelect = (card) => {
        deck.addCard(card)
    }
    const inputValue = () => {}

    interface FetchedData {
        data: []
    }

    const fetchData = async (q) => {
        console.log('fetching')
        const response = await fetch(
            `https://api.scryfall.com/cards/search?q=${encodeURI(q)}`
        )

        if (!response.ok) {
            console.log('Fetch failed')
            return []
        }

        const data = (await response.json()) as FetchedData

        return data.data
    }

    createAutoComplete(
        searchBar,
        renderOption,
        onOptionSelect,
        inputValue,
        fetchData
    )
}
