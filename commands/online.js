

const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
let XMLHttpRequest = require('xhr2');

function getPlayersForList(interaction, page, info, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let json = xhttp.responseText;
            console.log(json);
            try {
                let raw = JSON.parse(json);
                let best = info[0] || {};
                let players = info[1] || 0; 
                let worlds = info[2] || 0; 
                let needsToEnd = false;
                for (let i = 0; i < raw.length; i++) {
                    let curWorld = raw[i];
                    if (curWorld.players > best.players || 0) best = curWorld;
                    players += curWorld.players;
                    if (curWorld.players >= 1) worlds++;
                    else {
                        needsToEnd = true;
                        break;
                    }
                }
                if (needsToEnd) {
                    callback(info);
                } else {
                    let newInfo = [best, players, worlds];
                    getPlayersForList(interaction, page + 1, newInfo, callback);
                }
            } catch(e) {
                if (interaction.user.id == global.botOwner)
                    interaction.reply("There was a problem checking the API\n-# Debug: " + e);
                else
                    interaction.reply("There was a problem checking the API");
                return;
            }
        }
    };
    xhttp.open("GET", "http://v2202410239072292297.goodsrv.de:5003/v1/worlds?api_token=&sort=popularity&page=" + page, true);
    xhttp.send();
}

module.exports = {
    local: false,
	data: new SlashCommandBuilder()
        .setName('online')
        .setDescription(`See how many players are online in deepworld`),
	async execute(interaction) {
        const profileEmbed = new EmbedBuilder();
        try {
            getPlayersForList(interaction, 1, [], (info) => {
                if (info[1] >= 1) {
                    profileEmbed.setDescription(info[1] > 1 ? `There are ${info[1]} Players online ${info[2] > 1 ? `across ${info[2]} Worlds` : 'in 1 World'}` : `There is 1 Player online at the moment`)
                        .addFields({
                            name: 'Current Top World',
                            value: 'test-' + info[1].name
                        });
                    interaction.reply({ embeds: [profileEmbed] });
                } else {
                    profileEmbed.setDescription(`There is no one online at the moment`);
                    interaction.reply({ embeds: [profileEmbed] });
                }
            });
        } catch(e) {
            if (interaction.user.id == global.botOwner)
                interaction.reply("There was a problem checking the API\n-# Debug: " + e);
            else
                interaction.reply("There was a problem checking the API");
        }
	},
};