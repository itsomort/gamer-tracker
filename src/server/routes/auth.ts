import { Router, json } from 'express';
import { configDotenv } from 'dotenv';
import connectToDb from '../db/mongo';
import { generateJWT, generateHash } from '../auth/user';
import passport from 'passport';
configDotenv();

const router = Router();
router.use(json());

/**
 * POST /user/register
 * req: {"username": username, "email": email, "password": password}
 * res: {"message": message, "token": jwt_token}
 * message = success || username taken || email taken || missing fields
 */

router.post('/register', async(req, res) => {
    // take username, email, password
    // verify they exist in the request
    if(!req.body.email || !req.body.username || !req.body.password) {
        res.json({"message": "missing fields", "token": ""}).status(400);
        return;
    }

    console.log("all fields present");
    
    // make sure email and username are unique
    let db = await connectToDb();
    let collection = await db.collection("user-tests");
    // query for username and email
    let u_query = {username: req.body.username};
    let e_query = {email: req.body.email};
    let u_result = await collection.findOne(u_query);
    let e_result = await collection.findOne(e_query);

    if(u_result) {
        res.json({"message": "Username taken", "token": ""}).status(409);
        return;
    }
    if(e_result) {
        res.json({"message": "Email taken", "token": ""}).status(409);
        return;
    }

    console.log("unique email and username");

    // create hashed password and jwt token
    let [salt, hash] = generateHash(req.body.password);
    let userType = 0; // Default to regular user
    let token = generateJWT(req.body.email, req.body.username, userType);

    // creating new document without _id lets mongo make one for us
    // write email, username, hashed password, and salt to db

    try {
        await collection.insertOne({
            "username": req.body.username,
            "email": req.body.email,
            "hash": hash,
            "salt": salt,
            "type": 0 // 0 for regular user, 1 for admin
        });
        console.log("inserted into db");
    }
    catch {
        res.status(500).json({"message": "Database error", "token": ""});
        return;
    }

    // return jwt token to session
    res.status(200).json({"message": "success", "token": token});
});

/**
 * POST user/login
 * req: {"username": username, "password": password}
 * res: {"status": 0 || 1, "token": jwt_token}
 */

router.post('/login', (req, res, next) => {
    // authenticate with passport
    
    console.log("login route called");

    if(!req.body.username || !req.body.password) {
        console.log("missing fields to login");
        res.status(400).json({"status": 1, "token": ""});
        return;
    }

    // console.log("all fields present for login");
    //passport.authenticate('local', {session: false});
    passport.authenticate('local', {session: false}, (err: any, result: any, info: any) => {
        // console.log("in passport authenticate");
        // if passport error just die or something
        if(err) {
            // console.log("passport err");
            console.log(err);
            res.status(404).json({"status": 1, "token": ""});
            return;
        }
        
        // console.log("no error");
        // if user is found
            // generate jwt and return
        // else
            // throw a hissy fit everywhere

        // result = result from looking up db
        if(result) {
            const token = generateJWT(result.email, result.username, result.type || 0);
            console.log("generated new token from login");
            res.status(200).json({"status": 0, "token": token});
        } else {
            // console.log("user not found");
            console.log(info);
            res.status(401).json({"status": 1, "token": ""});
        }
        // console.log("past if statements ?");
    })(req, res, next);
});

export default router;