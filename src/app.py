from fastapi import FastAPI, Form, File, UploadFile, HTTPException, Query, BackgroundTasks
import base64
import os
import boto3
import pdfplumber
from pydantic import BaseModel
import bcrypt
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.responses import JSONResponse
import uuid
import json
from boto3.dynamodb.conditions import Key, Attr
import tempfile
from urllib.parse import urlparse
from botocore.exceptions import ClientError
import httpx
from datetime import datetime
from fastapi import Body
from typing import Dict
from decimal import Decimal
from typing import Any
from mangum import Mangum
import asyncio

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["file-status", "content-disposition"]
)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("user_details")
user_table = dynamodb.Table("login_user")
jobdesc_table = dynamodb.Table("jobdesc_user")
feedback_table = dynamodb.Table("feedback")

s3_client = boto3.client("s3")
lambda_client = boto3.client("lambda")

S3_BUCKET_NAME = "career.ai"


class LoginRequest(BaseModel):
    username: str
    password: str


@app.get("/ping")
def ping():
    return {"message": "pongyolo!"}


@app.post("/register")
async def register(request: LoginRequest):
    response = user_table.get_item(Key={"username": request.username})
    if "Item" in response:
        raise HTTPException(status_code=400, detail="Username exists")

    hashed_password = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt())
    hashed_password_str = hashed_password.decode('utf-8')
    user_table.put_item(Item={"username": request.username, "password": hashed_password_str})
    token = f"token_for_{request.username}"
    return {"message": "User created successfully", "token": token}


