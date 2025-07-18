import { Award, TrendingUp, AlertTriangle, CheckCircle, RotateCcw, Download } from 'lucide-react'
import type { GradingResult, RubricData } from '@/Types'

interface GradingResultsProps {
  results: GradingResult
  rubric: RubricData
  onStartOver: () => void
}

const GradingResults: React.FC<GradingResultsProps> = ({ results, rubric, onStartOver }) => {
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Helper for badge color
  const getGradeBadgeStyle = (percentage: number) => {
    if (percentage >= 90)
      return 'bg-green-100 text-green-800 border-green-400';
    if (percentage >= 80)
      return 'bg-blue-100 text-blue-800 border-blue-400';
    if (percentage >= 70)
      return 'bg-yellow-100 text-yellow-800 border-yellow-400';
    return 'bg-red-100 text-red-800 border-red-400';
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-2 md:px-0">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="bg-white shadow-2xl rounded-3xl p-10 mb-10 border border-blue-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-blue-500 mr-5" />
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow">Grading Results</h2>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleDownloadReport}
                className="bg-gray-100 hover:bg-blue-100 text-blue-700 font-bold py-2 px-5 rounded-xl flex items-center shadow-md transition border border-blue-200"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Report
              </button>
              <button
                onClick={onStartOver}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl flex items-center shadow-md transition border border-blue-700"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Grade Another
              </button>
            </div>
          </div>

          {/* Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="text-center">
              <div className={`text-6xl font-extrabold drop-shadow ${getGradeColor(results.percentage)}`}>{results.totalScore}</div>
              <div className="text-gray-500 text-lg font-medium">out of {results.maxScore}</div>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-extrabold drop-shadow ${getGradeColor(results.percentage)}`}>{results.percentage.toFixed(1)}%</div>
              <div className="text-gray-500 text-lg font-medium">Percentage</div>
            </div>
            <div className="text-center">
              <div className={`inline-block px-8 py-4 rounded-full text-4xl font-extrabold border-4 shadow-md ${getGradeBadgeStyle(results.percentage)}`}>{results.letterGrade}</div>
              <div className="text-gray-500 mt-3 text-lg font-medium">Letter Grade</div>
            </div>
            <div className="text-center">
              <div className="text-base text-gray-400 mb-1">Graded on</div>
              <div className="text-xl font-bold text-gray-900">{new Date(results.gradingTimestamp).toLocaleDateString()}</div>
              <div className="text-base text-gray-400">{new Date(results.gradingTimestamp).toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Overall Feedback */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 shadow-inner">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Overall Feedback</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{results.overallFeedback}</p>
          </div>
        </div>

        {/* Criterion Breakdown */}
        <div className="bg-white shadow-2xl rounded-3xl p-10 mb-10 border border-blue-100">
          <h3 className="text-3xl font-bold text-gray-900 mb-10">Detailed Criterion Assessment</h3>
          <div className="space-y-10">
            {results.criterionGrades.map((grade, index) => (
              <div key={index} className="border border-blue-100 rounded-2xl p-8 bg-gradient-to-r from-white to-blue-50 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-2xl font-bold text-gray-900">{grade.criterionName}</h4>
                  <div className="flex items-center space-x-6">
                    <span className={`px-5 py-2 rounded-full text-lg font-bold border-2 shadow-sm ${getGradeBadgeStyle((grade.pointsEarned / grade.maxPoints) * 100)}`}>{grade.levelAchieved}</span>
                    <span className={`text-2xl font-extrabold ${getGradeColor((grade.pointsEarned / grade.maxPoints) * 100)}`}>{grade.pointsEarned}/{grade.maxPoints}</span>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        (grade.pointsEarned / grade.maxPoints) >= 0.9 ? 'bg-green-400' :
                        (grade.pointsEarned / grade.maxPoints) >= 0.8 ? 'bg-blue-400' :
                        (grade.pointsEarned / grade.maxPoints) >= 0.7 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${(grade.pointsEarned / grade.maxPoints) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2">Feedback</h5>
                    <p className="text-gray-700 text-base leading-relaxed">{grade.feedback}</p>
                  </div>
                  <div className="space-y-4">
                    {grade.strengths.length > 0 && (
                      <div>
                        <h5 className="font-bold text-green-700 mb-2 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Strengths
                        </h5>
                        <ul className="text-base text-gray-700 space-y-1">
                          {grade.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {grade.improvements.length > 0 && (
                      <div>
                        <h5 className="font-bold text-yellow-700 mb-2 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Areas for Improvement
                        </h5>
                        <ul className="text-base text-gray-700 space-y-1">
                          {grade.improvements.map((improvement, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-yellow-500 mr-2">•</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {/* Strengths */}
          <div className="bg-white shadow-2xl rounded-3xl p-10 border border-green-100">
            <h3 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 mr-3" />
              Key Strengths
            </h3>
            <ul className="space-y-4">
              {results.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1 text-xl">✓</span>
                  <span className="text-gray-800 text-lg">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Areas for Improvement */}
          <div className="bg-white shadow-2xl rounded-3xl p-10 border border-yellow-100">
            <h3 className="text-2xl font-bold text-yellow-700 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3" />
              Areas for Improvement
            </h3>
            <ul className="space-y-4">
              {results.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-3 mt-1 text-xl">!</span>
                  <span className="text-gray-800 text-lg">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white shadow-2xl rounded-3xl p-10 border border-blue-100">
          <h3 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3" />
            Recommendations for Future Assignments
          </h3>
          <ul className="space-y-4">
            {results.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1 text-xl">→</span>
                <span className="text-gray-800 text-lg">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default GradingResults