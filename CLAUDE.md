# CLAUDE.md - AI Career Copilot Project Guide

**Last Updated:** 2025-11-14
**Purpose:** Comprehensive guide for AI assistants working with this codebase

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Development Setup](#development-setup)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Key Components](#key-components)
9. [Development Workflows](#development-workflows)
10. [Code Conventions](#code-conventions)
11. [Common Tasks](#common-tasks)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

**AI Career Copilot** is a comprehensive career development platform that leverages OpenAI's GPT-4o-mini to provide:
- Resume analysis and skill extraction
- Academic transcript parsing
- Job description matching with fit scores
- AI-generated cover letters
- Job search integration (Adzuna API)
- Personalized learning path recommendations
- AI career coaching chat interface
- Historical analysis tracking

**Architecture:** Monorepo with separated frontend (React) and backend (FastAPI)

**Key Features:**
- PDF resume upload and text extraction
- Real-time AI analysis with streaming responses
- Persistent job analysis history
- Mock data fallbacks for development
- Beautiful gradient UI with animations
- Mobile-responsive design

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  (React 19 + Vite + Axios)                                  │
│  - Tab-based navigation (Analysis/Search/History/Chat)      │
│  - PDF upload UI                                            │
│  - Markdown rendering for AI responses                      │
│  - Export to PDF functionality                              │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
                  │ (CORS enabled)
┌─────────────────┴───────────────────────────────────────────┐
│                         Backend                              │
│  (FastAPI + Uvicorn)                                        │
│  - RESTful API endpoints                                    │
│  - OpenAI GPT-4o-mini integration                           │
│  - PyMuPDF text extraction                                  │
│  - In-memory + JSON file storage                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───┴───┐   ┌────┴────┐   ┌────┴────┐
│OpenAI │   │ Adzuna  │   │  JSON   │
│  API  │   │   API   │   │Database │
└───────┘   └─────────┘   └─────────┘
```

### Data Flow

1. **Resume Upload:** Frontend → Backend → PyMuPDF → OpenAI → In-memory storage
2. **Job Compare:** Frontend → Backend → OpenAI (resume + job description) → JSON DB → Frontend
3. **Job Search:** Frontend → Backend → Adzuna API (or mock) → OpenAI (filtering) → Frontend
4. **Chat:** Frontend → Backend → OpenAI (with context) → Frontend

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.115.14 | Modern async web framework |
| **Uvicorn** | 0.30.6 | ASGI server with WebSocket support |
| **OpenAI** | 1.57.2 | GPT-4o-mini API client |
| **PyMuPDF** | 1.25.1 | PDF text extraction |
| **Pydantic** | 2.8.2 | Data validation and settings |
| **python-dotenv** | 1.1.1 | Environment variable management |
| **requests** | 2.32.3 | HTTP client for Adzuna API |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **Vite** | 7.1.7 | Build tool with HMR |
| **Axios** | 1.12.2 | HTTP client |
| **react-markdown** | 10.1.0 | Markdown rendering |
| **jsPDF** | 3.0.3 | PDF export functionality |
| **ESLint** | 9.36.0 | Code linting |

---

## Directory Structure

```
/home/user/ai-career-copilot/
├── .git/                       # Git repository data
├── .gitignore                  # Root-level ignore rules
│
├── backend/                    # Python FastAPI backend
│   ├── services/               # Service layer modules
│   │   ├── __init__.py        # Package initialization (empty)
│   │   ├── adzuna_service.py  # Job search API integration (600+ lines)
│   │   └── learning_path_service.py  # Course recommendations (200+ lines)
│   ├── main.py                # Main FastAPI app (800+ lines)
│   ├── database.py            # JSON file persistence layer (120+ lines)
│   ├── requirements.txt       # Python dependencies (21 packages)
│   └── .gitignore            # Backend-specific ignores
│
└── frontend/                   # React frontend
    ├── src/                    # Source code
    │   ├── assets/            # Static images
    │   │   └── react.svg      # React logo
    │   ├── App.jsx            # Main application component (600+ lines)
    │   ├── App.css            # Comprehensive styling (1043+ lines)
    │   ├── main.jsx           # React entry point
    │   └── index.css          # Base CSS variables
    ├── public/                # Public assets
    │   └── vite.svg          # Vite logo
    ├── index.html            # HTML entry point
    ├── package.json          # NPM dependencies & scripts
    ├── vite.config.js        # Vite configuration
    ├── eslint.config.js      # ESLint flat config
    ├── README.md             # Vite+React template docs
    └── .gitignore            # Frontend-specific ignores
```

**Critical Files:**
- `backend/main.py` - All API routes, business logic, OpenAI calls
- `backend/database.py` - Data persistence functions
- `frontend/src/App.jsx` - Entire React application in single file
- `frontend/src/App.css` - All styling including animations

---

## Development Setup

### Prerequisites
- Python 3.9+ (backend)
- Node.js 18+ (frontend)
- OpenAI API key (required)
- Adzuna API credentials (optional, has mock fallback)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
OPENAI_API_KEY=sk-your-key-here
ADZUNA_APP_ID=your-app-id  # Optional
ADZUNA_APP_KEY=your-app-key  # Optional
EOF

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend runs on:** http://localhost:8000
**API docs available at:** http://localhost:8000/docs (automatic Swagger UI)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
cat > .env << EOF
VITE_API_URL=http://localhost:8000/api
EOF

# Run development server
npm run dev
```

**Frontend runs on:** http://localhost:5173

### Verification

1. Backend health check: `curl http://localhost:8000/`
2. Frontend: Open http://localhost:5173 in browser
3. Upload a test resume PDF to verify OpenAI integration

---

## API Reference

**Base URL:** `http://localhost:8000/api` (configurable via `VITE_API_URL`)

### Endpoints

#### 1. Health Check
```http
GET /
```
**Response:** `{"message": "AI Career Copilot API is running"}`

---

#### 2. Resume Upload
```http
POST /api/resume/upload
Content-Type: multipart/form-data
```

**Parameters:**
- `file` (required): PDF file

**Response:**
```json
{
  "resume_id": "uuid-string",
  "text": "extracted resume text",
  "skills": ["Python", "JavaScript", "React"],
  "filename": "resume.pdf"
}
```

**Implementation:**
- Uses PyMuPDF (`fitz`) to extract text
- OpenAI GPT-4o-mini extracts skills (JSON format)
- Stores in `resume_storage` (in-memory dict)

---

#### 3. Transcript Upload
```http
POST /api/transcript/upload
Content-Type: application/json
```

**Request Body:**
```json
{
  "resume_id": "uuid-string",
  "transcript_text": "academic transcript content"
}
```

**Response:**
```json
{
  "resume_id": "uuid-string",
  "gpa": "3.85",
  "courses": ["Data Structures", "Algorithms"],
  "honors": ["Dean's List"]
}
```

**Implementation:**
- OpenAI extracts GPA, courses, honors
- Stores in `transcript_storage` (in-memory dict)

---

#### 4. Job Comparison
```http
POST /api/job/compare
Content-Type: application/json
```

**Request Body:**
```json
{
  "resume_id": "uuid-string",
  "job_description": "job description text",
  "job_title": "Software Engineer",
  "company": "Tech Corp"
}
```

**Response:**
```json
{
  "fit_score": 85,
  "matching_skills": ["Python", "React"],
  "missing_skills": ["Docker", "Kubernetes"],
  "strengths": "Strong technical background...",
  "recommendations": "Consider learning...",
  "cover_letter_tips": "Emphasize your..."
}
```

**Implementation:**
- OpenAI compares resume skills vs job requirements
- Saves analysis to JSON database via `add_analysis()`
- Returns detailed breakdown

---

#### 5. Cover Letter Generation
```http
POST /api/cover-letter/generate
Content-Type: application/json
```

**Request Body:**
```json
{
  "resume_id": "uuid-string",
  "job_description": "job description text",
  "job_title": "Software Engineer",
  "company": "Tech Corp"
}
```

**Response:**
```json
{
  "cover_letter": "Dear Hiring Manager,\n\n..."
}
```

**Implementation:**
- OpenAI generates personalized cover letter
- Uses resume text + job details
- Professional format with company/role context

---

#### 6. Job Search
```http
POST /api/jobs/search
Content-Type: application/json
```

**Request Body:**
```json
{
  "resume_id": "uuid-string",
  "keywords": "python developer"
}
```

**Response:**
```json
{
  "jobs": [
    {
      "title": "Python Developer",
      "company": "Tech Corp",
      "location": "Remote",
      "description": "We are looking for...",
      "url": "https://apply-link.com",
      "salary": "$100,000 - $120,000",
      "posted_date": "2025-11-14"
    }
  ]
}
```

**Implementation:**
- Calls `search_jobs()` from `adzuna_service.py`
- Falls back to mock jobs if Adzuna credentials missing
- OpenAI filters/ranks by resume fit

---

#### 7. Analysis History
```http
GET /api/history/{resume_id}
```

**Response:**
```json
{
  "history": [
    {
      "id": 1,
      "job_title": "Software Engineer",
      "company": "Tech Corp",
      "fit_score": 85,
      "missing_skills": ["Docker"],
      "timestamp": "2025-11-14T10:30:00"
    }
  ]
}
```

**Implementation:**
- Reads from JSON database
- Returns all analyses for given resume_id

---

#### 8. AI Career Coach Chat
```http
POST /api/chat
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "How can I improve my resume?",
  "resume_id": "uuid-string"
}
```

**Response:**
```json
{
  "response": "Based on your resume, I recommend..."
}
```

**Implementation:**
- OpenAI chat with career coaching context
- Uses resume data if resume_id provided
- Saves to chat_history in database

---

## Database Schema

**Storage Type:** JSON file (`career_copilot_db.json`) + In-memory dicts

### JSON Database Structure

```json
{
  "resumes": {},
  "analyses": [
    {
      "id": 1,
      "resume_id": "uuid-string",
      "job_title": "Software Engineer",
      "company": "Tech Corp",
      "fit_score": 85,
      "missing_skills": ["Docker", "Kubernetes"],
      "timestamp": "2025-11-14T10:30:00.123456"
    }
  ],
  "chat_history": [
    {
      "id": 1,
      "user_message": "How can I improve my skills?",
      "ai_response": "I recommend focusing on...",
      "timestamp": "2025-11-14T10:35:00.123456"
    }
  ]
}
```

### In-Memory Storage

**Location:** `backend/main.py` module-level variables

```python
# resume_storage: Dict[resume_id, dict]
{
  "uuid-123": {
    "text": "full resume text",
    "skills": ["Python", "React"],
    "filename": "resume.pdf",
    "upload_timestamp": "2025-11-14T10:00:00"
  }
}

# transcript_storage: Dict[resume_id, dict]
{
  "uuid-123": {
    "gpa": "3.85",
    "courses": ["Data Structures", "Algorithms"],
    "honors": ["Dean's List", "Summa Cum Laude"]
  }
}
```

**⚠️ Important:** Resume and transcript data are **not persistent** across server restarts. Only job analyses and chat history persist to JSON.

### Database Functions (`backend/database.py`)

```python
load_db() -> dict
    # Loads from career_copilot_db.json or creates new

save_db(db: dict) -> None
    # Saves to career_copilot_db.json

add_analysis(resume_id, job_title, company, fit_score, missing_skills) -> None
    # Appends new analysis record

get_analysis_history(resume_id: str) -> list
    # Returns all analyses for resume

add_chat_message(user_msg: str, ai_response: str) -> None
    # Appends chat conversation

get_chat_history(limit: int = 50) -> list
    # Returns recent chat messages
```

---

## Key Components

### Backend Components

#### 1. Main Application (`backend/main.py`)

**Key Elements:**
- FastAPI app initialization with CORS middleware
- OpenAI client setup with API key from environment
- Module-level storage dicts (resume_storage, transcript_storage)
- All API route handlers
- Business logic for AI calls

**CORS Configuration:**
```python
origins = [
    "http://localhost:5173",
    "https://*.vercel.app",
    "https://ai-career-copilot-nine.vercel.app"
]
```

**OpenAI Usage:**
- Model: `gpt-4o-mini`
- Temperature: 0.7 (balanced creativity)
- Max tokens: varies by endpoint (500-1000)
- JSON mode: used for structured extraction

---

#### 2. Adzuna Service (`backend/services/adzuna_service.py`)

**Purpose:** Job search integration with Adzuna API

**Key Functions:**
```python
search_jobs(keywords: str, location: str = "Remote") -> list
    # Returns real jobs from Adzuna or mock data
    # Automatically falls back to mock if credentials missing
```

**Mock Jobs:** 10 predefined job listings for development (Software Engineer, Data Scientist, Product Manager, etc.)

**Environment Variables:**
- `ADZUNA_APP_ID` (optional)
- `ADZUNA_APP_KEY` (optional)

---

#### 3. Learning Path Service (`backend/services/learning_path_service.py`)

**Purpose:** Course recommendations based on missing skills

**Skill Database:** Hardcoded 8 skill categories with courses:
- SQL (SQL Fundamentals, Advanced SQL, Database Design)
- Tableau (Tableau Desktop, Data Visualization, Dashboard Design)
- Python (Python Programming, Data Analysis with Python, etc.)
- Machine Learning (ML Fundamentals, Deep Learning, etc.)
- Statistics (Statistical Analysis, Probability, A/B Testing)
- Excel (Excel Advanced, Data Analysis, VBA Programming)
- Power BI (Power BI Basics, DAX, Data Modeling)
- R Programming (R Basics, Statistical Computing, ggplot2)

**Key Function:**
```python
get_learning_path(missing_skills: list) -> list
    # Returns list of course recommendations
    # Each course: {skill, course_name, duration, level, provider, url}
```

---

### Frontend Components

#### 1. Main Application (`frontend/src/App.jsx`)

**Structure:**
```jsx
function App() {
  // State management (useState)
  // - resumeData, transcriptData, compareResult
  // - jobResults, history, chatMessages
  // - loading states, error states

  // API functions (axios calls)
  // - handleResumeUpload
  // - handleTranscriptUpload
  // - handleJobCompare
  // - handleCoverLetterGenerate
  // - handleJobSearch
  // - fetchHistory
  // - handleChat

  // UI rendering
  // - Tab navigation
  // - 4 main tabs (Analysis, Job Search, History, Chat)
  // - Conditional rendering based on state
}
```

**Tab Structure:**
1. **Analysis Tab:** Resume upload, transcript upload, job comparison
2. **Job Search Tab:** Search interface, results display with fit scores
3. **History Tab:** Past analyses, learning path recommendations
4. **Chat Tab:** AI career coach interface

**State Management:**
- All state in single component (no Redux/Context)
- Local state with useState hooks
- Props drilling not needed (single component)

---

#### 2. Styling (`frontend/src/App.css`)

**Design System:**
- **Colors:** Purple gradients (#667eea → #764ba2)
- **Typography:** -apple-system, BlinkMacSystemFont, Segoe UI
- **Animations:** Fade-in, slide-in, pulse effects
- **Responsive:** Mobile-first with @media queries

**Key Classes:**
- `.container` - Main wrapper with max-width
- `.card` - White cards with shadow and hover effects
- `.gradient-text` - Purple gradient text
- `.tab-button` - Tab navigation buttons
- `.loading-spinner` - Animated spinner
- `.skill-tag` - Skill badge styling

**Animations:**
```css
@keyframes fadeIn { /* 300ms ease-in */ }
@keyframes slideIn { /* 300ms ease-out from translateY(-10px) */ }
@keyframes pulse { /* Infinite scale animation */ }
```

---

## Development Workflows

### Adding a New Feature

1. **Backend Changes:**
   ```bash
   # Add new endpoint in backend/main.py
   @app.post("/api/new-feature")
   async def new_feature(request: NewFeatureRequest):
       # Implementation
       return {"result": "data"}
   ```

2. **Frontend Changes:**
   ```javascript
   // Add new function in App.jsx
   const handleNewFeature = async () => {
     setLoading(true);
     try {
       const response = await axios.post(`${API_URL}/new-feature`, data);
       // Handle response
     } catch (error) {
       setError(error.message);
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Add to UI:** Insert into appropriate tab in App.jsx

---

### Adding a New AI Feature

**Pattern for OpenAI Calls:**

```python
# In backend/main.py
try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful AI assistant..."
            },
            {
                "role": "user",
                "content": f"Analyze this data: {user_input}"
            }
        ],
        temperature=0.7,
        max_tokens=800
    )
    result = response.choices[0].message.content
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

**For JSON extraction:**
```python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[...],
    response_format={"type": "json_object"}
)
data = json.loads(response.choices[0].message.content)
```

---

### Adding Database Persistence

**To add new persistent data type:**

1. **Update schema in `database.py`:**
   ```python
   def load_db():
       default_db = {
           "resumes": {},
           "analyses": [],
           "chat_history": [],
           "new_data_type": []  # Add here
       }
   ```

2. **Add helper functions:**
   ```python
   def add_new_data(data):
       db = load_db()
       db["new_data_type"].append({
           "id": len(db["new_data_type"]) + 1,
           **data,
           "timestamp": datetime.now().isoformat()
       })
       save_db(db)
   ```

3. **Use in main.py:**
   ```python
   from database import add_new_data

   @app.post("/api/new-data")
   async def store_new_data(data: NewDataRequest):
       add_new_data(data.dict())
       return {"status": "saved"}
   ```

---

### Testing Changes

**Backend Testing:**
```bash
# Manual testing with curl
curl -X POST http://localhost:8000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# Or use Swagger UI at http://localhost:8000/docs
```

**Frontend Testing:**
```bash
# Run linter
npm run lint

# Build for production (test for errors)
npm run build

# Preview production build
npm run preview
```

---

## Code Conventions

### Backend (Python)

**Style Guide:**
- Follow PEP 8
- Use async/await for I/O operations
- Type hints for function parameters (Pydantic models)
- Descriptive variable names

**Error Handling:**
```python
# Always use HTTPException for API errors
from fastapi import HTTPException

if not data:
    raise HTTPException(status_code=404, detail="Data not found")
```

**OpenAI Error Handling:**
```python
try:
    response = client.chat.completions.create(...)
except Exception as e:
    raise HTTPException(
        status_code=500,
        detail=f"OpenAI API error: {str(e)}"
    )
```

**File Handling:**
```python
# PDF files
import fitz  # PyMuPDF
doc = fitz.open(stream=await file.read(), filetype="pdf")
text = ""
for page in doc:
    text += page.get_text()
```

---

### Frontend (JavaScript/React)

**Style Guide:**
- Use functional components with hooks
- PascalCase for component names
- camelCase for functions and variables
- Arrow functions for handlers

**Component Pattern:**
```javascript
function ComponentName() {
  const [state, setState] = useState(initialValue);

  const handleAction = async () => {
    setLoading(true);
    try {
      const response = await axios.post(API_URL, data);
      setState(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

**API Calls:**
```javascript
// Always use try-catch-finally
// Always set loading states
// Always handle errors gracefully

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
```

**Styling:**
- CSS classes for styling (no inline styles for complex components)
- Use existing gradient classes for consistency
- Add responsive breakpoints for new features

---

## Common Tasks

### Task 1: Add a New Tab

**Steps:**
1. Add new tab button to navigation
2. Create new state variable for tab content
3. Add tab rendering logic
4. Style with existing CSS classes

**Example:**
```javascript
// Add to tabs array
const [activeTab, setActiveTab] = useState('analysis');

// Add button
<button
  className={`tab-button ${activeTab === 'new-tab' ? 'active' : ''}`}
  onClick={() => setActiveTab('new-tab')}
>
  New Feature
</button>

// Add content
{activeTab === 'new-tab' && (
  <div className="tab-content">
    {/* New feature UI */}
  </div>
)}
```

---

### Task 2: Add a New External API Integration

**Pattern (follow Adzuna service):**

1. **Create service file:** `backend/services/new_service.py`

```python
import os
import requests
from typing import List, Dict

def fetch_data(query: str) -> List[Dict]:
    """Fetch data from external API with mock fallback"""
    api_key = os.getenv("NEW_API_KEY")

    if not api_key:
        print("API key not found, using mock data")
        return get_mock_data()

    try:
        response = requests.get(
            "https://api.example.com/endpoint",
            params={"query": query, "key": api_key},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"API error: {e}, falling back to mock")
        return get_mock_data()

def get_mock_data() -> List[Dict]:
    """Mock data for development"""
    return [{"id": 1, "data": "mock"}]
```

2. **Import in main.py:**
```python
from services.new_service import fetch_data
```

3. **Create endpoint:**
```python
@app.get("/api/new-data")
async def get_new_data(query: str):
    data = fetch_data(query)
    return {"results": data}
```

---

### Task 3: Modify OpenAI Prompt

**Location:** Find the relevant endpoint in `backend/main.py`

**Pattern:**
```python
# System message defines AI behavior
system_msg = "You are an expert career counselor..."

# User message provides context and task
user_msg = f"""
Given the following resume:
{resume_text}

And this job description:
{job_description}

Provide a detailed analysis including:
1. Fit score (0-100)
2. Matching skills
3. Missing skills
4. Recommendations
"""

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_msg}
    ],
    temperature=0.7,  # Adjust for creativity
    max_tokens=1000   # Adjust for response length
)
```

**Testing prompts:**
- Use `/docs` Swagger UI for quick testing
- Monitor OpenAI API usage in dashboard
- Test with various resume/job combinations

---

### Task 4: Add Environment Variable

**Backend:**
```python
# In backend/main.py or service file
import os
from dotenv import load_dotenv

