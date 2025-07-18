import { Award, TrendingUp, AlertTriangle, CheckCircle, RotateCcw, Download } from 'lucide-react'
import type { GradingResult, RubricData } from '@/Types'

interface GradingResultsProps {
  results: GradingResult
  rubric: RubricData
  onStartOver: () => void
}

const GradingResults: React.FC<GradingResultsProps> = ({ results, rubric, onStartOver }) => {
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success-600'
    if (percentage >= 80) return 'text-primary-600'
    if (percentage >= 70) return 'text-warning-600'
    return 'text-error-600'
  }

  const getGradeBadgeClass = (percentage: number) => {
    if (percentage >= 90) return 'grade-excellent'
    if (percentage >= 80) return 'grade-good'
    if (percentage >= 70) return 'grade-satisfactory'
    return 'grade-needs-improvement'
  }

  const handleDownloadReport = () => {
    const reportContent = `
GRADING REPORT
==============

Assignment: ${rubric.title}
Student: ${results.criterionGrades[0]?.criterionName || 'N/A'}
Date: ${new Date(results.gradingTimestamp).toLocaleDateString()}

OVERALL SCORE
=============
Score: ${results.totalScore}/${results.maxScore} (${results.percentage.toFixed(1)}%)
Letter Grade: ${results.letterGrade}

CRITERION BREAKDOWN
==================
${results.criterionGrades.map(grade => `
${grade.criterionName}: ${grade.pointsEarned}/${grade.maxPoints} points
Level Achieved: ${grade.levelAchieved}
Feedback: ${grade.feedback}
`).join('\n')}

OVERALL FEEDBACK
===============
${results.overallFeedback}

STRENGTHS
=========
${results.strengths.map(strength => `• ${strength}`).join('\n')}

AREAS FOR IMPROVEMENT
====================
${results.areasForImprovement.map(area => `• ${area}`).join('\n')}

RECOMMENDATIONS
==============
${results.recommendations.map(rec => `• ${rec}`).join('\n')}
    `

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grading-report-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Award className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Grading Results</h2>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDownloadReport}
              className="btn-secondary flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
            <button
              onClick={onStartOver}
              className="btn-primary flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Grade Another
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getGradeColor(results.percentage)} mb-2`}>
              {results.totalScore}
            </div>
            <div className="text-gray-600">out of {results.maxScore}</div>
          </div>
          
          <div className="text-center">
            <div className={`text-4xl font-bold ${getGradeColor(results.percentage)} mb-2`}>
              {results.percentage.toFixed(1)}%
            </div>
            <div className="text-gray-600">Percentage</div>
          </div>
          
          <div className="text-center">
            <div className={`
              inline-block px-4 py-2 rounded-full text-2xl font-bold border-2
              ${getGradeBadgeClass(results.percentage)}
            `}>
              {results.letterGrade}
            </div>
            <div className="text-gray-600 mt-2">Letter Grade</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Graded on</div>
            <div className="text-lg font-medium text-gray-900">
              {new Date(results.gradingTimestamp).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(results.gradingTimestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Overall Feedback */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Overall Feedback</h3>
          <p className="text-gray-700 leading-relaxed">{results.overallFeedback}</p>
        </div>
      </div>

      {/* Criterion Breakdown */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Criterion Assessment</h3>
        <div className="space-y-6">
          {results.criterionGrades.map((grade, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">{grade.criterionName}</h4>
                <div className="flex items-center space-x-4">
                  <span className={`
                    px-3 py-1 rounded-full text-sm font-medium border
                    ${getGradeBadgeClass((grade.pointsEarned / grade.maxPoints) * 100)}
                  `}>
                    {grade.levelAchieved}
                  </span>
                  <span className={`text-lg font-bold ${getGradeColor((grade.pointsEarned / grade.maxPoints) * 100)}`}>
                    {grade.pointsEarned}/{grade.maxPoints}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (grade.pointsEarned / grade.maxPoints) >= 0.9 ? 'bg-success-500' :
                      (grade.pointsEarned / grade.maxPoints) >= 0.8 ? 'bg-primary-500' :
                      (grade.pointsEarned / grade.maxPoints) >= 0.7 ? 'bg-warning-500' : 'bg-error-500'
                    }`}
                    style={{ width: `${(grade.pointsEarned / grade.maxPoints) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Feedback</h5>
                  <p className="text-gray-700 text-sm leading-relaxed">{grade.feedback}</p>
                </div>

                <div className="space-y-4">
                  {grade.strengths.length > 0 && (
                    <div>
                      <h5 className="font-medium text-success-700 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Strengths
                      </h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {grade.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-success-500 mr-2">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {grade.improvements.length > 0 && (
                    <div>
                      <h5 className="font-medium text-warning-700 mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Areas for Improvement
                      </h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {grade.improvements.map((improvement, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-warning-500 mr-2">•</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="card">
          <h3 className="text-lg font-semibold text-success-700 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Key Strengths
          </h3>
          <ul className="space-y-3">
            {results.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-success-500 mr-3 mt-1">✓</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="card">
          <h3 className="text-lg font-semibold text-warning-700 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {results.areasForImprovement.map((area, index) => (
              <li key={index} className="flex items-start">
                <span className="text-warning-500 mr-3 mt-1">!</span>
                <span className="text-gray-700">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Recommendations for Future Assignments
        </h3>
        <ul className="space-y-3">
          {results.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="text-primary-500 mr-3 mt-1">→</span>
              <span className="text-gray-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default GradingResults