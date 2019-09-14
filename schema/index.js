const {
    buildSchema
} = require("graphql");

module.exports = buildSchema(`   

input getPostInput {
    member_id:String!
    limit:Int
    timeline:String
    post_type :String
    mobile:String
    specific_post:String
    profile_member_id:String
    skip:Int
    visibility:String
    multiple_specific_post:[String]
}
type Count{
    post_image_like_id:Int
    post_id:Int
    image_id:Int
}
type postImageType {
    post_image_id:Int
    member_id:String
    post_id:Int
    image:String
    status:String
    created_date:String
    image_type:String
    image_description:String
    image_location:String
    image_date:String
    tag_member_id:String
    video_thumb:String
    original_image:String
    photo_crop_skip:String
    image_count: Int
    total_like: Int
    member_like_status: String
    commentcount: Int
    get_viewer: Int
    image_commentcount:Int
    post_image_likes:Int
} 
  
type poll_question_list {
    first_name:String
    last_name:String
    member_gender:String
    ask_option_choice_id:Int
    profileimage:String
    member_id:String
    option_choice_no:Int
    mutualfriend:Int
    friend_status:String
}
type Turnup{
    first_name:String
    last_name:String
    member_gender:String
    sender_id:String
    profileimage:String
    receiver_id:String
    post_id:Int
    like_status: String
}
type ResponsePost {
    event_status:String
    seting:Boolean
        GiverModalVisibility:String
        ExchangeModalVisibility:String
        MessageExchangeOfferModal:String
        RenterModalVisibility:String
        SellModalVisibility:String
        MakeOfferModalVisibility:String
        WantedModalVisibility:String
        DealWantedModalVisibility:String
        askMemberModalVisibility:String
        poll_question1_list:[poll_question_list]
        poll_question2_list:[poll_question_list]
        poll_question1_percentage:Int
        poll_question2_percentage:Int
        poll_question1_total:Int
        poll_question2_total:Int
        askpostid:Int
        ask_selected_option:Int
        turnuplike:[Turnup]
        room:String
        kitchen: String
        bathroom: String
        sqft: String
        amount: String
        auto_play_video: String
        auto_replay_video: String
        availability: String
        category_id: String
        category_type: String
        comment_model: String
        connection_status: String
        courtesy: String
        desc: String
        discount_offer: String
        end_budget: String
        end_datetime: String
        exchange_with: String
        first_name: String
        gender: String
        give_subcategorytype: String
        hosted_by: String
        id: Int
        _id: String
        is_anonymous: String
        is_open_end: Boolean
        job_time_duration: String
        job_type: String
        last_name: String
        lat: String
        location: String
        long: String
        member_id: String
        muted_video: String
        opportunity_job_title: String
        opportunity_salary: String
        origional_Price: String
        parent_description: String
        parent_member_id: String
        parent_post_id: String
        parent_post_image_id: String
        payment_details: String
        pending_status: String
        poll_open_time: String
        poll_question1: String
        poll_question2: String
        poll_question3: String
        poll_question4: String
        poll_question5: String
        poll_question6: String
        post_id: Int
        post_title: String
        post_type: String
        price: String
        product_status: String
        rent_time_duration: String
        start_budget: String
        start_datetime: String
        status: String
        ticket_information: String
        video_comments: String
        video_post_wall:String
        video_repeat: String
        video_volume: Int
        visibility: String
        post_create_date: String
        post_year: Int
        hide_count: Int
        commentlikesetting: Boolean
        commentviewmypost: Boolean
        commentonmypost: Boolean
        notification_time: String
        full_date: String
        post_label: String
        create_Going: Int
        create_Interested: Int
        create_no: Int
        post_image:[postImageType]
        profileimage: String
        category_name: String
        member_gender:String
        profilecover: String
        resize_post_image: [[String]]
        total_like:Int
        member_like_status: String
        commentcount: Int
        mylike_string: Boolean
        savepost: Int
        sharepost: Int
        savepostvisible: Boolean
        image_share_post: Boolean
        profile_storie: Boolean
}

 
type RootQuery {
    memberdetails(memberID:String!) : String
    getposts(params:getPostInput) : [ResponsePost!] 
}
type RootMutation {
    memberdetails(memberID:String!) : String
    
}
schema {
    query: RootQuery
    mutation: RootMutation
}
`);