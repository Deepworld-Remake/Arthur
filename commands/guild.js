const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

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
    local: false,
	data: new SlashCommandBuilder()
        .setName('guild')
        .setDescription(`See this guild's common information`),
	async execute(interaction) {
        const guild = interaction.guild;
        const cret = guild.createdAt;
        guild.fetchOwner().then((owner) => {
            const profileEmbed = new EmbedBuilder()
                .setAuthor({
                    name: guild.name, 
                    iconURL: guild.iconURL()
                })
                .setDescription(`${guild.id}`)
                .addFields({
                    name: `Members`,
                    value: `${guild.memberCount}`
                }, {
                    name: `Created On`,
                    value: `${cret.toUTCString()} (${getDateDistance(cret, Date.now())} ago)`
                }, {
                    name: 'Owner',
                    value: `${owner.displayName} - @${owner.user.username} - ${owner.id}`
                })
                .setColor(global.color);
            if (guild.description) profileEmbed.setDescription(`${guild.id}\n\n${guild.description}`)
            interaction.reply({ embeds: [profileEmbed] }, { "allowed_mentions": { "parse": [] } });
        });
	},
};