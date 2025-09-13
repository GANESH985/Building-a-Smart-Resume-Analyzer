import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Star, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface ResumeDetails {
  id: number;
  filename: string;
  name: string;
  email: string;
  phone: string;
  technical_skills: string[];
  soft_skills: string[];
  resume_rating: number;
  improvement_areas: string;
  upskill_suggestions: string;
  upload_date: string;
}

interface ResumeModalProps {
  resumeId: number;
  onClose: () => void;
}

const ResumeModal: React.FC<ResumeModalProps> = ({ resumeId, onClose }) => {
  const [resume, setResume] = useState<ResumeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResumeDetails();
  }, [resumeId]);

  const fetchResumeDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/resumes/${resumeId}`);
      setResume(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch resume details:', error);
      setError('Failed to load resume details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Resume Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>


        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="text-center py-12">
              <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading resume details...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Error Loading Details</p>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
              </div>
              <button
                onClick={fetchResumeDetails}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {resume && (
            <div className="space-y-6">

              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{resume.filename}</h3>
                    <p className="text-blue-100">
                      Uploaded: {new Date(resume.upload_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{resume.resume_rating}/10</div>
                    <div className="text-blue-100">Overall Score</div>
                  </div>
                </div>
              </div>

      
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-lg text-gray-800">{resume.name || 'Not detected'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg text-gray-800">{resume.email || 'Not detected'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-lg text-gray-800">{resume.phone || 'Not detected'}</p>
                    </div>
                  </div>
                </div>
              </div>


              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Technical Skills</h4>
                  {resume.technical_skills && resume.technical_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {resume.technical_skills.map((skill, index) => (
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

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Soft Skills</h4>
                  {resume.soft_skills && resume.soft_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {resume.soft_skills.map((skill, index) => (
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

      
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                  Areas for Improvement
                </h4>
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                  <p className="text-gray-700 leading-relaxed">{resume.improvement_areas}</p>
                </div>
              </div>

    
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Upskilling Suggestions
                </h4>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <p className="text-gray-700 leading-relaxed">{resume.upskill_suggestions}</p>
                </div>
              </div>
            </div>
          )}
        </div>


        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeModal;