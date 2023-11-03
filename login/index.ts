import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import User from "../util/classes/User";
import errorResponseBuilder from "../util/errorResponseBuilder";
const getDb = require('../util/getDb')
const bcrypt = require('bcrypt');

//TODO
//Implement function in another file to handle errors
//IE - function that accepts a status and a message and returns the res object
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const username: string = req.body.name;
        const pw: string = req.body.password;

        const db = await getDb();
        const users = db.collection(process.env.MONGODB_USERS);

        const user = await users.findOne({name:username});

        if(user){
            var result = await bcrypt.compare(pw, user.password)
            if(!result){
                context.res = errorResponseBuilder(401, "Incorrect username or password, please try again.")
                return;
            }
        } else {
            context.res = errorResponseBuilder(401, "Incorrect username or password, please try again.")
            return;
        }
        var userResponse: User;
        if(user.gameRecords){
            userResponse = new User(user.name,user.id,user.gameRecords)
        } else {
            userResponse = new User(user.name, user.id)
        }
        context.res = {
            "headers": {
                "Content-Type": "application/json"
            },
            "body": user
        }
    } catch (error) {
        context.res = errorResponseBuilder(500, error.toString())
    }
};

export default httpTrigger;