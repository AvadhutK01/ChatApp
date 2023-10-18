const userModel = require("../Models/UserModel");
const bcrypt = require('bcrypt');
const sequelize = require("../dbConnect");

module.exports.RegisterUser = async (req, res) => {
    const newName = req.body.nameInput;
    const newPhoneNO = req.body.phoneInput;
    const newEmail = req.body.emailInput;
    const newPasswordInput = req.body.passwordInput;
    const transaction = await sequelize.transaction();
    try {
        const hashedPassword = await bcrypt.hash(newPasswordInput, 10);
        await userModel.create({
            name: newName,
            phoneNO: newPhoneNO,
            email: newEmail,
            password: hashedPassword
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
}
