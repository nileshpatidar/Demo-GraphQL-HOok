const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const getposts = require('./resolver/post')
const graphqlHttp = require('express-graphql')
const schemas = require('./schema/index')
const resolver = require('./resolver/index')
const rout = require('./router')
const port = process.env.PORT ? process.env.PORT : 9335
app.use(bodyParser.json({ limit: '50mb' }));
var MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//cors
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, key, id");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use('/', rout)


// MongoClient.connect('mongodb+srv://montu:montu@cluster0-pocft.mongodb.net/hoookedup', { useUnifiedTopology: true, useNewUrlParser: true }, function (error, db) {
//     if (error) throw error;
//     let database = db.db('hoookedup');
//     database.collection("follow").rename("follows", false)
// })
app.use('/graphql', graphqlHttp({
    rootValue: resolver,
    schema: schemas,
    graphiql: true,
    customFormatErrorFn: error => {
        console.log(error)
        return error.message
    }
}))
app.listen(port, () => { console.log(`server running on ${port}/graphql`) })



// var express = require('express');
// const { ApolloServer } =  require('apollo-server-express');
// const schema = require("./graphql/schema/index")
// const resolvers =require("./graphql/resolver/index")

// const app = express();

// const server = new ApolloServer({
//   typeDefs: schema,
//   resolvers,
// });

// server.applyMiddleware({ app, path: '/graphql' });

// app.listen({ port: 8000 }, () => {
//   console.log('Apollo Server on http://localhost:8000/graphql');
