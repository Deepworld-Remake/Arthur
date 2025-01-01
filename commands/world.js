const { EmbedBuilder, SlashCommandBuilder, inlineCode } = require('discord.js');
let XMLHttpRequest = require('xhr2');

let biomes = {
    "plain": ["Temperate", "https://media.discordapp.net/attachments/1041397042582388919/1323794948843372636/plain.png"],
    "arctic": ["Arctic", "https://cdn.discordapp.com/attachments/1041397042582388919/1323794949153755177/arctic.png"],
    "hell": ["Hell", "https://cdn.discordapp.com/attachments/1041397042582388919/1323794949979902022/hell.png"],
    "desert": ["Desert", "https://cdn.discordapp.com/attachments/1041397042582388919/1323794949782634569/desert.png"],
    "brain": ["Brain", "https://cdn.discordapp.com/attachments/1041397042582388919/1323794949405278308/brain.png"],
    "space": ["Space", "https://cdn.discordapp.com/attachments/1041397042582388919/1323794948629467198/space.png"],
    "deep": ["Deep", "https://cdn.discordapp.com/attachments/1041397042582388919/1323794949602283652/deep.png"]
}

module.exports = {
    local: false,
	data: new SlashCommandBuilder()
        .setName('world')
        .setDescription(`Grab the available info about a world`)
        .addStringOption((option) => option
            .setName('name')
            .setRequired(true)
            .setDescription('World you wish to know about')),
	async execute(interaction) {
        const profileEmbed = new EmbedBuilder();
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let json = xhttp.responseText;
                try {
                    let raw = JSON.parse(json)[0];
                    let fields = [{
                        name: "Biome",
                        value: biomes[raw.biome][0]
                    },{ 
                        name: "PVP", 
                        value: raw.pvp ? "Enabled" : "Disabled",
                        inline: true
                    },
                    // { 
                    //     name: "Private", 
                    //     value: raw.private ? "Yes" : "No" 
                    // },
                    { 
                        name: "Protection", 
                        value: raw.protected ? "Enabled" : "Disabled" ,
                        inline: true
                    },{
                        name: "Generated",
                        value: new Date(raw.gen_date).toDateString()
                    }];
                    profileEmbed
                        .setTitle(raw.name)
                        .setThumbnail(biomes[raw.biome][1])
                        .setDescription(`${Math.round(raw.explored * 1000) / 10}% Explored`)
                        .addFields(...fields)
                        .setColor(global.color);
                    interaction.reply({ embeds: [profileEmbed] });
                } catch(e) {
                    if (interaction.user.id == global.botOwner)
                        interaction.reply("World not found, or not specified\n-# Debug: " + e);
                    else
                        interaction.reply("World not found, or not specified");
                }
            }
        };
        xhttp.open("GET", "http://v2202410239072292297.goodsrv.de:5003/v1/worlds?api_token=&name=" + interaction.options.getString("name"), true);
        xhttp.send();
	},
};