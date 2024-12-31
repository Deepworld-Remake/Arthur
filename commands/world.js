const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    local: false,
	data: new SlashCommandBuilder()
        .setName('world')
        .setDescription(`Grab the available info about a world`)
        .addStringOption((option) => option
            .setName('name')
            .setDescription('World you wish to know about')),
	async execute(interaction) {
        const guild = interaction.guild;
        const profileEmbed = new EmbedBuilder()
            .setAuthor({
                name: guild.name, 
                iconURL: guild.iconURL()
            })
            .setColor(global.color);
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let json = xhttp.responseText;
                profileEmbed.setDescription(xhttp.responseText);
                interaction.reply({ embeds: [profileEmbed] });
            } else {
                interaction.reply("Command Failed");
            }
        };
        xhttp.open("GET", "http://v2202410239072292297.goodsrv.de:5003/v1/worlds?api_token=", true);
        xhttp.send();
	},
};