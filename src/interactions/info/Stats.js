const { MessageEmbed } = require('discord.js');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Stats extends RoxanneInteraction {
    get name() {
        return 'stats';
    }

    get description() {
        return 'My current info!';
    }

    static convertBytes(bytes) {
        const MB = Math.floor((bytes / 1024 / 1024) % 1000);
        const GB = Math.floor(bytes / 1024 / 1024 / 1024);
        if (MB >= 1000) return `${GB.toFixed(1)} GB`;
        else return `${Math.round(MB)} MB`;
    }

    static updateDBStats(interaction, client, message, guilds, channels, memory, players) {
        let obj = {
            servers: Array.from(client.shoukaku.nodes.keys()).join(', '),
            commandsRun: client.commandsRun,
            uptime: client.util.convertMS(client.uptime),
            ping: Math.round(message.createdTimestamp - interaction.createdTimestamp),
            memory: Stats.convertBytes(memory.reduce((sum, memory) => sum + memory.rss, 0)),
            players: players.reduce((sum, count) => sum + count),
            channels: channels.reduce((sum, count) => sum + count),
            userCount: client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c),
            guilds: guilds.reduce((sum, count) => sum + count),
        };
        // client.db.redis.set('stats', JSON.stringify(obj)).catch(_ => null);
        // const dbResult = this.client.db.redis.get('stats')
        return obj;
    }

    async run({ interaction }) {
        const message = await interaction.deferReply({ fetchReply: true });
        const [guilds, channels, memory, players] = await Promise.all([
            this.client.shard.broadcastEval('this.guilds.cache.size'),
            this.client.shard.broadcastEval('this.channels.cache.size'),
            this.client.shard.broadcastEval('process.memoryUsage()'),
            this.client.shard.broadcastEval('this.queue.size'),
        ]);
        const dbQuery = Stats.updateDBStats(interaction, this.client, message, guilds, channels, memory, players);

        const embed = new MessageEmbed()
            .setColor(this.client.color)
            .setTitle('Status')
            .setDescription(
                `\`\`\`ml\n
Guilds      :: ${dbQuery.guilds}
User Count  :: ${dbQuery.userCount}
Channels    :: ${dbQuery.channels}
Players     :: ${dbQuery.players}
Memory      :: ${dbQuery.memory}
Ping        :: ${dbQuery.ping} MS
Uptime      :: ${dbQuery.uptime}
CMDs Run    :: ${dbQuery.commandsRun}
Music Nodes :: ${dbQuery.servers}
\`\`\``
            )
            .setTimestamp()
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL());
        await interaction.editReply({ embeds: [embed] });
    }
}
module.exports = Stats;
