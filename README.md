# 🚀 AI Career Copilot

AI-powered platform that helps job seekers optimize resumes, match with jobs, and generate personalized cover letters.

**Live Demo:** [aicareercopilot.net](https://aicareercopilot.net)

---

## ✨ Features

- 📄 **Resume Analysis** - Extract skills from PDF resumes
- 💼 **Job Matching** - Calculate fit scores for any job
- 📚 **Learning Paths** - Get personalized course recommendations
- ✍️ **Cover Letter Generator** - AI-written, tailored cover letters
- 🔍 **Job Search** - Find matching opportunities
- 💬 **Career Coach** - Chat with AI for career advice

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - Modern component-based UI library
- **Vite 7** - Fast build tool and dev server
- **Axios** - Promise-based HTTP client for API requests
- **Custom CSS** - Apple-inspired minimalist design
- **Responsive Design** - Mobile-first approach

### **Backend**
- **FastAPI** - High-performance Python web framework
- **Python 3.11+** - Modern async/await support
- **Pydantic** - Data validation and settings management
- **Uvicorn** - Lightning-fast ASGI server

### **AI & ML**
- **OpenAI GPT-4o-mini** - Natural language processing
  - Resume skill extraction
  - Job fit analysis
  - Cover letter generation
  - Career coaching conversations
- **OpenAI Embeddings** - Semantic similarity matching

### **Data Processing**
- **PyMuPDF (fitz)** - PDF text extraction from resumes
- **Python-dotenv** - Environment variable management
- **JSON** - Simple data persistence

### **External APIs**
- **Adzuna API** - Job search and aggregation
- **OpenAI API** - AI completions and embeddings

### **Deployment & DevOps**
- **Vercel** - Frontend hosting with edge network
- **Render** - Backend hosting with auto-scaling
- **GitHub** - Version control and CI/CD
- **Custom Domain** - Professional branding (aicareercopilot.net)

### **Development Tools**
- **Git** - Version control
- **npm** - Package management (frontend)
- **pip** - Package management (backend)
- **Virtual Environment** - Python dependency isolation

---

## 💻 Local Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your-key-here" > .env

uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## 👨‍💻 Author

**Bao Tran**  
GitHub: [@BaoT1301](https://github.com/BaoT1301)