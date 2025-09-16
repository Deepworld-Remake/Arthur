const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    local: false,
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Get the leaderboard of certain topics')
        .addSubcommand(command => command
            .setName('mining_placing_crafting')
        ),
	async execute(interaction) {
        let desc = '';
        switch (interaction.options.getCommand()) {
            case 'mining_placing_crafting':
                desc = 'Leaderboards for mining, crafting, and building'
                break;
            case '':
                break;
            default:
        }
        let players = global.arthurdb.get('deepworld.players');
        let 
        const leaderboard = new EmbedBuilder()
            .setTitle(`Leaderboard`)
            .setDescription(desc)
			.setColor(global.color);
		await interaction.reply({ embeds: [leaderboard] });
	},
};