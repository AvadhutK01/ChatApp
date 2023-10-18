const path = require('path');
module.exports.getIndex = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'Views', 'RegistrationPage.html'))
}