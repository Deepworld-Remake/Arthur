const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commandBuilder = new SlashCommandBuilder()
    .setName('speak')
    .setDescription('Speak as the bot user')
    .addStringOption((option) => option
        .setName('text')
        .setDescription('Text you want to send')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

commandBuilder['EXFROMRULES'] = true;

module.exports = {
    local: true,
    data: commandBuilder,
    async execute(interaction) {
        interaction.channel.send(interaction.options.getString('text'));
        interaction.reply({ content: '.', ephemeral: true });
    },
};