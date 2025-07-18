import express from "express";
import passport from "passport";
import axios, { AxiosError } from "axios";
import multer from "multer";
import { extractText } from "../Controllers/controllers";
const router = express.Router();
import pdf from "pdf-parse";
import { createGradingPrompt } from "../Controllers/controllers";
import OpenAI from "openai";
import { calculateLetterGrade } from "../Controllers/controllers";
import { plagiarismChecker } from "../Controllers/controllers";
import mammoth from 'mammoth';


router.get(
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

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `http://localhost:3000/login-failure`,
    successRedirect: `http://localhost:5173/showLMS`,
  })
);

router.get("/login-failure", (req, res) => {
  console.log("issue");
  res.send("Login failed. Try again.");
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
});

router.get("/disturbed", (req, res) => {
  res.send(`<a href="/log">Login with Google</a>`);
});

router.post("/google-api", async (req, res) => {
  try {
    const accessToken = req.user?.accessToken;
    const { url } = req.body;
    if (!accessToken) {
      return res.send("You are not Logged In..");
    }

    if (!url) {
      return res.status(400).send("URL is required in request body");
    }

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

router.post("/moodle-login", async (req, res) => {
  req.session.moodleInstituteName = req.body.institute;
  req.session.moodleAccessToken = req.body.authToken;
  res.send("ha Bhai cheetey");
});
router.post("/canvas-login", async (req, res) => {
  req.session.canvasInstituteName = req.body.institute;
  req.session.canvasAccessToken = req.body.authToken;
  res.send("ha Bhai cheetey");
});

router.post("/moodle-api", async (req, res) => {
  if (!req.session.moodleAccessToken) {
    return res.send("Please Login into Moodle First..");
  }
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).send("URL is required in request body");
    }
    const properURL = url.replace("TOKEN_HERE", process.env.MOODLE_TOKEN);
    const moodleResponse = await axios.get(properURL);

    // console.log(moodleResponse.data);
    res.json(moodleResponse.data);
  } catch (error) {
    console.error("Moodle API Error:", error);
    res.status(500).send("Error fetching data from Moodle API");
  }
});

router.post("/canvas-api", async (req, res) => {
  try {
    const accessToken = req.session?.canvasAccessToken;
    const { url } = req.body;

    if (!accessToken) {
      return res.status(401).send("Please Login,.. You are not loginned...");
    }

    if (!url) {
      return res.status(400).send("URL is required in request body");
    }


    const canvasResponse = await axios.get(
      `https://canvas.instructure.com${url}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CANVAS_TOKEN}`,
        },
      }
    );
    res.json(canvasResponse.data);
  } catch (error) {
    console.error("Moodle API Error:", error);
    res.status(500).send("Error fetching data from Canvas API");
  }
});

router.post("/plagiarismCheck", async (req, res, next) => {
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
    if (axiosResponse.headers["content-type"] == "application/pdf") {
      console.log("checking the pdf..");
      const buffer = Buffer.from(axiosResponse.data);
      const pdfData = await pdf(buffer);
      const textContent = pdfData.text;
      // Plagiarism Checker
      const plagiarismResult = await plagiarismChecker(textContent);
      console.log(plagiarismResult);
      res.json(plagiarismResult);
    } else if (
      axiosResponse.headers["content-type"] ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        buffer: axiosResponse.data,
      });
      // Plagiarism Checker
      const plagiarismResult = await plagiarismChecker(result.value);
      console.log(plagiarismResult);
      res.send(plagiarismResult);
    } else {
      // Plagiarism Checker
      const plagiarismResult = await plagiarismChecker(axiosResponse.data.toString());
      console.log(plagiarismResult);
      res.send(plagiarismResult);
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


// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and text files are allowed"));
    }
  },
});

router.post("/api/extract-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        error: "Only PDF files are supported",
      });
    }

    const pdfData = await pdf(req.file.buffer);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "No text could be extracted from the PDF",
      });
    }

    res.json({
      success: true,
      data: {
        text: pdfData.text.trim(),
      },
    });
  } catch (error) {
    console.error("PDF extraction error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to extract text from PDF",
    });
  }
});



// Initialize OpenAI client for DeepSeek-V3
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'openai_endpoint'
})

