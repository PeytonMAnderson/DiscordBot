import mongoose, {Schema} from 'mongoose'

const reqString = {
    type: String,
    required: true
}

const streamerSchema = new Schema({
    //Guild ID
    _id: reqString,
    userId: reqString,
    lastChannelId: reqString,
    text: reqString
})

const name = 'Twitch Streamers'
export default mongoose.models[name] || mongoose.model(name, streamerSchema, name)