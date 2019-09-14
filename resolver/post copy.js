const PostSchema = require('../model/postSchema');
const postCategoryModel = require('../model/postCategory');
const ConnectionModel = require('../model/ConnectionSchema');
const FollowModel = require('../model/followSchema');

module.exports = {
    getposts: async (args, req) => {
        // console.log(args.params.member_id)

        try {
            if (args.params.post_id != '') {
                var post_id = args.params.post_id;
            } else {
                var post_id = ""
            }
            if (args.params.limit != '') {
                var limit = args.params.limit;
            } else {
                var limit = 5
            }
            if (args.params.skip != '') {
                var skip = args.params.skip;
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
                condition.post_type = ["$in", multiple_specific_post]
            }
            if (args.params.specific_post) {
                condition.post_type = args.params.specific_post;
            }

            var member_id = args.params.member_id;
            var Connection = await ConnectionModel.aggregate([
                { $match: { $or: [{ friend_member_id: member_id, connection_status: 'Connection', status: 'Active' }, { member_id: member_id, connection_status: 'Connection', status: 'Active' }] } },
                { $project: { member_id: 1, friend_member_id: 1 } },
                { "$group": { "_id": 0, "userid": { "$push": { "$cond": [{ "$eq": ["$member_id", member_id] }, "$friend_member_id", "$member_id"] } } } },
            ])
            var userid = Connection[0].userid
            ///****************FOOOLLLOOOOOWWWW */
            // {
            // var followfilterlookup={    $lookup:
            //     {
            //         from: "follow_filters",
            //         let: { followid: "$follow_id" },
            //         pipeline: [
            //             {
            //                 $match:
            //                 {
            //                     $expr:
            //                     {
            //                         $and:
            //                             [
            //                                 { $eq: ["$follow_id", "$$followid"] },
            //                                 { $eq: ["$status", "Yes"] },

            //                             ]
            //                     }
            //                 }
            //             },
            //             { $project: { post_type: 1 } }
            //         ],
            //         as: "Follower"
            //     }
            // },}
            var Follow = await FollowModel.aggregate([
                { $match: { member_id: member_id, status: 'Active' } },
                { $project: { member_id: 1, following_id: 1, follow_id: 1 } },
                //follofilter lookup
                { "$group": { "_id": 0, post_type: { "$push": "$following_id" } } },
                { $project: { post_type: 1, _id: 0 } },
                { $sort: { create_date: -1 } },
            ])
            var Follow = Follow[0].post_type

            var hook = {
                // "location": { $cond: { if: { $eq: ["hoookedup", "$post_type"] }, then: "$location", else: "$$REMOVE" } },
                "post_label": { $cond: { if: { $eq: ["hoookedup", "$post_type"] }, then: "Hook Me Up!!!", else: "$$REMOVE" } },

            }
            var snap = {
                "post_label": { $cond: { if: { $eq: ["snapit", "$post_type"] }, then: "Snap It", else: "$$REMOVE" } },
            }
            var fillme = { "post_label": { $cond: { if: { $eq: ["fillme", "$post_type"] }, then: "Just In!!!", else: "$$REMOVE" } }, }
            // var good_deed = { "post_label": { $cond: { if: { $eq: ["good_deed", "$post_type"] }, then: "Good Deeds", else: "$$REMOVE" } }, }
            // var Profile = { "post_label": { $cond: { if: { $eq: ["Profile", "$post_type"] }, then: " ", else: "$$REMOVE" } }, }
            // var Cover = { "post_label": { $cond: { if: { $eq: ["Cover", "$post_type"] }, then: " ", else: "$$REMOVE" } }, }
            // var opportunity = {
            //     "post_label": {
            //         $cond: { if: { $eq: ["opportunity", "$post_type"] }, then: { $cond: { if: { $eq: ["give_opportunity", "$category_type"] }, then: "Giving Opportunity", else: "Seeking Opportunity" } }, else: "$$REMOVE" }
            //     }
            // }
            // var situationroom = { "visibility": { $cond: { if: { $eq: ["situation_room", "$post_type"] }, then: "$visibility", else: "$$REMOVE" } } }
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
                // {
                //     $lookup:
                //     {
                //         from: "follow_filters",
                //         let: { followid: "$Follower.follow_id" },
                //         pipeline: [
                //             {
                //                 $match:
                //                 {
                //                     $expr:
                //                     {
                //                         $and:
                //                             [
                //                                 { $eq: ["$follow_id", "$$followid"] },
                //                                 { $eq: ["$status", "Yes"] },

                //                             ]
                //                     }
                //                 }
                //             },
                //             { $project: { post_type: 1 } }
                //         ],
                //         as: "Follower"
                //     }
                // },
                {
                    $project: {
                        ...hook, ...snap, ...fillme, "post_type": 1, "visibility": 1, "member_id": 1, "post_id": 1, post_image: 1, desc: 1,
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
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "post_images", let: { postid: { $toString: "$post_id" } }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$post_id", "$$postid"] }] } } }, {
                            "$lookup": {
                                "from": "post_image_likes", "let": { "image_id": "$post_image_id", "postids": { $toInt: "$post_id" }, },
                                "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$image_id", "$$image_id"] }, { "$eq": ["$post_id", "$$postids"] }, { "$eq": ["$status", "Like"] }] } } }],
                                "as": "postImageLikeCounts"
                            },
                        },
                        {
                            "$lookup": {
                                "from": "post_image_comments", "let": { "image_id": "$post_image_id", "postids": { $toInt: "$post_id" }, },
                                "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$image_id", "$$image_id"] }, { "$eq": ["$post_id", "$$postids"] }, { "$eq": ["$status", "Active"] }] } } }],
                                "as": "image_commentcount"
                            },
                        },

                        {
                            "$addFields": {
                                "post_image_likes": { "$size": "$postImageLikeCounts" }, image_commentcount: { "$size": "$image_commentcount" },
                                member_like_status: { $cond: { if: { $eq: [[], "$postLikeCount"] }, then: "Like", else: { $cond: { if: { $and: [{ $eq: [{ $arrayElemAt: ["$postImageLikeCounts.member_id", 0] }, member_id] }] }, then: "Unlike", else: "Like" } } } }
                            }
                        },
                        { $project: { postImageLikeCounts: 0, parent_image_id: 0, imagesize100x100: 0, imagesize200x200: 0, imagesize300x300: 0, imagesize400x400: 0, imagesize500x500: 0, imagesize650x650: 0 } },
                        ],
                        as: "post_image"
                    }
                },
                {
                    "$lookup": {
                        "from": "post_likes", "let": { "postlikeids": { $toString: "$post_id" }, },
                        "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postlikeids"] }, { "$eq": ["$status", "Like"] }] } } },
                        ], "as": "postLikeCount"
                    }
                },
                {
                    "$lookup": {
                        "from": "post_comments", "let": { "postids": "$post_id" },
                        "pipeline": [{ "$match": { "$expr": { $and: [{ "$eq": ["$post_id", "$$postids"] }, { "$eq": ["$status", "Active"] }] } } },
                        ], "as": "commentcount"
                    }
                },
                {
                    "$addFields": {
                        "postLikeCounts": { "$size": "$postLikeCount" }, commentcount: { "$size": "$commentcount" },
                        mypostlikestring: { $cond: { if: { $eq: [[], "$postLikeCount"] }, then: "Like", else: { $cond: { if: { $and: [{ $eq: [{ $arrayElemAt: ["$postLikeCount.member_id", 0] }, member_id] }] }, then: "Unlike", else: "Like" } } } },

                    }
                },

                {
                    $project: {
                        ...hook, ...snap, ...fillme, "post_type": 1, "visibility": 1, "member_id": 1, "post_id": 1, post_image: 1, desc: 1, Follower: 1, Connection: 1, postLikeCounts: 1, mypostlikestring: 1, commentcount: 1
                    }
                },
                { $sort: { post_id: -1 } },


            ])
            console.log(result);
            return result;

            // var formdetail = new PostSchema({member_id: "slkcn" })
            // var add = await formdetail.save();
            // console.log(add);

            // var postdetails = await post.getpost(post_id, limit, member_id, timeline, specific_post, profile_member_id, multiple_specific_post);
            // console.log(postdetails)
            // if (postdetails.length != 0) {
            //     console.log(postdetails.length)
            //     for (let i = 0; i < postdetails.length; i++) {
            //         // const profileDetails = postdetails[i];
            //         var membersetting = await profile.settingmember(postdetails[i].member_id);
            //         var seting = '';
            //         if (membersetting[0].who_can_view_photos_and_albums == "Friends" && member_id != postdetails[i].member_id) {
            //             var friend = await post.check_aleradyfriend(member_id, postdetails[i].member_id);
            //             if (friend.length != 0) {
            //                 seting = true;
            //             } else {
            //                 seting = false
            //             };
            //         } else if (membersetting[0].who_can_view_photos_and_albums == "Only Me") {
            //             if (member_id == postdetails[i].member_id) {
            //                 seting = true;
            //             } else {
            //                 seting = false
            //             };
            //         } else if (membersetting[0].who_can_view_photos_and_albums == "Friends of Friends" && member_id != postdetails[i].member_id) {
            //             var friend = await post.check_aleradyfriend(member_id, postdetails[i].member_id);
            //             if (friend.length != 0) {
            //                 var f = 0;
            //                 for (var j = 0; j < friend.length; j++) {
            //                     var checkfriend = await post.check_aleradyfriend(
            //                         postdetails[j].member_id,
            //                         friend[j].member
            //                     );
            //                     if (checkfriend.length != 0) {
            //                         f++;
            //                     }
            //                     if (f == 0) {
            //                         seting = false;
            //                     } else {
            //                         seting = true;
            //                     }
            //                 }
            //             } else {
            //                 seting = false
            //             };
            //         } else {
            //             seting = true;
            //         }
            //         var commentlikesetting = '';
            //         if (membersetting[0].who_can_like_comments_onmyposts == "Friends" && member_id != postdetails[i].member_id) {
            //             var friend = await post.check_aleradyfriend(member_id, postdetails[i].member_id);
            //             if (friend.length != 0) {
            //                 commentlikesetting = true;
            //             } else {
            //                 commentlikesetting = false
            //             };
            //         } else if (membersetting[0].who_can_like_comments_onmyposts == "Only Me") {
            //             if (member_id == postdetails[i].member_id) {
            //                 commentlikesetting = true;
            //             } else {
            //                 commentlikesetting = false
            //             };
            //         } else if (membersetting[0].who_can_like_comments_onmyposts == "Friends of Friends" && member_id != postdetails[i].member_id) {
            //             var friend = await post.check_aleradyfriend(member_id, postdetails[i].member_id);
            //             if (friend.length != 0) {
            //                 var f = 0;
            //                 for (var j = 0; j < friend.length; j++) {
            //                     var checkfriend = await post.check_aleradyfriend(
            //                         postdetails[j].member_id,
            //                         friend[j].member
            //                     );
            //                     if (checkfriend.length != 0) {
            //                         f++;
            //                     }
            //                     if (f == 0) {
            //                         seting = false;
            //                     } else {
            //                         seting = true;
            //                     }
            //                 }
            //             } else {
            //                 commentlikesetting = false
            //             };
            //         } else {
            //             commentlikesetting = true;
            //         }
            //         postdetails[i].commentlikesetting = commentlikesetting;
            //         var commentviewmypost = '';
            //         if (membersetting[0].who_can_view_comments_onmypost == "Friends" && member_id != postdetails[i].member_id) {
            //             var friend = await post.check_aleradyfriend(member_id, postdetails[i].member_id);
            //             if (friend.length != 0) {
            //                 commentviewmypost = true;
            //             } else {
            //                 commentviewmypost = false
            //             };
            //         } else if (membersetting[0].who_can_view_comments_onmypost == "Only Me") {
            //             if (member_id == postdetails[i].member_id) {
            //                 commentviewmypost = true;
            //             } else {
            //                 commentviewmypost = false
            //             };
            //         } else if (membersetting[0].who_can_view_comments_onmypost == "Friends of Friends" && member_id != postdetails[i].member_id) {
            //             var friend = await post.check_aleradyfriend(member_id, postdetails[i].member_id);
            //             if (friend.length != 0) {
            //                 var f = 0;
            //                 for (var j = 0; j < friend.length; j++) {
            //                     var checkfriend = await post.check_aleradyfriend(
            //                         postdetails[j].member_id,
            //                         friend[j].member
            //                     );
            //                     if (checkfriend.length != 0) {
            //                         f++;
            //                     }
            //                     if (f == 0) {
            //                         seting = false;
            //                     } else {
            //                         seting = true;
            //                     }
            //                 }
            //             } else {
            //                 commentviewmypost = false
            //             };
            //         } else {
            //             commentviewmypost = true;
            //         }
            //         postdetails[i].commentviewmypost = commentviewmypost;
            //         var commentonmypost = '';

            //         if (membersetting[0].who_can_comment_onmypost == "Friends" && member_id != postdetails[i].member_id) {
            //             var friend = await post.check_aleradyfriend(member_id, postdetails[i].member_id);
            //             if (friend.length != 0) {
            //                 commentonmypost = true;
            //             } else {
            //                 commentonmypost = false
            //             };
            //         } else if (membersetting[0].who_can_comment_onmypost == "Only Me") {
            //             if (member_id == postdetails[i].member_id) {
            //                 commentonmypost = true;
            //             } else {
            //                 commentonmypost = false
            //             };
            //         } else if (membersetting[0].who_can_comment_onmypost == "Friends of Friends" && member_id != postdetails[i].member_id) {
            //             var friend = await post.check_aleradyfriend(member_id, postdetails[i].member_id);
            //             if (friend.length != 0) {
            //                 var f = 0;
            //                 for (var j = 0; j < friend.length; j++) {
            //                     var checkfriend = await post.check_aleradyfriend(
            //                         postdetails[i].member_id,
            //                         friend[j].member
            //                     );
            //                     if (checkfriend.length != 0) {
            //                         f++;
            //                     }
            //                     if (f == 0) {
            //                         commentonmypost = false;
            //                     } else {
            //                         commentonmypost = true;
            //                     }
            //                 }
            //             } else {
            //                 commentonmypost = false
            //             };
            //         } else {
            //             commentonmypost = true;
            //         }
            //         postdetails[i].commentonmypost = commentonmypost;
            //         postdetails[i].notification_time = await otherservice.postdate(postdetails[i].post_create_date);;
            //         postdetails[i].full_date = "full_date";
            //         postdetails[i].post_type == "hoookedup" ? postdetails[i].post_label = "Hook Me Up!!!" : "";
            //         postdetails[i].post_type == "fillme" ? postdetails[i].post_label = "Just In!!!" : "";
            //         postdetails[i].post_type == "snapit" ? postdetails[i].post_label = "Snap It" : "";
            //         if (postdetails[i].post_type == "opportunity") {
            //             if (postdetails[i].category_type == "give_opportunity") {
            //                 postdetails[i].post_label = "Giving Opportunity";
            //             } else {
            //                 postdetails[i].post_label = "Seeking Opportunity"
            //             }
            //         }
            //         postdetails[i].post_type == "good_deed" ? postdetails[i].post_label = "Good Deeds" : "";
            //         postdetails[i].post_type == "Profile" ? postdetails[i].post_label = "" : "";
            //         postdetails[i].post_type == "Cover" ? postdetails[i].post_label = "" : "";
            //         postdetails[i].post_type == "give" ?
            //             (postdetails[i].GiverModalVisibility = false,
            //                 postdetails[i].post_label = "Free Stuff") :
            //             "";
            //         postdetails[i].category_type == "Exchange" ?
            //             (postdetails[i].ExchangeModalVisibility = false,
            //                 postdetails[i].post_label = "For Exchange") :
            //             "";
            //         postdetails[i].category_type == "Exchange" ?
            //             (postdetails[i].ExchangeModalVisibility = false,
            //                 postdetails[i].post_label = "For Exchange",
            //                 postdetails[i].MessageExchangeOfferModal = false
            //             ) :
            //             "";
            //         postdetails[i].category_type == "Rent" ?
            //             (postdetails[i].RenterModalVisibility = false,
            //                 postdetails[i].post_label = "For Rent"
            //             ) :
            //             "";
            //         postdetails[i].category_type == "Sell" ?
            //             (postdetails[i].SellModalVisibility = false,
            //                 postdetails[i].post_label = "For Sale",
            //                 postdetails[i].MakeOfferModalVisibility = false
            //             ) :
            //             "";
            //         postdetails[i].category_type == "Wanted" ?
            //             (postdetails[i].WantedModalVisibility = false,
            //                 postdetails[i].post_label = "Wanted",
            //                 postdetails[i].DealWantedModalVisibility = false
            //             ) :
            //             "";
            //         if (postdetails[i].post_type == "ask") {
            //             postdetails[i].askMemberModalVisibility = false;
            //             postdetails[i].post_label = "I Need Answers !";
            //             postdetails[i].DealWantedModalVisibility = false;
            //             if (postdetails[i].parent_post_id == null) {
            //                 var askpostid = postdetails[i].post_id;
            //             } else {
            //                 var askpostid = postdetails[i].parent_post_id;
            //             }
            //             var check_option = await post.check_option(askpostid);
            //             postdetails[i].is_open_end == "True" ? postdetails[i].is_open_end = true : postdetails[i].is_open_end = false;
            //             if (check_option.length != 0) {
            //                 var selectedoption = await post.get_option_sessionmember(askpostid, member_id);
            //                 selectedoption.length != 0 ? postdetails[i].ask_selected_option = parseInt(selectedoption[0].option_choice_no) : postdetails[i].ask_selected_option = 0;
            //                 var optionmembercount = await post.get_option_count(askpostid);
            //                 optionmembercount = 100 / optionmembercount[0].optioncount;
            //                 if (postdetails[i].poll_question1 != "" && postdetails[i].poll_question1 != null) {
            //                     var optionmember = await post.get_option_member_details(askpostid, '1');
            //                     for (var j = 0; j < optionmember.length; j++) {
            //                         var profileimage = await post.profileimage(optionmember[j].member_id, "Profile");
            //                         profileimage.length != 0 ? optionmember[j].profileimage = profileimage[0].image : optionmember[j].profileimage = "";
            //                         var gender = await post.get_cometid(optionmember[j].member_id);
            //                         optionmember[j].member_gender = gender[0].gender;
            //                         var mutual = await post.mutualfriend(optionmember[j].member_id, member_id);
            //                         optionmember[j].mutualfriend = mutual[0].mutualcount;
            //                         var friend = await post.check_aleradyfriend(optionmember[j].member_id, member_id);
            //                         friend.length != 0 ? optionmember[j].friend_status = "Friends" : optionmember[j].friend_status = "Add Friend";
            //                     }
            //                     postdetails[i].poll_question1_list = optionmember;
            //                     postdetails[i].poll_question1_percentage = Math.round(optionmembercount * optionmember.length);
            //                     postdetails[i].poll_question1_total = optionmember.length;
            //                 }
            //                 if (postdetails[i].poll_question2 != "" && postdetails[i].poll_question2 != null) {
            //                     var optionmember = await post.get_option_member_details(askpostid, '2');
            //                     for (var j = 0; j < optionmember.length; j++) {
            //                         var profileimage = await post.profileimage(optionmember[j].member_id, "Profile");
            //                         profileimage.length != 0 ? optionmember[j].profileimage = profileimage[0].image : optionmember[j].profileimage = "";
            //                         var gender = await post.get_cometid(optionmember[j].member_id);
            //                         optionmember[j].member_gender = gender[0].gender;
            //                         var mutual = await post.mutualfriend(optionmember[j].member_id, member_id);
            //                         optionmember[j].mutualfriend = mutual[0].mutualcount;
            //                         var friend = await post.check_aleradyfriend(optionmember[j].member_id, member_id);
            //                         friend.length != 0 ? optionmember[j].friend_status = "Friends" : optionmember[j].friend_status = "Add Friend";
            //                     }
            //                     postdetails[i].poll_question2_list = optionmember;
            //                     postdetails[i].poll_question2_percentage = Math.round(optionmembercount * optionmember.length);
            //                     postdetails[i].poll_question2_total = optionmember.length;
            //                 }

            //             }
            //         }
            //         if (postdetails[i].post_type == "situation_room") {
            //             postdetails[i].post_label = "Situation Room";
            //             if (postdetails[i].parent_post_id == "" || postdetails[i].parent_post_id == null) {
            //                 var donate = await post.situation_donate_amount(postdetails[i].post_id);
            //                 if (donate[0].total != 0) {
            //                     if (donate[0].total == null) {
            //                         postdetails[i].donation_amount = 0;
            //                         postdetails[i].donation_amount_percentage = 0;
            //                     } else {
            //                         postdetails[i].donation_amount = donate[0].total;
            //                         postdetails[i].donation_amount_percentage = Math.round(donate[0].total * 100 / postdetails[i].amount);
            //                     }

            //                 } else {
            //                     postdetails[i].donation_amount = "0";
            //                     postdetails[i].donation_amount_percentage = 0;
            //                 }
            //             } else {
            //                 var donate = await post.situation_donate_amount(postdetails[i].parent_post_id);
            //                 if (donate[0].total != 0) {
            //                     if (donate[0].total == null) {
            //                         postdetails[i].donation_amount = 0;
            //                         postdetails[i].donation_amount_percentage = 0;
            //                     } else {
            //                         postdetails[i].donation_amount = donate[0].total;
            //                         postdetails[i].donation_amount_percentage = Math.round(donate[0].total * 100 / postdetails[i].amount);
            //                     }


            //                 } else {
            //                     postdetails[i].donation_amount = "0";
            //                     postdetails[i].donation_amount_percentage = 0;
            //                 }
            //             }
            //         }
            //         if (postdetails[i].post_type == "create") {
            //             var d = new Date();
            //             var end_date = postdetails[i].end_datetime;
            //             var start_date = postdetails[i].start_datetime;
            //             if (end_date > d) {
            //                 var end = 1;
            //             } else {
            //                 var end = 0;
            //             }
            //             if (end == 1) {
            //                 postdetails[i].eventtype = true;
            //             } else {
            //                 postdetails[i].eventtype = false;
            //                 postdetails[i].event_close_time = "";
            //             }
            //             var countreport = await post.get_event_report_count(postdetails[i].post_id, member_id);

            //             if (countreport.length != 0) {
            //                 postdetails[i].create_Going = countreport[0].Going;
            //                 postdetails[i].create_Interested = countreport[0].Interested;
            //                 postdetails[i].create_no = countreport[0].No;
            //                 countreport[0].status ? postdetails[i].event_status = countreport[0].status : postdetails[i].event_status = "Interested";
            //             } else {
            //                 postdetails[i].create_Going = 0;
            //                 postdetails[i].create_Interested = 0;
            //                 postdetails[i].create_no = 0;
            //                 postdetails[i].event_status = "Interested";
            //             }
            //         } else {
            //             postdetails[i].create_Going = 0;
            //             postdetails[i].create_Interested = 0;
            //             postdetails[i].create_no = 0;
            //         }
            //         if (postdetails[i].post_type == "turnup") {
            //             postdetails[i].post_label = "Turn Up";
            //             if (member_id == postdetails[i].member_id) {
            //                 var turnuplike = await post.turnup_like(postdetails[i].post_id, member_id);
            //                 if (turnuplike.length != 0) {
            //                     for (var j = 0; j < turnuplike.length; j++) {
            //                         var profileimage = await post.profileimage(turnuplike[j].member_id, "Profile");
            //                         profileimage.length != 0 ? turnuplike[j].profileimage = profileimage[0].image : turnuplike[j].profileimage = "";
            //                         var gender = await post.get_cometid(turnuplike[j].member_id);
            //                         turnuplike[j].member_gender = gender[0].gender;
            //                     }
            //                     postdetails[i].turnuplike = turnuplike;
            //                 } else {
            //                     postdetails[i].turnuplike = "";
            //                 }
            //             } else {
            //                 var turnuplike = await post.check_like_or_unlike(postdetails[i].post_id, member_id);
            //                 turnuplike.length != 0 ? postdetails[i].turnuplike = turnuplike[0].like_status : postdetails[i].turnuplike = "";
            //             }
            //         }
            //         var postimage = await post.post_image(postdetails[i].post_id);
            //         for (var x = 0; x < postimage.length; x++) {
            //             var postimagelike = await post.get_image_post_like(postdetails[i].member_id, postimage[x].post_id, postimage[x].post_image_id);
            //             postimage[x].total_like = postimagelike[0].total_like;
            //             postimagelike[0].likestatus == "Like" ? postimage[x].member_like_status = "Unlike" : postimage[x].member_like_status = "Like";
            //             var commentcount = await post.get_image_comment_count(postimage[x].post_image_id);
            //             postimage[x].commentcount = commentcount[0].total_comment;
            //             if (postimage[x].image_type == "video") {
            //                 var get_viewer = await post.get_video_viewer(postimage[x].post_image_id, "video");
            //                 get_viewer.length != 0 ? postimage[x].video_viewer = get_viewer.length : postimage[x].get_viewer = get_viewer.length;
            //             } else {
            //                 postimage[x].get_viewer = null;
            //             }
            //             postimage[x].image_commentcount = commentcount[0].total_comment;
            //         }
            //         postdetails[i].post_image = postimage;
            //         var profileimage = await post.profileimage(postdetails[i].member_id, "Profile");
            //         profileimage.length != 0 ? postdetails[i].profileimage = profileimage[0].image : postdetails[i].profileimage = "";
            //         var category = await post.get_post_category_id(postdetails[i].category_id);
            //         category.length != "" ? postdetails[i].category_name = category[0].category_name : postdetails[i].category_name = "";
            //         var gender = await post.get_cometid(postdetails[i].member_id);
            //         postdetails[i].member_gender = gender[0].gender;
            //         var profilecover = await post.profileimage(postdetails[i].member_id, "Cover");
            //         profilecover.length != 0 ? postdetails[i].profilecover = profilecover[0].image : postdetails[i].profilecover = "";
            //         var resizeimage = await otherservice.resizeimage(postdetails[i].post_id);
            //         postdetails[i].resize_post_image = resizeimage;
            //         var postlike = await post.get_post_like(member_id, postdetails[i].post_id);
            //         postdetails[i].total_like = postlike[0].total_like;
            //         postlike[0].likestatus == "Like" ? postdetails[i].member_like_status = "Unlike" : postdetails[i].member_like_status = "Like";
            //         var commentcount = await post.get_comment_count(postdetails[i].post_id);
            //         postdetails[i].commentcount = commentcount[0].total_comment;
            //         var checkpostlike = await post.get_post_likecheck(postdetails[i].post_id, member_id);
            //         if (checkpostlike[0].total_like == 1) {
            //             if (postdetails[i].total_like == 1) {
            //                 postdetails[i].mylike_string = true;
            //             } else {
            //                 postdetails[i].mylike_string = false;
            //             }
            //         } else {
            //             postdetails[i].mylike_string = false;
            //         }
            //         if (postdetails[i].location == null) {
            //             postdetails[i].location = '';
            //         }
            //         var savepost = await post.checkpostsaved(postdetails[i].post_id, member_id);
            //         postdetails[i].savepost = savepost.length != 0 ? savepost.length : 0;
            //         if (postdetails[i].parent_member_id != "" && postdetails[i].parent_member_id != null) {
            //             var parentmember = await post.get_cometid(postdetails[i].parent_member_id);
            //             postdetails[i].parent_first_name = parentmember[0].first_name;
            //             postdetails[i].parent_last_name = parentmember[0].last_name;
            //         }
            //         var share_post = await post.share_post_count(postdetails[i].post_id);
            //         postdetails[i].sharepost = share_post[0].share_count;
            //         postdetails[i].savepostvisible = false;
            //         postdetails[i].parent_post_image_id != "" ? postdetails[i].image_share_post = true : postdetails[i].image_share_post = false;
            //         var friend_storie = await general.friend_storie(member_id, postdetails[i].member_id);
            //         if (friend_storie.length != 0) {
            //             if (friend_storie[0].storie != 0) {
            //                 if (friend_storie[0].view_count == 0) {
            //                     postdetails[i].profile_storie = true;
            //                 } else {
            //                     postdetails[i].profile_storie = false;
            //                 }
            //             } else {
            //                 postdetails[i].profile_storie = false;
            //             }
            //         } else {
            //             postdetails[i].profile_storie = false
            //         }
            //     }
            //     // console.log('setting', seting)
            //     // console.log('commentlikesetting', commentlikesetting)
            //     // console.log('post', postdetails[0])
            // }
            // end for loop//



            // return postdetails
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }
}