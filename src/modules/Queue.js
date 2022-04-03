const RoxanneDispatcher = require('./RoxanneDispatcher.js');
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
            if (botVoice?.channelId && this.client.util.config.foreverMode) {
                try {
                    const userVoice = await guild.voiceStates.cache.get(member.user.id);
                    if (botVoice?.channelId !== member.voice.channelId) {
                        try {
                            botVoice.setChannel(userVoice?.channelId);
                            this.client.logger.log({
                                constructor: this.constructor?.name || 'Queue',
                                message: 'Existing dispatcher moving player',
                                guild: guild.name,
                                guildID: guild.id,
                            });
                        } catch (error) {
                            this.client.logger.error('Queue', 'Failed to move voice channels.');
                        }
                    }
                    dispatcher.queue.push(track);
                    this.set(guild.id, dispatcher);
                    this.client.logger.log({
                        constructor: dispatcher?.constructor.name,
                        message: 'Existing dispatcher started player',
                        guild: guild.name,
                        guildID: guild.id,
                    });
                    return dispatcher;
                } catch (error) {
                    return this.client.logger.error(dispatcher.constructor.name, error.toString());
                }
            } else {
                //TODO: check voice user limit before joining.
                player = await node
                    .joinChannel({
                        guildId: guild.id,
                        shardId: guild.shardId,
                        channelId: member.voice.channelId,
                        deaf: true,
                    })
                    .catch((error) => {
                        return this.client.logger.error(`QueueHandlerError`, error);
                    });
            }

            this.client.logger.log({
                constructor: this.constructor.name,
                message: 'New player connection',
                guild: guild.name,
                guildID: guild.id,
            });

            dispatcher = new RoxanneDispatcher({
                client: this.client,
                guild,
                channel,
                player,
            });

            dispatcher.queue.push(track);
            this.set(guild.id, dispatcher);
            this.client.logger.log({
                constructor: this.constructor.name,
                message: 'New player dispatcher',
                guild: guild.name,
                guildID: guild.id,
            });
            return dispatcher;
        }

        first ? existing.queue.unshift(track) : existing.queue.push(track);

        return null;
    }
}
module.exports = Queue;
