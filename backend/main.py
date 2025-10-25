from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import fitz  # PyMuPDF
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from typing import Optional, List
from datetime import datetime

# Import our services
from services.adzuna_service import search_jobs
from services.learning_path_service import generate_learning_path
from database import add_analysis, get_analysis_history, add_chat_message, get_chat_history

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://*.vercel.app",    # Vercel deployments
        "https://your-app-name.vercel.app"  # Your specific domain (update later)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check API key
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("⚠️  WARNING: OPENAI_API_KEY not found in .env file!")
else:
    print("✅ OpenAI API key loaded successfully")

# Initialize OpenAI
client = OpenAI(api_key=api_key)

# Store resume in memory (in production, use database)
resume_storage = {}
transcript_storage = {}

# Models
class JobCompareRequest(BaseModel):
    resume_id: str
    job_description: str
    job_title: Optional[str] = "Unknown Position"
    company: Optional[str] = "Unknown Company"

class TranscriptUploadRequest(BaseModel):
    resume_id: str
    transcript_text: str

class JobSearchRequest(BaseModel):
    resume_id: str
    keywords: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    resume_id: Optional[str] = None

@app.get("/")
def home():
    return {"message": "AI Career Copilot is running! 🚀", "version": "2.0"}

@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and analyze a resume PDF"""
    
    print(f"📄 Received file: {file.filename}")
    
    try:
        # Read the PDF
        pdf_bytes = await file.read()
        print(f"✅ File read successfully: {len(pdf_bytes)} bytes")
        
        # Extract text
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        resume_text = ""
        for page in doc:
            resume_text += page.get_text()
        
        print(f"✅ Extracted {len(resume_text)} characters from PDF")
        
        if len(resume_text) < 50:
            raise HTTPException(status_code=400, detail="Resume appears to be empty or unreadable")
        
        # Ask GPT to extract skills
        prompt = f"""Extract the key technical and professional skills from this resume. 
Return ONLY a JSON object with this exact format:
{{
  "skills": ["Python", "SQL", "React", "Communication", ...]
}}

Resume:
{resume_text[:2000]}"""
        
        print("🤖 Calling OpenAI API...")
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        print("✅ OpenAI response received")
        
        skills_data = json.loads(response.choices[0].message.content)
        
        # Store resume
        resume_id = f"resume_{len(resume_storage) + 1}"
        resume_storage[resume_id] = {
            "text": resume_text,
            "skills": skills_data.get("skills", []),
            "filename": file.filename,
            "uploaded_at": datetime.now().isoformat()
        }
        
        print(f"✅ Resume stored with ID: {resume_id}")
        print(f"✅ Found {len(skills_data.get('skills', []))} skills")
        
        return {
            "resume_id": resume_id,
            "skills": skills_data.get("skills", []),
            "preview": resume_text[:300] + "..."
        }
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@app.post("/api/transcript/upload")
async def upload_transcript(req: TranscriptUploadRequest):
    """Upload and analyze transcript"""
    
    print(f"📜 Received transcript for resume: {req.resume_id}")
    
    try:
        # Ask GPT to extract coursework and GPA
        prompt = f"""Extract relevant academic information from this transcript.
Return ONLY a JSON object:
{{
  "gpa": 3.75,
  "relevant_courses": ["Data Structures", "Machine Learning", "Databases"],
  "honors": ["Dean's List", "Magna Cum Laude"]
}}

Transcript:
{req.transcript_text[:1500]}"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        transcript_data = json.loads(response.choices[0].message.content)
        
        # Store transcript
        transcript_storage[req.resume_id] = transcript_data
        
        print(f"✅ Transcript stored for {req.resume_id}")
        
        return transcript_data
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing transcript: {str(e)}")

