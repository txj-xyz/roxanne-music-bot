import { Channel, Guild, GuildMember } from 'discord.js';
import { Shoukaku, Connectors, Player, Node, Track } from 'shoukaku';
import Bot from '../Bot';
import { BotModule } from '../handlers/ModuleHandler';

export interface MusicDispatcher {
    client: Bot;
    guild: Guild;
    channel: Channel;
    player: Player;
    queue: Array<Track>;
    repeat: 'off';
    current: null | object;
    stopped: boolean;
    nowplaying: null;
}
export default class Music extends Shoukaku implements BotModule {
    get enabled() {
        return true;
    }
    get name() {
        return this.constructor.name;
    }
    constructor(client: Bot) {
        super(new Connectors.DiscordJS(client), client.util.config.lavalinkOptions, client.util.config.shoukakuOptions);
        this.on('ready', (name, resumed) => {
            client.logger.log({ handler: this.constructor.name, message: `Lavalink Node: ${name} is now ${resumed ? 'resumed' : 'connected'}` }, true);
        });
        this.on('error', (name, error) => {
            client.logger.error({ handler: this.constructor.name, error: `Lavalink Node: ${name} had an error ${error.toString()}` }, true);
        });
        this.on('close', (name, code, reason) => {
            client.logger.log({ handler: this.constructor.name, message: `Lavalink Node: ${name} closed with code ${code} ${reason ? `with reason: ${reason}` : ''}` }, true);
        });
        this.on('disconnect', (name, players, moved) => {
            client.logger.log(
                {
                    handler: this.constructor.name,
                    message: `Lavalink Node: ${name} disconnected ${
                        moved ? `${players ? players.length : ''} players have been moved` : `${players ? players.length : ''} players have been disconnected`
                    }`,
                },
                true
            );
        });
    }
}

export class MusicDispatcher {
    constructor(client: Bot, guild: Guild, channel: Channel, player: Player) {
        this.client = client;
        this.guild = guild;
        this.channel = channel;
        this.player = player;
        this.queue = new Array<Track>
        this.repeat = 'off';
        this.current = null;
        this.stopped = false;
        this.nowplaying = null;

        this.player
            .on('start', async () => {})
            .on('end', async () => {})
            .on('stuck', () => {});
            // .on('closed', async (payload: WebSocketClosedEvent) => {});
    }
}

export interface MusicQueue {
    client: Bot;
    player?: Player;
    dispatcher: MusicDispatcher;
    handle(guild: Guild, member: GuildMember, channel: Channel, node: Node, track: Track, first: boolean): Promise<MusicDispatcher>;
}

export class MusicQueue extends Map {
    constructor(client: Bot) {
        super();
        this.client = client;
    }

    public async handle(guild: Guild, member: GuildMember, channel: Channel, node: Node, track: Track, first: boolean): Promise<MusicDispatcher> {
        const existing = this.get(guild.id);

        // TODO: HANDLE THE MISSING VOID CONNECTION CONNECTION FLAGS VIA BEFORE INTERACTION HANDLES IN `<Bot>.modules.<ModuleName>.queue.<Handle>`
        if (!existing && member.voice.channelId) {
            this.player = await node.joinChannel({ guildId: guild.id, shardId: guild.shardId, channelId: member.voice.channelId, deaf: true })
            this.dispatcher = new MusicDispatcher(this.client, guild, channel, this.player);
            this.dispatcher.queue.push(track);
            this.set(guild.id, this.dispatcher);
            return this.dispatcher;
        }

        first ? existing.queue.unshift(track) : existing.queue.push(track);

        return this.dispatcher;
    }
}
