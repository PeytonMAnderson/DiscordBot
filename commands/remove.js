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
const streamer_schema_1 = __importDefault(require("../models/streamer-schema"));
exports.default = {
    category: 'Configuration',
    description: 'Adds Twitch Streamer to list.',
    permissions: ['ADMINISTRATOR'],
    slash: 'both',
    testOnly: false,
    guildOnly: true,
    callback: ({ guild }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!guild) {
            return 'Please use this command in a server.';
        }
        try {
            //ACCESS MONGODB TO UPDATE INFORMATION
            console.log('MongoDB -> Fetching from MongoDB for user command (remove)');
            yield streamer_schema_1.default.findOneAndDelete({ _id: guild.id });
        }
        catch (_a) {
            console.log('MongoDB -> UNABLE TO ACCESS MONGODB CANNOT EXECUTE USER COMMAND (remove)');
            return 'Unable to add the user to the database...';
        }
        return 'Streamer Settings removed from database!';
    })
};
