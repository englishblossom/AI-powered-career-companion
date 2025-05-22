import langchain
from langchain_core.agents import AgentFinish
from langchain_core.runnables import Runnable
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import Tool, render_text_description, tool, BaseTool
from langchain.agents.output_parsers import ReActSingleInputOutputParser
from dotenv import load_dotenv
from typing import Union, List, Tuple
from langchain_core.agents import AgentAction, AgentFinish
from langchain_community.tools.tavily_search import TavilySearchResults
from plotly.graph_objs.indicator import Number

from callbacks import AgentCallbackHandler
import requests
from bs4 import BeautifulSoup
from objects_py import summary_parser, resume_parser, out_resume

load_dotenv()


# add scheduling and all other regular tasks like pointing where it can be found in our website and steps to take


@tool
def get_profile_url_tavily(name: str):
    """
    Searches for the keywords regarding the job description
    """
    search = TavilySearchResults()
    res = search.run(f"{name}")
    return res


def parse_agent_val(res: List[Tuple[Union[AgentAction, AgentFinish], str]],
                    user_input: str = "Observation: ",
                    llm_prefix: str = "Thought: ") -> str:
    thoughts = ""
    for action, observation in res:
        thoughts += f"{llm_prefix}: {action.log}"
        thoughts += f"\n{user_input}: {observation} \n "
    return thoughts


def find_tool(tool_name: str, tools: List[BaseTool]) -> Tool | None:
    for tool_ in tools:
        if tool_.name == tool_name:
            return tool_
    raise Exception(f"{tool_name} not found")


def function_get_relevant_projects(name: str, job_description: str, urls: List[str], job_title: str,
                                   num_iters=10) -> str:
    prompt = """
    Extract any projects from the provided urls that might be relevant to the user for making his resume great.
     Return projects even if they deal with an adjacent idea to the provided search query. Err on the side of verbosity.

     You are given the following job description which he is applying to :
    <job_description>
     {job_description}
    </job_description>

    You are given the following urls:
    <urls>
     {urls}
    </urls>
     Final answer should be in the following format:
    <output_format>
    {{"projects": [
            "project_title": "",
            "points": [point1,...]
            "link": ""
            ], ...
        }},
    </output_format>


    Use the following format:

    Question: the input question you must answer
    Thought: you should always think about what to do to resolve the user question
    Action: the action to take, should be one of [{tool_names}]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question.

    Begin!

    Question: {input}
    Thought: {agent_scratchpad}
    """
    tools = [get_profile_url_tavily]
    conversations = []
    print("tool names are", " ,".join([tool_.name for tool_ in tools]))
    prompt = PromptTemplate.from_template(prompt).partial(
        tools=render_text_description(tools), tool_names=" ,".join([tool_.name for tool_ in tools])
    )

    llm = ChatOpenAI(temperature=0, stop="\nObservation", model_name="gpt-4o", callbacks=[AgentCallbackHandler()])
    agent = {"input": lambda x: x["input"],
             "agent_scratchpad": lambda x: x["agent_scratchpad"],
             "name": lambda x: x["name"],
             "urls": lambda x: x["urls"],
             "job_description": lambda x: x["job_description"],
             "job_title": lambda x: x["job_title"]} | prompt | llm | ReActSingleInputOutputParser()
    res: Union[AgentAction | AgentFinish] = AgentAction(agent=agent, tools=tools, tool="None", log="Not run",
                                                        tool_input="None")
    input_question = "search for the projects that are relevant to the job description so that user can improve their resume"
    for i in range(num_iters):
        res = agent.invoke({
            "input": str(input_question),
            "agent_scratchpad": parse_agent_val(conversations),
            "name": str(name),
            "urls": urls,
            "job_description": str(job_description),
            "job_title": str(job_title)
        })
        if isinstance(res, AgentFinish):
            print(res.log)
            break
        tool_name = res.tool
        print(res.log)
        action_input = res.tool_input
        tool_to_use = find_tool(tool_name, tools)
        observation = tool_to_use.func(str(action_input))
        conversations.append((res, str(observation)))
    return res.log


