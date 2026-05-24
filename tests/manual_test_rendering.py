import sys
import os

# Add backend to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import skia
from utils.skia_rendering import VideoTextRenderer
from schemas.burn import Style, Position

# Mock Configuration
input_url = "dummy.mp4"
upload_url = "http://google.com"
style = {
    "font_family": "Arial",
    "font_color": "#FFFFFF",
    "font_size": 24,
    "font_weight": 400,
    "font_style": "normal",
    "position": {"x": 0.5, "y": 0.9}
}

# Viral Subtitles Mock
subtitles = [
    {
        "id": "sub-1",
        "start": 0.0,
        "end": 2.0,
        "text": "This is a normal subtitle",
        "style": None
    },
    {
        "id": "sub-2",
        "start": 2.0,
        "end": 4.0,
        "text": "This is a VIRAL subtitle!",
        "style": {
            "font_family": "Arial",
            "font_color": "#FF00FF", # Magenta
            "font_size": 40,
            "font_weight": 700,
            "font_style": "glow",
            "position": {"x": 0.5, "y": 0.5}
        }
    },
     {
        "id": "sub-3",
        "start": 4.0,
        "end": 6.0,
        "text": "I am popping!",
        "style": {
            "font_family": "Arial",
            "font_color": "#FFFF00", 
            "font_size": 30,
            "font_style": "pop"
        }
    }
]

def test_draw():
    print("Initializing VideoTextRenderer...")
    renderer = VideoTextRenderer(input_url, upload_url, style, subtitles, "output.mp4")
    
    # Mock video dimensions
    renderer.width = 1920
    renderer.height = 1080
    
    print("Creating Surface...")
    surface = skia.Surface(1920, 1080)
    
    print("Testing Normal Subtitle...")
    with surface as canvas:
        renderer.draw_subtitles(canvas, 1.0, style)
    print("Normal Subtitle Drawn.")
    
    print("Testing Viral Subtitle (Glow)...")
    with surface as canvas:
        renderer.draw_subtitles(canvas, 3.0, style)
    print("Viral Subtitle (Glow) Drawn.")

    print("Testing Viral Subtitle (Pop)...")
    with surface as canvas:
        renderer.draw_subtitles(canvas, 4.1, style) # Just after start for animation
    print("Viral Subtitle (Pop) Drawn.")
    
    print("Verification Successful!")

if __name__ == "__main__":
    try:
        test_draw()
    except Exception as e:
        print(f"Test Failed: {e}")
        import traceback
        traceback.print_exc()
