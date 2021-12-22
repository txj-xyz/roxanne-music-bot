const uuid = require('uuid');

class RoxanneContext {
    constructor(client) {
        this.uid = uuid.v4();
        this.client = client;
        this.category = null;
        if (this.constructor === RoxanneContext)
            throw new TypeError(
                'Abstract class "RoxanneContext" cannot be instantiated directly.'
            );
        if (this.name === undefined)
            throw new TypeError(
                'Classes extending RoxanneContext must have a getter "name"'
            );
        if (this.type === undefined)
            throw new TypeError(
                'Classes extending RoxanneContext must have a getter "type"'
            );
        if (this.permissions === undefined)
            throw new TypeError(
                'Classes extending RoxanneContext must have a getter "permission"'
            );
        if (this.options === undefined)
            throw new TypeError(
                'Classes extending RoxanneContext must have a getter "options"'
            );
        if (this.run === undefined)
            throw new TypeError(
                'Classes extending RoxanneContext must implement an async function "run"'
            );
        if (this.run.constructor.name !== 'AsyncFunction')
            throw new TypeError(
                'Classes extending RoxanneContext must implement "run" as an async function'
            );
    }
    get permissions() {
        return null;
    }
    get description() {
        return '';
    }
    get options() {
        return null;
    }
    get interactionData() {
        return {
            name: this.name,
            type: this.type,
            options: this.options,
        };
    }
}
module.exports = RoxanneContext;
