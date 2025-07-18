import { useState, useRef } from 'react'
import { Upload, FileText, User, Calendar, ArrowLeft, Send } from 'lucide-react'
import type { AssignmentData, RubricData } from '@/Types'
import { extractTextFromPDF } from '@/Services/api'
import toast from 'react-hot-toast'

interface AssignmentUploadProps {
  onSubmit: (data: AssignmentData) => void
  rubric: RubricData
  onBack: () => void
}

const AssignmentUpload: React.FC<AssignmentUploadProps> = ({ onSubmit, rubric, onBack }) => {
  const [formData, setFormData] = useState({
    title: '',
    studentName: '',
    content: '',
    submissionDate: new Date().toISOString().split('T')[0]
  })
  const [fileType, setFileType] = useState<'text' | 'pdf'>('text')
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsProcessingFile(true)
    
    try {
      if (file.type === 'application/pdf') {
        setFileType('pdf')
        const extractedText = await extractTextFromPDF(file)
        setFormData(prev => ({ ...prev, content: extractedText }))
        toast.success('PDF content extracted successfully!')
      } else if (file.type === 'text/plain') {
        setFileType('text')
        const text = await file.text()
        setFormData(prev => ({ ...prev, content: text }))
        toast.success('Text file loaded successfully!')
      } else {
        toast.error('Please upload a PDF or text file')
      }
    } catch (error) {
      console.error('File processing error:', error)
      toast.error('Failed to process file. Please try again.')
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.studentName || !formData.content) {
      toast.error('Please fill in all required fields')
      return
    }

    const assignmentData: AssignmentData = {
      ...formData,
      fileType,
      submissionDate: formData.submissionDate
    }

    onSubmit(assignmentData)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white/90 rounded-2xl shadow-2xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Upload className="w-6 h-6 text-primary-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Upload Assignment</h2>
        </div>
        <button
          onClick={onBack}
          className="btn-secondary flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rubric
        </button>
      </div>

      {/* Rubric Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-primary-900 mb-2">Grading with {rubric.title}</h3>
        <p className="text-primary-700 text-sm mb-2">{rubric.description}</p>
        <div className="flex items-center text-sm text-primary-600">
          <span className="mr-4">Subject: {rubric.subject}</span>
          <span className="mr-4">Grade Level: {rubric.gradeLevel}</span>
          <span>Total Points: {rubric.totalPoints}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Assignment Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400 bg-white"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter assignment title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400 bg-white pl-10"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="Enter student name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white pl-10"
                value={formData.submissionDate}
                onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Assignment File
          </label>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 bg-gray-50 ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-100'} ${isProcessingFile ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isProcessingFile ? 'Processing file...' : 'Drop your file here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF and text files (max 10MB)
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isProcessingFile}
            >
              {isProcessingFile ? 'Processing...' : 'Choose File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Text Content Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Content *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400 bg-white pl-10 min-h-[300px]"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Paste or type the assignment content here, or upload a file above..."
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {formData.content.length} characters
          </p>
        </div>
        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="inline-flex items-center text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!formData.title || !formData.studentName || !formData.content || isProcessingFile}
          >
            <Send className="w-5 h-5 mr-2" />
            Grade Assignment
          </button>
        </div>
      </form>
    </div>
  )
}

export default AssignmentUpload