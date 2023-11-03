import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import UserInput from "../util/classes/UserInput";
import User from "../util/classes/User";
import errorResponseBuilder from "../util/errorResponseBuilder";
const getDb = require('../util/getDb')
const bcrypt = require('bcrypt');
const saltRounds = 10;

//TODO
//Typescript types for Mongo operations

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const db = await getDb();
        const users = db.collection(process.env.MONGODB_USERS);

        const username: string = req.body.name;
        const plaintextPw: string = req.body.password;

        if(!username || !plaintextPw || username.length<1 || plaintextPw.length<4){
            const message: string = !username ? "Username is required." : "Password must be at least 4 characters long."
            context.res = errorResponseBuilder(400, message)
            return;
        }

        const hashedPw:string = await bcrypt.hash(plaintextPw, saltRounds);

        const userInput: UserInput = {
            name: username,
            password: hashedPw
        }
        try {
            const result = await users.insertOne(userInput)
            const user: User = new User(userInput.name,result.insertedId)
            context.res = {
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {user}
            }
        } catch (error) {
            //mongodb client error code for unique constraint violation
            if(error.code === 11000){
                context.res = errorResponseBuilder(409, "User with that name already exists.")
            }
        }

    } catch (error) {
        context.res = errorResponseBuilder(500, error.toString())
    }
};

export default httpTrigger;