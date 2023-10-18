const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(cors({
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST']
}))
const path = require('path');
const sequelize = require('./dbConnect');
const userRouter = require('./Routes/userRoutes');
const router = require('./Routes/indexRoute');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);
app.use("/user", userRouter)
app.use(express.static(path.join(__dirname, '..', 'FrontEnd', 'Public')));
sequelize.sync().then(() => app.listen(3000))