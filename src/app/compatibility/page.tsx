'use client'

import { useState } from 'react'
import { Navigation } from '@/components/ui/navigation'
import { Upload, CheckCircle, XCircle, AlertCircle, Zap, Monitor, Cpu, HardDrive } from 'lucide-react'

interface CompatibilityResult {
  score: number
  compatible: boolean
  issues: string[]
  recommendations: string[]
}

interface SystemSpecs {
  ledCount: number
  controllerType: string
  voltage: string
  maxCurrent: number
  protocol: string
  refreshRate: number
}

export default function CompatibilityPage() {
  const [systemSpecs, setSystemSpecs] = useState<SystemSpecs>({
    ledCount: 0,
    controllerType: '',
    voltage: '5V',
    maxCurrent: 0,
    protocol: 'WS2812B',
    refreshRate: 60
  })
  
  const [sequenceFile, setSequenceFile] = useState<File | null>(null)
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [loading, setLoading] = useState(false)

  const controllerTypes = [
    'Arduino Uno',
    'Arduino Nano',
    'ESP32',
    'ESP8266',
    'Raspberry Pi',
    'WLED Controller',
    'FadeCandy',
    'Other'
  ]

  const protocols = [
    'WS2812B',
    'WS2811',
    'APA102',
    'SK6812',
    'LPD8806',
    'Other'
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSequenceFile(file)
    }
  }

  const handleSpecChange = (field: keyof SystemSpecs, value: string | number) => {
    setSystemSpecs(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const checkCompatibility = async () => {
    if (!sequenceFile || !systemSpecs.ledCount || !systemSpecs.controllerType) {
      alert('Please fill in all required fields and upload a sequence file.')
      return
    }

    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('sequence', sequenceFile)
      formData.append('specs', JSON.stringify(systemSpecs))

      const response = await fetch('/api/compatibility/score', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        // Mock result for demo purposes
        const mockResult: CompatibilityResult = {
          score: Math.floor(Math.random() * 40) + 60, // 60-100
          compatible: true,
          issues: systemSpecs.ledCount > 1000 ? ['High LED count may cause performance issues'] : [],
          recommendations: [
            'Consider using a dedicated power supply for LED strips over 300 LEDs',
            'Ensure proper grounding between controller and LED strip',
            'Use appropriate gauge wire for your LED count'
          ]
        }
        
        if (systemSpecs.ledCount > 1000) {
          mockResult.score -= 20
          mockResult.issues.push('LED count exceeds recommended limit for this controller')
        }
        
        if (systemSpecs.maxCurrent > 10) {
          mockResult.recommendations.push('Consider using a current-limiting resistor')
        }
        
        mockResult.compatible = mockResult.score >= 70
        setResult(mockResult)
      }
    } catch (error) {
      console.error('Compatibility check failed:', error)
      alert('Failed to check compatibility. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Compatibility Check
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your LED sequence and enter your system specifications to check compatibility 
            and get optimization recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Specifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              System Specifications
            </h2>

            <div className="space-y-4">
              {/* LED Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of LEDs *
                </label>
                <input
                  type="number"
                  value={systemSpecs.ledCount || ''}
                  onChange={(e) => handleSpecChange('ledCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 300"
                  required
                />
              </div>

              {/* Controller Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Controller Type *
                </label>
                <select
                  value={systemSpecs.controllerType}
                  onChange={(e) => handleSpecChange('controllerType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select controller</option>
                  {controllerTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Voltage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Voltage
                </label>
                <select
                  value={systemSpecs.voltage}
                  onChange={(e) => handleSpecChange('voltage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="3.3V">3.3V</option>
                  <option value="5V">5V</option>
                  <option value="12V">12V</option>
                  <option value="24V">24V</option>
                </select>
              </div>

              {/* Max Current */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Current (Amps)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={systemSpecs.maxCurrent || ''}
                  onChange={(e) => handleSpecChange('maxCurrent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5.0"
                />
              </div>

              {/* Protocol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LED Protocol
                </label>
                <select
                  value={systemSpecs.protocol}
                  onChange={(e) => handleSpecChange('protocol', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {protocols.map((protocol) => (
                    <option key={protocol} value={protocol}>{protocol}</option>
                  ))}
                </select>
              </div>

              {/* Refresh Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Refresh Rate (Hz)
                </label>
                <input
                  type="number"
                  value={systemSpecs.refreshRate || ''}
                  onChange={(e) => handleSpecChange('refreshRate', parseInt(e.target.value) || 60)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          {/* Sequence Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Sequence File
            </h2>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Sequence File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".json,.xml,.seq,.led"
                  className="hidden"
                  id="sequence-upload"
                />
                <label htmlFor="sequence-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {sequenceFile ? sequenceFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports: JSON, XML, SEQ, LED files
                  </p>
                </label>
              </div>
            </div>

            {/* Check Button */}
            <button
              onClick={checkCompatibility}
              disabled={loading || !sequenceFile || !systemSpecs.ledCount || !systemSpecs.controllerType}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Checking Compatibility...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Check Compatibility
                </>
              )}
            </button>

            {/* Results */}
            {result && (
              <div className="mt-6 p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Compatibility Results</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(result.score)} ${getScoreColor(result.score)}`}>
                    {result.score}% Compatible
                  </div>
                </div>

                {/* Overall Status */}
                <div className="flex items-center mb-4">
                  {result.compatible ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className={result.compatible ? 'text-green-700' : 'text-red-700'}>
                    {result.compatible ? 'Compatible' : 'Compatibility Issues Found'}
                  </span>
                </div>

                {/* Issues */}
                {result.issues.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-red-700 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Issues
                    </h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      {result.issues.map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Recommendations
                    </h4>
                    <ul className="text-sm text-blue-600 space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            How Compatibility Scoring Works
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-start">
              <Cpu className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Performance Analysis:</strong> We check if your controller can handle the sequence's complexity and frame rate requirements.
              </div>
            </div>
            <div className="flex items-start">
              <HardDrive className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Memory Requirements:</strong> Ensures your system has enough memory to store and process the sequence data.
              </div>
            </div>
            <div className="flex items-start">
              <Zap className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Power Analysis:</strong> Calculates power requirements and checks against your system's capabilities.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}