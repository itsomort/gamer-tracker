import passport from "passport";
import passportLocal from "passport-local";
import connectToDb from '../db/mongo';
import { checkPassword } from "./user";
const LocalStrategy = passportLocal.Strategy;


passport.use(new LocalStrategy({
    // lowkey the username is actually the email
    usernameField: 'email'
}, async(username, password, done) => {
    // check if user exists
    let db = await connectToDb();
    let collection = await db.collection("users");
    let query = {email: username};
    let result = await collection.findOne(query);

    // user not found
    if(result === null) {
        return done(null, false, {
            message: "User not found"
        });
    }

    // check password
    if(!checkPassword(username, password)) {
        return done(null, false, {
            message: "Incorrect password"
        });
    }

    // password is correct
    return done(null, result);
}));