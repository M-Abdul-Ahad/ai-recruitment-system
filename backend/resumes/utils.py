import re
import docx
import PyPDF2
from resumes.data.skills import SKILLS

# Date pattern to detect job dates/durations in experience sections
DATE_PATTERN = (
    r'(?:\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|'
    r'aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{1,2}[/-])\s*)?'
    r'\b(?:19|20)\d{2}\b'
    r'(?:\s*(?:[-–]|to|\s)\s*'
    r'(?:\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|'
    r'aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{1,2}[/-])\s*)?'
    r'(?:\b(?:19|20)\d{2}\b|present|current|now))?'
)


def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text


def clean_resume_text(text):
    text = text.lower()
    text = re.sub(r'\n+', '\n', text)              # keep structure
    text = re.sub(r'[^\w\s\n]', '', text)          # keep \n
    text = re.sub(r'[ \t]+', ' ', text)            # only spaces
    return text.strip()


def extract_skills(cleaned_text):
    found_skills = []

    for skill in SKILLS:
        if skill in cleaned_text:
            found_skills.append(skill)

    return list(set(found_skills))


def extract_education_section(cleaned_text):
    lines = cleaned_text.split('\n')
    education_lines = []
    capture = False

    start_keywords = [
        "education", "academic", "academics",
        "qualification", "qualifications",
        "educational background", "academic background"
    ]

    stop_keywords = [
        "experience", "work", "skills",
        "projects", "certifications", "internships"
    ]

    for line in lines:
        line = line.strip()

        if not line:
            continue

        if any(k in line for k in start_keywords):
            capture = True
            continue

        if capture and any(k in line for k in stop_keywords):
            break

        if capture:
            education_lines.append(line)

    return education_lines


def extract_year(text):
    match = re.search(r'(19|20)\d{2}', text)
    return match.group() if match else ""


def parse_education(education_lines):
    education_data = []

    for line in education_lines:
        degree = ""
        institution = ""
        year = ""

        # Degree detection
        for keyword in [
            "bachelor", "bsc", "bs",
            "master", "msc", "ms",
            "phd", "diploma"
        ]:
            if keyword in line:
                degree = keyword.title()
                break

        # Institution detection
        if any(word in line for word in ["university", "college", "institute"]):
            institution = re.sub(r'(19|20)\d{2}', '', line).title().strip()

        # Year detection
        year_match = re.search(r'(19|20)\d{2}', line)
        if year_match:
            year = year_match.group()

        if degree or institution:
            education_data.append({
                "degree": degree,
                "institution": institution,
                "year": year
            })

    return education_data


def extract_experience_section(cleaned_text):
    lines = cleaned_text.split('\n')
    experience_lines = []
    capture = False

    start_keywords = [
        "experience", "work experience",
        "employment", "professional experience",
        "internship", "industrial training"
    ]

    stop_keywords = [
        "education", "skills",
        "projects", "certifications", "awards"
    ]

    for line in lines:
        line = line.strip()

        if not line:
            continue

        if any(k in line for k in start_keywords):
            capture = True
            continue

        if capture and any(k in line for k in stop_keywords):
            break

        if capture:
            experience_lines.append(line)

    return experience_lines


def split_experience_blocks(experience_lines):
    blocks = []
    current_block = []

    for line in experience_lines:
        if re.search(DATE_PATTERN, line, re.IGNORECASE):
            if current_block:
                blocks.append(current_block)
                current_block = []
        current_block.append(line)

    if current_block:
        blocks.append(current_block)

    return blocks


def parse_experience(blocks):
    experience_data = []

    for block in blocks:
        job_title = ""
        company = ""
        duration = ""
        description_lines = []

        # First line usually contains title + company + duration
        header = block[0]

        # Duration
        duration_match = re.search(
            r'(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|[0-9]{1,2}/)\s*)?'
            r'(?:19|20)\d{2}\s*[-–\s|to]*\s*'
            r'(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|[0-9]{1,2}/)\s*)?'
            r'(?:(?:19|20)\d{2}|present|current|now)',
            header,
            re.IGNORECASE
        )
        if duration_match:
            duration = duration_match.group()

        # Split title and company
        if " at " in header:
            job_title, company = header.split(" at ", 1)
        elif " - " in header:
            job_title, company = header.split(" - ", 1)
        else:
            job_title = header
            company = ""

        # Remaining lines → description
        if len(block) > 1:
            description_lines = block[1:]

        experience_data.append({
            "job_title": job_title,
            "company": company,
            "duration": duration,
            "description": " ".join(description_lines)
        })

    return experience_data


def extract_contact_info(raw_text):
    """
    Extract contact details: full name, email, phone, location, linkedin, github, portfolio.
    """
    if not raw_text:
        return {}

    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]

    # 1. Email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', raw_text)
    email = email_match.group(0) if email_match else ""

    # 2. Phone
    phone_match = re.search(r'(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}', raw_text)
    phone = phone_match.group(0).strip() if phone_match else ""

    # 3. LinkedIn
    linkedin_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([A-Za-z0-9_-]+)/?', raw_text, re.IGNORECASE)
    linkedin = f"https://linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else ""

    # 4. GitHub
    github_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([A-Za-z0-9_-]+)/?', raw_text, re.IGNORECASE)
    github = f"https://github.com/{github_match.group(1)}" if github_match else ""

    # 5. Full Name (heuristics: first non-empty line with 2-4 words, no email/phone/url)
    full_name = ""
    for line in lines[:5]:
        if '@' in line or 'http' in line or 'www.' in line or re.search(r'\d{4}', line):
            continue
        words = line.split()
        if 1 <= len(words) <= 4 and all(w.isalpha() for w in words):
            full_name = line
            break

    # 6. Professional Title (heuristics: line following name or containing developer/engineer/manager)
    professional_title = ""
    title_keywords = ["engineer", "developer", "designer", "manager", "architect", "consultant", "analyst", "specialist", "scientist"]
    for line in lines[:8]:
        if any(tk in line.lower() for tk in title_keywords) and len(line.split()) <= 6:
            professional_title = line
            break

    return {
        "fullName": full_name,
        "email": email,
        "phone": phone,
        "professionalTitle": professional_title,
        "linkedin": linkedin,
        "github": github,
    }


def extract_projects(raw_text):
    """
    Extract projects section and structure into project entries.
    """
    if not raw_text:
        return []

    lines = raw_text.split('\n')
    project_lines = []
    capture = False

    start_keywords = ["projects", "personal projects", "academic projects", "key projects", "selected projects"]
    stop_keywords = ["experience", "work experience", "education", "skills", "certifications", "awards", "languages"]

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        lower = stripped.lower()

        if any(lower == k or lower.startswith(f"{k}:") or lower.startswith(f"{k} -") for k in start_keywords):
            capture = True
            continue

        if capture and any(lower == k or lower.startswith(f"{k}:") for k in stop_keywords):
            break

        if capture:
            project_lines.append(stripped)

    if not project_lines:
        return []

    projects = []
    current_proj = None

    for line in project_lines:
        if not current_proj or (len(line.split()) <= 6 and not line.startswith(('-', '•', '*', '–', '>', '·'))):
            if current_proj:
                projects.append(current_proj)
            current_proj = {
                "name": line.strip(),
                "description": "",
                "technologies": [],
                "bullets": [],
            }
        else:
            bullet_clean = re.sub(r'^[-•*–>·]\s*', '', line).strip()
            if current_proj and bullet_clean:
                if bullet_clean not in current_proj["bullets"]:
                    current_proj["bullets"].append(bullet_clean)

    if current_proj:
        projects.append(current_proj)

    return projects


