import mongoose, {Schema} from 'mongoose'

const reqString = {
    type: String,
    required: true
}

const reqNumber = {
    type: Number,
    required: true
}

const reqDate = {
    type: Date,
    required: true
}

const settingsSchema = new Schema({
    //Guild ID
    _id: reqString,
    autoDot: reqString,
    updateIteration: reqNumber,
    updateTime: reqDate
})

const name = 'Server Settings'
export default mongoose.models[name] || mongoose.model(name, settingsSchema, name)