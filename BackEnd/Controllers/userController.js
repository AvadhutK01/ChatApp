const userModel = require("../Models/UserModel");
const bcrypt = require('bcrypt');
const sequelize = require("../dbConnect");
const jwt = require('jsonwebtoken');
const moment = require("moment/moment");
const crypto = require('crypto');
const AWS = require('aws-sdk');

//Adding new user
module.exports.RegisterUser = async (req, res) => {
    const newName = req.body.name;
    const newPhoneNO = req.body.phoneNo;
    const newEmail = req.body.email;
    const newPasswordInput = req.body.password;
    const file = req.file;
    const filename = file ? file.originalname : null;
    const transaction = await sequelize.transaction();

    try {
        let profilePictureUrl = '';

        if (file) {
            try {
                const s3 = new AWS.S3({
                    accessKeyId: process.env.IAM_USER_KEY,
                    secretAccessKey: process.env.IAM_USER_SECRET
                });

                const params = {
                    Bucket: 'chatfilebuckett',
                    Key: filename,
                    Body: file.buffer
                };

                const s3Response = await s3.upload(params).promise();
                profilePictureUrl = s3Response.Location;
            } catch (s3Error) {
                console.error('S3 Upload Failed:', s3Error);
                profilePictureUrl = ''; // fallback to empty string
            }
        }

        const hashedPassword = await bcrypt.hash(newPasswordInput, 10);
        const currentDateTime = moment().format('DD/MM/YYYY, hh:mm A');

        await userModel.create({
            id: getRandomInt(100000, 999999),
            name: newName,
            profiePicture: profilePictureUrl,
            phoneNO: newPhoneNO,
            email: newEmail,
            password: hashedPassword,
            lastSeen: currentDateTime,
        }, { transaction });

        await transaction.commit();
        res.status(201).json({ message: 'success' });
    } catch (error) {
        await transaction.rollback();
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ message: 'exist' });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

//checking and authenticating user from database
module.exports.verifyLogin = async (req, res) => {
    const phoneNO = req.body.phoneNo;
    const password = req.body.password;
    const t = await sequelize.transaction();
    try {
        let data = await userModel.findOne({
            where: {
                phoneNO: phoneNO
            },
            transaction: t
        });

        if (data) {
            const checkLogin = await bcrypt.compare(password, data.password);
            if (checkLogin) {
                await t.commit();
                res.status(201).json({ message: 'success', token: generateAccessToken(data.id) });
            } else {
                await t.rollback();
                res.status(401).json({ message: 'Failed' });
            }
        } else {
            await t.rollback();
            res.status(404).json({ message: 'NotExist' });
        }
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

//helper functions

//generating access token
function generateAccessToken(id) {
    return jwt.sign({ userid: id }, process.env.SECRETKEY);
}

//generating random number
function getRandomInt(min, max) {
    const buffer = crypto.randomBytes(4);
    const randomNumber = buffer.readUInt32LE(0);
    return Math.floor(randomNumber / 0xFFFFFFFF * (max - min + 1) + min);
}