const EventEmitter = require('events');

class ComponentHandler extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.client.logger.log(this.constructor.name, 'Loaded ComponentEvent Listeners.');
        this.on('error', error => client.logger.error(error));
        this.client.on('interactionCreate', interaction => this.exec(interaction));
        // this.play = this.client.interactions.commands.get('play');
    }

    async exec(interaction) {

        if (!interaction.isSelectMenu()) return;
        await interaction.deferUpdate();
        try {
            let requestingUser = await interaction.fetchReply();
            if(requestingUser.interaction.user.id !== interaction.user.id) return;
        } catch (error) {
            return this.client.webhook.send(`${this.constructor.name} - ${error}`);
        }
        try {
            if(interaction.customId === 'playlist_menu'){
                await interaction.editReply({content: 'Please wait, I am loading the query now. :)', components: []});
                
                switch (interaction.values[0]) {
                    case 'txb_playlist':
                        this.client.interactions.commands.get('play').buttonSpotifyPlaylist(interaction, 'https://open.spotify.com/playlist/1Ac9XPXCQaTUjTNbnNwYhV');
                        break;
                    case 'txj_playlist':
                        this.client.interactions.commands.get('play').buttonSpotifyPlaylist(interaction, 'https://open.spotify.com/playlist/4YLTXRl623J8WXYyZse3rk');
                        break;
                    case 'dnb_playlist':
                        this.client.interactions.commands.get('play').buttonYoutubePlaylist(interaction, 'https://www.youtube.com/watch?v=RKSr5ovamds&list=PL9BCA60EEB1C8893D', false);
                        break;
                    case 'alda_playlist':
                        this.client.interactions.commands.get('play').buttonSpotifyPlaylist(interaction, 'https://open.spotify.com/playlist/6CtQMssfXfWwUnAwZclC6b');
                        break;
                }
            } else if(interaction.customId === 'radio_menu'){
                await interaction.editReply({content: 'Please wait, I am loading the radio station. :)', components: []});
                switch (interaction.values[0]) {
                    case 'lofi_radio':
                        this.client.interactions.commands.get('play').buttonYoutubePlaylist(interaction, 'https://www.youtube.com/watch?v=5qap5aO4i9A', true);
                        break;
                    case 'coffee_lofi_radio':
                        this.client.interactions.commands.get('play').buttonYoutubePlaylist(interaction, 'https://www.youtube.com/watch?v=-5KAN9_CzSA', true);
                        break;
                    case 'good_life_radio':
                        this.client.interactions.commands.get('play').buttonYoutubePlaylist(interaction, 'https://www.youtube.com/watch?v=36YnV9STBqc', true);
                        break;
                    case 'dnb_radio':
                        this.client.interactions.commands.get('play').buttonYoutubePlaylist(interaction, 'https://youtu.be/Rf4jJzziJko', true);
                        break;
                        
                }
            }
        } catch (e) {return e;}
    }
}

module.exports = ComponentHandler;
