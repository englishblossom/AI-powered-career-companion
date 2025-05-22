import json
from io import BytesIO

import boto3
from agents import genResume
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
    s3_client = boto3.resource('s3')
    client_db = boto3.resource('dynamodb', region_name='us-east-2')
    table_jo = client_db.Table('jobdesc_user')
    try:
        data = json.loads(event["body"])
    except:
        data = event["body"]
    if "base_resume" in data and "job_desc" in data and "urls" in data and "role" in data and "company_name" in data:
        base_resume = data["base_resume"]
        job_desc = data["job_desc"]
        urls = data["urls"]
        role = data["role"]
        username = data["username"]
        jobdescid = data["jobdescriptionid"]
        company_name = data["company_name"]
        out_ = genResume(base_resume, job_desc, urls, role, company_name)
        bucket_name = "career.ai"
        tex_bytes = BytesIO(out_.encode("utf-8"))
        s3_key = f"{username}_{jobdescid}.tex"
        s3_client.Bucket(bucket_name).upload_fileobj(out_,s3_key)
        url = s3_client.generate_presigned_url(
            ClientMethod='get_object',
            Params={'Bucket': bucket_name, 'Key': s3_key},
            ExpiresIn=None
        )
        response_job_desc = table_jo.get_item(
            Key={
                "jobdesc_id": jobdescid
            }
        )
        response_job_desc["Item"]["s3_link"] = url
        table_jo.put_item(Item=response_job_desc["Item"])
        return {
            'statusCode': 200,
            'body': json.dumps(url)
        }




    return {
        "statusCode": 404,
        "body": json.dumps({
            "message": "hello world",
            # "location": ip.text.replace("\n", "")
        }),
    }
