const { MessageEmbed } = require('discord.js');
const { Collection } = require('@discordjs/collection');
const EventEmitter = require('events');

class ComponentHandler extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.commands = new Collection();
        this.on('error', error => client.logger.error(error));
        this.client.on('interactionCreate', interaction => this.exec(interaction));
    }

    async exec(interaction) {
        try {
            if (!interaction.isSelectMenu()) return;

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
