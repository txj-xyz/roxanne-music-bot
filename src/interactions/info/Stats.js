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

        const embed = new MessageEmbed()
            .setColor(this.client.color)
            .setTitle('Status')
            guilds: this.client.guilds.cache.size,
            users: this.client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c),
            players: this.client.queue.size,
            .setDescription(
                `\`\`\`ml\n
Guilds      :: ${this.client.guilds.cache.size}
User Count  :: ${this.client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c)}
Channels    :: ${this.client.channels.cache.size}
Players     :: ${this.client.queue.size}
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
