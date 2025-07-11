"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
require("./auth"); // 👈 Google strategy setup
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const session_file_store_1 = __importDefault(require("session-file-store"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3000;
const allowedOrigins = ["http://localhost:5173"];
const paraAndSentence = {
    paragraph: "Hi, I'm Pratyush Verma, a MERN stack developer passionate about building fast, scalable, and user-friendly web applications. I work with MongoDB, Express.js, React, and Node.js to create full-stack solutions that solve real-world problems. I enjoy turning ideas into clean, efficient code and continuously improving my skills to stay updated with the latest in web development",
    sentences: [
        {
            length: 124,
            score: 59.98,
            text: "Hi, I'm Pratyush Verma, a MERN stack developer passionate about building fast, scalable, and user-friendly web applications."
        },
        {
            length: 115,
            score: 10.98,
            text: 'I work with MongoDB,, Express.js, React, and Node.js to create full-stack solutions that solve real-world problems.'
        },
        {
            length: 138,
            score: 59.34,
            text: 'I enjoy turning ideas into clean, efficient code and continuously improving my skills to stay updated with the latest in web development.'
        }
    ]
};
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // If you're using cookies/sessions
}));
const FileStoreInstance = (0, session_file_store_1.default)(express_session_1.default);
// Setup session
app.use((0, express_session_1.default)({
    store: new FileStoreInstance({}),
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: true
}));
// Initialize Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// ------------------- ROUTES ------------------- //
// 👇 User clicks this to start Google login
app.get("/login", passport_1.default.authenticate("google", {
    scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/classroom.courses.readonly",
        "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
        "https://www.googleapis.com/auth/classroom.rosters.readonly",
        "https://www.googleapis.com/auth/drive.readonly"
    ],
}));
// 👇 Google redirects here after login
app.get("/auth/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: `http://localhost:3000/login-failure`,
    successRedirect: `http://localhost:5173/dashboard`, // ✅ send user here if login is successful
}));
// 👤 Protected profile route
app.get("/profile", (req, res) => {
    var _a, _b;
    if (!req.isAuthenticated()) {
        return res.redirect("/login-failure");
    }
    // 👇 Send user details
    res.send(`
    <h1>Welcome ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.displayName}</h1>
    <p>Email: ${(_b = req.user) === null || _b === void 0 ? void 0 : _b.emails}</p>
    <a href="/logout">Logout</a>
  `);
});
// ❌ Failed login
app.get("/login-failure", (req, res) => {
    console.log("issue");
    res.send("Login failed. Try again.");
});
// 🚪 Logout
app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err)
            console.log(err);
        res.redirect("/");
    });
});
// 🏠 Home route
app.get("/disturbed", (req, res) => {
    res.send(`<a href="/log">Login with Google</a>`);
});
app.get("/getA", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const accessToken = (_a = req.user) === null || _a === void 0 ? void 0 : _a.accessToken;
    if (!accessToken)
        return res.status(401).send("Not logged in");
    const googleResponse = yield axios_1.default.get("https://classroom.googleapis.com/v1/courses/783074160423/courseWork", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    // console.log(response.data);
    const checkAIContent = (textToCheck) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield axios_1.default.post("https://api.gowinston.ai/v2/ai-content-detection", { text: textToCheck }, {
            headers: {
                Authorization: `Bearer ${process.env.WINGSTON_API}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    });
    const checkedData = yield checkAIContent("Hi, I'm Pratyush Verma, a MERN stack developer passionate about building fast, scalable, and user-friendly web applications. I work with MongoDB, Express.js, React, and Node.js to create full-stack solutions that solve real-world problems. I enjoy turning ideas into clean, efficient code and continuously improving my skills to stay updated with the latest in web development.");
    console.log("Hey see this data ", checkedData);
    res.json({
        responseByGoogle: googleResponse.data,
        responseByWingston: checkedData
    });
}));
app.get("/getPandS", (req, res, next) => {
    console.log("hii got p&s");
    res.send(paraAndSentence);
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
// https://classroom.googleapis.com/v1/courses
// https://classroom.googleapis.com/v1/courses/783074160423/courseWork
// https://www.googleapis.com/drive/v3/files/1BhsFL5cLp7UqEvSM7U30yPl_vXbopauG?alt=media
