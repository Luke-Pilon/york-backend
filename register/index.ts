import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import UserInput from "../util/classes/UserInput";
import User from "../util/classes/User";
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
            context.res = {
                "headers": {
                    "Content-Type": "application/json"
                },
                "status": 400,
                "body": {"message":message}
            }
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
            if(error.code === 11000){
                context.res = {
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "status": 409,
                    "body": {"message":"User with that name already exists."}
                }    
            }
        }

    } catch (error) {
        context.res = {
            "status": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "message": error.toString()
            }
        }
    }
};

export default httpTrigger;