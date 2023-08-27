import { Card } from '../classes/Card'

export const createCardPreview = (card: Card) => {
    const cardPreviewDiv = document.querySelector('#card-preview')
    cardPreviewDiv.innerHTML = `
        <img src="${card.imageLink}"></img>
    `
}