def function_get_profile_keywords(name: str,
                                  job_title: str,
                                  job_description: str,
                                  num_iters: int = 10) -> str:
    prompt = """
    You are a search engine. Your task is to search for the Technical keywords regarding the job description.
    The keywords should be relevant to the job description and should be used to improve the resume.

    Our focus is only for the technical keywords like (python,go,java,spring boot,etc) and soft skills required for the role.

    You will be given a name and your task is to search for the keywords regarding the job description.
    {job_title}

    You have the following tools at your disposal:
    {tools}

    You will be given the job description and your task is to search for the keywords regarding the job description.
    {job_description}

    You will be given the name of the company at which the candidate is applying for and your task is to search for the keywords regarding the job description.
    {name}

    Final answer should be in the following format:
    <output_format>
    Technical Keywords:
        - <keyword>
        - <keyword>
        - <keyword>
        - <keyword>
        - <keyword>
        ....

    Soft Skills:
        - <skill>
        - <skill>
        - <skill>
        - <skill>
        - <skill>
        ....
    </output_format>

    Use the following format:

    Question: the input question you must answer
    Thought: you should always think about what to do to resolve the user question
    Action: the action to take, should be one of [{tool_names}] [STRICTLY USE THE TOOL NAMES]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question.

    Begin!

    Question: {input}
    Thought: {agent_scratchpad}
    """
    tools = [get_profile_url_tavily]
    conversations = []
    print("tool names are", " ,".join([tool_.name for tool_ in tools]))
    prompt = PromptTemplate.from_template(prompt).partial(
        tools=render_text_description(tools), tool_names=" ,".join([tool_.name for tool_ in tools])
    )

    llm = ChatOpenAI(temperature=0, stop="\nObservation", model_name="gpt-4o", callbacks=[AgentCallbackHandler()])
    agent = {"input": lambda x: x["input"],
             "agent_scratchpad": lambda x: x["agent_scratchpad"],
             "name": lambda x: x["name"],
             "job_description": lambda x: x["job_description"],
             "job_title": lambda x: x["job_title"]} | prompt | llm | ReActSingleInputOutputParser()
    res: Union[AgentAction | AgentFinish] = AgentAction(agent=agent, tools=tools, tool="None", log="Not run",
                                                        tool_input="None")
    input_question = "search for the technical keywords regarding the job description so that user can improve their resume"
    for i in range(num_iters):
        res = agent.invoke({
            "input": str(input_question),
            "agent_scratchpad": parse_agent_val(conversations),
            "name": str(name),
            "job_description": str(job_description),
            "job_title": str(job_title)
        })
        if isinstance(res, AgentFinish):
            print(res.log)
            break
        tool_name = res.tool
        print(res.log)
        action_input = res.tool_input
        tool_to_use = find_tool(tool_name, tools)
        observation = tool_to_use.func(str(action_input))
        conversations.append((res, str(observation)))
    return res.log


