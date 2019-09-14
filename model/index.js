const mongoose = require('mongoose')
mongoose.Promise = mongoose.Promise
require('dotenv').config()
// mongodb+srv://montu:montu@nepon-pn1rg.mongodb.net/hoookedup?retryWrites=true&w=majority

const mongo_uri = 'mongodb+srv://montu:montu@cluster0-pocft.mongodb.net/hoookedup'
// mongoose.connect(process.env.MONGODB_URI, {
//     auth: {
//         user: process.env.MONGO_USER,
//         password: process.env.MONGO_PWD
//     }
// }, { useNewUrlParser: true, useFindAndModify: false })
// const db = mongoose.connection;
// db.on('error', console.log.bind(console, 'connection error'));
// db.once('open', () => {
//     console.log('\nSuccessfully connected to Mongo!\n');
// });
mongoose.connect(mongo_uri, { useNewUrlParser: true }).then(res => console.log('connected mongodb done')).catch(err => console.log('error in mongodb : ', err))

module.exports = mongoose