load_dotenv()  # Already done in main.py
new_value = os.getenv("NEW_ENV_VAR", "default_value")
```

**Frontend:**
```javascript
// In frontend/src/App.jsx or component
const newValue = import.meta.env.VITE_NEW_VAR || "default";
```

**Configuration:**
```bash
# backend/.env
NEW_ENV_VAR=production_value

# frontend/.env
VITE_NEW_VAR=production_value
```

**⚠️ Important:**
- Backend vars: direct names
- Frontend vars: MUST start with `VITE_`
- Never commit .env files (already in .gitignore)

---

### Task 5: Debug OpenAI API Issues

**Common Problems:**

1. **Invalid API Key:**
   ```python
   # Check environment variable
   print(f"API key loaded: {bool(os.getenv('OPENAI_API_KEY'))}")
   ```

2. **Rate Limiting:**
   ```python
   # Add exponential backoff
   from time import sleep

   for attempt in range(3):
       try:
           response = client.chat.completions.create(...)
           break
       except Exception as e:
           if "rate_limit" in str(e).lower():
               sleep(2 ** attempt)
           else:
               raise
   ```

3. **Token Limits:**
   ```python
   # Monitor token usage
   response = client.chat.completions.create(...)
   print(f"Tokens used: {response.usage.total_tokens}")
   ```

4. **JSON Parsing Errors:**
   ```python
   # Validate JSON response
   try:
       data = json.loads(response.choices[0].message.content)
   except json.JSONDecodeError:
       # Fallback or retry with stricter prompt
       print("Invalid JSON, retrying...")
   ```

---

## Deployment

### Backend Deployment

**Recommended Platform:** Railway, Render, or Heroku

**Requirements:**
- Python 3.9+
- Install dependencies: `pip install -r backend/requirements.txt`
- Set environment variables (OPENAI_API_KEY, etc.)
- Run: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Procfile (Heroku/Railway):**
```
web: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables:**
```
OPENAI_API_KEY=sk-...
ADZUNA_APP_ID=... (optional)
ADZUNA_APP_KEY=... (optional)
```

