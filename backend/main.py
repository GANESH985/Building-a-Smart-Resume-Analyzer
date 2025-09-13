from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os
import uuid
import json
import re
import fitz
from typing import Dict, List, Any, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = "sqlite:///./resume_parser.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    full_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    

    summary = Column(Text)
    work_experience = Column(JSON)
    education = Column(JSON)
    
    technical_skills = Column(JSON)
    soft_skills = Column(JSON)
    certifications = Column(JSON)

    resume_rating = Column(Integer)
    improvement_areas = Column(Text)
    upskill_suggestions = Column(Text)
    
    total_experience_years = Column(Numeric(3,1))
    file_path = Column(String(500))
    processed_at = Column(DateTime)


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Resume Parser API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ResumeParser:
    def __init__(self):
        self.email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        self.phone_patterns = [
            r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'(\+\d{1,3}[-.\s]?)?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}',
            r'(\+\d{1,3}[-.\s]?)?\d{10}'
        ]
        
    def extract_text_from_pdf(self, file_path: str) -> str:
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            return ""
    
    def extract_contact_info(self, text: str) -> Dict[str, str]:

        email_match = re.search(self.email_pattern, text, re.IGNORECASE)
        email = email_match.group() if email_match else None
        
        phone = None
        for pattern in self.phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                phone = phone_match.group()
                break
        

        lines = [line.strip() for line in text.split('\n') if line.strip()]
        name = None
        
        for i, line in enumerate(lines[:15]):  
            line = line.strip()
            if len(line) > 2 and len(line.split()) >= 2 and len(line) < 50:
                
                skip_keywords = ['resume', 'cv', 'curriculum', 'vitae', 'email', 'phone', 'address', 
                               'objective', 'summary', 'experience', 'education', 'skills', '@', 'www', 'http']
                
                if not any(keyword in line.lower() for keyword in skip_keywords):
                    
                    if re.match(r'^[A-Za-z\s\.\-\']+$', line) and not line.isupper():
                        name = line
                        break
        
        return {
            'name': name,
            'email': email,
            'phone': phone
        }
    
    def extract_skills(self, text: str) -> Dict[str, List[str]]:
        technical_keywords = [
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
            'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
            
            'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
            'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
            

            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite',
            
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'linux', 'unix',
            'terraform', 'ansible',
            
            'machine learning', 'data analysis', 'data science', 'artificial intelligence',
            'blockchain', 'microservices', 'api', 'rest', 'graphql'
        ]
        
        soft_skill_keywords = [
            'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
            'creative', 'adaptable', 'detail oriented', 'time management', 'project management',
            'critical thinking', 'collaboration', 'interpersonal', 'organizational',
            'multitasking', 'decision making', 'conflict resolution', 'mentoring'
        ]
        
        text_lower = text.lower()
        

        technical_skills = []
        for skill in technical_keywords:
            if skill.lower() in text_lower:
                technical_skills.append(skill.title())
        

        soft_skills = []
        for skill in soft_skill_keywords:
            if skill.lower() in text_lower:
                soft_skills.append(skill.title())
        
        return {
            'technical_skills': list(set(technical_skills)),  
            'soft_skills': list(set(soft_skills))
        }
    
    def parse_resume(self, file_path: str) -> Dict[str, Any]:
        text = self.extract_text_from_pdf(file_path)
        contact_info = self.extract_contact_info(text)
        skills = self.extract_skills(text)
        
        return {
            'raw_text': text,
            'contact_info': contact_info,
            'skills': skills
        }

