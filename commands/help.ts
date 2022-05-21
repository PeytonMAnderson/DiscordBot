import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";

export default {
    category: 'Information',
    description: 'Sends Help menu',
    
    callback: ({ message, text }) => {
        const embed = new MessageEmbed()
        .setDescription("TwitchDot Commands:")
        .setTitle("TwitchDot Help Menu")
        .setColor("RED")
        .addFields([
            {
                name:'golive',
                value: 'Adds red dot 🔴 to the current channel',
            },
            {
                name:'stoplive',
                value: 'Removes the red dot 🔴 from the current channel',
            },
            {
                name:'goauto',
                value: 'Enables automatic red dot application for the server',
            },
            {
                name:'stopauto',
                value: 'Disables automatic red dot application for the server',
            },
            {
                name:'add <@discord_username> <twitch username>',
                value: 'Enables automatic red dot application for the server',
            },
            {
                name:'remove',
                value: 'Removes all information on the database for the Streamer',
            },
            {
                name:'get <twitch username>',
                value: 'Gets information for a twitch channel if they are live',
            },
            {
                name:'list',
                value: 'Lists all information for the server that is stored on the database',
            },
            {
                name:'help',
                value: 'Brings up this help menu',
            },
        ])
        return embed
    },
} as ICommand