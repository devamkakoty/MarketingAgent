import json
from google.cloud import secretmanager

GCP_PROJECT_ID = "content-creator-435618"
def access_secret_version(secret_id, version_id="latest"):
    # Setup GCP Secret Manager client
    secret_client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{GCP_PROJECT_ID}/secrets/{secret_id}/versions/{version_id}"
    response = secret_client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")

def clean_text(text):
    """
    Function to cleanup the gemini api response
    """
    # Remove the ```json at the beginning 
    if text.strip().startswith("```json"):
        text = text.strip()[7:].strip()

    # Remove the ``` at the end
    if text.endswith("```"):
        text = text[:-3].strip()
    
    return text

def json_to_dict(json_text):
    """
    Function to convert json in string format to
    actual json
    """
    try:
        json_dict = json.loads(json_text)
        return json_dict
    except json.JSONDecodeError as e:
        json_text = json_text.replace("'",'"')
        json_dict = json.loads(json_text)
        #print(f"Error decoding JSON: {e}")
        return json_dict
