import { Card } from '../classes/Card'

export class TagEditor {
    constructor(public card: Card, public container: HTMLElement) {}

    createTagEditor() {
        this.container.innerHTML = ''

        this.createTagForm()

        this.card.tags.forEach((tag) => {
            this.createTagButton(tag)
        })
    }

    createTagForm() {
        const form = document.createElement('form')
        const input = document.createElement('input')
        const submit = document.createElement('button')

        submit.type = 'submit'
        submit.innerText = '+'
        form.append(input, submit)

        const submitTagEvent = (e) => {
            e.preventDefault()
            const name = input.value
            if (!this.card.addTag(name)) return
            this.createTagButton(name)
        }

        form.addEventListener('submit', submitTagEvent)
        this.container.append(form)
    }

    createTagButton(name: string) {
        const tagButton = document.createElement('button')
        tagButton.innerText = name

        const removeTagEvent = (e) => {
            this.card.removeTag(name)
            this.container.removeChild(tagButton)
        }

        tagButton.addEventListener('click', removeTagEvent)

        this.container.append(tagButton)
    }
}
