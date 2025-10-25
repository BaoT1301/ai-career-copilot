import requests
import os

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "")

def search_jobs(keywords, location="us", results_per_page=10):
    """Search jobs using Adzuna API"""
    
    # If no API keys, return mock data
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        return get_mock_jobs(keywords)
    
    try:
        url = f"https://api.adzuna.com/v1/api/jobs/{location}/search/1"
        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY,
            "what": keywords,
            "results_per_page": results_per_page,
            "content-type": "application/json"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        jobs = []
        
        for job in data.get("results", []):
            jobs.append({
                "id": job.get("id"),
                "title": job.get("title"),
                "company": job.get("company", {}).get("display_name", "Unknown Company"),
                "location": job.get("location", {}).get("display_name", "Remote"),
                "description": job.get("description", "")[:500],  # Truncate
                "salary_min": job.get("salary_min"),
                "salary_max": job.get("salary_max"),
                "url": job.get("redirect_url")
            })
        
        return jobs
    
    except Exception as e:
        print(f"Adzuna API error: {e}")
        return get_mock_jobs(keywords)

def get_mock_jobs(keywords):
    """Return mock job data for demo"""
    return [
        {
            "id": "1",
            "title": "Data Analyst Intern",
            "company": "Google",
            "location": "Mountain View, CA",
            "description": f"Looking for a data analyst with skills in {keywords}. Analyze user behavior data and create dashboards.",
            "salary_min": 75000,
            "salary_max": 90000,
            "url": "https://careers.google.com"
        },
        {
            "id": "2",
            "title": "Junior Data Scientist",
            "company": "Meta",
            "location": "Remote",
            "description": f"Join our data science team. Work on recommendation systems and A/B testing. Skills needed: {keywords}, ML, Statistics.",
            "salary_min": 90000,
            "salary_max": 120000,
            "url": "https://www.metacareers.com"
        },
        {
            "id": "3",
            "title": "Business Analyst",
            "company": "Amazon",
            "location": "Seattle, WA",
            "description": f"Support product teams with data insights. {keywords} experience preferred. Strong communication skills required.",
            "salary_min": 70000,
            "salary_max": 95000,
            "url": "https://www.amazon.jobs"
        }
    ]