def function_resume_feedback(num_iters: int, resume: str, job_description: str, company_name: str) -> str:
    prompt = """
    You are a resume expert. You will be given a job description and a resume. Your task is to analyze the resume and provide feedback on how to improve it and a score.
    You are given the following job description:
    <job_descriptions>
    {job_description}
    </job_descriptions>
    Read it carefully and pay attention to details like: years of experience, the company, industry and the requirements, buzzwords, industry-specific terms, technologies, and other relevant keywords.
    you are also given the name of the company at which the candidate is applying for.
    <company_name>
    {company_name}
    </company_name>

    you are also given the resume of the candidate.
    <resume>
    {resume}
    </resume>

    You need to evaluate the resume based on the guidelines provided below. The guidelines must be respected:

    <guidelines>
    1. Be relevant. A resume is a highlight reel, not a list of everything someone has ever done. It is not a list of job descriptions and writing out every task that someone ever did. Instead, it is a overview of accomplishments.
    2. Be direct. Get rid of the objective. The first thing recruiters look for is the most recent job, so do them a favor and put it right at the top. Objectives are outdated and take up valuable space, so get rid of it! Lead with work experience, close with education and aim for a one-page resume – two pages max – depending on the length of the career.
    3. Be clear. Write full sentences. Just because a resume needs to be concise does not mean using fragments is viable and just because it needs to be descriptive doesn't mean run-ons are a solution. The intention of business writing is to convey information, so stick to the facts. Avoid any filler words, do not use articles (a, an, the), pronouns (my, its and their) and superfluous adjectives.
    4. Be structured. Not all bullet points are created equal. The first bullet may be the only bullet someone gets a chance to read at a career fair, so make it a good one. Organize your bullets according to the priorities of the position in descending order. For example, if the majority of the job is client advocacy, then make client advocacy the first bullet and the additional bullets will describe in greater detail what that entails and how someone accomplish it.
    5. Be confident. Use active voice and action words. Simply put, active voice is direct and easier to understand. Also, don't use the word "I" on a resume. Instead, simply say "Created five monthly financial reports."
    6. Be distinct. Don't say the same thing twice. Even though there are a couple jobs where the candidate did the exact same thing doesn't mean you can copy and paste the exact same bullets for every position. You must diversify your bullets.
    </guidelines>

    After Evaluating the resume, you need to provide a score from 0 to 100, where 100 is the best resume possible.
    AS well as a list of 5-8 points critiquing the resume and providing feedback on how to improve it, strongly focus on critiquing the resume focus on negatives and how can you improve the score.
    The output should be in the following format:


    <output_format>
    {{
        "score": ... [STRICTLY NUMERICAL SCORE]
        "feedback": [POINT1, POINT2, ...] [STRICTLY LIST OF POINTS]
    }}
    </output_format>

    """

    llm = ChatOpenAI(temperature=0, model_name="gpt-4o", callbacks=[AgentCallbackHandler()])
    prompt = PromptTemplate.from_template(prompt).partial(
        job_description=job_description, resume=resume, company_name=company_name
    )
    chain = {"job_description": lambda x: x["job_description"],
             "resume": lambda x: x["resume"],
             "company_name": lambda x: x["company_name"]} | prompt | llm | summary_parser
    res = chain.invoke({
        "job_description": str(job_description),
        "resume": str(resume),
        "company_name": str(company_name)
    })
    return res.to_dict()


def function_extract_resume_info(resume: str):
    """
    Extracts the relevant information from the resume.
    """
    prompt = """
        You are a resume parser. Given a resume in plain text format, extract and return the following information as a Python dictionary.
        Input :
        <resume>
        {resume}
        </resume>
        Extract the following fields and return an valid json response as shown below:
        <output_format>
        {{
            "contact_details": {{
                "full_name": "",
                "email": "",
                "phone": "",
                "linkedin": "",
                "github": "",
                "portfolio": ""
            }},
            "work_history": [
                {{
                    "job_title": "",
                    "company_name": "",
                    "location": "",
                    "start_date": "",
                    "end_date": "",
                    "responsibilities": [
                        # List of bullet points
                    ]
                }},
                ...
            ],
            "projects": [
                {{
                    "project_title": "",
                    "points": [point1,point2,...],
                    "link": ""
                }},
                ...
            ],
            "achievements": [
                ...
            ]
        }}
        </output_format>

        Use the given text resume as the input, extract and fill in the dictionary fields accurately based on the resume content. Return only the dict and nothing else, the dict must be parsed directly to a json so do not start with python or something, return the json as it is.
    """
    llm = ChatOpenAI(temperature=0, model_name="gpt-4o", callbacks=[AgentCallbackHandler()])
    prompt = PromptTemplate.from_template(prompt).partial(resume=resume)
    chain = {"resume": lambda x: x["resume"]} | prompt | llm | resume_parser
    res = chain.invoke({"resume": resume})
    return res.to_dict()


