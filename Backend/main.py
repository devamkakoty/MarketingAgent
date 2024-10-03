import google.generativeai as genai
from images_handler_gemini import generate_images
from utils import clean_text
from utils import json_to_dict
from utils import access_secret_version
from narration_handler import synthesize_narration_speech
from video_generator import generate_video
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import storage
import firebase_admin
from firebase_admin import credentials, auth, firestore
import functools
import json
import base64
from email.mime.text import MIMEText
from email_handler import get_gmail_service

app = Flask(__name__)
CORS(app)

def upload_to_gcs(video_buffer, bucket_name, blob_name):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    folder_name = "Videos/"
    full_blob_name = folder_name + blob_name
    blob = bucket.blob(full_blob_name)
    blob.upload_from_string(video_buffer.getvalue(), content_type='video/mp4')
    return blob.public_url

def require_auth(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "No token provided"}), 401
        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user = decoded_token
        except Exception as e:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated_function

# Initialize Firebase Admin SDK
firebase_cred_json = access_secret_version("firebase_cred_json")
cred = credentials.Certificate(json.loads(firebase_cred_json))
firebase_admin.initialize_app(cred)

# Configure GenAI
genai.configure(api_key=access_secret_version("gemini_api_key"))

#Initialize the AI model
model = genai.GenerativeModel("gemini-1.5-flash")

# End-point for video ad creation
@app.route('/generate-youtube-ad',methods=['POST'])
@require_auth
def generate_youtube_ad():
    try:
        data = request.json
        response_schema = {
            "Frame Order": "number",
            "Duration": "number",
            "Background_Image_Description":"string",
            "Narration":"string",
        }
        prompt = f""" Write the script to make a You Tube short ad campaign of 30 seconds using the information given in the customer segment information in the JSON Object - {data.get('customerProfile')}.
        
        Use this JSON Schema for response output - {response_schema}. Use double quotes
        Create equal number of images and corresponding narrations.
        Return: list[response_schema]

        Do Not include JSON decorator
        """
        result = model.generate_content(prompt)
        result_text = clean_text(result.text) # clean text output
        result_dict = json_to_dict(result_text) # convert to dict values

        img_descriptions = [] #list storing image descriptions
        narration = [] #list storing narration data

    
        for data in result_dict:
            img_descriptions.append(data["Background_Image_Description"])
            narration.append(data["Narration"])
        

        # Generate images
        print("Generating images ....")
        image_buffers = generate_images(img_descriptions)

        # Generate narration
        print("Generating narrations...")
        audio_buffers = synthesize_narration_speech(narration)

        # Create video
        print("Generating video...")
        video_buffer = generate_video(image_buffers,audio_buffers)

        # Upload video to Google Cloud Storage
        bucket_name = 'content-creator-2'
        blob_name = 'Yt_video.mp4'
        video_url = upload_to_gcs(video_buffer, bucket_name, blob_name)

        return jsonify({
            'status': 'success',
            'videoUrl': video_url
        }), 200
    except Exception as e:
        return jsonify({
            'status':'error',
            'message':str(e)
        }),500

# Route to call meta ad creation function
@app.route('/generate-meta-ad',methods=['POST'])
@require_auth
def generate_meta_ad():
    """
    This function generates a Meta ad
    """
    try:
        data = request.json
        response_schema = {
            "Ad Content":"string",
            "Ad Image Description":"string"
        }
        prompt = f""" Write a facebook ad content targetting the users described by the information given in the customer 
        segment in the JSON Object - {data.get('customerProfile')}.
        
        Use this JSON Schema for response output - {response_schema}. 
        Use double quotes
        Return: response_schema

        Do Not include JSON decorator
        """
        result = model.generate_content(prompt)
        result_text = clean_text(result.text) # clean text output
        result_dict = json_to_dict(result_text) # convert to dict values

        # Generate image
        print("Generating image ....")
        image_buffer = generate_images([result_dict["Ad Image Description"]])
        image_base64 = base64.b64encode(image_buffer[0].getvalue()).decode('utf-8')


        return jsonify({
            'status': 'success',
            'imageUrl':image_base64,
            'caption':result_dict["Ad Content"]
        }), 200
    except Exception as e:
        return jsonify({
            'status':'error',
            'message':str(e)
        }),500