---

### Frontend Deployment

**Current Setup:** Configured for Vercel

**Vercel Deployment:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

**Build Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**Environment Variables (Vercel):**
```
VITE_API_URL=https://your-backend.railway.app/api
```

**CORS Configuration:**
- Update `backend/main.py` origins list with deployed frontend URL
- Redeploy backend after adding new origin

---

### Full Stack Deployment Checklist

- [ ] Deploy backend first
- [ ] Note backend URL
- [ ] Set `VITE_API_URL` in frontend environment
- [ ] Deploy frontend
- [ ] Add frontend URL to backend CORS origins
- [ ] Redeploy backend
- [ ] Test full workflow (upload resume, compare job, etc.)
- [ ] Monitor logs for errors
- [ ] Set up database backups (career_copilot_db.json)

---

## Troubleshooting

### Issue: Resume upload fails

**Symptoms:** Error after uploading PDF

**Solutions:**
1. Check file size (may need to adjust limits)
2. Verify PDF is not encrypted
3. Check OpenAI API key is set
4. Review backend logs for PyMuPDF errors

**Debug:**
```python
# In /api/resume/upload endpoint
print(f"File size: {len(await file.read())} bytes")
print(f"Extracted text length: {len(text)}")
```

---

### Issue: CORS errors in browser

