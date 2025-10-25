import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

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
  const [activeTab, setActiveTab] = useState('upload') // upload, search, history, chat

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

  // NEW: Handle transcript upload
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
      loadHistory() // Refresh history
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

  // NEW: Download cover letter as PDF
  const handleDownloadPDF = () => {
    if (!coverLetter) return

    // Create a simple text file (you can enhance this with jsPDF for better formatting)
    const element = document.createElement('a')
    const file = new Blob([coverLetter], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'cover-letter.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    
    alert('✅ Cover letter downloaded!')
  }

  // NEW: Search jobs
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

  // NEW: Load history
  const loadHistory = async () => {
    if (!resumeId) return

    try {
      const response = await axios.get(`${API_URL}/history/${resumeId}`)
      setHistory(response.data.history)
    } catch (error) {
      console.error(error)
    }
  }

  // NEW: Send chat message
  const handleSendChat = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setChatInput('')
    
    // Add user message to UI immediately
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }])
    
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: userMessage,
        resume_id: resumeId
      })
      
      // Add AI response
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

  // NEW: Select job from search results
  const handleSelectJob = (job) => {
    setJobDescription(job.description)
    setActiveTab('upload')
    alert(`✅ Job "${job.title}" loaded! Scroll down to analyze.`)
  }

  return (
    <div className="App">
      <h1>🚀 AI Career Copilot</h1>
      <p>Your intelligent assistant for job applications and career growth</p>

      {/* NEW: Tab Navigation */}
      {resumeId && (
        <div className="tab-nav">
          <button 
            className={activeTab === 'upload' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('upload')}
          >
            📄 Analysis
          </button>
          <button 
            className={activeTab === 'search' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('search')}
          >
            🔍 Job Search
          </button>
          <button 
            className={activeTab === 'history' ? 'tab-active' : 'tab-inactive'}
            onClick={() => { setActiveTab('history'); loadHistory(); }}
          >
            📊 History ({history.length})
          </button>
          <button 
            className={activeTab === 'chat' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('chat')}
          >
            💬 Career Coach
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {activeTab === 'upload' && (
        <>
          {/* Step 1: Upload Resume */}
          <div className="card">
            <h2>📄 Step 1: Upload Your Resume</h2>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleResumeUpload}
              disabled={loading}
            />
            {skills.length > 0 && (
              <div className="skills-box">
                <h3>✨ Your Skills Detected:</h3>
                <div className="skills">
                  {skills.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NEW: Step 1.5: Upload Transcript (Optional) */}
          {resumeId && (
            <div className="card">
              <h2>📜 Optional: Add Your Transcript</h2>
              <p style={{color: '#718096', marginBottom: '1rem'}}>
                Upload your academic transcript to highlight relevant coursework and GPA
              </p>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Paste your transcript text here (or leave blank)..."
                rows={5}
                disabled={loading}
              />
              <button onClick={handleTranscriptUpload} disabled={loading || !transcriptText}>
                {loading ? '⏳ Analyzing...' : '📜 Analyze Transcript'}
              </button>
              
              {transcriptData && (
                <div className="transcript-summary">
                  <h3>✅ Transcript Summary:</h3>
                  <p><strong>GPA:</strong> {transcriptData.gpa}</p>
                  <p><strong>Relevant Courses:</strong></p>
                  <div className="skills">
                    {transcriptData.relevant_courses?.map((course, i) => (
                      <span key={i} className="skill-tag">{course}</span>
                    ))}
                  </div>
                  {transcriptData.honors?.length > 0 && (
                    <>
                      <p><strong>Honors:</strong></p>
                      <div className="skills">
                        {transcriptData.honors.map((honor, i) => (
                          <span key={i} className="skill-tag green">{honor}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Job Description */}
          {resumeId && (
            <div className="card">
              <h2>💼 Step 2: Paste Job Description</h2>
              <p style={{color: '#718096', marginBottom: '1rem'}}>
                Or <button 
                  onClick={() => setActiveTab('search')} 
                  style={{display: 'inline', padding: '0.3rem 0.8rem', fontSize: '0.9rem'}}
                >
                  search for jobs
                </button> based on your skills
              </p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here from LinkedIn, Indeed, or any job board..."
                rows={10}
                disabled={loading}
              />
              <button onClick={handleCompare} disabled={loading}>
                {loading ? '⏳ Analyzing...' : '🔍 Analyze Job Fit'}
              </button>
            </div>
          )}

          {/* Step 3: Results */}
          {analysis && (
            <div className="card results">
              <h2>📊 Analysis Results</h2>
              <div className="fit-score">
                <h3>{analysis.fit_score}%</h3>
                <p style={{fontSize: '1.1rem', fontWeight: '600', color: '#4a5568', marginTop: '0.5rem'}}>
                  Match Score
                </p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${analysis.fit_score}%`}}
                  ></div>
                </div>
              </div>

              <div className="skills-section">
                <h3>✅ Skills You Have:</h3>
                <div className="skills">
                  {analysis.matching_skills?.map((skill, i) => (
                    <span key={i} className="skill-tag green">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="skills-section">
                <h3>📚 Skills to Learn:</h3>
                <div className="skills">
                  {analysis.missing_skills?.map((skill, i) => (
                    <span key={i} className="skill-tag red">{skill}</span>
                  ))}
                </div>
              </div>

              {/* NEW: Learning Path */}
              {analysis.learning_path && analysis.learning_path.length > 0 && (
                <div className="learning-path">
                  <h3>📚 Your Learning Path ({analysis.learning_path.length} skills)</h3>
                  {analysis.learning_path.map((item, i) => (
                    <div key={i} className="learning-item">
                      <div className="learning-header">
                        <h4>{item.skill}</h4>
                        <span className="learning-weeks">Week {item.weeks}</span>
                      </div>
                      <p className="learning-course">
                        <strong>{item.course}</strong> by {item.provider}
                      </p>
                      <p className="learning-detail">
                        💰 {item.cost} | ⏱️ {item.time_commitment}
                      </p>
                      <p className="learning-project">
                        🎯 Project: {item.project}
                      </p>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="learning-link"
                      >
                        Start Learning →
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <div className="recommendation">
                <h3>💡 AI Recommendation:</h3>
                <p>{analysis.recommendation}</p>
              </div>

              <button onClick={handleGenerateCoverLetter} disabled={loading}>
                {loading ? '⏳ Generating...' : '✍️ Generate Cover Letter'}
              </button>
            </div>
          )}

          {/* Cover Letter */}
          {coverLetter && (
            <div className="card">
              <h2>✍️ Your Personalized Cover Letter</h2>
              <div className="cover-letter">
                {coverLetter.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <button onClick={() => {
                navigator.clipboard.writeText(coverLetter)
                alert('✅ Cover letter copied to clipboard!')
              }}>
                📋 Copy to Clipboard
              </button>
              <button onClick={handleDownloadPDF}>
                📥 Download as File
              </button>
            </div>
          )}
        </>
      )}

      {/* NEW: Job Search Tab */}
      {activeTab === 'search' && (
        <div className="card">
          <h2>🔍 Find Jobs That Match Your Skills</h2>
          <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
            <input
              type="text"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="Optional: Enter keywords (e.g., 'data analyst python')"
              style={{flex: 1, padding: '1rem', borderRadius: '8px', border: '2px solid #e2e8f0'}}
            />
            <button onClick={handleJobSearch} disabled={loading}>
              {loading ? '⏳ Searching...' : '🔍 Search Jobs'}
            </button>
          </div>

          {jobSearchResults.length > 0 && (
            <div className="job-results">
              <h3>Found {jobSearchResults.length} Jobs</h3>
              {jobSearchResults.map((job, i) => (
                <div key={i} className="job-card">
                  <div className="job-header">
                    <div>
                      <h4>{job.title}</h4>
                      <p className="job-company">{job.company} • {job.location}</p>
                    </div>
                    <div className="job-match">
                      <span className="match-score">{job.match_score}%</span>
                      <span className="match-label">Match</span>
                    </div>
                  </div>
                  <p className="job-description">{job.description.substring(0, 200)}...</p>
                  {job.salary_min && (
                    <p className="job-salary">
                      💰 ${(job.salary_min/1000).toFixed(0)}k - ${(job.salary_max/1000).toFixed(0)}k
                    </p>
                  )}
                  <div className="job-actions">
                    <button onClick={() => handleSelectJob(job)}>
                      📝 Analyze Fit
                    </button>
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="job-apply-link"
                    >
                      🔗 View Job
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {jobSearchResults.length === 0 && !loading && (
            <p style={{textAlign: 'center', color: '#718096'}}>
              Click "Search Jobs" to find positions matching your skills
            </p>
          )}
        </div>
      )}

      {/* NEW: History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          <h2>📊 Your Application History</h2>
          {history.length === 0 ? (
            <p style={{textAlign: 'center', color: '#718096'}}>
              No job analyses yet. Analyze some jobs to see them here!
            </p>
          ) : (
            <div className="history-list">
              {history.map((item, i) => (
                <div key={i} className="history-item">
                  <div className="history-header">
                    <div>
                      <h4>{item.job_title}</h4>
                      <p className="history-company">{item.company}</p>
                    </div>
                    <div className="history-score">
                      <span className="match-score">{item.fit_score}%</span>
                    </div>
                  </div>
                  <p className="history-date">
                    📅 {new Date(item.timestamp).toLocaleDateString()} at{' '}
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                  {item.missing_skills?.length > 0 && (
                    <div className="history-skills">
                      <strong>Missing skills:</strong>
                      <div className="skills" style={{marginTop: '0.5rem'}}>
                        {item.missing_skills.map((skill, j) => (
                          <span key={j} className="skill-tag red" style={{fontSize: '0.85rem'}}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEW: Chat Tab */}
      {activeTab === 'chat' && (
        <div className="card chat-container">
          <h2>💬 AI Career Coach</h2>
          <p style={{color: '#718096', marginBottom: '1rem'}}>
            Ask me anything about your career, resume, interviews, or job search!
          </p>

          <div className="chat-messages">
            {chatMessages.length === 0 && (
              <div className="chat-welcome">
                <h3>👋 Hi! I'm your AI Career Coach</h3>
                <p>Try asking me:</p>
                <ul>
                  <li>"How can I improve my resume?"</li>
                  <li>"What should I prepare for a data analyst interview?"</li>
                  <li>"How do I negotiate salary?"</li>
                  <li>"What are the best skills to learn in 2025?"</li>
                </ul>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="chat-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="chat-content">
                  {msg.content}
                </div>
              </div>
            ))}
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
            <button 
              onClick={handleSendChat} 
              disabled={loading || !chatInput.trim()}
              className="chat-send"
            >
              {loading ? '⏳' : '📤 Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App