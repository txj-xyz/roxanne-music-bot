const { ShoukakuPlayer } = require('shoukaku');
const RoxanneDispatcher = require('./RoxanneDispatcher.js');
const { foreverMode } = require('../../config.json');
let player = null;
let dispatcher = null;
class Queue extends Map {
    constructor(client, iterable) {
        super(iterable);
        this.client = client;
    }

    async handle(guild, member, channel, node, track, first) {
        const existing = this.get(guild.id);
        if (!existing) {
            //24/7 mode checker
            const botVoice = guild.voiceStates.cache.get(this.client.user.id);
            if (botVoice?.channelId && foreverMode) {
                const userVoice = await guild.voiceStates.cache.get(member.user.id);
                if (botVoice?.channelId !== member.voice.channelId) {
                    try {
                        botVoice.setChannel(userVoice?.channelId);
                        this.client.logger.log('Queue', `Existing dispatcher @ guild "${guild.id}" moving player`);
                    } catch (error) {
                        this.client.logger.log('Queue', 'Failed to move voice channels.');
                    }
                }
                dispatcher.queue.push(track);
                this.set(guild.id, dispatcher);
                this.client.logger.log(dispatcher.constructor.name, `Existing dispatcher @ guild "${guild.id}" started player`);
                return dispatcher;
            } else {
                player = await node
                    .joinChannel({
                        guildId: guild.id,
                        shardId: guild.shardId,
                        channelId: member.voice.channelId,
                        deaf: true,
                    })
                    .catch(() => {
                        return this.client.logger.debug(`QueueHandlerError`, error);
                    });
            }
            this.client.logger.debug(player.constructor.name, `New connection @ guild "${guild.id}"`);
            dispatcher = new RoxanneDispatcher({
                client: this.client,
                guild,
                channel,
                player,
            });
            dispatcher.queue.push(track);
            this.set(guild.id, dispatcher);
            this.client.logger.debug(dispatcher.constructor.name, `New player dispatcher @ guild "${guild.id}"`);
            return dispatcher;
        }
        first ? existing.queue.unshift(track) : existing.queue.push(track);
        return null;
    }
}
module.exports = Queue;
