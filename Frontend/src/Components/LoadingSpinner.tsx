import { Brain, Zap } from 'lucide-react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto animate-pulse-slow">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-warning-400 rounded-full flex items-center justify-center animate-bounce">
            <Zap className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          AI Grading in Progress
        </h2>
        
        <div className="max-w-md mx-auto mb-8">
          <p className="text-gray-600 mb-4">
            DeepSeek-V3 is analyzing the assignment against your rubric criteria...
          </p>
          
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center animate-fade-in">
              <div className="w-2 h-2 bg-primary-400 rounded-full mr-2 animate-pulse"></div>
              Analyzing content structure and quality
            </div>
            <div className="flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="w-2 h-2 bg-primary-400 rounded-full mr-2 animate-pulse"></div>
              Evaluating against rubric criteria
            </div>
            <div className="flex items-center justify-center animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="w-2 h-2 bg-primary-400 rounded-full mr-2 animate-pulse"></div>
              Generating detailed feedback
            </div>
            <div className="flex items-center justify-center animate-fade-in" style={{ animationDelay: '1.5s' }}>
              <div className="w-2 h-2 bg-primary-400 rounded-full mr-2 animate-pulse"></div>
              Calculating final scores
            </div>
          </div>
        </div>
        
        <div className="w-64 mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-primary-500 to-success-500 h-2 rounded-full animate-gradient" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-4">
          This may take 30-60 seconds for comprehensive analysis
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner