const jwt = require('jsonwebtoken');
import { configDotenv } from 'dotenv';
import connectToDb from '../db/mongo';
import { pbkdf2Sync, randomBytes } from 'crypto';
configDotenv();

export function generateHash(password: string) {
    let salt = randomBytes(16).toString('hex');
    let hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString();

    return [salt, hash];
}

export async function checkPassword(email: string, password: string) {
    // find user in database
    let db = await connectToDb();
    let collection = await db.collection("users");
    let query = {email: email};
    let result = await collection.findOne(query);

    if(result === null) {
        return false;
    }
    else {
        // if user found, get salt and compare hashed passwords
        let salt = result.salt;
        let hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString();
        // validate password
        return hash === result.hash;
    }
}

export function generateJWT(_id: string, email: string, name: string) {
    var expire = new Date();
    // token expires after a week
    expire.setDate(expire.getDate() + 7);

    return jwt.sign({
        _id: _id,
        email: email,
        name: name,
        exp: expire.getTime() / 1000
    }, process.env.JWT_SECRET,
    {algorithm: "HS256"});
}
