import pdf from "pdf-parse";
import express from "express";
import session from "express-session";
import passport from "passport";
import "./auth";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import FileStore from "session-file-store";
import { AxiosError } from "axios";
import fs from "fs";
import * as mammoth from "mammoth";

dotenv.config();

const app = express();
const PORT = 3000;

const allowedOrigins = ["http://localhost:5173"];

declare module "express-session" {
  interface SessionData {
    moodleAccessToken?: string;
    moodleInstituteName?: string;
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

async function plagiarismChecker(text: string): Promise<string> {
  const response = await axios.post(
    "https://api.gowinston.ai/v2/plagiarism",
    { text },
    {
      headers: {
        Authorization: `Bearer ${process.env.WINGSTON_API}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

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
    successRedirect: `http://localhost:5173/showLMS`,
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
    console.log(req.sessionID);
    const accessToken = req.user?.accessToken;
    const { url } = req.body;
    console.log("yeh dekh access token idhar ", accessToken);
    console.log(url);
    if (!accessToken) {
      return res.send("You are not Logged In..");
    }

    if (!url) {
      return res.status(400).send("URL is required in request body");
    }

    console.log("Google API URL:", url);

    const googleResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "arraybuffer",
      // responseType: "stream",
    });
    res.send(googleResponse.data);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data.toString() || error.message);
    }
    res.status(500).send("Error fetching data from Google API");
  }
});

app.post("/moodle-login", async (req, res) => {
  console.log("Request aa rahi hai ", req.sessionID);
  req.session.moodleInstituteName = req.body.institute;
  req.session.moodleAccessToken = req.body.authToken;
  console.log("req.user", req.session.moodleAccessToken);
  res.send("ha Bhai cheetey");
});

app.post("/moodle-api", async (req, res) => {
  console.log("yaha moodleAPI per aayi hai", req.session.moodleAccessToken);
  if (!req.session.moodleAccessToken) {
    return res.send("Please Login into Moodle First..");
  }
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).send("URL is required in request body");
    }
    const properURL = url.replace("TOKEN_HERE", process.env.MOODLE_TOKEN);
    console.log("Moodle API URL:", properURL);
    const moodleResponse = await axios.get(properURL);

    // console.log(moodleResponse.data);
    res.json(moodleResponse.data);
  } catch (error) {
    console.error("Moodle API Error:", error);
    res.status(500).send("Error fetching data from Moodle API");
  }
});
const path = "temp.pdf";

async function extractText(url: string) {
  console.log("Request Recieved", url);
  const writer = fs.createWriteStream(path);
  const response = await axios.get(url, { responseType: "stream" });
  await new Promise<void>((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", () => resolve());
    writer.on("error", reject);
  });

  const dataBuffer = fs.readFileSync(path);
  const text = await pdf(dataBuffer);
  fs.unlinkSync(path);

  return text.text;
}
app.post("/extract-text", async (req, res) => {
  console.log("got request!!");
  const response = await extractText(req.body.url);
  console.log(response);
  res.send("Hello Extract ho gaya hai text");
});
app.post("/canvas-api", async (req, res) => {
  try {
    // const accessToken = req.user?.accessToken;
    const { url } = req.body;

    // if (!accessToken) {
    //   return res.status(401).send("Please Login,.. You are not loginned... ");
    // }

    if (!url) {
      return res.status(400).send("URL is required in request body");
    }

    console.log("Moodle API URL:", url);

    const canvasResponse = await axios.get(
      `https://canvas.instructure.com${url}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CANVAS_TOKEN}`,
        },
      }
    );
    console.log(canvasResponse.data);
    console.log(canvasResponse.data);
    res.json(canvasResponse.data);
  } catch (error) {
    console.error("Moodle API Error:", error);
    res.status(500).send("Error fetching data from Canvas API");
  }
});

app.post("/plagiarismCheck", async (req, res, next) => {
  if (!req.user?.accessToken) {
    console.log("hai hi nahi access Token toh");
    return res.send("You are not allowed because you are not loggedin");
  }
  try {
    let url: string = req.body.url;
    let headers;

    if (req.body.urlFor === "moodle-file") {
      url = `${url}?token=${process.env.MOODLE_TOKEN}`;
      headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/octet-stream,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      };
    } else {
      headers = {
        Authorization: `Bearer ${req.user?.accessToken}`,
      };
    }
    const axiosResponse = await axios.get(url, {
      headers,
      responseType: "arraybuffer",
    });
    console.log("-----------------", axiosResponse.headers["content-type"]);
    console.log(axiosResponse.data);
    if (axiosResponse.headers["content-type"] == "application/pdf") {
      console.log("checking the pdf..");
      const buffer = Buffer.from(axiosResponse.data);
      const pdfData = await pdf(buffer);
      const textContent = pdfData.text;
      // Plagiarism Checker
      // const plagiarismResult = plagiarismChecker(textContent);
      console.log(textContent);
      res.json(textContent);
    } else if (
      axiosResponse.headers["content-type"] ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        buffer: axiosResponse.data,
      });
      // Plagiarism Checker
      // const plagiarismResult = await plagiarismChecker(result.value);
      // console.log(result.value);
      res.send(result.value);
    } else {
      // Plagiarism Checker
      // const plagiarismResult = await plagiarismChecker(axiosResponse.data);
      // console.log(axiosResponse.data);
      res.send(axiosResponse.data);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data.toString());
      console.log(error.response?.data.message);
      res.send("Error Occurred While Fetching , Error From (Backend)");
    } else {
      console.log(error);
      res.send("Error Occurred While Fetching...");
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
// useEffect(() => {
//   const unMountReport = (e:MouseEvent) => {
//     console.log(modalReport);
//     console.log(modalReport && reportEle.current && !reportEle.current?.contains(e.target as Node));
//     if(modalReport && reportEle.current && !reportEle.current?.contains(e.target as Node) && !viewEl.current?.contains(e.target as Node)){
//       setModalReport(null);
//     }else{
//       console.log("Ha Bhai ");
//     }
//   };
//   window.addEventListener("click", unMountReport);
//   return () => window.removeEventListener("click", unMountReport);
// }, [reportEle,modalReport]);
//   const reportEle = useRef<HTMLDivElement | null>(null);
// const viewEl = useRef<HTMLDivElement | null>(null);
