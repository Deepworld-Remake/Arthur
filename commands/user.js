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
        .setName('user')
        .setDescription('See your own or someone elses arthur profile')
        .addUserOption((option) => option.setName('user')
            .setDescription('Account you want to view')
            .setRequired(true)),
	async execute(interaction) {
        const specUsr = interaction.options.getUser('user');
        const specMem = interaction.options.getMember('user');
        const user = specUsr ? specUsr : interaction.user;
        const memb = specMem ? specMem : interaction.member;
        const cret = user.createdAt;
        const join = memb.joinedAt;
        const profileEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: `Profile of ${user.displayName}`, 
                iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            })
            .setThumbnail(user.avatarURL())
            .setDescription(`${user.username}\n-# ${user.id}`)
            .addFields({
                name: 'User Creation Date',
                value: `${cret.toUTCString()} (${getDateDistance(cret, Date.now())} ago)`
            }, {
                name: 'Local Join Date',
                value: `${join.toUTCString()} (${getDateDistance(join, Date.now())} ago)`
            })
            .setColor(global.color);
        const flags = user.flags;
        if (flags.toArray().length > 0) profileEmbed.addFields({
            name: 'Special Flags',
            value: `${flags.toArray().join(', ')}`
        });
        // let tmpu = await user.fetch({ force: true });
        // if (tmpu.id) profileEmbed.setColor(tmpu.hexAccentColor == null ? global.color : tmpu.hexAccentColor);
        if (user.id == global.botOwner)
            profileEmbed.setFooter({
                text: 'Owner of ' + globalThis.bot.user.username,
                iconURL: 'https://cdn.discordapp.com/emojis/747511563082137710.webp?size=128&quality=lossless'
            });
        interaction.reply({ embeds: [profileEmbed] });
	},
};