class MockLLMAnalyzer:
    def analyze_resume(self, resume_text: str, extracted_data: Dict[str, Any]) -> Dict[str, Any]:

        technical_skills = extracted_data.get('skills', {}).get('technical_skills', [])
        soft_skills = extracted_data.get('skills', {}).get('soft_skills', [])
        
    
        rating = 5 
        if len(technical_skills) > 5:
            rating += 2
        if len(soft_skills) > 3:
            rating += 1
        if len(resume_text) > 2000:
            rating += 1
        if extracted_data.get('contact_info', {}).get('email'):
            rating += 1
        
        rating = min(rating, 10)
        
        improvements = []
        if len(technical_skills) < 5:
            improvements.append("Add more technical skills relevant to your field")
        if len(soft_skills) < 3:
            improvements.append("Highlight more soft skills and interpersonal abilities")
        if not extracted_data.get('contact_info', {}).get('email'):
            improvements.append("Ensure your contact information is clearly visible")
        if len(resume_text) < 1000:
            improvements.append("Expand on your work experience and achievements")
        
        improvement_text = ". ".join(improvements) if improvements else "Your resume looks comprehensive. Consider adding quantifiable achievements and metrics to strengthen your impact statements."
        

        upskill_suggestions = []
        if 'python' in [s.lower() for s in technical_skills]:
            upskill_suggestions.append("Consider learning advanced Python frameworks like FastAPI or Django")
        if 'javascript' in [s.lower() for s in technical_skills]:
            upskill_suggestions.append("Explore modern JavaScript frameworks like React or Vue.js")
        if not any('cloud' in s.lower() or s.lower() in ['aws', 'azure', 'gcp'] for s in technical_skills):
            upskill_suggestions.append("Learn cloud technologies like AWS, Azure, or Google Cloud Platform")
        
        if not upskill_suggestions:
            upskill_suggestions.append("Consider learning emerging technologies in your field such as AI/ML, cloud computing, or modern development frameworks")
        
        upskill_text = ". ".join(upskill_suggestions)
        
        return {
            "resume_rating": rating,
            "improvement_areas": improvement_text,
            "upskill_suggestions": upskill_text,
            "enhanced_skills": {
                "technical_skills": technical_skills,
                "soft_skills": soft_skills
            }
        }


parser = ResumeParser()
analyzer = MockLLMAnalyzer()


@app.post("/api/resumes/upload")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        os.makedirs("uploads", exist_ok=True)
        
        file_id = str(uuid.uuid4())
        file_path = f"uploads/{file_id}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"File saved: {file_path}")

        parsed_data = parser.parse_resume(file_path)
        logger.info(f"Resume parsed successfully")
        

        analysis = analyzer.analyze_resume(parsed_data['raw_text'], parsed_data)
        logger.info(f"Analysis completed")
        

        resume = Resume(
            filename=file.filename,
            full_name=parsed_data['contact_info']['name'],
            email=parsed_data['contact_info']['email'],
            phone=parsed_data['contact_info']['phone'],
            technical_skills=parsed_data['skills']['technical_skills'],
            soft_skills=parsed_data['skills']['soft_skills'],
            resume_rating=analysis['resume_rating'],
            improvement_areas=analysis['improvement_areas'],
            upskill_suggestions=analysis['upskill_suggestions'],
            file_path=file_path,
            processed_at=datetime.utcnow()
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        logger.info(f"Resume saved to database with ID: {resume.id}")
        
        return {
            "id": resume.id,
            "filename": resume.filename,
            "name": resume.full_name,
            "email": resume.email,
            "phone": resume.phone,
            "technical_skills": resume.technical_skills or [],
            "soft_skills": resume.soft_skills or [],
            "resume_rating": resume.resume_rating,
            "improvement_areas": resume.improvement_areas,
            "upskill_suggestions": resume.upskill_suggestions
        }
        
    except Exception as e:
        logger.error(f"Error processing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@app.get("/api/resumes/")
async def get_all_resumes(db: Session = Depends(get_db)):
    try:
        resumes = db.query(Resume).order_by(Resume.upload_date.desc()).all()
        return [
            {
                "id": resume.id,
                "filename": resume.filename,
                "full_name": resume.full_name,
                "email": resume.email,
                "phone": resume.phone,
                "upload_date": resume.upload_date.isoformat() if resume.upload_date else None,
                "resume_rating": resume.resume_rating
            }
            for resume in resumes
        ]
    except Exception as e:
        logger.error(f"Error fetching resumes: {e}")
        raise HTTPException(status_code=500, detail="Error fetching resumes")

@app.get("/api/resumes/{resume_id}")
async def get_resume_details(resume_id: int, db: Session = Depends(get_db)):
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return {
            "id": resume.id,
            "filename": resume.filename,
            "name": resume.full_name,
            "email": resume.email,
            "phone": resume.phone,
            "technical_skills": resume.technical_skills or [],
            "soft_skills": resume.soft_skills or [],
            "resume_rating": resume.resume_rating,
            "improvement_areas": resume.improvement_areas,
            "upskill_suggestions": resume.upskill_suggestions,
            "upload_date": resume.upload_date.isoformat() if resume.upload_date else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching resume details: {e}")
        raise HTTPException(status_code=500, detail="Error fetching resume details")

@app.get("/")
async def root():
    return {"message": "Resume Parser API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)