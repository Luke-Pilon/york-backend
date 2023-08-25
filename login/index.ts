import { AzureFunction, Context, HttpRequest } from "@azure/functions"
const getDb = require('../util/getDb')
const bcrypt = require('bcrypt');


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const username = req.body.name;
        const pw = req.body.password;

        const db = await getDb();
        const users = db.collection(process.env.MONGODB_USERS);

        const user = await users.findOne({name:username});

        if(user){
            var result = await bcrypt.compare(pw, user.password)
            if(!result){
                context.res = {
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "message": "Incorrect username or password, please try again."
                    },
                    "status": 401
                }
                return;
            }
        } else {
            context.res = {
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": {
                    "message": "Incorrect username or password, please try again."
                },
                "status": 401
            }
            return;
        }
        context.res = {
            "headers": {
                "Content-Type": "application/json"
            },
            "body": user
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