@app.post("/api/job/compare")
async def compare_job(req: JobCompareRequest):
    """Compare resume to job description"""
    
    print(f"🔍 Comparing job for resume: {req.resume_id}")
    
    resume = resume_storage.get(req.resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Get transcript if available
    transcript = transcript_storage.get(req.resume_id)
    transcript_context = ""
    if transcript:
        transcript_context = f"\nTranscript Data: GPA: {transcript.get('gpa')}, Courses: {', '.join(transcript.get('relevant_courses', []))}"
    
    try:
        prompt = f"""Compare this resume with the job description.

Return ONLY a JSON object with this EXACT format:
{{
  "fit_score": 75,
  "missing_skills": ["Tableau", "Statistics"],
  "matching_skills": ["Python", "SQL"],
  "recommendation": "You're a good fit but should learn Tableau and brush up on Statistics."
}}

Resume Skills: {', '.join(resume['skills'])}{transcript_context}

Full Resume:
{resume['text'][:1000]}

Job Description:
{req.job_description[:1000]}"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        print(f"✅ Fit score: {result.get('fit_score')}%")
        
        # Save to history
        add_analysis(req.resume_id, req.job_title, req.company, result)
        
        # Generate learning path
        learning_path = generate_learning_path(result.get("missing_skills", []))
        result["learning_path"] = learning_path
        
        return result
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error comparing job: {str(e)}")

@app.post("/api/cover-letter/generate")
async def generate_cover_letter(req: JobCompareRequest):
    """Generate a cover letter"""
    
    print(f"✍️  Generating cover letter for resume: {req.resume_id}")
    
    resume = resume_storage.get(req.resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Get transcript if available
    transcript = transcript_storage.get(req.resume_id)
    transcript_context = ""
    if transcript:
        courses = ', '.join(transcript.get('relevant_courses', [])[:3])
        transcript_context = f"\nAcademic: GPA {transcript.get('gpa')}, relevant courses: {courses}"
    
    try:
        prompt = f"""Write a professional, one-page cover letter for this job.

Guidelines:
- Be specific and mention concrete achievements from the resume
- Show enthusiasm for {req.company}
- Keep it under 300 words
- Don't use placeholders{transcript_context}

Resume:
{resume['text'][:1500]}

Job Description:
{req.job_description[:1000]}"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        
        print("✅ Cover letter generated")
        
        return {
            "cover_letter": response.choices[0].message.content
        }
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating cover letter: {str(e)}")

@app.post("/api/jobs/search")
async def search_jobs_endpoint(req: JobSearchRequest):
    """Search for jobs based on resume skills"""
    
    print(f"🔍 Searching jobs for resume: {req.resume_id}")
    
    resume = resume_storage.get(req.resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    try:
        # Use provided keywords or generate from skills
        keywords = req.keywords or ' '.join(resume['skills'][:3])
        
        print(f"Searching for: {keywords}")
        jobs = search_jobs(keywords)
        
        # Calculate match score for each job using AI
        for job in jobs:
            try:
                prompt = f"""Rate how well this resume matches this job (0-100).
Consider skills, experience, and job requirements.
Return ONLY a number between 0-100.

Resume skills: {', '.join(resume['skills'])}
Job: {job['title']} - {job['description'][:200]}"""
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}]
                )
                
                score = response.choices[0].message.content.strip()
                job['match_score'] = int(''.join(filter(str.isdigit, score))) if score else 70
            except:
                job['match_score'] = 70  # Default score
        
        # Sort by match score
        jobs.sort(key=lambda x: x.get('match_score', 0), reverse=True)
        
        print(f"✅ Found {len(jobs)} jobs")
        return {"jobs": jobs}
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching jobs: {str(e)}")

@app.get("/api/history/{resume_id}")
async def get_history(resume_id: str):
    """Get job analysis history"""
    try:
        history = get_analysis_history(resume_id)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def career_chat(req: ChatRequest):
    """AI Career Coach chat"""
    
    print(f"💬 Chat message: {req.message[:50]}...")
    
    try:
        # Build context
        context = "You are an expert career coach helping with job applications, resume tips, and career advice."
        
        if req.resume_id:
            resume = resume_storage.get(req.resume_id)
            if resume:
                context += f"\n\nUser's skills: {', '.join(resume['skills'][:10])}"
        
        # Get recent chat history
        history = get_chat_history(5)
        messages = [{"role": "system", "content": context}]
        
        for msg in history:
            messages.append({"role": "user", "content": msg["user_message"]})
            messages.append({"role": "assistant", "content": msg["ai_response"]})
        
        messages.append({"role": "user", "content": req.message})
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        
        ai_response = response.choices[0].message.content
        
        # Save to history
        add_chat_message(req.message, ai_response)
        
        print("✅ Chat response generated")
        
        return {"response": ai_response}
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

# Run with: uvicorn main:app --reload