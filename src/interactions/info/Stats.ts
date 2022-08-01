const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Stats extends RoxanneInteraction {
    get name() {
        return 'stats';
    }

    get description() {
        return 'My current info!';
    }

    async run({ interaction }) {
        const pingTime = Date.now();
        await interaction.deferReply();
        const [guilds, channels, memory, players] = await Promise.all([
            this.client.shard.broadcastEval('this.guilds.cache.size'),
            this.client.shard.broadcastEval('this.channels.cache.size'),
            this.client.shard.broadcastEval('process.memoryUsage()'),
            this.client.shard.broadcastEval('this.queue.size'),
        ]);

        const embed = new MessageEmbed()
            .setColor(this.client.color)
            .setTitle('Status')
            .setDescription(
                `\`\`\`ml\n
Guilds      :: ${guilds.reduce((sum, count) => sum + count)}
User Count  :: ${this.client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c)}
Channels    :: ${channels.reduce((sum, count) => sum + count)}
Players     :: ${players.reduce((sum, count) => sum + count)}
Memory      :: ${this.client.util.convertBytes(memory.reduce((sum, memory) => sum + memory.rss, 0))}
Ping        :: ${Math.round(Date.now() - pingTime)} MS
Uptime      :: ${this.client.util.convertMS(this.client.uptime)}
CMDs Run    :: ${this.client.commandsRun}
Music Nodes :: ${Array.from(this.client.shoukaku.nodes.keys()).join(', ')}
\`\`\``
            )
            .setTimestamp()
            .setFooter({ text: this.client.user.username, iconURL: this.client.user.displayAvatarURL() });
        await interaction.editReply({ embeds: [embed], components: [] });
    }
}
module.exports = Stats;
