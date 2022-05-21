import DJS from 'discord.js'
import { ICommand } from "wokcommands";
import settingsSchema from '../models/settings-schema';

export default {
    category: 'Configuration',
    description: 'Turn on automatic red dot.',

    permissions: ['ADMINISTRATOR'],

    slash: 'both',
    testOnly: false,
    guildOnly: true,

    callback: async ({ guild, message, interaction, args}) => {

        let cTime = new Date()

        if (!guild) {
            return 'Please use this command in a server.'
        }
        try {
            console.log('MongoDB -> Fetching from MongoDB for user command (stopauto)')
            await settingsSchema.findOneAndUpdate({
                _id: guild.id
            }, {
                _id: guild.id,
                autoDot: 'off',
                updateIteration: 0,
                updateTime: cTime
            }, {
                upsert: true
            })
        } catch {
            console.log('MongoDB -> UNABLE TO ACCESS MONGODB FOR USER COMMAND (stopauto)')
            return 'Unable to update server information...'            
        }
        return 'Settings Updated!'
    }
} as ICommand