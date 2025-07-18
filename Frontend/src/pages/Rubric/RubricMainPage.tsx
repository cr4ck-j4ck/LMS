import { useState } from 'react'
import { FileText, Upload, Brain, CheckCircle } from 'lucide-react'
import RubricForm from '@/Components/RubricForm'
import AssignmentUpload from '@/Components/AssignmentUploads'
import GradingResults from '@/Components/GradingResults'
import LoadingSpinner from '@/Components/LoadingSpinner'
import type { RubricData, AssignmentData, GradingResult } from '@/Types/index'
import { gradeAssignment } from '@/Services/api'
import toast from 'react-hot-toast'

function RubricMainPage() {
  const [currentStep, setCurrentStep] = useState<'rubric' | 'assignment' | 'results'>('rubric')
  const [rubricData, setRubricData] = useState<RubricData | null>(null)
  const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(null)
  const [gradingResults, setGradingResults] = useState<GradingResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRubricSubmit = (data: RubricData) => {
    setRubricData(data)
    setCurrentStep('assignment')
    toast.success('Rubric created successfully!')
  }

  const handleAssignmentSubmit = async (data: AssignmentData) => {
    if (!rubricData) {
      toast.error('Rubric data is missing')
      return; 
    }

    setAssignmentData(data)
    setIsLoading(true)

    try {
      const results = await gradeAssignment(rubricData, data)
      setGradingResults(results)
      setCurrentStep('results')
      toast.success('Assignment graded successfully!')
    } catch (error) {
      console.error('Grading error:', error)
      toast.error('Failed to grade assignment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOver = () => {
    setCurrentStep('rubric')
    setRubricData(null)
    setAssignmentData(null)
    setGradingResults(null)
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'rubric':
        return <FileText className="w-5 h-5" />
      case 'assignment':
        return <Upload className="w-5 h-5" />
      case 'results':
        return <Brain className="w-5 h-5" />
      default:
        return null
    }
  }

  const getStepStatus = (step: string) => {
    if (step === 'rubric' && rubricData) return 'completed'
    if (step === 'assignment' && assignmentData) return 'completed'
    if (step === 'results' && gradingResults) return 'completed'
    if (step === currentStep) return 'active'
    return 'pending'
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-600 p-3 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Rubric Assistant Grading
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered grading system using OpenAI-4o-mini for accurate, consistent assessment of any assignment
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {['rubric', 'assignment', 'results'].map((step, index) => {
              const status = getStepStatus(step)
              return (
                <div key={step} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${status === 'completed' 
                      ? 'bg-success-500 border-success-500 text-white' 
                      : status === 'active'
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      getStepIcon(step)
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`font-medium capitalize ${
                      status === 'active' ? 'text-primary-600' : 
                      status === 'completed' ? 'text-success-600' : 'text-gray-500'
                    }`}>
                      {step === 'rubric' ? 'Create Rubric' : 
                       step === 'assignment' ? 'Upload Assignment' : 'View Results'}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className={`
                      w-24 h-0.5 mx-4 transition-all duration-300
                      ${status === 'completed' ? 'bg-success-300' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 'rubric' && (
            <div className="animate-fade-in">
              <RubricForm onSubmit={handleRubricSubmit} />
            </div>
          )}

          {currentStep === 'assignment' && rubricData && (
            <div className="animate-fade-in">
              <AssignmentUpload 
                onSubmit={handleAssignmentSubmit}
                rubric={rubricData}
                onBack={() => setCurrentStep('rubric')}
              />
            </div>
          )}

          {currentStep === 'results' && gradingResults && rubricData && (
            <div className="animate-fade-in">
              <GradingResults 
                results={gradingResults}
                rubric={rubricData}
                onStartOver={handleStartOver}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-white text-sm">
            Powered by OpenAI-4o-mini AI • Built with precision for educational excellence
          </p>
        </div>
      </div>
    </div>
  )
}

export default RubricMainPage