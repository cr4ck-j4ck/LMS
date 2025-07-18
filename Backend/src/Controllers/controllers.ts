import fs from "fs"
import axios from "axios";
import pdf from "pdf-parse";




export async function extractText(url: string) {
    const path = "temp.pdf"
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

export async function plagiarismChecker(text: string): Promise<string> {
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

// Helper function to calculate letter grade
export const calculateLetterGrade = (percentage) => {
  if (percentage >= 97) return "A+";
  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 67) return "D+";
  if (percentage >= 63) return "D";
  if (percentage >= 60) return "D-";
  return "F";
};

export const createGradingPrompt = (rubric, assignment) => {
  const criteriaDetails = rubric.criteria
    .map((criterion) => {
      const levels = criterion.levels
        .map(
          (level) =>
            `${level.name} (${level.points} points): ${level.description}`
        )
        .join("\n    ");

      return `${criterion.name} (ID: ${criterion.id}, Weight: ${criterion.weight}%):
  Description: ${criterion.description}
  Performance Levels:
    ${levels}`;
    })
    .join("\n\n");

  return `You are an expert educational assessor with deep knowledge across all academic disciplines. You must grade assignments using the provided rubric with absolute precision and consistency.

ASSIGNMENT CONTEXT:
Title: ${assignment.title || "Not specified"}
Student: ${assignment.studentName || "Not specified"}
Subject: ${rubric.subject}
Grade Level: ${rubric.gradeLevel}
Submission Date: ${assignment.submissionDate || "Not specified"}

RUBRIC: ${rubric.title}
Description: ${rubric.description}
Total Possible Points: ${rubric.totalPoints}

ASSESSMENT CRITERIA:
${criteriaDetails}

GRADING INSTRUCTIONS:
1. Analyze the assignment content thoroughly against each criterion
2. For each criterion, determine the exact performance level achieved
3. Provide specific, constructive feedback with evidence from the content
4. Calculate weighted scores accurately
5. Identify specific strengths and areas for improvement
6. Provide actionable recommendations

CRITICAL RESPONSE FORMAT:
- Respond with ONLY valid JSON - no markdown, no code blocks, no backticks, no explanations
- Start your response directly with { and end with }
- Do not include \`\`\`json or any other formatting
- The JSON must be parseable and match this exact structure:

{
  "criterionGrades": [
    {
      "criterionId": "use_the_actual_criterion_id",
      "criterionName": "use_the_actual_criterion_name",
      "levelAchieved": "level_name",
      "pointsEarned": number,
      "maxPoints": number,
      "feedback": "detailed_feedback_with_evidence",
      "strengths": ["specific_strength_1", "specific_strength_2"],
      "improvements": ["specific_improvement_1", "specific_improvement_2"]
    }
  ],
  "overallFeedback": "comprehensive_overall_assessment",
  "strengths": ["key_strength_1", "key_strength_2", "key_strength_3"],
  "areasForImprovement": ["improvement_area_1", "improvement_area_2"],
  "recommendations": ["actionable_recommendation_1", "actionable_recommendation_2", "actionable_recommendation_3"]
}

REQUIREMENTS:
- Use the exact criterion IDs provided in the rubric
- Be absolutely precise in point allocation
- Provide evidence-based feedback with specific examples from the content
- Ensure feedback is constructive and educational
- Consider the grade level and subject context
- Maintain consistency with rubric descriptions
- Include specific quotes or references from the assignment when possible
- Provide actionable, specific recommendations for improvement
- ABSOLUTELY CRITICAL: Your entire response must be valid JSON starting with { and ending with }
- NO markdown formatting, NO code blocks, NO backticks, NO explanations outside the JSON
- The response must be immediately parseable by JSON.parse()`;
};