import { useState } from 'react'
import { Plus, Trash2, Save, FileText, Upload, Download, Info } from 'lucide-react'
import toast from 'react-hot-toast'

// Types
interface RubricLevel {
  id: string
  name: string
  description: string
  points: number
}

interface RubricCriterion {
  id: string
  name: string
  description: string
  weight: number
  levels: RubricLevel[]
}

interface RubricData {
  title: string
  description: string
  subject: string
  gradeLevel: string
  totalPoints: number
  criteria: RubricCriterion[]
}

interface RubricFormProps {
  onSubmit: (data: RubricData) => void
}

const RubricForm: React.FC<RubricFormProps> = ({ onSubmit }) => {
  const [showCsvHelp, setShowCsvHelp] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    gradeLevel: ''
  })
  const [criteria, setCriteria] = useState<RubricCriterion[]>([
    {
      id: '1',
      name: 'Content Knowledge',
      description: 'Demonstrates understanding of key concepts',
      weight: 25,
      levels: [
        { id: '1-1', name: 'Excellent', description: 'Comprehensive understanding with detailed explanations', points: 4 },
        { id: '1-2', name: 'Good', description: 'Good understanding with adequate explanations', points: 3 },
        { id: '1-3', name: 'Satisfactory', description: 'Basic understanding with minimal explanations', points: 2 },
        { id: '1-4', name: 'Needs Improvement', description: 'Limited understanding with unclear explanations', points: 1 }
      ]
    }
  ])

  // CSV Template download
  const downloadCsvTemplate = () => {
    const csvContent = `criterion_name,criterion_description,weight,level_1_name,level_1_points,level_1_description,level_2_name,level_2_points,level_2_description,level_3_name,level_3_points,level_3_description,level_4_name,level_4_points,level_4_description
"Content Knowledge","Demonstrates understanding of key concepts",25,"Excellent",4,"Comprehensive understanding with detailed explanations","Good",3,"Good understanding with adequate explanations","Satisfactory",2,"Basic understanding with minimal explanations","Needs Improvement",1,"Limited understanding with unclear explanations"
"Critical Thinking","Analyzes and evaluates information effectively",25,"Exceptional",4,"Sophisticated analysis with insightful evaluation","Proficient",3,"Clear analysis with appropriate evaluation","Developing",2,"Basic analysis with limited evaluation","Beginning",1,"Minimal analysis with unclear evaluation"
"Communication","Presents ideas clearly and effectively",25,"Outstanding",4,"Clear and engaging presentation of ideas","Good",3,"Clear presentation with minor issues","Adequate",2,"Generally clear with some unclear areas","Poor",1,"Unclear presentation with major issues"
"Organization","Structures work logically and coherently",25,"Excellent",4,"Highly organized with logical flow","Good",3,"Well organized with clear structure","Fair",2,"Adequately organized with some issues","Poor",1,"Poorly organized with unclear structure"`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rubric_template.csv'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('CSV template downloaded!')
  }

  // CSV File upload handler
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('Selected file type:', file.type) // Debug log
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a file with .csv extension')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        console.log('CSV content:', csvText.substring(0, 500) + '...') // Debug log
        
        const parsedCriteria = parseCsvData(csvText)
        console.log('Parsed criteria:', parsedCriteria) // Debug log
        
        if (parsedCriteria.length > 0) {
          setCriteria(parsedCriteria)
          toast.success(`Successfully imported ${parsedCriteria.length} criteria from CSV`)
        } else {
          toast.error('No valid criteria found in CSV file. Please ensure your file matches the template format.')
        }
      } catch (error) {
        console.error('Error parsing CSV:', error)
        toast.error(`Error parsing CSV file: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure your file matches the template format.`)
      }
    }
    reader.onerror = () => {
      toast.error('Error reading CSV file')
    }
    reader.readAsText(file)
    
    // Reset the input
    event.target.value = ''
  }

  // Parse CSV data with proper handling of quoted fields
  const parseCsvData = (csvText: string): RubricCriterion[] => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row')
    }

    // Parse CSV line properly handling quoted fields
    const parseCsvLine = (line: string): string[] => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      let i = 0

      while (i < line.length) {
        const char = line[i]
        
        if (char === '"' && !inQuotes) {
          inQuotes = true
        } else if (char === '"' && inQuotes) {
          if (i + 1 < line.length && line[i + 1] === '"') {
            // Handle escaped quotes
            current += '"'
            i++ // Skip next quote
          } else {
            inQuotes = false
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
        i++
      }
      
      values.push(current.trim())
      return values
    }

    const headers = parseCsvLine(lines[0])
    const expectedHeaders = [
      'criterion_name', 'criterion_description', 'weight',
      'level_1_name', 'level_1_points', 'level_1_description',
      'level_2_name', 'level_2_points', 'level_2_description',
      'level_3_name', 'level_3_points', 'level_3_description',
      'level_4_name', 'level_4_points', 'level_4_description'
    ]

    // Check if all required headers are present
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
    }

    const parsedCriteria: RubricCriterion[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // Skip empty lines
      
      const values = parseCsvLine(line)
      
      if (values.length < expectedHeaders.length) {
        console.warn(`Row ${i + 1} has ${values.length} columns, expected ${expectedHeaders.length}, skipping`)
        continue
      }

      const criterionId = `${Date.now()}-${i}`
      const criterion: RubricCriterion = {
        id: criterionId,
        name: values[0] || '',
        description: values[1] || '',
        weight: parseFloat(values[2]) || 0,
        levels: []
      }

      // Parse 4 levels
      for (let levelIndex = 0; levelIndex < 4; levelIndex++) {
        const baseIndex = 3 + (levelIndex * 3)
        const level: RubricLevel = {
          id: `${criterionId}-${levelIndex + 1}`,
          name: values[baseIndex] || `Level ${levelIndex + 1}`,
          points: parseInt(values[baseIndex + 1]) || (4 - levelIndex),
          description: values[baseIndex + 2] || ''
        }
        criterion.levels.push(level)
      }

      if (criterion.name.trim()) { // Only add if criterion has a name
        parsedCriteria.push(criterion)
      }
    }

    return parsedCriteria
  }

  const addCriterion = () => {
    const newId = Date.now().toString()
    const newCriterion: RubricCriterion = {
      id: newId,
      name: '',
      description: '',
      weight: 25,
      levels: [
        { id: `${newId}-1`, name: 'Excellent', description: '', points: 4 },
        { id: `${newId}-2`, name: 'Good', description: '', points: 3 },
        { id: `${newId}-3`, name: 'Satisfactory', description: '', points: 2 },
        { id: `${newId}-4`, name: 'Needs Improvement', description: '', points: 1 }
      ]
    }
    setCriteria([...criteria, newCriterion])
  }

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id))
  }

  const updateCriterion = <K extends keyof RubricCriterion>(id: string, field: K, value: RubricCriterion[K]) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const updateLevel = <K extends keyof RubricLevel>(criterionId: string, levelId: string, field: K, value: RubricLevel[K]) => {
    setCriteria(criteria.map(c => 
      c.id === criterionId 
        ? {
            ...c,
            levels: c.levels.map(l => 
              l.id === levelId ? { ...l, [field]: value } : l
            )
          }
        : c
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.subject || !formData.gradeLevel) {
      toast.error('Please fill in all required fields')
      return
    }

    if (criteria.length === 0) {
      toast.error('Please add at least one criterion')
      return
    }

    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.1) {
      toast.error('Criterion weights must total 100%')
      return
    }

    const totalPoints = criteria.reduce((sum, c) => sum + Math.max(...c.levels.map(l => l.points)), 0)

    const rubricData: RubricData = {
      ...formData,
      totalPoints,
      criteria
    }

    onSubmit(rubricData)
    toast.success('Rubric created successfully!')
  }

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Create Assessment Rubric</h2>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Research Paper on Climate Change"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Environmental Science"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Level *
            </label>
            <select
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${!formData.gradeLevel ? 'text-gray-400' : 'text-black'}`}
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              required
            >
              <option value="" disabled hidden>Select Grade Level</option>
              <option value="Elementary">Elementary (K-5)</option>
              <option value="Middle School">Middle School (6-8)</option>
              <option value="High School">High School (9-12)</option>
              <option value="College">College/University</option>
              <option value="Graduate">Graduate Level</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the assignment requirements and expectations..."
          />
        </div>

        {/* CSV Upload Section */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Criteria from CSV</h3>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
            </label>
            
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </button>
            
            <button
              type="button"
              onClick={() => setShowCsvHelp(!showCsvHelp)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Info className="w-4 h-4 mr-2" />
              CSV Format Help
            </button>
          </div>

          {showCsvHelp && (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Required columns (in this exact order):</strong></p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><code>criterion_name</code> - Name of the assessment criterion</li>
                  <li><code>criterion_description</code> - Description of the criterion</li>
                  <li><code>weight</code> - Percentage weight (must total 100% across all criteria)</li>
                  <li><code>level_1_name</code> - Name for performance level 1</li>
                  <li><code>level_1_points</code> - Points for level 1</li>
                  <li><code>level_1_description</code> - Description for level 1</li>
                  <li><code>level_2_name, level_2_points, level_2_description</code> - Level 2 details</li>
                  <li><code>level_3_name, level_3_points, level_3_description</code> - Level 3 details</li>
                  <li><code>level_4_name, level_4_points, level_4_description</code> - Level 4 details</li>
                </ul>
                <p><strong>Notes:</strong></p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Each row represents one criterion with 4 performance levels</li>
                  <li>Points should typically be ordered from highest to lowest (e.g., 4, 3, 2, 1)</li>
                  <li>Weights must be numeric and total 100% across all criteria</li>
                  <li>Download the template for a properly formatted example</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Criteria Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Assessment Criteria</h3>
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-medium ${
                Math.abs(totalWeight - 100) < 0.1 ? 'text-green-600' : 'text-red-600'
              }`}>
                Total Weight: {totalWeight.toFixed(1)}%
              </span>
              <button
                type="button"
                onClick={addCriterion}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                // disabled={Math.abs(totalWeight - 100) > 0.1}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Criterion
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {criteria.map((criterion, index) => (
              <div key={criterion.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Criterion {index + 1}
                  </h4>
                  {criteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriterion(criterion.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Criterion Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
                      value={criterion.name}
                      onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                      placeholder="e.g., Content Knowledge"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (%) *
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
                      value={criterion.weight}
                      onChange={(e) => updateCriterion(criterion.id, 'weight', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
                      value={criterion.description}
                      onChange={(e) => updateCriterion(criterion.id, 'description', e.target.value)}
                      placeholder="Brief description of this criterion"
                    />
                  </div>
                </div>

                {/* Performance Levels */}
                <div>
                  <h5 className="text-md font-medium text-gray-800 mb-3">Performance Levels</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {criterion.levels.map((level) => (
                      <div key={level.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Level Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-black placeholder-gray-400"
                            value={level.name}
                            onChange={(e) => updateLevel(criterion.id, level.id, 'name', e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Points
                          </label>
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-black placeholder-gray-400"
                            value={level.points}
                            onChange={(e) => updateLevel(criterion.id, level.id, 'points', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-black placeholder-gray-400"
                            rows={3}
                            value={level.description}
                            onChange={(e) => updateLevel(criterion.id, level.id, 'description', e.target.value)}
                            placeholder="Describe this performance level..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={Math.abs(totalWeight - 100) > 0.1}
          >
            <Save className="w-5 h-5 mr-2" />
            Create Rubric
          </button>
        </div>
      </div>
    </div>
  )
}

export default RubricForm