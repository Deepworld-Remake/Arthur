const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');

function topTenString(list, target) {
    let selected = [];
    for (let i = 0; i < 10; i++)
        selected.push(list[i]);
    let finished = "";
    selected.forEach((item) => {
        finished += item.name + ' - ' + item[target] + '\n';
    });
    return finished;
}

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
        let mining_data = players.toSorted((a, b) => {
            if (a.admin & !b.admin) 1;
            if (b.admin & !a.admin) -1;
            if (a.items_mined > b.items_mined) -1;
            else if (a.items_mined < b.items_mined) 1;
            else 0;
        });
        let crafting_data = players.toSorted((a, b) => {
            if (a.admin & !b.admin) 1;
            if (b.admin & !a.admin) -1;
            if (a.items_crafted > b.items_crafted) -1;
            else if (a.items_crafted < b.items_crafted) 1;
            else 0;
        })
        let building_data = players.toSorted((a, b) => {
            if (a.admin & !b.admin) 1;
            if (b.admin & !a.admin) -1;
            if (a.items_placed > b.items_placed) -1;
            else if (a.items_placed < b.items_placed) 1;
            else 0;
        })
        const leaderboard = new EmbedBuilder()
            .setTitle(`Leaderboard`)
            .setDescription(desc)
			.setColor(global.color);
        leaderboard.addFields(
            { name: 'Blocks Mined', value: topTenString(mining_data) },
            { name: 'Items Crafted', value: topTenString(crafting_data) },
            { name: 'Blocks Placed', value: topTenString(building_data) },
        )
		await interaction.reply({ embeds: [leaderboard] });
	},
};