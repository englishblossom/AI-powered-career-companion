import json
import os

import boto3

# import requests


def lambda_handler(event, context):
    """Sample pure Lambda function

    Parameters
    ----------
    event: dict, required
        API Gateway Lambda Proxy Input Format

        Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format

    context: object, required
        Lambda Context runtime methods and attributes

        Context doc: https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html

    Returns
    ------
    API Gateway Lambda Proxy Output Format: dict

        Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    """

    # try:
    #     ip = requests.get("http://checkip.amazonaws.com/")
    # except requests.RequestException as e:
    #     # Send some context about this error to Lambda Logs
    #     print(e)

    #     raise e
    sqs = boto3.resource('sqs', region_name='us-east-2')
    queue_url = os.environ["QUEUE_URL"]
    try:
        data = json.loads(event["body"])
        if "username" in data and "jobdescriptionid" in data:
            username = data["username"]
            jobdescriptionid = data["jobdescriptionid"]
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
            portfolio = response_resume['Item']['portfolio']
            github = response_resume['Item']['github']
            linkedin = response_resume['Item']['linkedin']
            company_name = response_job_desc['Item']['companyName']
            role = response_job_desc['Item']['jobRole']
            urls = [portfolio, github, linkedin]
            new_dict_ = {
                "base_resume":base_resume,
                "job_desc":job_desc,
                "urls":urls,
                "role":role,
                "company_name":company_name,
                "username": username,
                "jobdescriptionid": jobdescriptionid
            }
            sqs.send_message(
                QueueUrl=queue_url,
                MessageBody=json.dumps(new_dict_)
            )

            return {
                'statusCode': 200,
                'body': json.dumps('Image fetched and sent to SQS successfully')
            }
    except:
        data = event["body"]


    """
    "portfolio": portfolio,
    "github": github,
    "linkedin": linkedin,

    """
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "hello world",
            # "location": ip.text.replace("\n", "")
        }),
    }
