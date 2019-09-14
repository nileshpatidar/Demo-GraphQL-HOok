const PostSchema = require('../model/postSchema');
const postCategoryModel = require('../model/postCategory');
const ConnectionModel = require('../model/ConnectionSchema');
const FollowModel = require('../model/followSchema');

module.exports = {
    getposts: async (args, res) => {
        try {
            if (args.params.post_id != '') {
                var post_id = args.params.post_id;
            } else {
                var post_id = ""
            }
            if (args.query.limit != '') {
                var limit = parseInt(args.query.limit);
            } else {
                var limit = 5
            }
            if (args.query.skip != '') {
                var skip = parseInt(args.query.skip);
            } else {
                var skip = 0;
            }
            if (args.params.timeline != '') {
                var timeline = "Profile";
            } else {
                var timeline = ""
            }
            if (args.params.profile_member_id != '') {
                var profile_member_id = args.params.profile_member_id;
            } else {
                var profile_member_id = ""
            }
            if (args.params.specific_post != '') {
                var specific_post = args.params.specific_post;
            } else {
                var specific_post = ""
            }
            if (args.params.multiple_specific_post != '') {
                var multiple_specific_post = args.params.multiple_specific_post;
            } else {
                var multiple_specific_post = ""
            }

            var condition = {}
            if (args.params.multiple_specific_post) {
                var multiple_specific_post = args.params.multiple_specific_post
                condition.post_type = { "$in": multiple_specific_post }
            }
            if (args.params.specific_post) {
                condition.post_type = args.params.specific_post;
            }
            var member_id = args.query.member_id;
            var Connection = await ConnectionModel.aggregate([
                { $match: { $or: [{ friend_member_id: member_id, connection_status: 'Connection', status: 'Active' }, { member_id: member_id, connection_status: 'Connection', status: 'Active' }] } },
                { $project: { member_id: 1, friend_member_id: 1 } },
                { "$group": { "_id": 0, "userid": { "$push": { "$cond": [{ "$eq": ["$member_id", member_id] }, "$friend_member_id", "$member_id"] } } } },
            ])
            var userid = Connection[0].userid

            var Follow = await FollowModel.aggregate([
                { $match: { member_id: member_id, status: 'Active' } },
                { $project: { member_id: 1, following_id: 1, follow_id: 1 } },
                //follofilter lookup
                { "$group": { "_id": 0, post_type: { "$push": "$following_id" } } },
                { $project: { post_type: 1, _id: 0 } },
                { $sort: { create_date: -1 } },
            ])
            var Follow = Follow[0].post_type

            var post_label = {
                "post_label": {
                    $cond: {
                        if: { $eq: ["hoookedup", "$post_type"] }, then: "Hook Me Up!!!", else: {
                            $cond: {
                                if: { $eq: ["snapit", "$post_type"] }, then: "Snap It", else: {
                                    $cond: {
                                        if: { $eq: ["fillme", "$post_type"] }, then: "Just In!!!", else: {
                                            $cond: {
                                                if: { $eq: ["good_deed", "$post_type"] }, then: "Good Deeds", else: {
                                                    $cond: {
                                                        if: { $eq: ["Profile", "$post_type"] }, then: "", else: {
                                                            $cond: {
                                                                if: { $eq: ["Cover", "$post_type"] }, then: "", else: {
                                                                    $cond: {
                                                                        if: { $eq: ["give", "$post_type"] }, then: "Free Stuff", else: {
                                                                            $cond: {
                                                                                if: { $eq: ["ask", "$post_type"] }, then: "I Need Answers !", else: {
                                                                                    $cond: {
                                                                                        if: { $eq: ["opportunity", "$post_type"] }, then: {
                                                                                            $cond: {
                                                                                                if: { $eq: ["give_opportunity", "$category_type"] }, then: "Giving Opportunity", else: "Seeking Opportunity"
                                                                                            }
                                                                                        }, else: {
                                                                                            $cond: {
                                                                                                if: { $eq: ["situation_room", "$post_type"] }, then: "Situation Room", else: {
                                                                                                    $cond: {
                                                                                                        if: { $eq: ["turnup", "$post_type"] }, then: "Turn Up", else: {
                                                                                                            $cond: {
                                                                                                                if: { $eq: ["Exchange", "$category_type"] }, then: "For Exchange", else: {
                                                                                                                    $cond: {
                                                                                                                        if: { $eq: ["Rent", "$category_type"] }, then: "For Rent", else: {
                                                                                                                            $cond: {
                                                                                                                                if: { $eq: ["Sell", "$category_type"] }, then: "For Sell", else: {
                                                                                                                                    $cond: {
                                                                                                                                        if: { $eq: ["Wanted", "$category_type"] }, then: "Wanted", else: ""
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            var give = { "GiverModalVisibility": { $cond: { if: { $eq: ["give", "$post_type"] }, then: false, else: "$$REMOVE" } } }

            var askpostid = {
                "askpostid": {
                    $cond: {
                        if: { $ne: ["ask", "$post_type"] }, then: "$$REMOVE", else: { $cond: { if: "$parent_post_id", then: "$parent_post_id", else: { $toInt: "$post_id" } } }
                    }
                }

            }
            var extrafiled = {
                "ExchangeModalVisibility": { $cond: { if: { $eq: ["Exchange", "$category_type"] }, then: false, else: "$$REMOVE" } },
                "MessageExchangeOfferModal": { $cond: { if: { $eq: ["Exchange", "$category_type"] }, then: false, else: "$$REMOVE" } },
                "RenterModalVisibility": { $cond: { if: { $eq: ["Rent", "$category_type"] }, then: false, else: "$$REMOVE" } },
                "SellModalVisibility": { $cond: { if: { $eq: ["Sell", "$category_type"] }, then: false, else: "$$REMOVE" } },
                "MakeOfferModalVisibility": { $cond: { if: { $eq: ["Sell", "$category_type"] }, then: false, else: "$$REMOVE" } },
                "WantedModalVisibility": { $cond: { if: { $eq: ["Wanted", "$category_type"] }, then: false, else: "$$REMOVE" } },
                "DealWantedModalVisibility": {
                    $cond: { if: { $eq: ["Wanted", "$category_type"] }, then: false, else: { $cond: { if: { $eq: ["ask", "$post_type"] }, then: false, else: "$$REMOVE" } } }
                },
                "askMemberModalVisibility": { $cond: { if: { $eq: ["ask", "$post_type"] }, then: false, else: "$$REMOVE" } },
                is_open_end: { $cond: { if: { $eq: ["ask", "$post_type"] }, then: { $cond: { if: { $eq: ["True", "$is_open_end"] }, then: true, else: false } }, else: "$$REMOVE" } }
            }
            //for ak option member*************
            var membersdetail = {
                "$lookup": {
                    "from": "members", "let": { "membersid": "$member_id" }, "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$member_id", "$$membersid"] }, { "$eq": ["$status", "Active"] }] } } }, {
                        $project: {
                            first_name: 1, last_name: 1, gender: 1, commentlikesetting: 1, headline: 1, auto_play_video: 1, muted_video: 1,
                            member_id: 1, who_can_view_photos_and_albums: 1, who_can_view_post_location: 1,
                            who_can_like_comments_onmyposts: 1, who_can_view_comments_onmypost: 1, who_can_comment_onmypost: 1, Who_can_send_me_friend_requests: 1
                        }
                    }
                    ],
                    "as": "membersdetail"
                }
            }
            var parentmembersdetail = {
                "$lookup": {
                    "from": "members", "let": { "membersid": "$parent_member_id" }, "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$member_id", "$$membersid"] }, { "$eq": ["$status", "Active"] }] } } }, { $project: { first_name: 1, last_name: 1, gender: 1 } }
                    ],
                    "as": "parentmembersdetail"
                }
            }
            var parentprofiledetail = {
                "$lookup": {
                    "from": "posts", "let": { "membersid": "$parent_member_id" }, "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$member_id", "$$membersid"] }, { "$eq": ["$status", "Active"] }, { "$eq": ["$post_type", "Profile"] }] } } }, { $project: { post_id: 1 } }, { $sort: { post_id: -1 } }, { $limit: 1 },
                    ],
                    "as": "parentprofiledetail"
                }
            }
            var parentprofileimage = {
                "$lookup": {
                    "from": "post_images",
                    "let": { "postids": { $toString: { $arrayElemAt: ["$parentprofiledetail.post_id", 0] } } },
                    "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postids"] }, { "$eq": ["$status", "Active"] }] } } },
                    { $project: { original_image: 1 } }],
                    "as": "parentprofileimage"
                }
            }
            var profiledetail = {
                "$lookup": {
                    "from": "posts", "let": { "membersid": "$member_id" }, "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$member_id", "$$membersid"] }, { "$eq": ["$status", "Active"] }, { "$eq": ["$post_type", "Profile"] }] } } }, { $project: { post_id: 1 } }, { $sort: { post_id: -1 } }, { $limit: 1 },
                    ],
                    "as": "profiledetail"
                }
            }

            var coverphotodetail = {
                "$lookup": {
                    "from": "posts", "let": { "membersid": "$member_id" }, "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$member_id", "$$membersid"] }, { "$eq": ["$status", "Active"] }, { "$eq": ["$post_type", "Cover"] }] } } }, { $project: { post_id: 1 } }, { $sort: { post_id: -1 } }, { $limit: 1 },
                    ],
                    "as": "coverphotodetail"
                }
            }
            var profileimage = {
                "$lookup": {
                    "from": "post_images",
                    "let": { "postids": { $toString: "$profiledetail.post_id" } },
                    "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postids"] }, { "$eq": ["$status", "Active"] }] } } },
                    { $project: { original_image: 1 } }],
                    "as": "profileimage"
                }
            }
            var categorytype = {
                "$lookup": {
                    "from": "post_categories",
                    "let": { "categoryId": { $cond: { if: { $and: [{ $ne: ["", "$category_id"] }, { $ne: [null, "$category_id"] }] }, then: "$category_id", else: 0 } } },
                    "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$category_id", { $toInt: "$$categoryId" }] }, { "$eq": ["$status", "Active"] }] } } },
                    { $project: { category_name: 1 } }],
                    "as": "categorytype"
                }
            }
            var coverimage = {
                "$lookup": {
                    "from": "post_images",
                    "let": { "postids": { $toString: "$coverphotodetail.post_id" } },
                    "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postids"] }, { "$eq": ["$status", "Active"] }] } } },
                    { $project: { image: 1 } }],
                    "as": "coverimage"
                }
            }

            var result = await PostSchema.aggregate([
                { "$match": { $or: [{ "member_id": { "$in": Follow }, status: 'Active', "visibility": { "$ne": 'Only Me' }, ...condition }, { "member_id": member_id, status: 'Active', ...condition }] } },
                {
                    $lookup: {
                        from: "custome_visibilities",
                        let: { memberid: "$member_id", postid: "$post_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$post_id", "$$postid"] },
                                            { $eq: ["$member_id", member_id] },
                                            { $eq: ["$birthday_member_id", "$$memberid"] },
                                            { $eq: ["$share_with", "share_with"] }
                                        ]
                                    }
                                }
                            },
                        ],
                        as: "Follower"
                    }
                },
                /********MAIN PROJECT POSTS FIELD */
                {
                    $project: {
                        ...askpostid, amount: 1, category_id: 1, "post_type": 1, "visibility": 1, "member_id": 1, "post_id": 1, post_image: 1, desc: 1, category_type: 1, parent_post_id: 1, parent_member_id: 1,
                        Follower: {
                            $cond: {
                                if: { $ne: [[], "$Follower"] }, then: true, else: { $cond: { if: { $and: [{ $eq: ["$member_id", member_id] },] }, then: true, else: { $cond: { if: { $and: [{ $eq: ["$visibility", "Custom"] }] }, then: false, else: true } } } }
                            }
                        },
                        Connection: {
                            $and: [
                                { $not: [{ $in: ["$member_id", userid] }] },
                                { $eq: ["$visibility", "Connections"] },
                            ]
                        },
                    }
                },
                { $match: { Connection: false, Follower: true } },
                { $sort: { post_id: -1 } },
                { $skip: skip },
                { $limit: limit },
                ///*********post_images************** */
                {
                    $lookup: {
                        from: "post_images", let: { postid: { $toString: "$post_id" } }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$post_id", "$$postid"] }] } } }, {
                            "$lookup": {
                                "from": "post_image_likes", "let": { "image_id": "$post_image_id", "postids": { $toInt: "$post_id" }, },
                                "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$image_id", "$$image_id"] }, { "$eq": ["$post_id", "$$postids"] }, { "$eq": ["$status", "Like"] }] } } }],
                                "as": "postImageLikeCounts"
                            },
                        },
                        { "$lookup": { "from": "post_image_comments", "let": { "image_id": "$post_image_id", "postids": { $toInt: "$post_id" } }, "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$image_id", "$$image_id"] }, { "$eq": ["$post_id", "$$postids"] }, { "$eq": ["$status", "Active"] }] } } }], "as": "image_commentcount" } },
                        {
                            "$addFields": {
                                "post_image_likes": { "$size": "$postImageLikeCounts" },
                                image_commentcount: { "$size": "$image_commentcount" },
                                member_like_status: { $cond: { if: { $eq: [[], "$postLikeCount"] }, then: "Like", else: { $cond: { if: { $and: [{ $eq: [{ $arrayElemAt: ["$postImageLikeCounts.member_id", 0] }, member_id] }] }, then: "Unlike", else: "Like" } } } }
                            }
                        },

                        { $project: { photo_crop_skip: 0, video_thumb: 0, mage_location: 0, tag_member_id: 0, image_date: 0, member_id: 0, status: 0, parent_image_id: 0, imagesize650x650_width: 0, imagesize200x200: 0, imagesize300x300: 0, imagesize400x400: 0, imagesize500x500: 0, imagesize650x650: 0 } },
                        ],
                        as: "post_image"
                    }
                },

                // //**********post_likes************** */
                { "$lookup": { "from": "post_likes", "let": { "postlikeids": { $toString: "$post_id" }, }, "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postlikeids"] }, { "$eq": ["$status", "Like"] }] } } },], "as": "postLikeCount" } },
                //*********post_likes******************** */
                { "$lookup": { "from": "post_comments", "let": { "postids": "$post_id" }, "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postids"] }, { "$eq": ["$status", "Active"] }] } } },], "as": "commentcount" } },
                //  ******** ask_option_choices ************
                {
                    "$lookup": {
                        "from": "ask_option_choices",
                        "let": { "askpostid": "$askpostid", "memberid": member_id },
                        "pipeline": [
                            { "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$askpostid"] }, { "$eq": ["$status", "Active"] }] } } },
                            membersdetail, { $unwind: "$membersdetail" },
                            profiledetail, { $unwind: "$profiledetail" },
                            profileimage, { $unwind: "$profileimage" },
                            {
                                "$lookup": {
                                    "from": "connections",
                                    "let": { "memberids": "$member_id" },
                                    "pipeline": [{
                                        $match: {
                                            "$expr": {
                                                $or:
                                                {
                                                    $and: [{ "$eq": ["$friend_member_id", "$$memberids"] }, { "$eq": ["$connection_status", 'Connection'] }, { "$eq": ["$status", 'Active'] }],
                                                    $and: [{ "$eq": ["$member_id", "$$memberids"] }, { "$eq": ["$connection_status", 'Connection'] }, { "$eq": ["$status", 'Active'] }]
                                                }
                                            }
                                        }
                                    },
                                    { $project: { member_id: 1, friend_member_id: 1 } },
                                    { "$group": { "_id": 0, "mutualids": { "$push": { "$cond": [{ "$eq": ["$member_id", member_id] }, "$friend_member_id", "$member_id"] } } } },
                                    { $project: { mutualcount: { "$size": { $setIntersection: ["$mutualids", userid] } } } },

                                    ],
                                    "as": "mutul"
                                }
                            },
                            { $unwind: "$mutul" },

                            {
                                $project: {
                                    first_name: "$membersdetail.first_name", last_name: "$membersdetail.last_name", member_gender: "$membersdetail.gender", ask_option_choice_id: "$ask_option_choice_id", option_choice_no: "$option_choice_no", member_id: "$member_id", profileimage: "$profileimage.original_image", mutualfriend: "$mutul.mutualcount",
                                    friend_status: { $cond: { if: { $and: [{ $in: ["$member_id", userid] }] }, then: "Friends", else: "Add Friend" } }
                                }
                            }
                        ], "as": "option_choices"
                    }
                },
                //********ask_option_choices**************** */
                {
                    "$lookup": {
                        "from": "ask_option_choices",
                        "let": { "askpostid": "$askpostid", "memberid": member_id },
                        "pipeline": [
                            { "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$askpostid"] }, { "$eq": ["$member_id", "$$memberid"] }, { "$eq": ["$status", "Active"] }] } } }],
                        as: "myoptionchoices"
                    }
                },
                // //*/*************situation_donates************** */
                {
                    "$lookup": {
                        "from": "situation_donates",
                        "let": { "postid": { $cond: { if: "$parent_post_id", then: "$parent_post_id", else: "$post_id" } } },
                        "pipeline": [
                            { "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postid"] }, { "$eq": ["$status", "Active"] }] } } },
                            { "$project": { total: { $sum: { $toInt: "$donation_price" } }, } }
                        ],
                        as: "situation_donate"
                    }
                },
                //*********turnup_like_requests************** */
                {
                    "$lookup": {
                        "from": "turnup_like_requests",
                        "let": {
                            "postid": { $toString: "$post_id" }
                        },
                        "pipeline": [
                            { "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postid"] },] } } },
                            { "$addFields": { member_id: "$sender_id" } },
                            membersdetail, profiledetail,
                            {
                                "$lookup": {
                                    "from": "post_images",
                                    "let": { "postids": { $toString: { $arrayElemAt: ["$profiledetail.post_id", 0] } } },
                                    "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postids"] }, { "$eq": ["$status", "Active"] }] } } },
                                    { $project: { original_image: 1 } }],
                                    "as": "profileimage"
                                }
                            },
                            {
                                $project: {
                                    status: 1, post_id: 1, receiver_id: 1, sender_id: 1, like_status: 1, first_name: { $arrayElemAt: ["$membersdetail.first_name", 0] }, last_name: { $arrayElemAt: ["$membersdetail.last_name", 0] }, member_gender: { $arrayElemAt: ["$membersdetail.gender", 0] }, profileimage: { $arrayElemAt: ["$profileimage.original_image", 0] }
                                }
                            }

                        ],
                        as: "turnuplike"
                    }
                },
                // //*****event_replies***** */
                {
                    "$lookup": {
                        "from": "event_replies",
                        "let": { "postid": "$post_id", "memberids": member_id },
                        "pipeline": [
                            { "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postid"] }, { "$eq": ["$status", "Active"] }] } } },
                            { $project: { reply: 1, member_id: 1 } }
                        ],
                        as: "event_replies"
                    }
                },
                // //***profiledetail profileimage**** */
                membersdetail, { $unwind: "$membersdetail" },
                profiledetail, { $unwind: "$profiledetail" },
                profileimage, { $unwind: "$profileimage" },
                categorytype,
                coverphotodetail, { $unwind: "$coverphotodetail" },
                coverimage, { $unwind: "$coverimage" },

                //*****save_posts***** */
                {
                    "$lookup": {
                        "from": "save_posts",
                        "let": { "postid": "$post_id", "memberids": member_id },
                        "pipeline": [
                            { "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postid"] }, { "$eq": ["$status", "Active"] }] } } },
                            { $count: "savepostcount" }
                        ],
                        as: "saveposts"
                    }
                },
                {
                    "$lookup": {
                        "from": "posts",
                        "let": { "postid": "$post_id", "memberids": member_id },
                        "pipeline": [
                            { "$match": { "$expr": { $and: [{ "$eq": ["$parent_post_id", "$$postid"] }, { "$eq": ["$status", "Active"] }] } } },
                            { $count: "sharepostcount" }
                        ],
                        as: "sharepost"
                    }
                },
                parentmembersdetail,
                parentprofiledetail,
                parentprofileimage,

                {
                    "$lookup": {
                        from: "connections",
                        "let": { "postmemberid": "$member_id" },
                        "pipeline": [{
                            $match: {
                                "$expr": {
                                    $or:
                                        [{
                                            $and: [
                                                { "$eq": ["$friend_member_id", "$$postmemberid"] },
                                                { "$eq": ["$connection_status", 'Connection'] },
                                                { "$eq": ["$status", 'Active'] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { "$eq": ["$member_id", "$$postmemberid"] },
                                                { "$eq": ["$connection_status", 'Connection'] },
                                                { "$eq": ["$status", 'Active'] }
                                            ]
                                        }]
                                }
                            }
                        },
                        { $project: { member_id: 1, friend_member_id: 1 } },
                        { "$group": { "_id": 0, "friendsid": { "$push": { "$cond": [{ "$eq": ["$member_id", "$$postmemberid"] }, "$friend_member_id", "$member_id"] } } } },
                        { $project: { _id: 0, friendsid: 1 } },

                        ],
                        as: "PostFriends"
                    }
                },
                //********* addFields ALL LOOKUP COLLECTIONS ******** */
                {
                    "$addFields": {
                        "going": { $filter: { input: "$event_replies", as: "event", cond: { $eq: ["$$event.reply", "Going"] } } },
                        "Interested": { $filter: { input: "$event_replies", as: "event", cond: { $eq: ["$$event.reply", "Interested"] } } },
                        "No": { $filter: { input: "$event_replies", as: "event", cond: { $eq: ["$$event.reply", "No"] } } },
                        "status": { $filter: { input: "$event_replies", as: "event", cond: { $eq: ["$$event.member_id", member_id] } } },
                        "postLikeCounts": { "$size": "$postLikeCount" },
                        commentcount: { "$size": "$commentcount" },
                        mypostlikestring: {
                            $cond: {
                                if: { $ne: [[], "$postLikeCount"] }, then: {
                                    $filter: { input: "$postLikeCount", as: "postlike", cond: { $eq: ["$$postlike.member_id", member_id] } }
                                }, else: []
                            }
                        },
                        poll_question1_list: {
                            $cond: { if: { $ne: [[], "$option_choices"] }, then: { $filter: { input: "$option_choices", as: "options", cond: { $eq: ["$$options.option_choice_no", 1] } } }, else: "$$REMOVE" }
                        },
                        poll_question2_list: {
                            $cond: { if: { $ne: [[], "$option_choices"] }, then: { $filter: { input: "$option_choices", as: "options", cond: { $eq: ["$$options.option_choice_no", 2] } } }, else: "$$REMOVE" }
                        },
                        ask_selected_option: { $cond: { if: { $eq: ["ask", "$post_type"] }, then: { $cond: { if: { $eq: [[], "$myoptionchoices"] }, then: 0, else: { $arrayElemAt: ["$myoptionchoices.option_choice_no", 0] } } }, else: "$$REMOVE" } },
                        donation_amount: {
                            $cond: { if: { $eq: ["situation_room", "$post_type"] }, then: { $cond: { if: { $eq: [[], "$situation_donate"] }, then: 0, else: { $cond: { if: "$situation_donate.total", then: { $arrayElemAt: ["$situation_donate.total", 0] }, else: 0 } } } }, else: "$$REMOVE" }
                        },
                        donation_amount_percentage: {
                            $cond: { if: { $eq: ["situation_room", "$post_type"] }, then: { $cond: { if: { $eq: [[], "$situation_donate"] }, then: 0, else: { $toInt: { $divide: [{ $multiply: [100, { $arrayElemAt: ["$situation_donate.total", 0] }] }, { $toInt: "$amount" }] } } } }, else: "$$REMOVE" }
                        },
                        turnuplike: {
                            $cond: {
                                if: { $ne: [[], "$turnuplike"] }, then: {
                                    $cond: {
                                        if: { $and: [{ $eq: [member_id, "$member_id"] }] }, then:
                                        {
                                            $filter: {
                                                input: "$turnuplike",
                                                as: "turnup",
                                                cond: { $eq: ["$$turnup.receiver_id", member_id], $eq: ["$$turnup.like_status", "Like"], $eq: ["$$turnup.status", "Requested"] }
                                            }
                                        }, else: {
                                            $filter: {
                                                input: "$turnuplike",
                                                as: "turnups",
                                                cond: {
                                                    $and: [
                                                        { $eq: ["$$turnups.sender_id", member_id] },
                                                        { $eq: ["$$turnups.post_id", { $toString: "$post_id" }] }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }, else: []
                            }
                        },
                        "parent_first_name": { $cond: { if: { $eq: [[], "$parentmembersdetail"] }, then: { $arrayElemAt: ["$parentmembersdetail.first_name", 0] }, else: "$$REMOVE" } },
                        "parent_last_name": { $cond: { if: { $eq: [[], "$parentmembersdetail"] }, then: { $arrayElemAt: ["$parentmembersdetail.last_name", 0] }, else: "$$REMOVE" } },
                        "parent_profileimage": { $cond: { if: { $eq: [[], "$profileimage"] }, then: { $arrayElemAt: ["$profileimage.original_image", 0] }, else: "$$REMOVE" } },

                    }
                },
                {
                    $project: {
                        amount: 1,
                        auto_play_video: "$membersdetail.auto_play_video",
                        auto_replay_video: "$membersdetail.auto_replay_video",
                        availability: 1,
                        bathroom: 1,
                        category_id: 1,
                        category_name: {
                            $cond: { if: { $ne: [[], "$categorytype"] }, then: { $arrayElemAt: ["$categorytype.category_name", 0] }, else: "" }
                        },
                        category_type: 1,
                        comment_model: 1,
                        commentcount: 1,
                        commentlikesetting: {
                            $cond: {
                                if: { $and: [{ $eq: ["$membersdetail.who_can_like_comments_onmyposts", "Public"] }] },
                                then: true, else: {
                                    $cond: {
                                        if: { $and: [{ $eq: ["$membersdetail.who_can_like_comments_onmyposts", "Friends"] }, { $ne: ["$member_id", member_id] }] },
                                        then: { $and: [{ $in: ["$member_id", userid] }] },
                                        else: {
                                            $cond: {
                                                if: { $and: [{ $eq: ["$membersdetail.who_can_like_comments_onmyposts", "Only Me"] }] },
                                                then: { $and: [{ $eq: ["$member_id", member_id] }] },
                                                else: {
                                                    $cond: {
                                                        if: { $and: [{ $eq: ["$membersdetail.who_can_like_comments_onmyposts", "Friends of Friends"] }, { $ne: ["$member_id", member_id] }] },
                                                        then: { $and: [{ $in: [{ $arrayElemAt: ["$PostFriends.friendsid", 0] }, userid] }] },
                                                        else: false
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        commentviewmypost: {
                            $cond: {
                                if: { $and: [{ $eq: ["$membersdetail.who_can_view_comments_onmypost", "Public"] }] },
                                then: true, else: {
                                    $cond: {
                                        if: { $and: [{ $eq: ["$membersdetail.who_can_view_comments_onmypost", "Friends"] }, { $ne: ["$member_id", member_id] }] },
                                        then: { $and: [{ $in: ["$member_id", userid] }] },
                                        else: {
                                            $cond: {
                                                if: { $and: [{ $eq: ["$membersdetail.who_can_view_comments_onmypost", "Only Me"] }] },
                                                then: { $and: [{ $eq: ["$member_id", member_id] }] },
                                                else: {
                                                    $cond: {
                                                        if: { $and: [{ $eq: ["$membersdetail.who_can_view_comments_onmypost", "Friends of Friends"] }, { $ne: ["$member_id", member_id] }] },
                                                        then: { $and: [{ $in: [{ $arrayElemAt: ["$PostFriends.friendsid", 0] }, userid] }] },
                                                        else: false
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        commentonmypost: {
                            $cond: {
                                if: { $and: [{ $eq: ["$membersdetail.who_can_view_comments_onmypost", "Public"] }] },
                                then: true, else: {
                                    $cond: {
                                        if: { $and: [{ $eq: ["$membersdetail.who_can_view_comments_onmypost", "Friends"] }, { $ne: ["$member_id", member_id] }] },
                                        then: { $and: [{ $in: ["$member_id", userid] }] },
                                        else: {
                                            $cond: {
                                                if: { $and: [{ $eq: ["$membersdetail.who_can_view_comments_onmypost", "Only Me"] }] },
                                                then: { $and: [{ $eq: ["$member_id", member_id] }] },
                                                else: {
                                                    $cond: {
                                                        if: { $and: [{ $eq: ["$membersdetail.who_can_view_comments_onmypost", "Friends of Friends"] }, { $ne: ["$member_id", member_id] }] },
                                                        then: { $and: [{ $in: [{ $arrayElemAt: ["$PostFriends.friendsid", 0] }, userid] }] },
                                                        else: false
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        courtesy: 1,
                        create_Going: { $cond: { if: { $ne: [[], "$going"] }, then: { $size: "$going" }, else: 0 } },
                        create_Interested: { $cond: { if: { $ne: [[], "$Interested"] }, then: { $size: "$Interested" }, else: 0 } },
                        create_no: { $cond: { if: { $ne: [[], "$No"] }, then: { $size: "$No" }, else: 0 } },
                        desc: 1,
                        discount_offer: 1,
                        end_budget: 1,
                        end_datetime: 1,
                        exchange_with: 1,
                        first_name: "$membersdetail.first_name",
                        last_name: "$membersdetail.last_name",
                        full_date: 1,
                        give_subcategorytype: 1,
                        headline: "$membersdetail.headline",
                        hide_count: 1,
                        hosted_by: 1,
                        image_share_post: 1,
                        is_anonymous: 1,
                        is_open_end: 1,
                        job_time_duration: 1,
                        job_type: 1,
                        kitchen: 1,
                        last_name: 1,
                        lat: 1,
                        location: 1,
                        long: 1,
                        member_gender: "$membersdetail.gender",
                        member_id: 1,
                        member_like_status: { $cond: { if: { $ne: [[], "$mypostlikestring"] }, then: "Unlike", else: "Like" } },
                        // muted_video: 1,
                        mylike_string: { $cond: { if: { $eq: [{ "$size": "$postLikeCount" }, 1] }, then: { $cond: { if: { $ne: [[], "$mypostlikestring"] }, then: true, else: false } }, else: false } },
                        // notification_time: 1,
                        // opportunity_job_title:1,
                        // opportunity_salary:1,
                        // origional_Price:1,
                        // parent_description:1,
                        parent_member_id: 1,
                        parent_post_id: 1,
                        // parent_post_image_id:1
                        // payment_details: 1,
                        pending_status: 1,
                        poll_open_time: 1,
                        poll_question1_list: 1,
                        poll_question2_list: 1,
                        poll_question1_total: { $cond: { if: { $isArray: "$poll_question1_list" }, then: { $size: "$poll_question1_list" }, else: 0 } },
                        poll_question2_total: { $cond: { if: { $isArray: "$poll_question2_list" }, then: { $size: "$poll_question2_list" }, else: 0 } },
                        poll_question1_percentage: {
                            $cond: { if: { $ne: [[], "$option_choices"] }, then: { $toInt: { $multiply: [{ $divide: [100, { "$size": "$option_choices" }] }, { $cond: { if: { $isArray: "$poll_question1_list" }, then: { $size: "$poll_question1_list" }, else: 0 } }] } }, else: false }
                        },
                        post_create_date: 1,
                        post_currency: 1,
                        "post_id": 1,
                        post_image: 1,
                        ...post_label,
                        post_title: 1,
                        "post_type": 1,
                        post_year: 1,
                        price: 1,
                        product_status: 1,
                        profileimage: { $cond: { if: "$profileimage", then: "$profileimage.original_image", else: "" } },
                        profilecover: { $cond: { if: "$coverimage", then: "$coverimage.image", else: "" } },
                        rent_time_duration: 1,
                        room: 1,
                        sharepost: { $cond: { if: { $ne: [[], "$sharepost"] }, then: { $arrayElemAt: ["$sharepost.sharepostcount", 0] }, else: 0 } },
                        savepost: { $cond: { if: { $ne: [[], "$saveposts"] }, then: { $arrayElemAt: ["$saveposts.savepostcount", 0] }, else: 0 } },
                        savepostvisible: 1,
                        sqft: 1,
                        start_budget: 1,
                        start_datetime: 1,
                        status: 1,
                        ticket_information: 1,
                        total_like: 1,
                        turnuplike: 1,
                        video_comments: 1,
                        video_post_wall: 1,
                        video_repeat: 1,
                        video_volume: 1,
                        visibility: 1,
                        seting: {
                            $cond: {
                                if: { $and: [{ $eq: ["$membersdetail.who_can_view_photos_and_albums", "Public"] }] },
                                then: true, else: {
                                    $cond: {
                                        if: { $and: [{ $eq: ["$membersdetail.who_can_view_photos_and_albums", "Friends"] }, { $ne: ["$member_id", member_id] }] },
                                        then: { $and: [{ $in: ["$member_id", userid] }] },
                                        else: {
                                            $cond: {
                                                if: { $and: [{ $eq: ["$membersdetail.who_can_view_photos_and_albums", "Only Me"] }] },
                                                then: { $and: [{ $eq: ["$member_id", member_id] }] },
                                                else: {
                                                    $cond: {
                                                        if: { $and: [{ $eq: ["$membersdetail.who_can_view_photos_and_albums", "Friends of Friends"] }, { $ne: ["$member_id", member_id] }] },
                                                        then: { $and: [{ $in: [{ $arrayElemAt: ["$PostFriends.friendsid", 0] }, userid] }] },
                                                        else: false
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        parent_first_name: 1,
                        parent_last_name: 1,
                        parent_profileimage: 1,
                        ...post_label, ...give, ...extrafiled,
                        postLikeCounts: 1,
                        mypostlikestring: 1,
                        option_choices: 1,
                        askpostid: 1,
                        ask_selected_option: 1,
                        donation_amount_percentage: 1,
                        donation_amount: 1,
                        event_status: { $cond: { if: { $ne: [[], "$status"] }, then: { $arrayElemAt: ["$status.reply", 0] }, else: "Interested" } },
                        poll_question2_percentage: {
                            $cond: { if: { $ne: [[], "$option_choices"] }, then: { $toInt: { $multiply: [{ $divide: [100, { "$size": "$option_choices" }] }, { $cond: { if: { $isArray: "$poll_question2_list" }, then: { $size: "$poll_question2_list" }, else: 0 } }] } }, else: false }
                        },



                    }
                }
            ])
            // return result;
            return res.status(200).send(result);
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }
}