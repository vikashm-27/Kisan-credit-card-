const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRouter = require('./routes/authroute');
const customerRoute = require('./routes/customerroute');
const uploadPan = require('./routes/uploadPan');
const pdftextfile = require('./routes/pdftotextfile');
const uploadVoterid = require('./routes/uploadVoterid');
const sessionRoute = require('./routes/sessionRoute');
const landVerificationRoute = require('./routes/landVerificationRoute');
const loanCalculatorRoute = require('./routes/loanCalculatorRoute');
const adminRoute = require('./routes/adminRoute');
const chatRoute = require('./routes/chatRoute');

const logger = require('./logger');
const sequelize = require('./db/connection');
const models = require('./models');

sequelize.sync({ alter: true }).then(() => {
    console.log('All MySQL tables synced');
});

const app = express();
const port = process.env.PORT || 4005;

/* ===================== MIDDLEWARE ===================== */

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Increased limit for testing
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"],
    credentials: true,
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || "1651651651sacav1s65vd1s6165166cs1a61csa65scadvaasg",
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

/* ===================== 🔥 REQUEST LOGGER ===================== */

app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const responseTime = Date.now() - start;

        logger.info({
            type: "request",
            method: req.method,
            url: req.originalUrl,
            status_code: res.statusCode,
            response_time: responseTime,
            ip: req.ip,
            user_id: req.user ? req.user.userId : 'anonymous',
            user_agent: req.headers["user-agent"],
        });
    });

    next();
});

/* ===================== ROUTES ===================== */

app.use('/api/auth', authRouter); // Prefixed for better organization
app.use(authRouter); // Keep old path for compatibility if needed, or remove if all frontend updated
app.use(customerRoute);
app.use(pdftextfile);
app.use(uploadPan);
app.use(uploadVoterid);
app.use(sessionRoute);
app.use(landVerificationRoute);
app.use(loanCalculatorRoute);
app.use(adminRoute);
app.use(chatRoute);

/* ===================== TEST ROUTES ===================== */

app.get("/", (req, res) => {
    res.send("KCC Backend API is running");
});

app.get("/error", (req, res, next) => {
    try {
        throw new Error("Test error triggered");
    } catch (err) {
        next(err);
    }
});

/* ===================== 🔥 ERROR LOGGER ===================== */

app.use((err, req, res, next) => {
    logger.error({
        type: "error",
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        status_code: err.status || 500,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
    });

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

/* ===================== SERVER ===================== */

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
