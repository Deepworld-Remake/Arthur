const { Client, Collection, REST, GatewayIntentBits, 
        Partials, Routes, EmbedBuilder, ActivityType } = require('discord.js');
const config = require('./config.json');
const pkg = require('./package.json');
const colors = require('colors');
const os = require('os');
const fs = require('fs');
const path = require('path');
const commandFiles = 'guild help ping speak user world online'.split(' ');
let active = require('./active.json');
let XMLHttpRequest = require('xhr2');
let envconfpath = path.join(__dirname, './.env');
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
                active.date = new Date(world.gen_date);
                announceWorld();
                fs.writeFileSync('./active.json', JSON.stringify(active));
            } else if (!active.world.name || world.name != active.world.name) {
                active.world = world;
                active.date = new Date(world.gen_date);
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

function announceWorld() {
    let biomes = {
        'plain': ['Temperate', 'https://media.discordapp.net/attachments/1041397042582388919/1323794948843372636/plain.png'],
        'arctic': ['Arctic', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949153755177/arctic.png'],
        'hell': ['Hell', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949979902022/hell.png'],
        'desert': ['Desert', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949782634569/desert.png'],
        'brain': ['Brain', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949405278308/brain.png'],
        'space': ['Space', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794948629467198/space.png'],
        'deep': ['Deep', 'https://cdn.discordapp.com/attachments/1041397042582388919/1323794949602283652/deep.png']
    }
    global.bot.channels.cache.get('416409883592884225').send(`A new zone has been discovered ingame! Head to ${active.world.name} (${biomes[active.world.biome][0]})`);
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

global.bot.once('ready', () => {
    console.log('\n\n');
    console.log(colors.bold('     ███  ████  █████ █   █ █   █ ████').yellow);
    console.log(colors.bold('    █   █ █   █   █   █   █ █   █ █   █').yellow);
    console.log(colors.bold('    █████ ████    █   █████ █   █ ████').yellow);
    console.log(colors.bold('    █   █ █   █   █   █   █ █   █ █   █').yellow);
    console.log(colors.bold('    █   █ █   █   █   █   █  ███  █   █').yellow);
    console.log(colors.bold(`    v${global.version}\n\n`).yellow);
    console.log(colors.bold(' + ').green + `Logged in as `.cyan + colors.bold(global.bot.user.tag).red + '\n');
    refreshPresence();
    setInterval(testForNewWorld, 30000);
});

global.bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!global.bot.commands.has(interaction.commandName)) return;
    try {
        await global.bot.commands.get(interaction.commandName).execute(interaction);
    } catch (error) {
        if (interaction.user.id === config.bot.owner) {
            await interaction.reply({ content: `Error: ${error}`, ephemeral: true });
            console.log(error);
        }
    }
});

global.bot.on('messageCreate', message => { 
    const txt = message.content;
    if (message.author.id == config.bot.owner) {
        let botname = bot.user.username.toLowerCase();
        let intcom = (command) => txt.startsWith(botname + '.' + command);
        try {
            if (intcom('eval')) {
                const content = txt.split(' ');
                try {
                    content.shift();
                    const evalText = Array.isArray(content) ? content.join(' ') : content;
                    const out = eval('('+content+')');
                    message.reply(`eval > ${out}`);
                } catch(e) {
                    message.reply('Eval failed with error: ' + e);
                }
            }
            if (intcom('end')) {
                console.log('Shutting Down...'.red);
                message.reply('Emergency Shutdown Started').then(process.exit);
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
                message.reply('Emergency Restart Started').then(process.exit);
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
                message.reply({ embeds: [logEmbed] });
            }
            if (intcom('reload')) {
                message.reply(`Reloading REST commands...`);
                rest.put(Routes.applicationCommands(global.bot.user.id), { body: global.globals }).then((e) => {
                    rest.put(Routes.applicationGuildCommands(global.bot.user.id, config.bot.mainserver), { body: global.locals }).then(() => {
                        message.channel.send((global.commands.length) + ' slash commands Updated');
                    });
                });
            }
            if (intcom('reset')) {
                message.reply(`Deleting REST commands...`);
                rest.put(Routes.applicationCommands(global.bot.user.id), { body: [] }).then(() => {
                    rest.put(Routes.applicationGuildCommands(global.bot.user.id, config.bot.mainserver), { body: [] }).then(() => {
                        message.channel.send((global.commands.length) + ' slash commands Deleted');
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
                message.reply({ embeds: [logEmbed] });
            }
            if (intcom('testDiscoveredWorld')) { // Unfinished
                announceWorld();
            }
        } catch(e) {
            message.reply('Failed with error: ' + e);
        }
    }
});

global.bot.login(process.env.TOKEN);
console.clear();