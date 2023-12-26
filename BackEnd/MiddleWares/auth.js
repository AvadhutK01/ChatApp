const jwt = require("jsonwebtoken");
const userDb = require("../Models/UserModel");

//Authenticating user by decoding jwt token and checking against database
const authnticateUser = async (req, res, next) => {
    console.log(req.header('Authorization'));
    try {
        const token = req.header('Authorization');
        const user = jwt.verify(token, process.env.SECRETKEY);
        const result = await userDb.findByPk(user.userid);
        req.user = result;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ data: 'failed' });
    }
}
module.exports = authnticateUser;