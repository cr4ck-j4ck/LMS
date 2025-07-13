import pdf from 'pdf-parse';
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface Isentence {
  length: number;
  score: number;
  text: string;
}

interface Ipara {
  paragraph: string;
  sentences: Isentence[];
}
const paraAndSentence: Ipara = {
  paragraph:
    "Hi, I'm Pratyush Verma, a MERN stack developer passionate about building fast, scalable, and user-friendly web applications. I work with MongoDB, Express.js, React, and Node.js to create full-stack solutions that solve real-world problems. I enjoy turning ideas into clean, efficient code and continuously improving my skills to stay updated with the latest in web development",
  sentences: [
    {
      length: 124,
      score: 59.98,
      text: "Hi, I'm Pratyush Verma, a MERN stack developer passionate about building fast, scalable, and user-friendly web applications.",
    },
    {
      length: 115,
      score: 10.98,
      text: "I work with MongoDB,, Express.js, React, and Node.js to create full-stack solutions that solve real-world problems.",
    },
    {
      length: 138,
      score: 59.34,
      text: "I enjoy turning ideas into clean, efficient code and continuously improving my skills to stay updated with the latest in web development.",
    },
  ],
};

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
app.use(
  session({
    store: new FileStoreInstance({}),
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: true,
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
      "https://www.googleapis.com/auth/drive.readonly",
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


app.post("/google-api", async (req, res) => {
  try {
    const accessToken = req.user?.accessToken;
    const { url } = req.body;

    if (!accessToken) {
      return res.status(401).send("login karle.. Login nahi hai ");
    }

    if (!url) {
      return res.status(400).send("URL is required in request body");
    }

    console.log("Google API URL:", url);

    const googleResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
      ,responseType: 'arraybuffer'
      // responseType: "stream",
    });
    console.log("see the Content Type ----",googleResponse.headers['content-type']);
if(googleResponse.headers['content-type'] == "application/pdf"){
      const buffer = Buffer.from(googleResponse.data);
    const pdfData = await pdf(buffer);
    const textContent = pdfData.text;
    console.log(textContent);
    res.json(textContent);
  }else{
    res.send(googleResponse.data.toString());
  }
  } catch (error) {
    console.error("Google API Error:", error);
    res.status(500).send("Error fetching data from Google API");
  }
});

app.post("/moodle-api", async (req, res) => {
  try {
    const accessToken = req.user?.accessToken;
    const { url } = req.body;

    if (!accessToken) {
      return res.status(401).send("Please Login,.. You are not loginned... ");
    }

    if (!url) {
      return res.status(400).send("URL is required in request body");
    }

    console.log("Moodle API URL:", url);

    const moodleResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(moodleResponse.data);
    res.json(moodleResponse.data);
  } catch (error) {
    console.error("Moodle API Error:", error);
    res.status(500).send("Error fetching data from Moodle API");
  }
});

app.get("/getPandS", (req, res, next) => {
  console.log("hii got p&s");
  res.send(paraAndSentence);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});