def function(num_iters: int,
             job_description: str,
             projects: str,
             relevant_projects: str,
             work_history: str,
             contact_details: str,
             feedback: str,
             relevant_key_words: str,
             score: int) -> str:
    agent_scratchpad = ""
    prompt = """
    You are a resume expert. You will be given a job description and a resume. Your task is to analyze the resume and improve it.
    You are given the following job description:
    <job_descriptions>
    {job_description}
    </job_descriptions>

    Read it carefully and pay attention to details like:

    - The company, industry and the requirements
    - Buzzwords, industry-specific terms, technologies, and other relevant keywords

    Follow these steps, thinking step-by-step before answering:
    You will also be given a set of guidelines to follow. Your task is to analyze the resume and provide feedback on how to improve it.

    1. Analyze the following guidelines. They are provided by a human expert about how to write better resumes. The guidelines must be respected:
    [STRICTLY FOLLOW THE GUIDELINES]
    <guidelines>
    1. Be relevant. A resume is a highlight reel, not a list of everything someone has ever done. It is not a list of job descriptions and writing out every task that someone ever did. Instead, it is a overview of accomplishments.
    2. Be direct. Get rid of the objective. The first thing recruiters look for is the most recent job, so do them a favor and put it right at the top. Objectives are outdated and take up valuable space, so get rid of it! Lead with work experience, close with education and aim for a one-page resume – two pages max – depending on the length of the career.
    3. Be clear. Write full sentences. Just because a resume needs to be concise does not mean using fragments is viable and just because it needs to be descriptive doesn't mean run-ons are a solution. The intention of business writing is to convey information, so stick to the facts. Avoid any filler words, do not use articles (a, an, the), pronouns (my, its and their) and superfluous adjectives.
    4. Be structured. Not all bullet points are created equal. The first bullet may be the only bullet someone gets a chance to read at a career fair, so make it a good one. Organize your bullets according to the priorities of the position in descending order. For example, if the majority of the job is client advocacy, then make client advocacy the first bullet and the additional bullets will describe in greater detail what that entails and how someone accomplish it.
    5. Be confident. Use active voice and action words. Simply put, active voice is direct and easier to understand. Also, don't use the word "I" on a resume. Instead, simply say "Created five monthly financial reports."
    6. Be distinct. Don't say the same thing twice. Even though there are a couple jobs where the candidate did the exact same thing doesn't mean you can copy and paste the exact same bullets for every position. You must diversify your bullets.
    </guidelines>

    2. Using the clues about the candidate so far, analyze their work history and the list of interests, then use this information to fill the professional experience section.

    <relevant projects extracted from the urls>
    {projects}
    </relevant projects extracted from the urls>

    <projects>
    {relevant_projects}
    </projects>

    <work_history>
    {work_history}
    </work_history>

    4. Analyze the next information and use it to fill-in the contact details:

    <contact_details>
    {contact_details}
    </contact_details>

    5. Use the feedback provided by the resume expert to improve the resume. The feedback is provided below :
    <feedback>
    {feedback}
    </feedback>

    6. Use the relevant keywords extracted from the job description to improve the resume. The keywords are provided below :
    <relevant keywords>
    {relevant_key_words}
    </relevant keywords>


    Use the following Markdown template to write a draft resume. Within the template, the elements in square brackets contain descriptions of what should be filled within that place. Fill them with the details that fulfil the guidelines while taking into account the information analyzed in the steps before.

    <template>
    {{"name" :"name of the candidate",
    "email": "email",
    "links": "[link1, link2, ..."],
    "headline": "headline, maximum 200 characters; use guidelines, private notes, self description and the work experience to form a perfect headline that is tailored to the candidate",
    "executive_summary": "a list of 5-8 points about meaningful professional experience, tools and achievements; tailor this information to the candidate",
    "work_history": [
                {{
                    "job_title": "",
                    "company_name": "",
                    "location": "",
                    "start_date": "",
                    "end_date": "",
                    "responsibilities": [
                        # List of bullet points
                    ]
                }},
                ...
            ],
    "projects": [
        {{
            "project_title": "",
            "points":[],
            "link": ""
        }},
        ...
    ],
    "achievements": [
    "List of any extra-circular achievements, awards, certifications, etc"
    ] 

    }}

    ...
    </template>

    Before responding:

    <response_rules>
    1. Analyze the draft resume and check if it respects the guidelines, does not omit important information and it follows the template.
    2. The content must be professional, unless the candidate opts-in into industries that are risky, controversial or taboo.
    3. Check how it sounds and compare it to the private notes and the self description. Make adjustments to the draft, while maintaining the writing style appropriate for the candidate's personality.
    4. Make sure to include all the relevant information, not just the one related to the job description.
    </response_rules>

    You are also provided with the feedback from the resume expert and the score which the resume acheived
    <score>
    {score}
    </score>
    <feedback>
    {feedback}
    </feedback>
    Conversation Feedback: 
    <agent_scratchpad>
    {agent_scratchpad}
    </agent_scratchpad>

    Once done, the draft resume is ready and it becomes the final resume.

    Remember, this resume is important for the candidate, as it will be used to land a job. Make it unique to the candidate's personality.

    Now, please proceed with redacting the resume, and only the resume. Other words are useless.

    """
    conversations = []
    prompt = PromptTemplate.from_template(prompt)
    print(prompt.input_variables)
    llm = ChatOpenAI(temperature=0, model_name="gpt-4o", callbacks=[AgentCallbackHandler()])
    agent = {"input": lambda x: x["input"],
             "agent_scratchpad": lambda x: x["agent_scratchpad"],
             "job_description": lambda x: x["job_description"],
             "projects": lambda x: x["projects"],
             "work_history": lambda x: x["work_history"],
             "contact_details": lambda x: x["contact_details"],
             "feedback": lambda x: x["feedback"],
             "relevant_key_words": lambda x: x["relevant_key_words"],
             "score": lambda x: x["score"],
             "relevant_projects": lambda x: x["relevant_projects"],
             } | prompt | llm | out_resume
    res: Union[AgentAction | AgentFinish] = AgentAction(agent=agent, tool="None", log="Not run",
                                                        tool_input="None")
    for i in range(num_iters):
        res = agent.invoke({
            "input": str("Finetune my resume based on the job description provided"),
            "agent_scratchpad": conversations,
            "job_description": str(job_description),
            "projects": str(projects),
            "work_history": str(work_history),
            "contact_details": str(contact_details),
            "feedback": str(feedback),
            "relevant_key_words": str(relevant_key_words),
            "score": str(score),
            "relevant_projects": str(relevant_projects)
        })
        if isinstance(res, AgentFinish):
            print(res.to_dict())
            break
        conversations.append(res)
    return res.to_dict()