# Route to call instagram ad creation function
@app.route('/generate-instagram-ad',methods=['POST'])
@require_auth
def generate_instagram_ad():
    """
    This function generates an Instagram ad
    """
    try:
        data = request.json
        response_schema = {
            "Ad Content":"string",
            "Ad Image Description":"string"
        }
        prompt = f""" Write an instagram ad content targetting the users described by the information given in the customer 
        segment in the JSON Object - {data.get('customerProfile')}.
        
        Use this JSON Schema for response output - {response_schema}. 
        Use double quotes
        Return: response_schema

        Do Not include JSON decorator
        """
        result = model.generate_content(prompt)
        result_text = clean_text(result.text) # clean text output
        result_dict = json_to_dict(result_text) # convert to dict values

        # Generate image
        print("Generating image ....")
        image_buffer = generate_images([result_dict["Ad Image Description"]])
        image_base64 = base64.b64encode(image_buffer[0].getvalue()).decode('utf-8')


        return jsonify({
            'status': 'success',
            'imageUrl':image_base64,
            'caption':result_dict["Ad Content"]
        }), 200
    except Exception as e:
        return jsonify({
            'status':'error',
            'message':str(e)
        }),500

# Route to call email creation function
@app.route('/generate-email',methods=['POST'])
@require_auth
def generate_email():
    """
    This function generates an Email
    """
    try:
        data = request.json
        response_schema = {
            "Email Subject":"string",
            "Email Body":"string"
        }
        prompt = f""" Write an appropriate email subject and body marketing content targetting the users described by the information given in the customer 
        segment in the JSON Object - {data.get('customerProfile')} Use HTML for markup and follow the deign guidelines stated in {data.get('designGuidelines')}.
        
        Use this JSON Schema for response output - {response_schema}. 
        Use double quotes
        Return: response_schema

        Do Not include JSON decorator
        """
        result = model.generate_content(prompt)
        result_text = clean_text(result.text) # clean text output
        result_dict = json_to_dict(result_text) # convert to dict values

        return jsonify({
            'status': 'success',
            'emailSubject': result_dict["Email Subject"],
            'emailBody':result_dict["Email Body"]
        }), 200
    except Exception as e:
        return jsonify({
            'status':'error',
            'message':str(e)
        }),500
    
# Send an email
@app.route('/send-email', methods=['POST'])
@require_auth
def send_email():
    try:
        # User is already authenticated by the decorator
        # user = request.user
        # recipient_email = user.get('email')
        # print(recipient_email)
        # if not recipient_email:
        #     return jsonify({'error': 'User email not found'}), 400
        recipient_email = 'avhijtnair@gmail.com'

        # Get email content from request
        try:
            data = request.get_json(force=True)
        except json.JSONDecodeError as e:
            return jsonify({'error': f'Invalid JSON: {str(e)}'}), 400

        email_body = data.get('email_body')
        email_subject = data.get('email_subject')

        if not email_body or not email_subject:
            return jsonify({'error': 'Missing email body or subject'}), 400

        # Create the email message
        message = MIMEText(email_body, 'html')
        message['To'] = recipient_email
        message['Subject'] = email_subject
        message['From'] = recipient_email
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')

        # Send the email using Gmail API
        service = get_gmail_service()
        send_message = service.users().messages().send(userId='me', body={'raw': raw_message}).execute()

        return jsonify({'message': 'Email sent successfully', 'messageId': send_message['id']}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Get segment data from firestore
@app.route('/get-customer-segment-profiles',methods=['GET'])
@require_auth
def get_customer_segment_data():
    """
    This function pulls all segmented data from Firestore
    """
    try:
        db = firestore.client()
        docs = db.collection('segmentProfiles').get()
        segmented_data = [doc.to_dict() for doc in docs]
        return jsonify({
            'status': 'success',
            'segmentedData': segmented_data
        }), 200
    except Exception as e:
        return jsonify({
            'status':'error',
            'message':str(e)
        }),500

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080)
