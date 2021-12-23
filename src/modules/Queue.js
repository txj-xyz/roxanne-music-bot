const RoxanneDispatcher = require('./RoxanneDispatcher.js');

class Queue extends Map {
    constructor(client, iterable) {
        super(iterable);
        this.client = client;
    }

    async handle(guild, member, channel, node, track, first) {
        const existing = this.get(guild.id);
        if (!existing) {
            let player;
            try {
                player = await node.joinChannel({
                    guildId: guild.id,
                    shardId: guild.shardId,
                    channelId: member.voice.channelId,
                    deaf: true,
                });
            } catch (error) {
                this.client.webhook.send(
                    `QueueHandler \`"${guild.id} | ${guild.name}"\`: \`\`\`js\n${error}\n\`\`\``
                );
                this.client.logger.debug(`QueueHandler`, error);
                return null;
            }
            this.client.webhook.send(
                `${player.constructor.name} New connection @ guild \`"${guild.id} | ${guild.name}"\``
            );
            this.client.logger.debug(
                player.constructor.name,
                `New connection @ guild "${guild.id}"`
            );
            const dispatcher = new RoxanneDispatcher({
                client: this.client,
                guild,
                channel,
                player,
            });
            dispatcher.queue.push(track);
            this.set(guild.id, dispatcher);
            this.client.webhook.send(
                `${dispatcher.constructor.name} New player dispatcher @ guild \`"${guild.id} | ${guild.name}"\``
            );
            this.client.logger.debug(
                dispatcher.constructor.name,
                `New player dispatcher @ guild "${guild.id}"`
            );
            return dispatcher;
        }
        first ? existing.queue.unshift(track) : existing.queue.push(track);
        return null;
    }
}
module.exports = Queue;
