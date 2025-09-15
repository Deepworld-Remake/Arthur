const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');
let XMLHttpRequest = require('xhr2');

function getPlayer(name, token, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let json = xhttp.responseText;
            let raw = JSON.parse(json);
            if (raw.length == 0) callback(false, {});
            else callback(true, raw);
        }
    };
    xhttp.open('GET', global.serverUrl + ':5001/players/' + name + '?api_token=' + token, true);
    xhttp.send();
}

module.exports = {
    local: true,
	data: new SlashCommandBuilder()
        .setName('register')
        .setDescription(`Add yourself to the inventory database - Requires API Token`)
        .addStringOption((option) => option
            .setName('name')
            .setRequired(true)
            .setDescription('Deepworld Username'))
        .addStringOption((option) => option
            .setName('token')
            .setAutocomplete(false)
            .setRequired(true)
            .setDescription('Use your api token (/api ingame)')),
	async execute(interaction) {
        const profileEmbed = new EmbedBuilder();
        let name = interaction.options.getString('name').replace(/[^[\x00-\x7F]+$/g, "");
        let token = interaction.options.getString('token').replace(/[^[\x00-\x7F]+$/g, "");
        if (name.length == 0) {
            interaction.reply({ content: 'Username not found or not specified', flags: MessageFlags.Ephemeral });
            return;
        } else {
            getPlayer(name, token, (valid, data) => {
                if (valid) {
                    if (data.token_validated) {
                        global.arthurdb.set(`deepworld.players.${data.name}`, data);
                        global.arthurdb.set(`deepworld.player_tokens.${data.name}`, token);
                        interaction.reply({ content: 'Done! You are now added to the database!', flags: MessageFlags.Ephemeral });
                    } else {
                        interaction.reply({ content: 'Error validating. Token is not valid.', flags: MessageFlags.Ephemeral });
                    }
                } else {
                    interaction.reply({ content: 'Error retrieving username. May be invalid.', flags: MessageFlags.Ephemeral });
                }
            });
        }
	},
};