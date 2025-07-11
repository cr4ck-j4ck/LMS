// src/server.ts
import express from "express";
import session from "express-session";
import passport from "passport";
import "./auth";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import FileStore from "session-file-store";


dotenv.config();

const app = express();
const PORT = 3000;

const allowedOrigins = ["http://localhost:5173"];

declare module "express-session" {
  interface SessionData {
    accessToken?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      accessToken?: string;
    }
  }
}

interface Isentence{
  length:number,
  score:number,
  text:string
}

interface Ipara{
  paragraph:string,
  sentences:Isentence[]
}
const paraAndSentence:Ipara = {
  paragraph : "Hi, I'm Pratyush Verma, a MERN stack developer passionate about building fast, scalable, and user-friendly web applications. I work with MongoDB, Express.js, React, and Node.js to create full-stack solutions that solve real-world problems. I enjoy turning ideas into clean, efficient code and continuously improving my skills to stay updated with the latest in web development",
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
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
const FileStoreInstance = FileStore(session);

// Setup session
app.use(session({
  store: new FileStoreInstance({}),
  secret: "my-secret-key",
  resave: false,
  saveUninitialized: true
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ------------------- ROUTES ------------------- //

app.get(
  "/login",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/classroom.courses.readonly",
      "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
      "https://www.googleapis.com/auth/classroom.rosters.readonly",
      "https://www.googleapis.com/auth/drive.readonly"
    ],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `http://localhost:3000/login-failure`,
    successRedirect: `http://localhost:5173/dashboard`,
  })
);


app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login-failure");
  }

  res.send(`
    <h1>Welcome ${req.user?.displayName}</h1>
    <p>Email: ${req.user?.emails}</p>
    <a href="/logout">Logout</a>
  `);
});

app.get("/login-failure", (req, res) => {
  console.log("issue");
  res.send("Login failed. Try again.");
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
});


app.get("/disturbed", (req, res) => {
  res.send(`<a href="/log">Login with Google</a>`);
});

app.get("/getA", async (req, res) => {
  const accessToken = req.user?.accessToken;
  if (!accessToken) return res.status(401).send("Not logged in");

  const googleResponse = await axios.get("https://classroom.googleapis.com/v1/courses/783074160423/courseWork", {
    headers:{
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const checkAIContent = async (textToCheck : string ) => {
    const response = await axios.post(
      "https://api.gowinston.ai/v2/ai-content-detection",
      { text: textToCheck },
      {
        headers: {
          Authorization: `Bearer ${process.env.WINGSTON_API}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  };
  const checkedData = await checkAIContent("Hi, I'm Pratyush Verma, a MERN stack developer passionate about building fast, scalable, and user-friendly web applications. I work with MongoDB, Express.js, React, and Node.js to create full-stack solutions that solve real-world problems. I enjoy turning ideas into clean, efficient code and continuously improving my skills to stay updated with the latest in web development.");
  console.log("Hey see this data ", checkedData);
  res.json({
    responseByGoogle:googleResponse.data,
    responseByWingston: checkedData
  });
});

app.get("/getPandS",(req,res,next)=>{
  console.log("hii got p&s");
  res.send(paraAndSentence);
})

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// https://classroom.googleapis.com/v1/courses
// https://classroom.googleapis.com/v1/courses/783074160423/courseWork
// https://www.googleapis.com/drive/v3/files/1BhsFL5cLp7UqEvSM7U30yPl_vXbopauG?alt=media


