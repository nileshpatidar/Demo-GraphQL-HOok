const mongoose = require('mongoose')
mongoose.Promise = mongoose.Promise
require('dotenv').config()
const mongo_uri = 'Url'
mongoose.connect(mongo_uri, { useNewUrlParser: true }).then(res => console.log('connected mongodb done')).catch(err => console.log('error in mongodb : ', err))
module.exports = mongoose