# job_Desc = "software engineer at amazon with 5 years of experience"
# out_func = function_get_profile_keywords("amazon", "software engineer",job_Desc )
# res_out = function(10,"mrunal : SDE-1 ","llms,python",out_func,out_func)
# out_ = function_resume_feedback(10,res_out,job_Desc,"amazon")
# print(out_)

def final_function(
        num_iters: int,
        resume: str,
        job_description: str,
        urls: List[str],
        role: str,
        company_name: str
) -> dict:
    """
    Final function to get the resume feedback and generate the resume.
    """
    parsed_resume = function_extract_resume_info(resume)
    contact_details = parsed_resume["contact_details"]
    work_history = parsed_resume["work_history"]
    projects = parsed_resume["projects"]

    feed_: dict[str, Union[Number, str]] = {"score": 0, "feedback": ""}
    final_resume = ""
    score = 75
    for i in range(num_iters):
        # Get the profile keywords
        profile_keywords = function_get_profile_keywords(company_name, role, job_description, num_iters=2)
        # Get the relevant projects
        relevant_projects = function_get_relevant_projects(company_name, job_description, urls, role, num_iters=2)
        # Generate the resume
        final_resume = function(num_iters=2,
                                job_description=job_description,
                                projects=projects,
                                relevant_projects=relevant_projects,
                                work_history=work_history,
                                contact_details=contact_details,
                                feedback=feed_["feedback"],
                                relevant_key_words=profile_keywords,
                                score=score)

        # Get the resume feedback
        print(final_resume)
        resume = final_resume
        feed_ = function_resume_feedback(2, final_resume, job_description, company_name)
        if feed_["score"] >= 95:
            break

    return {
        "resume_feedback": feed_,
        "final_resume": final_resume
    }


def gen_Resume(resume: str, job_description: str, urls: List[str], role: str, company_name: str):
    out_ = final_function(2, resume, job_description, urls, role, company_name)
    return out_


