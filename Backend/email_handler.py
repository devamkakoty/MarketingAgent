from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from utils import access_secret_version
# Gmail API setup
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_gmail_service():
    creds = Credentials.from_authorized_user_file('client_secret_490882006281-4qdtqntoskf91chl5ab5hr03ifalibtb.apps.googleusercontent.com.json', SCOPES)
    print(creds)
    return build('gmail', 'v1', credentials=creds)
