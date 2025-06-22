const { Client, Collection, REST, GatewayIntentBits, 
        Partials, Routes, EmbedBuilder, ActivityType, MessageFlags } = require('discord.js');
const config = require('./config.json');
const pkg = require('./package.json');
const colors = require('colors');
const os = require('os');
const fs = require('fs');
const path = require('path');
const commandFiles = 'guild help ping user world online'.split(' ');
let XMLHttpRequest = require('xhr2');
let envconfpath = path.join(__dirname, './.env');
let active = {
    world: {},
    date: ""
};
require('dotenv').config({ path: envconfpath });

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

global.bot = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
], partials: [Partials.Channel] });
global.bot.commands = new Collection();
global.color = '#' + config.bot.color;
global.botOwner = config.bot.owner;
global.version = pkg.version;
global.commands = [];
global.locals = [];
global.globals = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    global.bot.commands.set(command.data.name, command);
    if (command.local) global.locals.push(command.data.toJSON());
    else global.globals.push(command.data.toJSON());
    global.commands.push(command.data.toJSON())
}

function refreshPresence() {
    global.bot.user.setPresence({
        activities: [{
            name: 'v' + global.version,
            type: ActivityType.Custom
            // url: 'https://www.twitch.tv/ '
        }],
        status: 'idle'
    });
}

function testDate(t, n) {
    if (n - t < (1000 * 60)) return true;
    else return false;
}

function testForNewWorld() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let json = xhttp.responseText;
            let world = JSON.parse(json)[0];
            if (testDate(active.date, Date.now())) {
                active.world = world;
                active.date = new Date(world.gen_date).getTime();
                announceWorld();
            } else if (!active.world.name || world.name != active.world.name) {
                active.world = world;
                active.date = new Date(world.gen_date).getTime();
            }
        }
    };
    xhttp.open('GET', 'http://v2202410239072292297.goodsrv.de:5003/v1/worlds?api_token=&sort=created', true);
    xhttp.send();
    //http://v2202410239072292297.goodsrv.de:5003/v1/worlds?api_token=&sort=created
    // server = 237835843677585408
    // channel = 237836153968001025 (debug)
    // channel = 416409883592884225
}

