const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    local: true,
	data: new SlashCommandBuilder()
        .setName('induct')
        .setDescription('Give someone on the deepworld discord basic image permissions')
        .addUserOption((option) => option.setName('user')
            .setDescription('Account you want to induct')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
        const specMem = interaction.options.getMember('user');
        specMem.roles.add('588145213776855050').then(() => {
            specMem.roles.add('663513461438808094').then(() => {
                interaction.reply(`${specMem.displayName} has been Inducted`);
            });
        });
	},
};