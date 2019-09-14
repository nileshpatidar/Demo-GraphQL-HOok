const mongoose = require('./index');
const Schema = mongoose.Schema;

const FollowFilterSchema = new Schema({
    follow_id: {
        type: Number
    },
    post_type: {
        type: String
    },
    follow_filter_id: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'Yes'
    },

});

const FollowFilterModel = mongoose.model('follow_filters', FollowFilterSchema);
module.exports = FollowFilterModel
