const path = require('path');
module.exports.getMain = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'FrontEnd', 'Views', 'ChatMain.html'));
}