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
const settings_schema_1 = __importDefault(require("../models/settings-schema"));
exports.default = {
    category: 'Configuration',
    description: 'Turn on automatic red dot.',
    permissions: ['ADMINISTRATOR'],
    slash: 'both',
    testOnly: false,
    guildOnly: true,
    callback: ({ guild, message, interaction, args }) => __awaiter(void 0, void 0, void 0, function* () {
        let cTime = new Date();
        if (!guild) {
            return 'Please use this command in a server.';
        }
        try {
            console.log('MongoDB -> Fetching from MongoDB for user command (stopauto)');
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
        }
        catch (_a) {
            console.log('MongoDB -> UNABLE TO ACCESS MONGODB FOR USER COMMAND (stopauto)');
            return 'Unable to update server information...';
        }
        return 'Settings Updated!';
    })
};
