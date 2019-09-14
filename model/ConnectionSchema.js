const mongoose = require('./index');
const Schema = mongoose.Schema;

const connectionsSchema = new Schema({
    connection_id: {
        type: Number
    },
    member_id: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'inActive', 'Delete'],
        default: 'Active'

    },
    connection_status: {
        type: String,
        enum: ['Requested', 'Connection', 'Unconnection', 'Deleted', 'Blocked'],
        default: 'Unconnection'

    },
    friend_member_id: {
        type: String
    },
    nickname: {
        type: String
    },
    request_date: {
        type: Date
    },

}, { timestamps: { createdAt: 'create_date' } });

const connectionsModel = mongoose.model('connections', connectionsSchema);
module.exports = connectionsModel