**Symptoms:** Browser console shows "blocked by CORS policy"

**Solutions:**
1. Verify frontend URL in backend's origins list
2. Check both servers are running (backend on 8000, frontend on 5173)
3. Clear browser cache
4. Restart both servers

**Quick Fix:**
```python
# In backend/main.py, temporarily allow all origins for debugging
origins = ["*"]  # Remove after debugging!
```

---

### Issue: OpenAI API errors

**Symptoms:** 500 errors from AI endpoints

**Solutions:**
1. Verify API key: `echo $OPENAI_API_KEY`
2. Check OpenAI account has credits
3. Review rate limits in OpenAI dashboard
4. Check prompt length (stay under model's context limit)

**Debug:**
```python
# Add detailed error logging
try:
    response = client.chat.completions.create(...)
except Exception as e:
    print(f"OpenAI error type: {type(e).__name__}")
    print(f"Error details: {str(e)}")
    raise
```

---

### Issue: Database not persisting

**Symptoms:** History disappears after restart

**Solutions:**
1. Check file permissions on `career_copilot_db.json`
2. Verify `save_db()` is being called
3. Check disk space
4. Review database.py for errors

**Debug:**
```python
# In database.py
def save_db(db):
    print(f"Saving database with {len(db['analyses'])} analyses")
    with open(DB_FILE, 'w') as f:
        json.dump(db, f, indent=2)
    print(f"Database saved successfully")
```

---

### Issue: Job search returns no results

**Symptoms:** Empty results from job search

**Solutions:**
1. This is expected if Adzuna credentials not set (uses mock data)
2. Verify mock jobs are being returned
3. Check Adzuna API credentials if set
4. Try different keywords

**Debug:**
```python
# In services/adzuna_service.py
def search_jobs(keywords, location):
    print(f"Searching jobs: {keywords}, {location}")
    print(f"API key present: {bool(os.getenv('ADZUNA_APP_KEY'))}")
    # ... rest of function
```

---

### Issue: Frontend not connecting to backend

**Symptoms:** Network errors in browser console

**Solutions:**
1. Verify `VITE_API_URL` is set correctly
2. Check backend is running: `curl http://localhost:8000/`
3. Review browser Network tab for actual URL being called
4. Restart Vite dev server after .env changes

**Debug:**
```javascript
// In App.jsx
console.log('API URL:', API_URL);

// Before each API call
console.log('Calling:', `${API_URL}/endpoint`);
```

---

### Issue: Styles not applying

**Symptoms:** UI looks broken or unstyled

**Solutions:**
1. Check App.css is imported in App.jsx
2. Clear browser cache (Ctrl+Shift+R)
3. Verify className matches CSS file
4. Check for CSS syntax errors

**Debug:**
```javascript
// Check CSS is loaded
import './App.css'  // Verify this line exists

// Inspect element in browser DevTools
// Check if classes are present in HTML
```

---

### Issue: Memory issues with large resumes

**Symptoms:** Server crashes or slow responses

**Solutions:**
1. Add file size limits
2. Chunk large text for OpenAI calls
3. Implement pagination for history
4. Clear resume_storage periodically

**Implementation:**
```python
# Add file size check
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
```

---

## Best Practices for AI Assistants

### When Making Changes

1. **Always read files before editing** - Understand current implementation
2. **Test changes locally** - Run both frontend and backend
3. **Check logs** - Monitor console output for errors
4. **Verify API responses** - Use browser DevTools or curl
5. **Update this documentation** - Keep CLAUDE.md current

### Code Quality

1. **Maintain consistency** - Follow existing patterns
2. **Add error handling** - Wrap API calls in try-catch
3. **Use descriptive names** - No single-letter variables
4. **Comment complex logic** - Especially AI prompts
5. **Validate inputs** - Use Pydantic models

### AI Integration

1. **Craft clear prompts** - Be specific about desired output format
2. **Handle failures gracefully** - OpenAI calls can fail
3. **Monitor token usage** - Watch for expensive calls
4. **Test with edge cases** - Empty resumes, long text, special characters
5. **Provide fallbacks** - Mock data for external APIs

### User Experience

1. **Show loading states** - User should see progress
2. **Display helpful errors** - Not just "An error occurred"
3. **Maintain responsiveness** - Test on mobile
4. **Preserve user data** - Don't lose form inputs on error
5. **Provide feedback** - Success messages, progress indicators

---

## Quick Reference

### Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Common Commands

```bash
# Install new Python package
cd backend
pip install package-name
pip freeze > requirements.txt

# Install new npm package
cd frontend
npm install package-name

# Format Python code
cd backend
black main.py

# Lint frontend
cd frontend
npm run lint

# Build frontend
npm run build
```

### File Locations

- **API routes:** `backend/main.py`
- **Database logic:** `backend/database.py`
- **Job search:** `backend/services/adzuna_service.py`
- **Learning paths:** `backend/services/learning_path_service.py`
- **React app:** `frontend/src/App.jsx`
- **Styles:** `frontend/src/App.css`
- **Environment:** `backend/.env`, `frontend/.env`

### Key URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Database:** `backend/career_copilot_db.json`

---

## Additional Resources

### Documentation Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Vite Documentation](https://vitejs.dev/)
- [PyMuPDF Documentation](https://pymupdf.readthedocs.io/)

### Project-Specific Notes

- Resume data is stored **in-memory only** (not persistent)
- Job analyses **persist** to JSON database
- Adzuna API has **mock fallback** for development
- Learning paths use **hardcoded course database**
- Single-file React app (no component splitting)
- No authentication/user management system
- CORS configured for localhost and Vercel

---

**Last Updated:** 2025-11-14
**Version:** 1.0
**Maintainer:** AI Career Copilot Team

---

## Changelog

### 2025-11-14 - Initial CLAUDE.md Creation
- Comprehensive documentation of entire codebase
- API reference with all 8 endpoints
- Database schema and persistence details
- Development workflows and common tasks
- Troubleshooting guide for common issues
- Best practices for AI assistant contributions

---

*This document should be updated whenever significant changes are made to the codebase structure, API, or development workflows.*
