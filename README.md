# Resume Parser Application

A full-stack web application that analyzes PDF resumes using AI to extract information, provide ratings, and suggest improvements.

## Features

- **PDF Resume Upload**: Drag & drop interface for uploading PDF resumes
- **AI-Powered Analysis**: Extracts contact info, skills, and provides intelligent feedback
- **Resume Rating**: Scores resumes on a 1-10 scale
- **Improvement Suggestions**: AI-generated recommendations for resume enhancement
- **Upskilling Recommendations**: Personalized suggestions for skill development
- **Historical Data**: View all previously uploaded resumes in a searchable table
- **Detailed Modal View**: Click to see full analysis of any uploaded resume

## Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Dropzone** for file uploads
- **Axios** for API communication

### Backend
- **FastAPI** (Python web framework)
- **SQLAlchemy** for database ORM
- **SQLite** for data storage
- **PyMuPDF** for PDF text extraction
- **Pydantic** for data validation

## Project Structure

```
resume-parser/
├── src/                          # React frontend
│   ├── components/
│   │   ├── UploadTab.tsx        # Resume upload interface
│   │   ├── HistoryTab.tsx       # Historical data view
│   │   └── ResumeModal.tsx      # Detailed resume view modal
│   └── App.tsx                  # Main application component
├── backend/                     # Python FastAPI backend
│   ├── main.py                  # Main application file
│   └── requirements.txt         # Python dependencies
├── sample_data/                 # Test resume files
└── uploads/                     # Uploaded resume storage
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
python main.py
```

The backend API will be available at `http://localhost:8000`

## API Endpoints

- `POST /api/resumes/upload` - Upload and analyze a resume
- `GET /api/resumes/` - Get all uploaded resumes
- `GET /api/resumes/{id}` - Get detailed information for a specific resume
- `GET /health` - Health check endpoint

## Usage

1. **Upload a Resume**: 
   - Go to the "Upload Resume" tab
   - Drag and drop a PDF file or click to select
   - Wait for the analysis to complete

2. **View Analysis**:
   - See extracted contact information
   - Review technical and soft skills
   - Read improvement suggestions
   - Check upskilling recommendations

3. **Browse History**:
   - Switch to "Resume History" tab
   - View all previously uploaded resumes
   - Click "Details" to see full analysis in a modal

## Features in Detail

### Resume Parsing
- Extracts contact information (name, email, phone)
- Identifies technical skills from a comprehensive keyword list
- Detects soft skills and interpersonal abilities
- Handles various PDF formats and layouts

### AI Analysis
- Rates resumes on a 1-10 scale based on multiple factors
- Provides specific improvement suggestions
- Recommends relevant skills to learn
- Analyzes content comprehensiveness

### Data Storage
- Stores all resume data in SQLite database
- Maintains file references for uploaded PDFs
- Tracks upload timestamps and analysis results

## Testing

### Sample Data
Add PDF resume files to the `sample_data/` folder for testing. Test with:
- Different resume formats and layouts
- Various experience levels
- Different skill sets and industries
- International and domestic contact formats

### Test Cases
1. Upload a simple 1-page resume
2. Upload a detailed multi-page resume
3. Test with resumes missing contact information
4. Verify skill extraction accuracy
5. Check improvement suggestion relevance

## Development Notes

### Mock LLM Implementation
This demo uses a mock LLM analyzer instead of real Gemini API integration. The mock analyzer:
- Generates ratings based on extracted skills and content length
- Provides relevant improvement suggestions
- Suggests upskilling opportunities based on detected skills

### Database Schema
The SQLite database stores:
- Resume metadata (filename, upload date)
- Extracted contact information
- Technical and soft skills arrays
- Analysis results (rating, suggestions)
- File paths for uploaded PDFs

## Future Enhancements

- Integration with real LLM APIs (Gemini, OpenAI)
- Support for additional file formats (DOC, DOCX)
- Advanced skill categorization and matching
- Resume comparison features
- Export functionality for analysis results
- User authentication and personal dashboards

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.
