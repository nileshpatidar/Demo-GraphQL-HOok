const mongoose = require('./index');
const Schema = mongoose.Schema;

const followsSchema = new Schema({
    follow_id: {
        type: Number
    },
    member_id: {
        type: String
    },
    following_id: {
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
        default: 'Active'
    },

});

const followsModel = mongoose.model('follows', followsSchema);
module.exports = followsModel