@app.post("/login")
async def login(request: LoginRequest):
    response = user_table.get_item(Key={"username": request.username})

    if "Item" not in response:
        raise HTTPException(status_code=401, detail="username does not exist")

    user = response["Item"]
    stored_hashed_password = user.get("password")

    if not bcrypt.checkpw(request.password.encode('utf-8'),
                          stored_hashed_password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Password is wrong")

    token = f"token_for_{request.username}"

    return {"message": "User login successful", "token": token}


@app.post("/submit")
async def submit_data(
        username: str,
        name: str = Form(...),
        email: str = Form(...),
        portfolio: str = Form(None),
        github: str = Form(None),
        linkedin: str = Form(...),
        resume_pdf: UploadFile = File(...)
):
    text_data = ""
    try:
        with pdfplumber.open(resume_pdf.file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_data += page_text + "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {e}")
    print(text_data)

    item = {
        "username": username,
        "name": name,
        "email": email,
        "portfolio": portfolio if portfolio else "",
        "github": github if github else "",
        "linkedin": linkedin,
        "full_resume_text": text_data
    }

    try:
        response = table.put_item(Item=item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DynamoDB Error: {e}")

    return {
        "message": "Data stored in DynamoDB successfully",
        "dynamodb_response": response
    }


@app.post("/generate")
async def generate_resume(
        username: str = Query(...),
        job_description: str = Form(...),
        job_role: str = Form(...),
        company_name: str = Form(...)
):
    if not job_description:
        raise HTTPException(status_code=400, detail="Job description is required.")

    existing_items = jobdesc_table.scan(
        FilterExpression=Attr("username").eq(username) & Attr("job_description").eq(job_description)
    )

    if existing_items.get("Items"):
        existing_item = existing_items["Items"][0]
        job_desc_id = existing_item["jobdesc_id"]
    else:
        job_desc_id = str(uuid.uuid4())
        try:
            jobdesc_table.put_item(
                Item={
                    "jobdesc_id": job_desc_id,
                    "username": username,
                    "job_description": job_description,
                    "jobRole": job_role,
                    "companyName": company_name
                },
                ConditionExpression="attribute_not_exists(jobdesc_id)"
            )
        except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
            raise HTTPException(status_code=500, detail="Duplicate job_desc_id. Retry.")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://xi8c69odm8.execute-api.us-east-2.amazonaws.com/Prod/updateResume",
                json={
                    "username": username,
                    "jobdescriptionid": job_desc_id
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to call /updateResume: {e}")

    # Return job_desc_id to frontend for polling
    return {"jobdesc_id": job_desc_id, "status": "processing"}


@app.get("/checkStatus")
async def check_status(jobdesc_id: str = Query(...)):
    try:
        item = jobdesc_table.get_item(Key={"jobdesc_id": jobdesc_id}).get("Item")
        if not item:
            raise HTTPException(status_code=404, detail="Job ID not found")

        s3_link = item.get("s3_link")
        if not s3_link:
            return {"file-status": "processing"}

        jobdesc_table.update_item(
            Key={"jobdesc_id": jobdesc_id},
            UpdateExpression="""
                SET #ts = :ts,
                    #st = :st,
                    Add_to_tracker = :track
            """,
            ExpressionAttributeNames={
                "#ts": "timestamp",
                "#st": "status"
            },
            ExpressionAttributeValues={
                ":ts": datetime.utcnow().isoformat(),
                ":st": "Optimised Resume",
                ":track": 1
            }
        )

        # Stream .tex file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".tex") as tmp_file:
            local_path = tmp_file.name
            async with httpx.AsyncClient() as client:
                file_response = await client.get(s3_link)
                if file_response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Failed to download .tex from S3")
                tmp_file.write(file_response.content)

        def iterfile():
            with open(local_path, "rb") as f:
                yield from f

        return StreamingResponse(
            iterfile(),
            media_type="text/plain",
            headers={
                "Content-Disposition": f"attachment; filename=resume_{jobdesc_id}.tex",
                "file-status": "completed"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching .tex file: {str(e)}")


@app.post("/feedback")
async def submit_feedback(username: str, message: str = Form(...)):
    feedback_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()

    item = {
        "feedback_id": feedback_id,
        "username": username.strip(),
        "message": message.strip(),
        "timestamp": timestamp
    }

    try:
        feedback_table.put_item(Item=item)
        return JSONResponse(status_code=200, content={
            "message": "Feedback submitted successfully",
            "feedback_id": feedback_id
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving feedback: {str(e)}")


def convert_decimal(obj: Any):
    if isinstance(obj, list):
        return [convert_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    else:
        return obj


@app.get("/get-jobdesc")
async def get_jobdesc(username: str):
    try:
        response = jobdesc_table.scan(
            FilterExpression=Attr("username").eq(username) & Attr("Add_to_tracker").eq(1)
        )
        items = response.get("Items", [])

        cleaned_items = convert_decimal(items)

        return JSONResponse(status_code=200, content={"entries": cleaned_items})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching job descriptions: {str(e)}")


@app.post("/update-jobdesc")
async def update_jobdesc(item: Dict = Body(...)):
    job_desc_id = item.get("jobdesc_id")

    if not job_desc_id:
        raise HTTPException(status_code=400, detail="jobdesc_id is required to update a record.")
    try:
        # item["timestamp"] = datetime.utcnow().isoformat()
        if "timestamp" not in item:
            item["timestamp"] = datetime.utcnow().isoformat()

        jobdesc_table.put_item(Item=item)
        return {
            "message": "Job description updated successfully",
            "jobdesc_id": job_desc_id,
            "timestamp": item["timestamp"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update job description: {e}")


@app.get("/get-s3-link")
async def get_s3_link(jobdesc_id: str = Query(...)):
    try:
        response = jobdesc_table.get_item(Key={"jobdesc_id": jobdesc_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Job description not found.")

        item = response["Item"]
        s3_url = item.get("s3_link")
        if not s3_url:
            raise HTTPException(status_code=404, detail="No S3 link found.")

        # Download the .tex file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".tex") as tmp_file:
            local_path = tmp_file.name
            async with httpx.AsyncClient() as client:
                file_response = await client.get(s3_url)
                if file_response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Failed to download .tex from S3")
                tmp_file.write(file_response.content)

        # Stream the file back
        def iterfile():
            with open(local_path, "rb") as f:
                yield from f

        return StreamingResponse(
            iterfile(),
            media_type="text/plain",
            headers={
                "Content-Disposition": f"attachment; filename=resume_{jobdesc_id}.tex",
                "file-status": "completed"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error streaming .tex file: {e}")


handler = Mangum(app)



@app.get("/get-s3-link")
def get_s3_link(jobdesc_id: str = Query(...)):
    try:
        response = jobdesc_table.get_item(Key={"jobdesc_id": jobdesc_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Job description not found.")

        item = response["Item"]
        s3_url = item.get("s3_link")
        if not s3_url:
            raise HTTPException(status_code=404, detail="No S3 link found.")

        parsed = urlparse(s3_url)
        path_parts = parsed.path.lstrip("/").split("/", 1)
        if len(path_parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid S3 path format in URL")

        bucket = path_parts[0]
        key = path_parts[1]

        fresh_link = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": bucket,
                "Key": key,
                "ResponseContentDisposition": "inline; filename=document.pdf",
                "ResponseContentType": "application/pdf"
            },
            ExpiresIn=3600
        )

        return {"s3_link": fresh_link}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating fresh S3 link: {e}")


