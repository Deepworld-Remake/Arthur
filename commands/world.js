const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
let XMLHttpRequest = require('xhr2');

let biomes = {
    'plain': ['Temperate', 'https://media.discordapp.net/attachments/1041397042582388919/1323794948843372636/plain.png'],
    'arctic': ['Arctic', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949153755177/arctic.png'],
    'hell': ['Hell', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949979902022/hell.png'],
    'desert': ['Desert', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949782634569/desert.png'],
    'brain': ['Brain', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949405278308/brain.png'],
    'space': ['Space', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794948629467198/space.png'],
    'deep': ['Deep', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949602283652/deep.png']
}

const levDist = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    const arr = [];
    for (let i = 0; i <= t.length; i++) {
        arr[i] = [i];
        for (let j = 1; j <= s.length; j++) {
            arr[i][j] = i === 0 ? j : Math.min(
                arr[i - 1][j] + 1,
                arr[i][j - 1] + 1,
                arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
        }
    }
    return arr[t.length][s.length];
};  

function searchWorlds(page, info, callback, api_token) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let json = xhttp.responseText;
            let needsToEnd = false;
            let raw = JSON.parse(json);
            if (raw.length == 0) needsToEnd = true;
            let distance = info[1] || 0;
            let best = info[2] || {};
            for (let i = 0; i < raw.length; i++) {
                if (!needsToEnd) {
                    let world = raw[i];
                    let dist = levDist(world.name, info[0]);
                    if (dist < distance) {
                        distance = dist;
                        best = world;
                    }
                    if (dist == 0 || page >= 5) needsToEnd = true;
                } else break;
            }
            if (needsToEnd) {
                callback([info[0], distance, best]);
            } else {
                searchWorlds(page + 1, [info[0], distance, best], callback, api_token);
            }
        }
    };
    xhttp.open('GET', 'http://v2202410239072292297.goodsrv.de:5003/v1/worlds?api_token=' + api_token + '&name=' + info[0] + '&page=' + page, true);
    xhttp.send();
}

function getDateDistance(t, n) {
    let diff = Math.abs(n - t) / 1000;
    let years = Math.floor(diff / 31536000);
    let months = Math.floor(diff / 2592000);
    let weeks = Math.floor(diff / 604800);
    let days = Math.floor(diff / 86400);
    let hours = Math.floor(diff / 3600) % 24;
    let minutes = Math.floor(diff / 60) % 60;
    let seconds = diff % 60;
    if (years > 1) return years + " Years";
    if (months > 2) return months + " Months";
    if (weeks > 2) return weeks + " Weeks";
    if (days > 1) return days + " Days";
    if (hours > 1) return hours + " Hours";
    if (minutes > 1) return minutes + " Minutes";
    return Math.floor(seconds) + " Seconds";
}

module.exports = {
    local: true,
	data: new SlashCommandBuilder()
        .setName('world')
        .setDescription(`Grab the available info about a world`)
        .addStringOption((option) => option
            .setName('name')
            .setRequired(true)
            .setDescription('World you wish to know about'))
        .addStringOption((option) => option
            .setName('token')
            .setAutocomplete(false)
            .setRequired(false)
            .setDescription('Use your api token (/api ingame) to show hidden worlds')),
    search(page, info, callback) { searchWorlds(page, info, callback) },
	async execute(interaction) {
        const profileEmbed = new EmbedBuilder();
        let name = interaction.options.getString('name').replace(/[^[\x00-\x7F]+$/g, "");
        if (name.length == 0) {
            interaction.reply('World not found, or not specified');
            return;
        }
        let token = interaction.options.getString('token');
        searchWorlds(1, [name, 100, 0], (info) => {
            try {
                let world = info[2];
                const market = world.activity == "market" ? true : false;
                const gendate = new Date(world.gen_date);
                let fields = [{
                    name: 'Biome',
                    value: biomes[world.biome][0] + (market ? ' (Market World)' : '')
                },{ 
                    name: 'PVP', 
                    value: world.pvp ? 'Enabled' : 'Disabled',
                    inline: true
                },
                // { 
                //     name: 'Private', 
                //     value: raw.private ? 'Yes' : 'No' 
                // },
                { 
                    name: 'Protection', 
                    value: world.protected ? 'Enabled' : 'Disabled' ,
                    inline: true
                },{
                    name: 'Generated',
                    value: `${gendate.toUTCString()} (${getDateDistance(gendate, Date.now())} ago)`
                }];
                profileEmbed
                    .setTitle(world.name)
                    .setThumbnail(biomes[world.biome][1])
                    .setImage(encodeURI(`http://v2202410239072292297.goodsrv.de:5003/v1/map/${world.name}`))
                    .setDescription(`${Math.round(world.explored * 1000) / 10}% Explored`)
                    .addFields(...fields)
                    // .setFooter({
                    //     text: 
                    // })
                    .setColor(market ? '5ee036' : global.color);
                if (interaction.options.getString('token')) {
                    profileEmbed.setFooter({
                        text: "Private World (Accessed with API Token)"
                    });
                }
                interaction.reply({ embeds: [profileEmbed] });
            } catch(e) {
                if (interaction.user.id == global.botOwner)
                    interaction.reply('World not found, or not specified\n-# Debug: ' + e);
                    //console.log(e);
                else
                    interaction.reply('World not found, or not specified');
            }
        }, token);
	},
};