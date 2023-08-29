const {MongoClient} = require("mongodb")

var atlasInstance;
var dbInstance;

module.exports = async function() {
    if(!atlasInstance){
        atlasInstance = await MongoClient.connect(process.env.MONGODB_URI)
        dbInstance = atlasInstance.db(process.env.MONGODB_DATABASE)
    }
    return dbInstance
}