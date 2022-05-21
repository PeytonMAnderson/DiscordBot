"use strict";
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
const discord_js_1 = require("discord.js");
const streamer_schema_1 = __importDefault(require("../models/streamer-schema"));
const settings_schema_1 = __importDefault(require("../models/settings-schema"));
const index_1 = require("../index");
exports.default = {
    category: 'Information',
    description: 'Lists streamer information on file.',
    permissions: ['ADMINISTRATOR'],
    slash: 'both',
    testOnly: false,
    guildOnly: true,
    callback: ({ guild }) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        let twitchUser = '';
        let discordId = '';
        let lastKnownChannel = '';
        let autoDotSetting = '';
        let currentInteration = 0;
        let oldUpdateTime = new Date();
        console.log('MongoDB -> Fetching from database for user command (list)');
        if (!guild) {
            return 'Must be in server!';
        }
        //GET INFORMATION IN TWITCH STREAMERS DOC
        try {
            yield streamer_schema_1.default.findOne({ _id: guild.id }).then(result => {
                discordId = result.userId;
                twitchUser = result.text;
                lastKnownChannel = result.lastChannelId;
            });
        }
        catch (_b) {
            console.log('MongoDB -> UNABLE TO FETCH USER COMMAND (list) FOR STREAMER DATA');
            return 'Unable to get information from the database [OR] No streamer user on file. Use: !add <discord_username> <twitch_username>';
        }
        //GET INFORMATION IN SERVER SETTINGS DOC
        try {
            yield settings_schema_1.default.findOne({ _id: guild.id }).then(result => {
                autoDotSetting = result.autoDot;
                currentInteration = result.updateIteration;
                oldUpdateTime = result.updateTime;
            });
        }
        catch (_c) {
            console.log('MongoDB -> UNABLE TO FETCH USER COMMAND (list) FOR SETTINGS DATA');
            return 'Unable to get information from the database. Try: !goauto/!stopauto [OR] remove the bot and add it again.';
        }
        let discordUser = guild.members.fetch(discordId);
        let discordName = (yield discordUser).user.username;
        let discordDisc = (yield discordUser).user.discriminator;
        let discordChannelName = 'NULL';
        if (lastKnownChannel != 'NULL') {
            discordChannelName = ((_a = guild.channels.cache.get(lastKnownChannel)) === null || _a === void 0 ? void 0 : _a.name) || 'NULL';
        }
        let currentInterationString = currentInteration.toString();
        //DATE AND TIME
        let cDate = new Date();
        let fDate = cDate.getTime() - oldUpdateTime.getTime();
        let updateString = '';
        if (fDate / 86400000 < 1) {
            if (fDate / 3600000 < 1) {
                if (fDate / 60000 < 1) {
                    fDate = fDate / 1000;
                    updateString = fDate.toFixed() + ' Second';
                    if (fDate >= 2) {
                        updateString = updateString + 's';
                    }
                    updateString = updateString + ' ago';
                }
                else {
                    fDate = fDate / 60000;
                    updateString = fDate.toFixed() + ' Minute';
                    if (fDate >= 2) {
                        updateString = updateString + 's';
                    }
                    updateString = updateString + ' ago';
                }
            }
            else {
                fDate = fDate / 3600000;
                updateString = fDate.toFixed() + ' Hour';
                if (fDate >= 2) {
                    updateString = updateString + 's';
                }
                updateString = updateString + ' ago';
            }
        }
        else {
            fDate = fDate / 86400000;
            updateString = fDate.toFixed() + ' Day';
            if (fDate >= 2) {
                updateString = updateString + 's';
            }
            updateString = updateString + ' ago';
        }
        const embed = new discord_js_1.MessageEmbed()
            .setDescription("Server Information")
            .setTitle("TwitchDot")
            .setColor("GREEN")
            .addFields([
            {
                name: '🔵Discord: ',
                value: discordName + '#' + discordDisc,
            },
            {
                name: '🟣Twitch: ',
                value: twitchUser,
            },
            {
                name: '🔴 Auto Dot: ',
                value: autoDotSetting,
            },
            {
                name: 'Bot Updates Since Start Up: ',
                value: 'Updates: ' + currentInterationString
            },
            {
                name: 'Last Known Discord Voice Channel: ',
                value: discordChannelName,
            },
            {
                name: 'Other: ',
                value: 'Bot Start Up Time: ' + index_1.startUpTime.toLocaleTimeString('en-us', { timeZoneName: 'short' }) + ' ' + index_1.startUpTime.toLocaleDateString() +
                    '\n Server Update Interval: ' + index_1.checkInMinutes + ' Minutes' +
                    '\nLast Updated: ' + updateString,
            },
        ]);
        return embed;
    })
};
