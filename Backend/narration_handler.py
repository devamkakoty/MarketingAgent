# from elevenlabs import ElevenLabs, save
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from utils import access_secret_version
from io import BytesIO
import time
# Initialize ElevenLabs client
# api_key = "sk_bc5cd4cb7d094150c06d60852b5aca515d9f4262d67a7df3"
client = ElevenLabs(api_key=access_secret_version("elevenlabs_api_key"))

def synthesize_narration_speech(narration_list):
    # Generate speech for each narration segment and save as audio files
    audio_buffers = []
    for i, text in enumerate(narration_list):
        try:
            audio_response = client.text_to_speech.convert(
            voice_id="pNInz6obpgDQGcFmaJgB",  # Adam pre-made voice
            optimize_streaming_latency="0",
            output_format="mp3_22050_32",
            text=text,
            model_id="eleven_turbo_v2",  # use the turbo model for low latency, for other languages use the `eleven_multilingual_v2`
            voice_settings=VoiceSettings(
                stability=0.0,
                similarity_boost=1.0,
                style=0.0,
                use_speaker_boost=True,
            ),)
        # audio_file = f"audio/narration_{i}.mp3"
        # with open(audio_file, "wb") as f:
        #     for chunk in audio_response:
        #         if chunk:
        #             f.write(chunk)
        # save(audio, audio_file)

        # Create a BytesIO buffer to store the audio data
        # Create a BytesIO buffer to store the audio data
            audio_buffer = BytesIO()
            for chunk in audio_response:
                if chunk:
                    audio_buffer.write(chunk)
            
            # Reset the buffer position to the beginning
            audio_buffer.seek(0)
            
            audio_buffers.append(audio_buffer)
            print(f"Created in-memory audio buffer for narration segment {i+1}")
            
            # Add a small delay to avoid rate limiting
            time.sleep(0.5)
        except Exception as e:
            print(f"Error generating audio for narration segment {i+1}: {e}")
        #audio_files.append(audio_file)
    
    print(f"Finished generating {len(audio_buffers)} audio segments")
    return audio_buffers