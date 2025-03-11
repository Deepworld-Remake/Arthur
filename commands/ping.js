const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    local: false,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping the bot'),
	async execute(interaction) {
		const user = global.bot.user;
		const pingEmbed = new EmbedBuilder()
			.setAuthor({ 
				name: `${user.username}#${user.discriminator}`, 
				iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
			})
			.setDescription(`Process Identifier: ${process.pid}`)
			.addFields({
				name: 'Version',
				value: `${global.version}`
			}, {
				name: 'API Ping',
				value: `${Math.round(global.bot.ws.ping)}ms`
			})
			.setColor(global.color);
		let sent = await interaction.reply({ embeds: [pingEmbed], flags: interaction.options.getInteger('hidden') == 1 ? MessageFlags.Ephemeral : '' });
		pingEmbed.addFields({
			name: 'Roundtrip Ping',
			value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`
		})
		interaction.editReply({ embeds: [pingEmbed], flags: interaction.options.getInteger('hidden') == 1 ? MessageFlags.Ephemeral : '' });
	},
};