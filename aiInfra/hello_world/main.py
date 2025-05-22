from fastapi import FastAPI
from agents import function_get_profile_keywords, function_resume_feedback, function, final_function, gen_Resume
import boto3
app = FastAPI()
@app.get("/generateResume/{username}/{jobdescriptionid}")
async def generate_resume(username,jobdescriptionid,n_iters=10):
    #user_Details, field called full resume
    # resume user_name, job_id
    """
    Generate a resume based on the provided information.
    """
    # Call the function to generate the resume
    # user_name,jon_id
    try:
        client_db = boto3.resource('dynamodb', region_name='us-east-2')
        table_user = client_db.Table('user_details')
        table_jo = client_db.Table('jobdesc_user')
        response_resume = table_user.get_item(
            Key={
                "username": username
            }
        )
        response_job_desc = table_jo.get_item(
            Key={
                "jobdesc_id": jobdescriptionid
            }
        )
        base_resume = response_resume['Item']['full_resume_text']
        job_desc = response_job_desc['Item']['job_description']
        print(base_resume)

        """
        "portfolio": portfolio,
        "github": github,
        "linkedin": linkedin,

        """
        portfolio = response_resume['Item']['portfolio']
        github = response_resume['Item']['github']
        linkedin = response_resume['Item']['linkedin']
        company_name = response_job_desc['Item']['companyName']
        role = response_job_desc['Item']['jobRole']
        urls = [portfolio, github, linkedin]
        res = gen_Resume(base_resume, job_desc, urls, role, company_name)
        return {"submitted_to_the_llm":True}
    except Exception as e:
        return {"error": str(e)}




