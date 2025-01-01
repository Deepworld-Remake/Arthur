const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

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
        const yr = (new Date(Date.now())).getYear();
        const cretAge = yr - cret.getYear();
        const joinAge = yr - join.getYear();
        const profileEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: `Profile of @${user.username}`, 
                iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            })
            .setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`)
            .setDescription(`${user.id}`)
            .addFields({
                name: 'User Creation Date',
                value: `${cret.toDateString()}${cretAge > 0 ? ', ' + cretAge + ' years ago' : ''}`
            }, {
                name: 'Local Join Date',
                value: `${join.toDateString()}${joinAge > 0 ? ', ' + joinAge + ' years ago' : ''}`
            })
            .setColor(global.color);
        let tmpu = await user.fetch({ force: true });
        if (tmpu.id) profileEmbed.setColor(tmpu.hexAccentColor == null ? global.color : tmpu.hexAccentColor);
        if (user.id == global.botOwner)
            profileEmbed.setFooter({
                text: 'Owner of ' + globalThis.bot.user.username,
                iconURL: 'https://cdn.discordapp.com/emojis/747511563082137710.webp?size=128&quality=lossless'
            });
        interaction.reply({ embeds: [profileEmbed] });
	},
};