const mongoose = require('./index');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    post_id: {
        type: String
    },
    post_type: {
        type: String
    },
    member_id: {
        type: String
    },
    desc: {
        type: String
    },
    location: {
        type: String
    },
    visibility: {
        type: String,
        enum: ['Public', 'Connections', 'Only Me', 'Custom'],
        default: 'Public',
    },
    lat: {
        type: String
    },
    long: {
        type: String
    },
    category_id: {
        type: String
    },
    payment_details: {
        type: String
    },
    post_title: {
        type: String
    },
    start_datetime: {
        type: Date
    },
    end_datetime: {
        type: Date
    },
    category_type: {
        type: String
    },
    amount: {
        type: String
    },
    ticket_information: {
        type: String
    },
    hosted_by: {
        type: String
    },
    product_status: {
        type: String
    },
    origional_Price: {
        type: Number
    },
    discount_offer: {
        type: Number
    },
    price: {
        type: Number
    },
    poll_question1: {
        type: String
    },
    poll_question2: {
        type: String
    },
    poll_question3: {
        type: String
    },
    poll_question4: {
        type: String
    },
    poll_question5: {
        type: String
    },
    poll_question6: {
        type: String
    },
    is_open_end: {
        type: String,
        enum: ['True', 'False'],
        default: 'False'
    },

    is_anonymous: {
        type: String
    },
    courtesy: {
        type: String
    },
    exchange_with: {
        type: String
    },
    start_budget: {
        type: Number
    },
    end_budget: {
        type: Number
    },
    parent_member_id: {
        type: String
    },
    parent_post_id: {
        type: Number
    },
    parent_description: {
        type: String
    },
    parent_post_image_id: {
        type: String
    },
    comment_model: {
        type: String,
        enum: ['Enable', 'Disable'],
        default: 'Disable',
    },
    album_pick_date: {
        type: Date
    },

    opportunity_job_title: {
        type: String
    },
    opportunity_salary: {
        type: Number
    },
    job_time_duration: {
        type: String
    },
    job_type: {
        type: String
    },
    give_subcategorytype: {
        type: String
    },
    availability: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    auto_replay_video: {
        type: String,
        enum: ['true', 'false'],
        default: 'false'
    },
    video_post_wall: {
        type: String,
        enum: ['true', 'false'],
        default: 'false'
    },
    pending_status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    rent_time_duration: {
        type: String
    },
    room: {
        type: String
    },
    kitchen: {
        type: String
    },
    bathroom: {
        type: String
    },
    sqft: {
        type: String
    },
    post_currency: {
        type: String
    },
    album_type: {
        type: String
    }
}, { timestamps: { createdAt: 'create_date' } });

const PostModel = mongoose.model('posts', PostSchema);
module.exports = PostModel


