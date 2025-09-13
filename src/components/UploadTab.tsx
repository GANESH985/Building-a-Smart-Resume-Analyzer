import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Star, TrendingUp, AlertCircle, User, Mail, Phone } from 'lucide-react';
import axios from 'axios';

interface ResumeAnalysis {
  id: number;
  name: string;
  email: string;
  phone: string;
  technical_skills: string[];
  soft_skills: string[];
  resume_rating: number;
  improvement_areas: string;
  upskill_suggestions: string;
  filename: string;
}

const UploadTab: React.FC = () => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysis(response.data);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to process resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 
  });

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex">
          {[...Array(10)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-semibold text-gray-700">{rating}/10</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Resume</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg text-blue-600">Drop your resume here...</p>
          ) : (
            <>
              <p className="text-lg text-gray-600 mb-2">
                Drag & drop your resume here, or click to select
              </p>
              <p className="text-sm text-gray-500">PDF files only (max 10MB)</p>
            </>
          )}
        </div>
      </div>


      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Analyzing your resume...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      )}


      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 font-medium">Upload Failed</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}


      {analysis && (
        <div className="space-y-6">

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Analysis Complete!</h2>
                <p className="text-blue-100">File: {analysis.filename}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{analysis.resume_rating}/10</div>
                <div className="text-blue-100">Overall Score</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg text-gray-800">{analysis.name || 'Not detected'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg text-gray-800">{analysis.email || 'Not detected'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg text-gray-800">{analysis.phone || 'Not detected'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Skills</h3>
              {analysis.technical_skills && analysis.technical_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.technical_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No technical skills detected</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Soft Skills</h3>
              {analysis.soft_skills && analysis.soft_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.soft_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No soft skills detected</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
              Areas for Improvement
            </h3>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
              <p className="text-gray-700 leading-relaxed">{analysis.improvement_areas}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Upskilling Suggestions
            </h3>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <p className="text-gray-700 leading-relaxed">{analysis.upskill_suggestions}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTab;