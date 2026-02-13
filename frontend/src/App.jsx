import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  MessageCircle, 
  Search, 
  History as HistoryIcon,
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Download,
  ExternalLink,
  TrendingUp,
  Clock,
  DollarSign,
  MapPin,
  Building2,
  Target,
  BookOpen,
  Send,
  Bot,
  User,
  Star,
  ArrowRight,
  Calendar,
  Award
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', duration: 0.5 }
  }
}

function App() {
  // Existing state
  const [resumeId, setResumeId] = useState(null)
  const [skills, setSkills] = useState([])
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)

  // NEW: Feature states
  const [transcriptText, setTranscriptText] = useState('')
  const [transcriptData, setTranscriptData] = useState(null)
  const [jobSearchResults, setJobSearchResults] = useState([])
  const [searchKeywords, setSearchKeywords] = useState('')
  const [history, setHistory] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [activeTab, setActiveTab] = useState('upload')

  // Load history when resume is uploaded
  useEffect(() => {
    if (resumeId) {
      loadHistory()
    }
  }, [resumeId])

  // Handle resume upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_URL}/resume/upload`, formData)
      setResumeId(response.data.resume_id)
      setSkills(response.data.skills)
      alert('✅ Resume uploaded successfully!')
      setActiveTab('upload')
    } catch (error) {
      console.error(error)
      alert('❌ Failed to upload resume')
    }
    setLoading(false)
  }

  // Handle transcript upload
  const handleTranscriptUpload = async () => {
    if (!resumeId || !transcriptText) {
      alert('Please upload resume first and paste transcript text!')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/transcript/upload`, {
        resume_id: resumeId,
        transcript_text: transcriptText
      })
      setTranscriptData(response.data)
      alert('✅ Transcript analyzed successfully!')
    } catch (error) {
      console.error(error)
      alert('❌ Failed to analyze transcript')
    }
    setLoading(false)
  }

  // Compare job
  const handleCompare = async () => {
    if (!resumeId || !jobDescription) {
      alert('Please upload resume and paste job description first!')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/job/compare`, {
        resume_id: resumeId,
        job_description: jobDescription,
        job_title: "Position from description",
        company: "Company from description"
      })
      setAnalysis(response.data)
      loadHistory()
    } catch (error) {
      console.error(error)
      alert('❌ Failed to analyze job fit')
    }
    setLoading(false)
  }

  // Generate cover letter
  const handleGenerateCoverLetter = async () => {
    if (!resumeId || !jobDescription) {
      alert('Please upload resume and paste job description first!')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/cover-letter/generate`, {
        resume_id: resumeId,
        job_description: jobDescription
      })
      setCoverLetter(response.data.cover_letter)
    } catch (error) {
      console.error(error)
      alert('❌ Failed to generate cover letter')
    }
    setLoading(false)
  }

  // Download cover letter
  const handleDownloadPDF = () => {
    if (!coverLetter) return
    const element = document.createElement('a')
    const file = new Blob([coverLetter], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'cover-letter.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    alert('✅ Cover letter downloaded!')
  }

  // Search jobs
  const handleJobSearch = async () => {
    if (!resumeId) {
      alert('Please upload resume first!')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/jobs/search`, {
        resume_id: resumeId,
        keywords: searchKeywords || undefined
      })
      setJobSearchResults(response.data.jobs)
      setActiveTab('search')
    } catch (error) {
      console.error(error)
      alert('❌ Failed to search jobs')
    }
    setLoading(false)
  }

  // Load history
  const loadHistory = async () => {
    if (!resumeId) return
    try {
      const response = await axios.get(`${API_URL}/history/${resumeId}`)
      setHistory(response.data.history)
    } catch (error) {
      console.error(error)
    }
  }

  // Send chat message
  const handleSendChat = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setChatInput('')
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }])
    
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: userMessage,
        resume_id: resumeId
      })
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response 
      }])
    } catch (error) {
      console.error(error)
      alert('❌ Chat error')
    }
    setLoading(false)
  }

  // Select job from search
  const handleSelectJob = (job) => {
    setJobDescription(job.description)
    setActiveTab('upload')
    alert(`✅ Job "${job.title}" loaded! Scroll down to analyze.`)
  }

  return (
    <div className="App">
      {/* Hero Header */}
      <motion.div 
        className="hero-header"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1>🚀 AI Career Copilot</h1>
        <p>Your intelligent assistant for job applications and career growth</p>
      </motion.div>

      {/* Tab Navigation */}
      {resumeId && (
        <motion.div 
          className="tab-nav"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.button
            variants={fadeIn}
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText size={20} />
            Analysis
          </motion.button>
          <motion.button
            variants={fadeIn}
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={20} />
            Job Search
          </motion.button>
          <motion.button
            variants={fadeIn}
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); loadHistory(); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HistoryIcon size={20} />
            History ({history.length})
          </motion.button>
          <motion.button
            variants={fadeIn}
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={20} />
            Career Coach
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* UPLOAD/ANALYSIS TAB */}
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            {/* Step 1: Upload Resume */}
            <motion.div className="glass-card" variants={scaleIn}>
              <h2>
                <Upload size={28} />
                Step 1: Upload Your Resume
              </h2>
              <div 
                className="upload-area"
                onClick={() => document.getElementById('resume-upload').click()}
              >
                <input 
                  id="resume-upload"
                  type="file" 
                  accept=".pdf" 
                  onChange={handleResumeUpload}
                  disabled={loading}
                />
                <div className="upload-content">
                  <Upload className="upload-icon" />
                  <div className="upload-text">
                    {loading ? 'Analyzing...' : 'Click to upload PDF resume'}
                  </div>
                  <div className="upload-hint">
                    Drag and drop or click to browse
                  </div>
                </div>
              </div>

              {skills.length > 0 && (
                <motion.div 
                  className="skills-box"
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                >
                  <h3>
                    <Sparkles size={24} />
                    Your Skills Detected:
                  </h3>
                  <div className="skills">
                    {skills.map((skill, i) => (
                      <motion.span 
                        key={i} 
                        className="skill-tag"
                        variants={scaleIn}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Star size={16} />
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Step 1.5: Transcript (Optional) */}
            {resumeId && (
              <motion.div className="glass-card" variants={scaleIn}>
                <h2>
                  <GraduationCap size={28} />
                  Optional: Add Your Transcript
                </h2>
                <p style={{color: '#718096', marginBottom: '1.5rem', textAlign: 'center'}}>
                  Upload your academic transcript to highlight relevant coursework and GPA
                </p>
                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Paste your transcript text here (or leave blank)..."
                  rows={5}
                  disabled={loading}
                />
                <motion.button 
                  className="btn"
                  onClick={handleTranscriptUpload} 
                  disabled={loading || !transcriptText}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <GraduationCap size={20} />
                  {loading ? 'Analyzing...' : 'Analyze Transcript'}
                </motion.button>
                
                {transcriptData && (
                  <motion.div 
                    className="skills-box"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                  >
                    <h3>
                      <CheckCircle2 size={24} />
                      Transcript Summary:
                    </h3>
                    <p><strong>GPA:</strong> {transcriptData.gpa}</p>
                    <p><strong>Relevant Courses:</strong></p>
                    <div className="skills">
                      {transcriptData.relevant_courses?.map((course, i) => (
                        <motion.span 
                          key={i} 
                          className="skill-tag"
                          variants={scaleIn}
                          whileHover={{ scale: 1.1 }}
                        >
                          <BookOpen size={16} />
                          {course}
                        </motion.span>
                      ))}
                    </div>
                    {transcriptData.honors?.length > 0 && (
                      <>
                        <p style={{marginTop: '1rem'}}><strong>Honors:</strong></p>
                        <div className="skills">
                          {transcriptData.honors.map((honor, i) => (
                            <motion.span 
                              key={i} 
                              className="skill-tag green"
                              variants={scaleIn}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Award size={16} />
                              {honor}
                            </motion.span>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Job Description */}
            {resumeId && (
              <motion.div className="glass-card" variants={scaleIn}>
                <h2>
                  <Briefcase size={28} />
                  Step 2: Paste Job Description
                </h2>
                <p style={{color: '#718096', marginBottom: '1.5rem', textAlign: 'center'}}>
                  Or{' '}
                  <button 
                    onClick={() => setActiveTab('search')} 
                    style={{
                      display: 'inline', 
                      padding: '0.4rem 1rem', 
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    search for jobs
                  </button>
                  {' '}based on your skills
                </p>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here from LinkedIn, Indeed, or any job board..."
                  rows={10}
                  disabled={loading}
                />
                <motion.button 
                  className="btn"
                  onClick={handleCompare} 
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Target size={20} />
                  {loading ? 'Analyzing...' : 'Analyze Job Fit'}
                </motion.button>
              </motion.div>
            )}

            {/* Step 3: Results */}
            {analysis && (
              <motion.div 
                className="glass-card"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2>
                  <TrendingUp size={28} />
                  Analysis Results
                </h2>
                
                <motion.div 
                  className="fit-score-container"
                  variants={scaleIn}
                >
                  <motion.div 
                    className="fit-score-number"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 1 }}
                  >
                    {analysis.fit_score}%
                  </motion.div>
                  <div className="fit-score-label">Match Score</div>
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.fit_score}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>

                <motion.div className="skills-section" variants={fadeIn}>
                  <h3>
                    <CheckCircle2 size={24} />
                    Skills You Have:
                  </h3>
                  <div className="skills">
                    {analysis.matching_skills?.map((skill, i) => (
                      <motion.span 
                        key={i} 
                        className="skill-tag green"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <CheckCircle2 size={16} />
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                <motion.div className="skills-section" variants={fadeIn}>
                  <h3>
                    <XCircle size={24} />
                    Skills to Learn:
                  </h3>
                  <div className="skills">
                    {analysis.missing_skills?.map((skill, i) => (
                      <motion.span 
                        key={i} 
                        className="skill-tag red"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <XCircle size={16} />
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Learning Path */}
                {analysis.learning_path && analysis.learning_path.length > 0 && (
                  <motion.div 
                    className="learning-path"
                    variants={fadeIn}
                  >
                    <h3>
                      <BookOpen size={24} />
                      Your Learning Path ({analysis.learning_path.length} skills)
                    </h3>
                    {analysis.learning_path.map((item, i) => (
                      <motion.div 
                        key={i} 
                        className="learning-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                      >
                        <div className="learning-header">
                          <h4>
                            <Target size={20} />
                            {item.skill}
                          </h4>
                          <span className="learning-weeks">
                            <Clock size={16} />
                            Week {item.weeks}
                          </span>
                        </div>
                        <p className="learning-course">
                          <strong>{item.course}</strong> by {item.provider}
                        </p>
                        <p className="learning-detail">
                          <DollarSign size={16} />
                          {item.cost} | <Clock size={16} /> {item.time_commitment}
                        </p>
                        <div className="learning-project">
                          <Sparkles size={18} style={{flexShrink: 0, marginTop: '2px'}} />
                          <span><strong>Project:</strong> {item.project}</span>
                        </div>
                        <motion.a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="learning-link"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Start Learning
                          <ArrowRight size={18} />
                        </motion.a>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                <motion.div 
                  className="recommendation-box"
                  variants={fadeIn}
                >
                  <h3>
                    <Sparkles size={24} />
                    AI Recommendation:
                  </h3>
                  <p>{analysis.recommendation}</p>
                </motion.div>

                <motion.button 
                  className="btn"
                  onClick={handleGenerateCoverLetter} 
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileText size={20} />
                  {loading ? 'Generating...' : 'Generate Cover Letter'}
                </motion.button>
              </motion.div>
            )}

            {/* Cover Letter */}
            {coverLetter && (
              <motion.div 
                className="glass-card"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2>
                  <FileText size={28} />
                  Your Personalized Cover Letter
                </h2>
                <div className="cover-letter-container">
                  {coverLetter.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <motion.button 
                  className="btn"
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetter)
                    alert('✅ Cover letter copied to clipboard!')
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileText size={20} />
                  Copy to Clipboard
                </motion.button>
                <motion.button 
                  className="btn btn-secondary"
                  onClick={handleDownloadPDF}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={20} />
                  Download as File
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* JOB SEARCH TAB */}
        {activeTab === 'search' && (
          <motion.div
            key="search"
            className="glass-card"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <h2>
              <Search size={28} />
              Find Jobs That Match Your Skills
            </h2>
            <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
              <input
                type="text"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="Optional: Enter keywords (e.g., 'data analyst python')"
                style={{
                  flex: 1, 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  minWidth: '250px'
                }}
              />
              <motion.button 
                className="btn"
                onClick={handleJobSearch} 
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search size={20} />
                {loading ? 'Searching...' : 'Search Jobs'}
              </motion.button>
            </div>

            {jobSearchResults.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <h3 style={{textAlign: 'center', marginBottom: '2rem'}}>
                  Found {jobSearchResults.length} Jobs
                </h3>
                {jobSearchResults.map((job, i) => (
                  <motion.div 
                    key={i} 
                    className="job-card"
                    variants={fadeIn}
                  >
                    <div className="job-header">
                      <div>
                        <h4>
                          <Briefcase size={22} />
                          {job.title}
                        </h4>
                        <p className="job-company">
                          <Building2 size={18} />
                          {job.company} • <MapPin size={18} /> {job.location}
                        </p>
                      </div>
                      <div className="job-match">
                        <span className="match-score">{job.match_score}%</span>
                        <span className="match-label">Match</span>
                      </div>
                    </div>
                    <p className="job-description">{job.description.substring(0, 200)}...</p>
                    {job.salary_min && (
                      <p className="job-salary">
                        <DollarSign size={20} />
                        ${(job.salary_min/1000).toFixed(0)}k - ${(job.salary_max/1000).toFixed(0)}k
                      </p>
                    )}
                    <div className="job-actions">
                      <motion.button 
                        className="btn"
                        onClick={() => handleSelectJob(job)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Target size={18} />
                        Analyze Fit
                      </motion.button>
                      <motion.a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="job-apply-link"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink size={18} />
                        View Job
                      </motion.a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {jobSearchResults.length === 0 && !loading && (
              <p style={{textAlign: 'center', color: '#718096', padding: '3rem'}}>
                Click "Search Jobs" to find positions matching your skills
              </p>
            )}
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            className="glass-card"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <h2>
              <HistoryIcon size={28} />
              Your Application History
            </h2>
            {history.length === 0 ? (
              <p style={{textAlign: 'center', color: '#718096', padding: '3rem'}}>
                No job analyses yet. Analyze some jobs to see them here!
              </p>
            ) : (
              <motion.div 
                className="history-list"
                variants={staggerContainer}
              >
                {history.map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="history-item"
                    variants={fadeIn}
                  >
                    <div className="history-header">
                      <div>
                        <h4>
                          <Briefcase size={20} />
                          {item.job_title}
                        </h4>
                        <p className="history-company">
                          <Building2 size={18} />
                          {item.company}
                        </p>
                      </div>
                      <div className="job-match">
                        <span className="match-score">{item.fit_score}%</span>
                      </div>
                    </div>
                    <p className="history-date">
                      <Calendar size={16} />
                      {new Date(item.timestamp).toLocaleDateString()} at{' '}
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                    {item.missing_skills?.length > 0 && (
                      <div className="history-skills">
                        <strong>Missing skills:</strong>
                        <div className="skills" style={{marginTop: '0.8rem'}}>
                          {item.missing_skills.map((skill, j) => (
                            <span key={j} className="skill-tag red" style={{fontSize: '0.9rem'}}>
                              <XCircle size={14} />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            className="glass-card chat-container"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <h2>
              <MessageCircle size={28} />
              AI Career Coach
            </h2>
            <p style={{color: '#718096', marginBottom: '1.5rem', textAlign: 'center'}}>
              Ask me anything about your career, resume, interviews, or job search!
            </p>

            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <div className="chat-welcome">
                  <h3>
                    <Bot size={28} />
                    Hi! I'm your AI Career Coach
                  </h3>
                  <p>Try asking me:</p>
                  <ul>
                    {[
                      "How can I improve my resume?",
                      "What should I prepare for a data analyst interview?",
                      "How do I negotiate salary?",
                      "What are the best skills to learn in 2025?"
                    ].map((q, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <MessageCircle size={18} />
                        {q}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <AnimatePresence>
                {chatMessages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    className={`chat-message ${msg.role}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="chat-avatar">
                      {msg.role === 'user' ? <User size={24} /> : <Bot size={24} />}
                    </div>
                    <div className="chat-content">
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask me anything..."
                disabled={loading}
                className="chat-input"
              />
              <motion.button 
                onClick={handleSendChat} 
                disabled={loading || !chatInput.trim()}
                className="btn chat-send"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? <Clock size={20} /> : <Send size={20} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App