const express = require('express');
const http = require('http');
require('dotenv').config();
const mongoose = require('mongoose');
const app = express();
const cors = require("cors");
const helmetMiddleware = require('./src/middlewares/helmet.js');
const rateLimiter = require('./src/middlewares/rateLimiter.js');
const corsOptions = require('./src/middlewares/cors.js');
const {errorHandler,logger} = require('./src/middlewares/errorHandler.js');
const AuthRoutes = require('./src/routes/AuthRoutes');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
/* **********************mongodb connexion ************************* */
mongoose.connect(process.env.MONGO_URI, {
    connectTimeoutMS: 50000,
    serverSelectionTimeoutMS: 50000,
    family: 4,
    socketTimeoutMS: 50000,
    retryWrites: true,
    w: 'majority'
})
.then(() => console.log('connected to database!'))
.catch(err => console.error("can't connect to database", err));

/* **********************middlewares************************* */
app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(rateLimiter)
app.use(helmetMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,}));

app.use(errorHandler);

/* ******************************routes************************ */
app.use("/api/auth", AuthRoutes);
/* **********************server************************* */
const HTTP_PORT = 3000;



app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
http.createServer(app).listen(HTTP_PORT, async () => {
  console.log(`HTTP Server running on port ${HTTP_PORT}`);
});
module.exports = app;