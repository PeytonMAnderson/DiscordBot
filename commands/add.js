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
const discord_js_1 = __importDefault(require("discord.js"));
const streamer_schema_1 = __importDefault(require("../models/streamer-schema"));
exports.default = {
    category: 'Configuration',
    description: 'Adds Twitch Streamer to list.',
    permissions: ['ADMINISTRATOR'],
    minArgs: 2,
    expectedArgs: '<user> <text>',
    slash: 'both',
    testOnly: false,
    guildOnly: true,
    options: [{
            name: 'user',
            description: 'The target discord user.',
            required: true,
            type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.USER
        },
        {
            name: 'text',
            description: 'The target twitch user.',
            required: true,
            type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
        }],
    callback: ({ guild, message, interaction, args }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!guild) {
            return 'Please use this command in a server.';
        }
        const target = message ? message.mentions.users.first() : interaction.options.getUser('user');
        if (!target) {
            return 'Please tag a user in the server.';
        }
        let text = interaction === null || interaction === void 0 ? void 0 : interaction.options.getString('text');
        if (message) {
            args.shift();
            text = args.join(' ');
        }
        try {
            //ACCESS MONGODB TO UPDATE INFORMATION
            console.log('MongoDB -> Fetching from MongoDB for user command (add)');
            yield streamer_schema_1.default.findOneAndUpdate({
                _id: guild.id
            }, {
                _id: guild.id,
                userId: target.id,
                lastChannelId: 'NULL',
                text
            }, {
                upsert: true
            });
        }
        catch (_a) {
            console.log('MongoDB -> UNABLE TO ACCESS MONGODB CANNOT EXECUTE USER COMMAND (add)');
            return 'Unable to add the user to the database...';
        }
        return 'User added to database!';
    })
};