async function announceWorld() {
    let biomes = {
        'plain': ['Temperate', 'https://media.discordapp.net/attachments/1041397042582388919/1323794948843372636/plain.png'],
        'arctic': ['Arctic', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949153755177/arctic.png'],
        'hell': ['Hell', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949979902022/hell.png'],
        'desert': ['Desert', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949782634569/desert.png'],
        'brain': ['Brain', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949405278308/brain.png'],
        'space': ['Space', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794948629467198/space.png'],
        'deep': ['Deep', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949602283652/deep.png']
    }
    let channel = global.bot.channels.cache.get('416409883592884225');
    try {
        await channel.messages.fetch({limit: 5}).then((messages) => {
            let needsToEdit = false;
            messages.forEach((msg) => {
                if (msg.author.id == global.bot.user.id) {
                    if (msg.content.length > 400) return;
                    if (msg.content.includes('new zone')) {
                        needsToEdit = true;
                        if (msg.content.includes('More have'))
                            msg.edit(msg.content + `, ${active.world.name} (${biomes[active.world.biome][0]})`);
                        else msg.edit(msg.content + `\n-# More have been found! ${active.world.name} (${biomes[active.world.biome][0]})`);
                        return;
                    }
                }
            }) 
            if (!needsToEdit)
                channel.send(`A new zone has been discovered ingame! Head to ${active.world.name} (${biomes[active.world.biome][0]})`);
        });
    } catch(e) {
        console.warn(e);
    }
}

function format(seconds){
    function pad(s) {
        return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60 * 60));
    var minutes = Math.floor(seconds % (60 * 60) / 60);
    var seconds = Math.floor(seconds % 60);
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

global.bot.once('ready', async () => {
    console.log('\n\n');
    console.log(colors.bold('     ███  ████  █████ █   █ █   █ ████').yellow);
    console.log(colors.bold('    █   █ █   █   █   █   █ █   █ █   █').yellow);
    console.log(colors.bold('    █████ ████    █   █████ █   █ ████').yellow);
    console.log(colors.bold('    █   █ █   █   █   █   █ █   █ █   █').yellow);
    console.log(colors.bold('    █   █ █   █   █   █   █  ███  █   █').yellow);
    console.log(colors.bold(`    v${global.version}\n`).yellow);
    console.log(colors.bold('    + ').green + `Logged in as `.cyan + colors.bold(global.bot.user.tag).red + '\n');
    refreshPresence();
    setInterval(testForNewWorld, 30000);
});

global.bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!global.bot.commands.has(interaction.commandName)) return;
    try {
        await global.bot.commands.get(interaction.commandName).execute(interaction);
    } catch (e) {
        if (interaction.user.id === config.bot.owner) await interaction.reply({ content: `Error: ${e}`, flags: MessageFlags.Ephemeral });
    }
});

global.bot.on('messageCreate', async message => { 
    const txt = message.content;
    if (message.author.id == config.bot.owner) {
        let botname = bot.user.username.toLowerCase();
        let intcom = (command) => txt.startsWith(botname + '.' + command);
        try {
            if (intcom('eval') || intcom('evalc')) {
                const content = txt.split(' ');
                try {
                    content.shift();
                    const evalText = Array.isArray(content) ? content.join(' ') : content;
                    console.log(evalText);
                    const out = eval('('+content+')');
                    if (intcom('evalc'))
                        await message.reply('```\n'+out+'\n```');
                    else
                        await message.reply(`eval > ${out}`);
                } catch(e) {
                    await message.reply('Eval failed with error: ' + e, { "allowed_mentions": { "parse": [] } });
                    console.warn(e);
                }
            }
            if (intcom('speak')) {
                const content = txt.split(' ');
                try {
                    content.shift();
                    await message.channel.send(content.join(' '));
                } catch(e) { }
            }
            if (intcom('end')) {
                console.log('Shutting Down...'.red);
                await message.reply('Emergency Shutdown Started').then(process.exit);
            }
            if (intcom('restart')) {
                process.on('exit', function () {
                    require('child_process').spawn(process.argv.shift(), process.argv, {
                        cwd: process.cwd(),
                        detached : true,
                        stdio: 'inherit'
                    });
                });
                console.log('Restarting...'.red);
                await message.reply('Emergency Restart Started').then(process.exit);
            }
            if (intcom('host') || intcom('info')) {
                const logEmbed = new EmbedBuilder()
                    .addFields({
                        name: 'Platform',
                        value: `${os.version()} - ${os.release()} / ${os.platform()}`
                    }, {
                        name: 'Host Type',
                        value: `"${os.hostname()}" ${os.type()} - ${os.machine()} / ${os.arch()}`
                    }, {
                        name: 'CPU And Memory',
                        value: `${os.cpus()[0].model} - Free Memory: ${os.freemem()}/${os.totalmem()} Bytes`
                    });
                await message.reply({ embeds: [logEmbed] });
            }
            if (intcom('reload')) {
                await message.reply(`Reloading REST commands...`);
                rest.put(Routes.applicationCommands(global.bot.user.id), { body: global.globals }).then( async (e) => {
                    rest.put(Routes.applicationGuildCommands(global.bot.user.id, config.bot.mainserver), { body: global.locals }).then( async () => {
                        rest.put(Routes.applicationGuildCommands(global.bot.user.id, config.bot.devserver), { body: global.locals }).then( async () => {
                            await message.channel.send((global.commands.length) + ' slash commands Updated');
                        });
                    });
                });
            }
            if (intcom('reset')) {
                await message.reply(`Deleting REST commands...`);
                rest.put(Routes.applicationCommands(global.bot.user.id), { body: [] }).then( async () => {
                    rest.put(Routes.applicationGuildCommands(global.bot.user.id, config.bot.mainserver), { body: [] }).then( async () => {
                        await message.channel.send((global.commands.length) + ' slash commands Deleted');
                    });
                });
            }
            if (intcom('process')|| intcom('info')) {
                let uptime = format(process.uptime());
                const logEmbed = new EmbedBuilder()
                    .addFields({
                        name: 'Process Data',
                        value: `PID: ${process.pid} - Uptime: ${uptime}`
                    }, {
                        name: 'Host and Mem',
                        value: `Platform: ${process.platform} - V8 Mem: ${process.memoryUsage().heapUsed}/${process.memoryUsage().heapTotal} Bytes`
                    });
                await message.reply({ embeds: [logEmbed] });
            }
            if (intcom('testDiscoveredWorld')) { // Unfinished
                announceWorld();
            }
            if (intcom('devvify')) {
                const content = txt.split(' ');
                try {
                    await message.guild.members.fetch(content[1]).then((member) => {
                        message.guild.roles.fetch('1320596062863626301').then((role) => {
                            member.roles.add(role);
                        })
                    });
                } catch(e) {
                    await message.reply('Eval failed with error: ' + e);
                }
            }
            if (intcom('induct')) {
                const content = txt.split(' ');
                try {
                    message.guild.members.fetch(content[1]).then((member) => {
                        member.roles.add('588145213776855050').then(() => {
                            member.roles.add('663513461438808094').then(() => {
                                message.reply(`${specMem.displayName} has been Inducted`);
                            });
                        });
                    });
                } catch(e) {
                    await message.reply('Eval failed with error: ' + e);
                }
            }
        } catch(e) {
            await message.reply('Failed with error: ' + e);
        }
    }
});

global.bot.login(process.env.TOKEN);
console.clear();