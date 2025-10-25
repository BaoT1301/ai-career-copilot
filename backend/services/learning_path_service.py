# Simple course database
COURSES_DB = {
    "SQL": [
        {
            "title": "SQL for Data Analysis",
            "provider": "freeCodeCamp",
            "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/",
            "duration_weeks": 2,
            "cost": "Free",
            "project": "Analyze a public database (Chinook, Sakila) and write 10 complex queries"
        }
    ],
    "Tableau": [
        {
            "title": "Tableau Fundamentals",
            "provider": "Tableau",
            "url": "https://www.tableau.com/learn/training",
            "duration_weeks": 2,
            "cost": "Free",
            "project": "Create an interactive sales dashboard with 5+ visualizations"
        }
    ],
    "Python": [
        {
            "title": "Python Crash Course",
            "provider": "Google/Coursera",
            "url": "https://www.coursera.org/learn/python-crash-course",
            "duration_weeks": 3,
            "cost": "Free (audit)",
            "project": "Build a data cleaning script for CSV files"
        }
    ],
    "Machine Learning": [
        {
            "title": "ML Specialization",
            "provider": "Andrew Ng/Coursera",
            "url": "https://www.coursera.org/specializations/machine-learning-introduction",
            "duration_weeks": 8,
            "cost": "$49/month",
            "project": "Train and deploy a classification model (95%+ accuracy)"
        }
    ],
    "Statistics": [
        {
            "title": "Statistics Fundamentals",
            "provider": "Khan Academy",
            "url": "https://www.khanacademy.org/math/statistics-probability",
            "duration_weeks": 3,
            "cost": "Free",
            "project": "Perform A/B test analysis with statistical significance"
        }
    ],
    "Excel": [
        {
            "title": "Excel for Data Analysis",
            "provider": "Microsoft Learn",
            "url": "https://learn.microsoft.com/en-us/training/excel/",
            "duration_weeks": 1,
            "cost": "Free",
            "project": "Build financial model with pivot tables and formulas"
        }
    ],
    "Power BI": [
        {
            "title": "Power BI Essentials",
            "provider": "Microsoft Learn",
            "url": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi",
            "duration_weeks": 2,
            "cost": "Free",
            "project": "Create interactive business intelligence dashboard"
        }
    ],
    "R": [
        {
            "title": "R Programming",
            "provider": "Johns Hopkins/Coursera",
            "url": "https://www.coursera.org/learn/r-programming",
            "duration_weeks": 4,
            "cost": "Free (audit)",
            "project": "Statistical analysis and visualization of real dataset"
        }
    ]
}

def generate_learning_path(missing_skills):
    """Generate a learning path for missing skills"""
    if not missing_skills:
        return []
    
    path = []
    current_week = 0
    
    for skill in missing_skills[:5]:  # Limit to 5 skills
        # Find course for this skill (case-insensitive match)
        course = None
        for skill_key, courses in COURSES_DB.items():
            if skill.lower() in skill_key.lower() or skill_key.lower() in skill.lower():
                course = courses[0]
                break
        
        # If no exact match, create generic recommendation
        if not course:
            course = {
                "title": f"Learn {skill}",
                "provider": "Multiple platforms",
                "url": f"https://www.google.com/search?q=learn+{skill.replace(' ', '+')}",
                "duration_weeks": 2,
                "cost": "Varies",
                "project": f"Build a portfolio project demonstrating {skill}"
            }
        
        current_week += course["duration_weeks"]
        
        path.append({
            "skill": skill,
            "weeks": f"{current_week - course['duration_weeks'] + 1}-{current_week}",
            "course": course["title"],
            "provider": course["provider"],
            "url": course["url"],
            "cost": course["cost"],
            "project": course["project"],
            "time_commitment": f"{course['duration_weeks'] * 5} hours"
        })
    
    return path