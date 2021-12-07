const { MessageEmbed } = require('discord.js');
const { Collection } = require('@discordjs/collection');
const EventEmitter = require('events');

class ComponentHandler extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.commands = new Collection();
        this.client.logger.log(this.constructor.name, `Loaded ComponentEvent Listeners.`);
        this.on('error', error => client.logger.error(error));
        this.client.on('interactionCreate', interaction => this.exec(interaction));
        this.play = this.client.interactions.commands.get('play');
    }

    async exec(interaction) {

        if (!interaction.isSelectMenu()) return;
        await interaction.deferUpdate();
        try {
            let requestingUser = await interaction.fetchReply();
            if(requestingUser.interaction.user.id !== interaction.user.id) return;
        } catch (error) {
            return this.client.webhook.send(`${this.constructor.name} - ${error}`)
        }
        try {
            if(interaction.customId === "playlist_menu"){
                await interaction.editReply({content: 'Please wait, I am loading the query now :)', components: []});
                
                switch (interaction.values[0]) {
                    case "txb_playlist":
                        this.play.buttonSpotifyPlaylist(interaction, "https://open.spotify.com/playlist/1Ac9XPXCQaTUjTNbnNwYhV");
                        
                        break;
                    case "txj_playlist":
                        this.play.buttonSpotifyPlaylist(interaction, "https://open.spotify.com/playlist/4YLTXRl623J8WXYyZse3rk");
                        break;
                    case "dnb_playlist":
                        this.play.buttonYoutubePlaylist(interaction, "https://www.youtube.com/watch?v=RKSr5ovamds&list=PL9BCA60EEB1C8893D");
                        break;
                }
            }
        } catch (error) {
            const embed = new MessageEmbed()
                .setColor(0xff99CC)
                .setTitle(`${this.constructor.name} - Something errored!`)
                .setDescription(`\`\`\`js\n ${error.toString()}\`\`\``)
                .setTimestamp()
                .setFooter(this.client.user.username, this.client.user.displayAvatarURL());
            this.client.webhook.send({ embeds: [ embed ] });
            
            if (interaction.replied || interaction.deferred) 
                await interaction
                    .editReply({ embeds: [ embed ] })
                    .catch(error => this.emit('error', error));
            else 
                await interaction
                    .reply({ embeds: [ embed ] })
                    .catch(error => this.emit('error', error));
            this.emit('error', error);
        }
    }
}

module.exports = ComponentHandler;
