import io
import os
import tempfile
import numpy as np
from PIL import Image
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips
from contextlib import contextmanager

@contextmanager
def temporary_file(suffix=None):
    """Context manager for creating and cleaning up a temporary file."""
    fd, path = tempfile.mkstemp(suffix=suffix)
    try:
        os.close(fd)
        yield path
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass

def generate_video(image_buffers, audio_buffers):
    video_clips = []
    
    for img_buffer, audio_buffer in zip(image_buffers, audio_buffers):
        # Convert image buffer to numpy array
        img = Image.open(img_buffer)
        img_array = np.array(img)
        
        # Create ImageClip from numpy array
        img_clip = ImageClip(img_array).set_duration(5)
        
        # Create temporary file for audio
        with temporary_file(suffix='.mp3') as temp_audio_path:
            with open(temp_audio_path, 'wb') as temp_audio:
                temp_audio.write(audio_buffer.getvalue())
            
            # Create AudioFileClip from temporary file
            audio_clip = AudioFileClip(temp_audio_path)
            
            # Set audio to image clip
            video_clip = img_clip.set_audio(audio_clip)
            video_clips.append(video_clip)

    # Concatenate all video clips
    final_video = concatenate_videoclips(video_clips)

    # Write video to a buffer
    output_buffer = io.BytesIO()
    with temporary_file(suffix='.mp4') as temp_video_path:
        final_video.write_videofile(
            temp_video_path,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True,
            audio_bitrate='80k',
            fps=24
        )
        with open(temp_video_path, 'rb') as video_file:
            output_buffer.write(video_file.read())
    
    output_buffer.seek(0)
    return output_buffer

# Usage:
# video_buffer = generate_video(image_buffers, audio_buffers)