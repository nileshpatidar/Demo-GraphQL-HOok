const router = require('express').Router()
const { getposts } = require('../resolver/post')

router.route('/getposts')
    .get(getposts)
    .post((req, res) => { res.status(400).send({ status: false, message: 'invalid request' }) })

module.exports = router