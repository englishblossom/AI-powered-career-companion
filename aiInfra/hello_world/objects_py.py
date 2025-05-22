from typing import List, Dict, Any, Union
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class Review(BaseModel):
    score: int = Field(description="score")
    feedback: List[str] = Field(description="comments on the resume")

    def to_dict(self) -> Dict[str,Union[int, str]]:
        return {"score":self.score,"feedback": self.feedback}



from pydantic import BaseModel
from typing import List, Optional

class ContactDetails(BaseModel):
    full_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    linkedin: Optional[str]
    github: Optional[str]
    portfolio: Optional[str]
    def to_dict(self):
        return {
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "linkedin": self.linkedin,
            "github": self.github,
            "portfolio": self.portfolio
        }

class WorkEntry(BaseModel):
    job_title: str
    company_name: str
    location: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    responsibilities: List[str]
    def to_dict(self):
        return {
            "job_title": self.job_title,
            "company_name": self.company_name,
            "location": self.location,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "responsibilities": self.responsibilities
        }

class ProjectEntry(BaseModel):
    project_title: str
    points: List[str]
    link: Optional[str]
    def to_dict(self):
        return {
            "project_title": self.project_title,
            "points": self.points,
            "link": self.link
        }

class ResumeData(BaseModel):
    contact_details: ContactDetails
    work_history: List[WorkEntry]
    projects: List[ProjectEntry]
    def to_dict(self):
        return {
            "contact_details": self.contact_details.to_dict(),
            "work_history": [entry.to_dict() for entry in self.work_history],
            "projects": [entry.to_dict() for entry in self.projects]
        }

class skillObject(BaseModel):
    """
    "skills": {
    "Programming Languages": ["Java", "Python", "C++", "Go"],
    "Tools and Technologies": ["AWS", "Spring Boot", "Docker", "Kubernetes", "Git"],
    "Soft Skills": ["Problem-solving", "Analytical skills", "Communication", "Teamwork"]
}
    """
    skills: Dict[str, List[str]] = Field(description="A dictionary of skills categorized by type")

    def to_dict(self):
        return self.skills

class OutResumeData(BaseModel):
    """
    {{"name" :[name of the candidate],
    "email": "[email hyperlink]",
    "links": "[link1 hyperlink] | [link2 hyperlink] | ...",
    "headline": "[headline, maximum 200 characters; use guidelines, private notes, self description and the work experience to form a perfect headline that is tailored to the candidate]",
    "executive_summary": "[a list of 5-8 points about meaningful professional experience, tools and achievements; tailor this information to the candidate]",
    "professional_experience": ["### [role] | [company] [location] | [dates]", [a list of 3-5 bullet points about the experience, tailoring it to the role, company and the candidate]]
    "achievements": ["any extra-circular achievements, awards, certifications, etc"] }}
    """
    name: str
    email: str
    links: List[str]
    headline: Optional[str]
    skills : Optional[Dict[str, List[str]]]
    work_history: List[WorkEntry]
    projects: Optional[List[ProjectEntry]]
    def to_dict(self):
        return {
            "name": self.name,
            "email": self.email,
            "links": self.links,
            "headline": self.headline if self.headline else"",
            "skills": self.skills if self.skills else [],
            "work_history": [entry.to_dict() for entry in self.work_history],
            "projects": [entry.to_dict() for entry in self.projects] if self.projects else []
        }

# from langchaioutput_parsers import BaseOutputParser
# import ast
#
# class ResumeOutputParser(BaseOutputParser):
#     def parse(self, text: str) -> ResumeData:
#         try:
#             parsed = ast.literal_eval(text)
#             return ResumeData(**parsed)
#         except Exception as e:
#             raise ValueError(f"Failed to parse model output: {e}")

summary_parser = PydanticOutputParser(pydantic_object=Review)
resume_parser = PydanticOutputParser(pydantic_object=ResumeData)
out_resume = PydanticOutputParser(pydantic_object=OutResumeData)