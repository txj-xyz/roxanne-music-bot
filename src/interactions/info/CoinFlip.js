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
        const coinFlip = Math.floor(Math.random() * 2);
        coinFlip ? (flippedCoin = 'Heads') : (flippedCoin = 'Tails');
        return flippedCoin;
    }

    async run({ interaction }) {
        await interaction.deferReply();
        await interaction.editReply(`**${CoinFlip.rolledResult().toString()}!**`);
    }
}
module.exports = CoinFlip;
