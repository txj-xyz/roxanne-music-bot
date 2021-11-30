const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const KongouInteraction = require('../../abstract/KongouInteraction.js');

class Stats extends KongouInteraction {
    get name() {
        return 'stats';
    }

    get description() {
        return 'My current info!';
    }

    static convertBytes(bytes) {
        const MB = Math.floor(bytes / 1024 / 1024 % 1000);
        const GB = Math.floor(bytes / 1024 / 1024 / 1024);
        if (MB >= 1000) 
            return `${GB.toFixed(1)} GB`;
        else 
            return `${Math.round(MB)} MB`;
    }

    static humanizeTime(millisec) {
        let seconds = (millisec / 1000).toFixed(1);
        let minutes = (millisec / (1000 * 60)).toFixed(1);
        let hours = (millisec / (1000 * 60 * 60)).toFixed(1);
        let days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (seconds < 60) {
            return seconds + " Sec";
        } else if (minutes < 60) {
            return minutes + " Min";
        } else if (hours < 24) {
            return hours + " Hrs";
        } else {
            return days + " Days"
        }
    }

    async run({ interaction }) {
        const message = await interaction.deferReply({ fetchReply: true });
        const [ guilds, channels, memory, players ] = await Promise.all([
            this.client.shard.broadcastEval('this.guilds.cache.size'),
            this.client.shard.broadcastEval('this.channels.cache.size'),
            this.client.shard.broadcastEval('process.memoryUsage()'),
            this.client.shard.broadcastEval('this.queue.size')
        ]);

        const embed = new MessageEmbed()
            .setColor(this.client.color)
            .setTitle('Status')
            .setDescription(`\`\`\`ml\n
Guilds   :: ${guilds.reduce((sum, count) => sum + count)}
Channels :: ${channels.reduce((sum, count) => sum + count)}
Players  :: ${players.reduce((sum, count) => sum + count)}
Memory   :: ${Stats.convertBytes(memory.reduce((sum, memory) => sum + memory.rss, 0))}
Ping     :: ${Math.round(message.createdTimestamp - interaction.createdTimestamp)} MS
Uptime   :: ${Stats.humanizeTime(this.client.uptime)}
\`\`\``)
            .setTimestamp()
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL());
        await interaction.editReply({ embeds: [ embed ] });
    }
}
module.exports = Stats;