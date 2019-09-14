const mongoose = require('./index');
const Schema = mongoose.Schema;

const postCategorySchema = new Schema({
    category_id: {
        type: Number
    },
    category_name: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'inActive', 'Delete'],
        default: 'Active'

    },
    lowercase_category_name: {
        type: String,
        default: null
    },
    category_icon: {
        type: String,
        default: null

    },
    other_field_status: {
        type: Boolean,
        default: false
    },
    mobile_category_icon: {
        type: String,
        default: null

    },
    parent_id: {
        type: Number
    }

});

const postCategoryModel = mongoose.model('post_category', postCategorySchema);
module.exports = postCategoryModel


