import DJS from 'discord.js'
import { ICommand } from "wokcommands";
import streamerSchema from '../models/streamer-schema';

export default {
    category: 'Configuration',
    description: 'Adds Twitch Streamer to list.',

    permissions: ['ADMINISTRATOR'],

    slash: 'both',
    testOnly: false,
    guildOnly: true,

    callback: async ({guild}) => {
        if (!guild) {
            return 'Please use this command in a server.'
        }
        try {
            //ACCESS MONGODB TO UPDATE INFORMATION
            console.log('MongoDB -> Fetching from MongoDB for user command (remove)')
            await streamerSchema.findOneAndDelete({_id: guild.id})
        } catch {
            console.log('MongoDB -> UNABLE TO ACCESS MONGODB CANNOT EXECUTE USER COMMAND (remove)')
            return 'Unable to add the user to the database...'
        }
        return 'Streamer Settings removed from database!'
    }
} as ICommand