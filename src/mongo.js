// @ts-check
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb')

dotenv.config()
const uri = `mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PASSWORD}@cluster0.7icbg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
    useNewUrlParser : true,
    useUnifiedTopology: true,
})

module.exports = client