router.post("/api/grade", async (req, res) => {
  try {
    console.log("=== Grading Request Started ===");
    console.log("Request body keys:", Object.keys(req.body));

    const { rubric, assignment } = req.body;

    if (!rubric || !assignment) {
      console.error("Missing data:", {
        hasRubric: !!rubric,
        hasAssignment: !!assignment,
      });
      return res.status(400).json({
        success: false,
        error: "Missing rubric or assignment data",
      });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      console.error("Missing API key");
      return res.status(500).json({
        success: false,
        error: "DeepSeek API key not configured",
      });
    }

    console.log("Rubric:", {
      title: rubric.title,
      criteriaCount: rubric.criteria?.length || 0,
      totalPoints: rubric.totalPoints,
    });

    console.log("Assignment:", {
      title: assignment.title || "No title",
      hasContent: !!assignment.content,
      contentLength: assignment.content?.length || 0,
    });

    // Create the grading prompt (system instructions with rubric)
    const systemPrompt = createGradingPrompt(rubric, assignment);
    console.log("System prompt created, length:", systemPrompt.length);

    // Extract assignment content as string
    const assignmentContent =
      typeof assignment === "string"
        ? assignment
        : assignment.content || JSON.stringify(assignment);

    console.log(
      "Assignment content extracted, length:",
      assignmentContent.length
    );

    // Call DeepSeek-V3 API
    console.log("Calling DeepSeek API...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Please grade the following assignment content:\n\n${assignmentContent}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    console.log("API call successful");
    const aiResponse = completion.choices[0].message.content;

    if (!aiResponse) {
      console.error("Empty AI response");
      throw new Error("No response from AI");
    }

    console.log("AI response received, length:", aiResponse.length);
    console.log("AI response preview:", aiResponse.substring(0, 200));

    // Clean the response - remove any markdown formatting or extra text
    let cleanedResponse = aiResponse.trim();

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
      console.log("Removed json code blocks");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
      console.log("Removed code blocks");
    }

    // Remove any leading/trailing backticks
    cleanedResponse = cleanedResponse.replace(/^`+|`+$/g, "");

    // Find the first { and last } to extract just the JSON
    const firstBrace = cleanedResponse.indexOf("{");
    const lastBrace = cleanedResponse.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      console.error("No JSON braces found in response:", cleanedResponse);
      throw new Error(
        "Invalid response format from AI - no JSON structure found"
      );
    }

    cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
    console.log("Cleaned response preview:", cleanedResponse.substring(0, 200));

    // Parse AI response
    let gradingData;
    try {
      gradingData = JSON.parse(cleanedResponse);
      console.log("JSON parsing successful");
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Cleaned response:", cleanedResponse);
      throw new Error("Invalid response format from AI - JSON parsing failed");
    }

    // Validate required fields
    if (
      !gradingData.criterionGrades ||
      !Array.isArray(gradingData.criterionGrades)
    ) {
      console.error("Invalid gradingData structure:", Object.keys(gradingData));
      throw new Error(
        "Invalid response structure - missing criterionGrades array"
      );
    }

    console.log("Processing criterion grades...");
    // Validate and calculate scores
    let totalScore = 0;
    let maxScore = 0;

    const processedCriterionGrades = gradingData.criterionGrades.map(
      (grade, index) => {
        console.log(`Processing criterion ${index}:`, grade.criterionName);

        const criterion = rubric.criteria.find(
          (c) => c.name === grade.criterionName || c.id === grade.criterionId
        );
        if (!criterion) {
          console.error(
            `Criterion not found: ${grade.criterionName} (ID: ${grade.criterionId})`
          );
          console.error(
            "Available criteria:",
            rubric.criteria.map((c) => ({ name: c.name, id: c.id }))
          );
          throw new Error(`Criterion not found: ${grade.criterionName}`);
        }

        const maxCriterionPoints = Math.max(
          ...criterion.levels.map((l) => l.points)
        );
        const weightedPoints =
          (grade.pointsEarned / maxCriterionPoints) *
          (criterion.weight / 100) *
          rubric.totalPoints;

        totalScore += weightedPoints;
        maxScore += (criterion.weight / 100) * rubric.totalPoints;

        return {
          criterionId: criterion.id,
          criterionName: grade.criterionName,
          levelAchieved: grade.levelAchieved,
          pointsEarned: Math.round(weightedPoints * 100) / 100,
          maxPoints:
            Math.round((criterion.weight / 100) * rubric.totalPoints * 100) /
            100,
          feedback: grade.feedback,
          strengths: grade.strengths || [],
          improvements: grade.improvements || [],
        };
      }
    );

    console.log("Score calculation complete:", { totalScore, maxScore });

    // Calculate final metrics
    const percentage = (totalScore / maxScore) * 100;
    const letterGrade = calculateLetterGrade(percentage);

    // Construct final result
    const result = {
      totalScore: Math.round(totalScore * 100) / 100,
      maxScore: Math.round(maxScore * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      letterGrade,
      overallFeedback: gradingData.overallFeedback,
      criterionGrades: processedCriterionGrades,
      strengths: gradingData.strengths || [],
      areasForImprovement: gradingData.areasForImprovement || [],
      recommendations: gradingData.recommendations || [],
      gradingTimestamp: new Date().toISOString(),
    };

    console.log("=== Grading Request Completed Successfully ===");
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("=== Grading Error ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    let errorMessage = "Failed to grade assignment";
    let statusCode = 500;

    if (error.message.includes("API key")) {
      errorMessage = "AI service configuration error";
      statusCode = 500;
    } else if (error.message.includes("rate limit")) {
      errorMessage =
        "AI service temporarily unavailable. Please try again in a moment.";
      statusCode = 429;
    } else if (error.message.includes("timeout")) {
      errorMessage = "AI processing timeout. Please try again.";
      statusCode = 504;
    } else if (error.message.includes("Criterion not found")) {
      errorMessage = "Rubric validation error: " + error.message;
      statusCode = 400;
    } else if (error.message.includes("Invalid response")) {
      errorMessage = "AI response processing error: " + error.message;
      statusCode = 500;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
// Health check endpoint
router.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Rubric Grading API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router