export interface RubricCriterion {
    id: string
    name: string
    description: string
    weight: number
    levels: RubricLevel[]
  }
  
  export interface RubricLevel {
    id: string
    name: string
    description: string
    points: number
  }
  
  export interface RubricData {
    title: string
    description: string
    subject: string
    gradeLevel: string
    totalPoints: number
    criteria: RubricCriterion[]
  }
  
  export interface AssignmentData {
    title: string
    studentName: string
    content: string
    fileType: 'text' | 'pdf'
    submissionDate: string
  }
  
  export interface CriterionGrade {
    criterionId: string
    criterionName: string
    levelAchieved: string
    pointsEarned: number
    maxPoints: number
    feedback: string
    strengths: string[]
    improvements: string[]
  }
  
  export interface GradingResult {
    totalScore: number
    maxScore: number
    percentage: number
    letterGrade: string
    overallFeedback: string
    criterionGrades: CriterionGrade[]
    strengths: string[]
    areasForImprovement: string[]
    recommendations: string[]
    gradingTimestamp: string
  }
  
  export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
  }