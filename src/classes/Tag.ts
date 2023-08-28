export enum TagType {
    user = 'user',
    manaValue = 'mana value',
    superType = 'supertype',
    subType = 'subtype',
    color = 'color',
    keywords = 'keywords',
}

export class Tag {
    constructor(public name: string, public type: TagType) {}
}
