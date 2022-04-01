const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class CoinFlip extends RoxanneInteraction {
    get name() {
        return 'coinflip';
    }

    get description() {
        return 'Basic coin flip that rolls heads or tails!';
    }

    static rolledResult() {
        let flippedCoin;
        const coinFlip = this.client.util.rollRandomInt16(2);
        if (coinFlip == 0) {
            flippedCoin = 'Heads';
        } else {
            flippedCoin = 'Tails';
        }
        return flippedCoin;
    }

    async run({ interaction }) {
        const message = await interaction.deferReply();
        await interaction.editReply(`**${CoinFlip.rolledResult().toString()}!**`);
    }
}
module.exports = CoinFlip;
