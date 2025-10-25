import json
import os
from datetime import datetime

DB_FILE = "career_copilot_db.json"

def load_db():
    """Load database from file"""
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    return {
        "resumes": {},
        "analyses": [],
        "chat_history": []
    }

def save_db(db):
    """Save database to file"""
    with open(DB_FILE, 'w') as f:
        json.dump(db, f, indent=2)

def add_analysis(resume_id, job_title, company, analysis_data):
    """Save a job analysis to history"""
    db = load_db()
    
    analysis_record = {
        "id": len(db["analyses"]) + 1,
        "resume_id": resume_id,
        "job_title": job_title,
        "company": company,
        "fit_score": analysis_data.get("fit_score", 0),
        "missing_skills": analysis_data.get("missing_skills", []),
        "timestamp": datetime.now().isoformat()
    }
    
    db["analyses"].append(analysis_record)
    save_db(db)
    return analysis_record

def get_analysis_history(resume_id):
    """Get all analyses for a resume"""
    db = load_db()
    return [a for a in db["analyses"] if a["resume_id"] == resume_id]

def add_chat_message(user_message, ai_response):
    """Save chat message"""
    db = load_db()
    
    chat_record = {
        "id": len(db["chat_history"]) + 1,
        "user_message": user_message,
        "ai_response": ai_response,
        "timestamp": datetime.now().isoformat()
    }
    
    db["chat_history"].append(chat_record)
    save_db(db)
    return chat_record

def get_chat_history(limit=10):
    """Get recent chat history"""
    db = load_db()
    return db["chat_history"][-limit:]