resume_str = """
    Mrunaldhar Bathula
📞 +1 540-429-3619
✉️ mrunaldharb23@vt.edu
🔗 LinkedIn
🔗 GitHub

⸻

Work History

Software Development Engineer
Proctor360, Richmond, VA
Aug 2024 – Present
	•	Engineered a GenAI chatbot using LangChain, FAISS, and Nemo Guardrails, achieving 95% user satisfaction.
	•	Developed a serverless RESTful microservice for resource validation using Python, Go, and AWS Lambda.
	•	Designed cloud infrastructure with Terraform and AWS CloudFormation, improving scalability by 60%.
	•	Refactored Spring Boot APIs with async processing and caching, reducing response time from 450ms to 120ms.
	•	Integrated YOLOv10, replacing AWS Rekognition, achieving a 90% cost reduction.
	•	Architected a scalable AWS backend using SQS, DLQ, Lambda, and MongoDB, supporting 1M+ daily requests.
	•	Developed a Manifest v3 Chrome extension for real-time tab monitoring, used by over 30,000 users.

Software Development Engineer
Tiger Analytics, Chennai, India
Nov 2022 – Aug 2023
	•	Built a model tracking service using Spring Boot, PostgreSQL, and AWS S3 for 50+ models.
	•	Developed a real-time data drift detection service with Kafka, Cassandra, and Databricks.
	•	Containerized 8+ microservices with Docker and Kubernetes on AWS EKS.
	•	Implemented real-time dashboards with Java WebSockets and Thymeleaf.
	•	Automated CI/CD pipelines using Jenkins and GitLab CI, with SonarQube and blue-green deployments.
	•	Mentored 5 developers and standardized coding practices, reducing troubleshooting time by 40%.

Software Development Engineer
Coforge, Pune, India
Jan 2020 – Nov 2022
	•	Created a metrics collection framework for Kong Gateway using Python and Prometheus.
	•	Developed a Kubernetes Operator with Kopf to auto-scale Kong based on traffic patterns.
	•	Optimized JWT and rate-limiting plugins using asyncio, reducing CPU usage by 30%.
	•	Deployed Kong Hybrid clusters with Terraform and Helm, ensuring <100ms failover across AWS regions.

⸻

Projects

TailorMyResume: Agentic RAG-Powered Resume Generator
Sep 2024 – Oct 2024
Developed an AI-based resume generator using LangChain and FastAPI, deployed via AWS SageMaker. Integrated metadata-aware RAG pipelines and event-driven processing with Lambda, securely storing outputs in PostgreSQL and S3.

Bookstore
Jan 2024 – Apr 2024
Built a full-stack e-commerce app using Java Spring Boot and React. Integrated Redis for caching, PostgreSQL for data storage, Stripe for payments, and deployed via AWS EC2, S3, and CloudFront.

Customer Behavior Prediction with ML on Instacart Data
Aug 2023 – Dec 2023
Implemented a full ML pipeline using pandas, NumPy, and Scikit-learn, achieving R² = 0.813 and F1 = 1.0. Automated training and analysis with Airflow and visualized insights with Dash and Plotly.
🔗 GitHub Link

"""

job_Desc = """
Role Summary:
A brief overview of the SDE's purpose within the organization and team, including their role in design, development, testing, deployment, and maintenance of software solutions. 
Responsibilities:
A detailed list of the SDE's primary duties, which may include:
Designing, developing, and testing software applications. 
Writing clean, maintainable, and efficient code. 
Collaborating with other engineers, product managers, and stakeholders. 
Troubleshooting and debugging software issues. 
Maintaining and enhancing existing software systems. 
Required Skills & Experience:
Specific technical proficiency and experience requirements, such as:
Programming languages (e.g., Java, Python, C++). 
Software development methodologies (e.g., Agile, Scrum). 
Version control systems (e.g., Git). 
Database systems and SQL. 
Experience with cloud platforms (e.g., AWS, Azure, Google Cloud). 
Desired Qualifications:
Optional but beneficial skills and qualities, such as:
Strong problem-solving and analytical skills. 
Excellent communication and teamwork skills. 
Experience with specific frameworks, libraries, or technologies relevant to the company's projects. 
Benefits and perks:
Information about the company's compensation and benefits package, which may include:
Salary range. 
Health insurance, dental insurance, and vision insurance. 
Paid time off, parental leave, and holidays. 
Bonuses and stock options. 
Tuition reimbursement and professional development opportunities
"""

company_name = "Amazon"

role = "Software Development Engineer"

urls = ["https://msonu007.github.io/"]

print(gen_Resume(resume_str, job_Desc, urls, role, company_name))