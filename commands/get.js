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
const axios_1 = __importDefault(require("axios"));
exports.default = {
    category: 'Information',
    description: 'Get request to Twitch',
    permissions: ['ADMINISTRATOR'],
    maxArgs: 1,
    expectedArgs: '<username>',
    expectedArgsTypes: ['STRING'],
    slash: 'both',
    testOnly: false,
    callback: ({ args }) => __awaiter(void 0, void 0, void 0, function* () {
        let uri = 'https://api.twitch.tv/helix/streams?user_login=';
        if (args.length) {
            uri += `${args[0]}`;
        }
        else {
            return 'Please enter a username!';
        }
        try {
            //ACCESS TWITCH API FOR TWITCH USER INFORMATION
            console.log('Twitch  -> Fetching from Twitch for user command (get)');
            let { data } = yield axios_1.default.get(uri, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + process.env.TWITCH_TOKEN,
                    'Client-Id': process.env.TWITCH_ID || 'NULL',
                    'Content-Type': 'application/json'
                },
            });
            console.log('Twitch  -> Twitch look up: ' + data.data[0].user_name);
            return 'The user: ' + data.data[0].user_name + ' is currently live with ' + data.data[0].viewer_count + ' viewers watching ' + data.data[0].game_name;
        }
        catch (_a) {
            return 'The user: ' + args[0] + ' is currently offline!';
        }
    }),
};
