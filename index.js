"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInMinutes = exports.startUpTime = void 0;
const discord_js_1 = __importStar(require("discord.js"));
const wokcommands_1 = __importDefault(require("wokcommands"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const settings_schema_1 = __importDefault(require("./models/settings-schema"));
const streamer_schema_1 = __importDefault(require("./models/streamer-schema"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//SET TIME IT TAKES TO CHECK
let startUpTime = new Date();
exports.startUpTime = startUpTime;
let checkInMinutes = 6;
exports.checkInMinutes = checkInMinutes;
const client = new discord_js_1.default.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS
    ]
});
client.on('rateLimit', (info) => {
    console.log(`Discord -> Rate limit: ${info.path} hit. Timeout: ${info.timeout / 1000 + ' seconds' ? info.timeout : 'Unknown timeout '}`);
    exports.checkInMinutes = checkInMinutes = checkInMinutes + 1;
    console.log('Increasing Check Interval to: ' + checkInMinutes + 'minute(s)!');
});
client.on('guildCreate', (guild) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    (_a = guild.systemChannel) === null || _a === void 0 ? void 0 : _a.send(`Hello, I'm TwitchDot. Thank you for inviting me. Type !help to see my commands! Type !goauto to turn on automatic red dot application!`);
    let cTime = new Date();
    yield settings_schema_1.default.findOneAndUpdate({
        _id: guild.id
    }, {
        _id: guild.id,
        autoDot: 'off',
        updateIteration: 0,
        updateTime: cTime
    }, {
        upsert: true
    });
}));
client.on('guildDelete', (guild) => __awaiter(void 0, void 0, void 0, function* () {
    yield settings_schema_1.default.deleteOne({ _id: guild.id });
    yield streamer_schema_1.default.deleteOne({ _id: guild.id });
}));
client.on('error', (info) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Discord -> ERROR: ' + info.name + ' Description: ' + info.message);
}));
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    //BOT STARTED
    console.log('BOT READY!');
    //BOT CONNECT TO MONGO DATABASE
    yield mongoose_1.default.connect(process.env.MONGO_URI || '', {
        keepAlive: true,
    });
    console.log('MongoDB Connected! -> Updating Interation count for all servers...');
    //SET ALL SERVERS UPDATE ITERATION BACK TO 0
    yield settings_schema_1.default.bulkWrite([
        { updateMany: {
                "filter": { updateIteration: { $gt: 0 } },
                "update": {
                    $set: {
                        updateIteration: 0
                    }
                },
                "upsert": true
            }
        }
    ]);
    console.log('MongoDB Connected! -> Updating Interation count for all servers... DONE!');
    //INITIALIZE WOKCOMMANDS
    console.log('WOKCommands -> Initializing WOKCommands...');
    new wokcommands_1.default(client, {
        commandsDir: path_1.default.join(__dirname, 'commands'),
        typeScript: false,
        testServers: ['937180898024112258'],
        botOwners: ['409530259545915402'],
        mongoUri: process.env.MONGO_URI
    });
    console.log('WOKCommands -> Initializing WOKCommands... DONE!');
    console.log('DiscordBot -> Initializing Variables...');
    //INITIALIZE VARIABLES
    let databaseServers = yield settings_schema_1.default.count({ autoDot: 'on' });
    console.log('DiscordBot -> There are: ' + databaseServers + ' server(s) connected and recieving active polling!');
    databaseServers = databaseServers + 1;
    let checkInterval = (checkInMinutes * 60 * 1000) / databaseServers;
    console.log('DiscordBot -> Check Time: ' + checkInMinutes + ' minute(s) per server');
    console.log('DiscordBot -> Check Interval: ' + checkInterval / 1000 + ' second(s)');
    let uri = 'https://api.twitch.tv/helix/streams?user_login=';
    let intervalSince = 0;
    let twitchUser = 'NULL';
    let discordId = 'NULL';
    let guildId = 'NULL';
    let discordChannel = 'NULL';
    let forgottenChannel = 'NULL';
    let forgottenName = 'NULL';
    let newgottenName = 'NULL';
    let voiceChannelName = 'NULL';
    let newName = 'NULL';
    let addOrRem = true;
    let thisGuild = undefined;
    let thisChannel = undefined;
    let thisMember = undefined;
    console.log('DiscordBot -> Initializing Variables... DONE!');
    //FIX NAME OF CHANNEL ON MEMORY IF THERE IS A RED DOT IN IT
    function fixForgotten() {
        return __awaiter(this, void 0, void 0, function* () {
            if (forgottenChannel != 'NULL') {
                try {
                    thisGuild = undefined;
                    thisChannel = undefined;
                    forgottenName = 'NULL';
                    thisGuild = yield client.guilds.fetch(guildId);
                    thisChannel = thisGuild.channels.cache.get(forgottenChannel);
                    forgottenName = (thisChannel === null || thisChannel === void 0 ? void 0 : thisChannel.name) || 'NULL';
                    if (forgottenName != 'NULL') {
                        console.log('Discord -> Updating Voice Channel: ' + forgottenName + ' seeing if has dot...');
                        if (forgottenName.startsWith('🔴') == true) {
                            newgottenName = forgottenName.replace('🔴', '');
                            try {
                                thisChannel === null || thisChannel === void 0 ? void 0 : thisChannel.setName(newgottenName);
                                console.log('Discord -> Updating Voice Channel: ' + newgottenName + ' seeing if has dot...DONE!');
                                //SEE IF USER IS IN A CALL CURRENTLY
                                console.log("DiscordBot -> updating mongoDB...");
                                uploadFixForgotten();
                            }
                            catch (_a) {
                                console.log('Discord -> UNABLE TO UPDATE FORGOTTEN CHANNEL NAME');
                            }
                        }
                        else {
                            console.log("DiscordBot -> forgotten name does not contain red dot, updating MongoDB...");
                            uploadFixForgotten();
                        }
                    }
                    else {
                        console.log("DiscordBot -> UNABLE TO RETREIVE FORGOTTEN CHANNEL NAME");
                    }
                }
                catch (_b) {
                    console.log('Discord -> UNABLE TO GET FORGOTTEN CHANNEL INFORMATION');
                }
            }
            else {
                console.log("DiscordBot -> NO FORGOTTEN CHANNEL ON FILE");
            }
        });
    }
    //UPLOAD NEW FORGOTTEN CHANNEL TO MONGODB
    function uploadFixForgotten() {
        return __awaiter(this, void 0, void 0, function* () {
            if (discordChannel != 'NULL') {
                console.log('MongoDB -> Updating Forgotten Channel to: ' + discordChannel);
                //ONCE LAST CHANNEL HAS BEEN FIXED, CHANGE MEMORY TO NEW CHANNEL
                try {
                    yield streamer_schema_1.default.findOneAndUpdate({
                        _id: guildId
                    }, {
                        lastChannelId: discordChannel,
                    }, {
                        upsert: true
                    });
                }
                catch (_a) {
                    console.log('MongoDB -> UNABLE TO UPDATE MONODB DATABASE');
                }
            }
            else {
                console.log('MongoDB -> Updating Forgotten Channel to: NULL');
                //ONCE LAST CHANNEL HAS BEEN FIXED, CHANGE MEMORY TO NULL
                try {
                    yield streamer_schema_1.default.findOneAndUpdate({
                        _id: guildId
                    }, {
                        lastChannelId: 'NULL',
                    }, {
                        upsert: true
                    });
                }
                catch (_b) {
                    console.log('MongoDB -> UNABLE TO UPDATE MONODB DATABASE');
                }
            }
        });
    }
    //ADD OR REMOVE THE RED DOT IN THE DISCORD CHANNEL
    function updateRedDot() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                voiceChannelName = 'NULL';
                thisGuild = undefined;
                thisChannel = undefined;
                thisGuild = yield client.guilds.fetch(guildId);
                thisChannel = thisGuild.channels.cache.get(discordChannel);
                voiceChannelName = (thisChannel === null || thisChannel === void 0 ? void 0 : thisChannel.name) || 'NULL';
                console.log('DiscordBot -> Updating Voice Channel Name: ' + voiceChannelName + ' ...');
                //SEE IF CURRENT CALL IS ALREADY IN LIVE STATE
                if (addOrRem == true) {
                    //IF USER IS IN CALL THAT NEEDS A RED DOT
                    if (voiceChannelName != 'NULL' && voiceChannelName.startsWith('🔴') == false) {
                        console.log('DiscordBot -> Updating Voice Channel Name: ' + voiceChannelName + ' ...adding red dot');
                        newName = '🔴' + voiceChannelName;
                        try {
                            thisChannel === null || thisChannel === void 0 ? void 0 : thisChannel.setName(newName);
                            console.log('DiscordBot -> Updating Voice Channel Name: ' + voiceChannelName + ' ...DONE!');
                            //AFTER UPDATING NEW CHANNEL, SEE OF FORGOTTEN CHANNEL IS EMPTY, IF IT IS THEN UPLOAD NEW FORGOTTEN CHANNEL
                            if (forgottenChannel == 'NULL') {
                                uploadFixForgotten();
                            }
                        }
                        catch (_a) {
                            console.log('Discord -> UNABLE TO UPDATE VOICE CHANNEL NAME');
                        }
                        //IF USER IS IN CALL THAT DOES NOT NEED A RED DOT, CHECK TO SEE IF FORGOTTEN CHANNEL IS UP TO DATE
                    }
                    else if (voiceChannelName != 'NULL' && voiceChannelName.startsWith('🔴') == true) {
                        console.log('Discord -> Updating Voice Channel: ' + voiceChannelName + ' already has dot, now checking forgotten = current...');
                        if (discordChannel != forgottenChannel) {
                            console.log('Current discord channel: ' + discordChannel + ' does not equal database channel: ' + forgottenChannel + ' checking Forgotten Channel...');
                            fixForgotten();
                        }
                        else {
                            console.log('Current discord channel: ' + discordChannel + ' does equal database channel: ' + forgottenChannel + ' stop checking...');
                        }
                        //IF USER IS IN AN UNDEFINED CALL OR NO CALL
                    }
                    else {
                        console.log('Discord -> Updating Voice Channel: ' + voiceChannelName + ' UNABLE TO UPDATE, now checking forgotten...');
                        fixForgotten();
                    }
                }
                else {
                    //IF USER IS IN VOICE CHANNEL WITH RED DOT THAT NEEDS TO BE REMOVED
                    if (voiceChannelName != 'NULL' && voiceChannelName.startsWith('🔴') == true) {
                        newName = voiceChannelName.replace('🔴', '');
                        try {
                            thisChannel === null || thisChannel === void 0 ? void 0 : thisChannel.setName(newName);
                            console.log('Voice Channel Updated!');
                        }
                        catch (_b) {
                            console.log('Discord -> UNABLE TO UPDATE VOICE CHANNEL NAME');
                        }
                        //IF USER IS IN VOICE CHANNEL WITH NO RED DOT, CHECK FORGOTTEN INSTEAD
                    }
                    else if (voiceChannelName != 'NULL' && voiceChannelName.startsWith('🔴') == false) {
                        console.log('Discord -> Updating Voice Channel: ' + voiceChannelName + ' already has dot removed, now checking forgotten = current...');
                        if (discordChannel != forgottenChannel) {
                            console.log('Current discord channel: ' + discordChannel + ' does not equal database channel: ' + forgottenChannel + ' checking Forgotten Channel...');
                            fixForgotten();
                        }
                        else {
                            console.log('Current discord channel: ' + discordChannel + ' does equal database channel: ' + forgottenChannel + ' stop checking...');
                        }
                        //IF USER IS IN NO VOICE CHANNEL OR UNDEFINED, CHECK FORGOTTEN INSTEAD
                    }
                    else {
                        console.log('Discord -> Updating Voice Channel: ' + voiceChannelName + ' UNABLE TO UPDATE, now checking forgotten...');
                        fixForgotten();
                    }
                }
            }
            catch (_c) {
                console.log('Discord -> UNABLE TO ACCESS VOICE CHANNEL NAME');
            }
        });
    }
    console.log('DiscordBot -> Beginning Interval Server Check...');
    //CHECK INTERVAL FOR TWITCH STREAMERS LIVE = ADD RED DOT TO THEIR VOICE CHANNEL
    function autoRedDot() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('--------------------------------');
            console.log("DiscordBot -> IntervalUpdate: " + intervalSince);
            //GET INFORMATION FROM DATABASE
            console.log('MongoDB -> Fetching from Database: Server Settings');
            try {
                thisGuild = undefined;
                thisChannel = undefined;
                yield settings_schema_1.default.findOne({ autoDot: 'on', updateIteration: { $lte: intervalSince } }).then(result => {
                    guildId = result.id;
                });
                console.log('MongoDB -> ServerID: ' + guildId);
                //FOUND DISCORD SERVER, NOW GET TWITCH DISCORD USER INFORMATION FROM DATABASE
                thisGuild = yield client.guilds.fetch(guildId);
                discordId = 'NULL';
                twitchUser = 'NULL';
                forgottenChannel = 'NULL';
                uri = 'https://api.twitch.tv/helix/streams?user_login=';
                try {
                    console.log('MongoDB -> Fetching from Database: Streamer Settings');
                    yield streamer_schema_1.default.findOne({ _id: guildId }).then(result => {
                        discordId = result.userId;
                        twitchUser = result.text;
                        forgottenChannel = result.lastChannelId;
                    });
                    try {
                        discordChannel = 'NULL';
                        thisMember = undefined;
                        thisMember = yield thisGuild.members.fetch(discordId);
                        let discordUsername = thisMember.displayName;
                        console.log('MongoDB -> Twitch Username: ' + twitchUser);
                        console.log('MongoDB -> Discord Username: ' + discordUsername);
                        console.log('MongoDB -> Discord Forgotten Channel: ' + forgottenChannel);
                        discordChannel = thisMember.voice.channelId || 'NULL';
                        console.log('Discord -> Discord Current Channel: ' + discordChannel);
                        //ONCE AQUIRED DATABASE INFORMATION, INCREASE ITERATION FOR THIS SERVER
                        let newInterval = intervalSince + 1;
                        console.log('MongoDB -> Updating Server Iteration to: ' + newInterval);
                        let newDate = new Date();
                        yield settings_schema_1.default.findOneAndUpdate({
                            _id: guildId
                        }, {
                            updateIteration: newInterval,
                            updateTime: newDate
                        }, {
                            upsert: true
                        });
                        //CHECK IF USER IS IN CALL
                        if (discordChannel === 'NULL') {
                            console.log("DiscordBot -> Discord Channel is NULL");
                            //IF USER IS NO LONGER IN THE CALL, PULL UP LAST CHANNEL FROM DATABASE AND CHECK FOR CIRCLE TO REMOVE
                            console.log("DiscordBot -> Checking previous channel: " + forgottenChannel);
                            fixForgotten();
                        }
                        else {
                            //CHECK IF TWITCH USER ON FILE IS NOT NULL
                            if (twitchUser != 'NULL' && twitchUser != '') {
                                //LOOK UP TWITCH FOR USER IF LIVE
                                uri = uri + twitchUser;
                                console.log('Twitch -> Twitch uri: ' + uri);
                                try {
                                    console.log('Twitch -> Connecting to Twitch API...');
                                    let { data } = yield axios_1.default.get(uri, {
                                        method: 'GET',
                                        headers: {
                                            'Authorization': 'Bearer ' + process.env.TWITCH_TOKEN,
                                            'Client-Id': process.env.TWITCH_ID || 'NULL',
                                            'Content-Type': 'application/json'
                                        },
                                    });
                                    console.log('Twitch -> Twitch look up: ' + data.data[0].user_name + ' is live and recieved data!');
                                    //IF USER IS LIVE ON TWITCH AND IS IN DISCORD CALL, ADD DOT IN DISCORD TITLE
                                    try {
                                        addOrRem = true;
                                        updateRedDot();
                                    }
                                    catch (_a) {
                                        console.log('DiscordBot -> UNABLE TO UPDATE TITLE EVEN THOUGH TWITCH IS LIVE');
                                    }
                                }
                                catch (_b) {
                                    console.log('Twitch -> Twitch look up: ' + twitchUser + ' IS OFFLINE OR DOES NOT EXIST!');
                                    //IF USER IS NOT LIVE OR UNABLE TO READ BUT IS IN DISCORD CALL, REMOVE DOT IN DISCORD TITLE
                                    try {
                                        addOrRem = false;
                                        updateRedDot();
                                    }
                                    catch (_c) {
                                        console.log('DiscordBot -> UNABLE TO UPDATE TITLE EVEN THOUGH TWITCH IS NOT LIVE');
                                    }
                                }
                            }
                            else {
                                console.log("DiscordBot -> TWITCH USER ON FILE IS EMPTY: " + twitchUser);
                            }
                        }
                        //IF INFORMATION PROVIDED DOES NOT ALLOW CHANNEL AND USER SEARCHES       
                    }
                    catch (_d) {
                        console.log('Unable to find user with server id: ' + guildId + ' and user id: ' + discordId);
                    }
                    //IF INFORMATION PROVIDED DOES NOT ALLOW USER SEARCH 
                }
                catch (_e) {
                    console.log('Unable to find server with server id: ' + guildId);
                }
                //IF INFORMATION PROVIDED DOES NOT ALLOW SERVER SEARCH
            }
            catch (_f) {
                //IF NO SERVER EXISTS WITH AUTODOT ENABLED OR EQUAL OR LESS INTERATION, THEN INCREASE ITERATION
                console.log('MongoDB -> Unable to find server with autoDot enabled and interation: ' + intervalSince + ' increasing iteration.');
                intervalSince = intervalSince + 1;
                //UPDATE INTERVAL SETTINGS
                console.log('DiscordBot -> Creating new Interval...');
                databaseServers = yield settings_schema_1.default.count({ autoDot: 'on' });
                console.log('DiscordBot -> There are: ' + databaseServers + ' server(s) connected and recieving active polling!');
                databaseServers = databaseServers + 1;
                checkInterval = (checkInMinutes * 60 * 1000) / databaseServers;
                console.log('DiscordBot -> Check Time: ' + checkInMinutes + ' minute(s) per server');
                console.log('DiscordBot -> Check Interval: ' + checkInterval / 1000 + ' second(s)');
                clearInterval(thisInterval);
                thisInterval = setInterval(autoRedDot, checkInterval);
                console.log('DiscordBot -> Creating new Interval...DONE!');
            }
        });
    }
    //DYNAMIC INTERVAL FOR AUTOMATIC RED DOT APPLICATION
    console.log('DiscordBot -> Starting Interval...');
    let thisInterval = setInterval(autoRedDot, checkInterval);
}));
client.login(process.env.TOKEN);
