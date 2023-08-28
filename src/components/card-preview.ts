import { Card } from '../classes/Card.js'

export const createCardPreview = (card: Card) => {
    const cardPreviewDiv = document.querySelector('#card-preview')
    cardPreviewDiv.innerHTML = `
        <img src="${card.imageLink}"></img>
    `
}
