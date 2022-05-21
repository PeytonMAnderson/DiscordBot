"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    category: 'Configuration',
    description: 'Adds red dot 🔴 to show live channel!',
    callback: ({ message }) => {
        var _a, _b, _c, _d;
        let voiceChannelName = (_b = (_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel) === null || _b === void 0 ? void 0 : _b.name;
        if (!voiceChannelName) {
            message.reply('No voice channel detected! (Wait for discord to update status and try again)');
        }
        else {
            let newName = '🔴' + voiceChannelName;
            (_d = (_c = message.member) === null || _c === void 0 ? void 0 : _c.voice.channel) === null || _d === void 0 ? void 0 : _d.setName(newName);
            message.reply('Your new Voice Channel name is: ' + newName + '. If the channel did not update please wait 10+ minutes to take effect! (Possible Update Limit Hit!)');
        }
    },
};
