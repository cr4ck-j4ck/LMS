import axios from 'axios'
import type { RubricData, AssignmentData, GradingResult, ApiResponse } from '@/Types'

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`

export const gradeAssignment = async (
  rubric: RubricData,
  assignment: AssignmentData
): Promise<GradingResult> => {
  try {
    const response = await axios.post<ApiResponse<GradingResult>>(
      `${API_BASE_URL}/grade`,
      {
        rubric,
        assignment
      },
      {
        timeout: 120000, // 2 minutes timeout for AI processing
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to grade assignment')
    }

    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The AI is taking longer than expected.')
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
    }
    throw new Error('Failed to grade assignment. Please try again.')
  }
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post<ApiResponse<{ text: string }>>(
      `${API_BASE_URL}/extract-text`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      }
    )

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to extract text from PDF')
    }

    return response.data.data.text
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
    }
    throw new Error('Failed to extract text from PDF')
  }
}