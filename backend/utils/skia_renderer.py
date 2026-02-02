import skia
import subprocess
import numpy as np
import logging
import json
import shlex

logger = logging.getLogger(__name__)

class VideoTextRenderer:
    def __init__(self, input_path: str, output_path: str, subtitles: list):
        """
        Initialize the renderer.
        
        Args:
            input_path: Path to input video.
            output_path: Path to save output video.
            subtitles: List of subtitle dictionaries with style info.
        """
        self.input_path = input_path
        self.output_path = output_path
        self.subtitles = subtitles
        self.width = 0
        self.height = 0
        self.fps = 30.0

    def get_video_info(self):
        """Get video dimensions and FPS using ffprobe."""
        cmd = [
            "ffprobe",
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height,r_frame_rate",
            "-of", "json",
            self.input_path
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            info = json.loads(result.stdout)
            stream = info["streams"][0]
            self.width = int(stream["width"])
            self.height = int(stream["height"])
            
            # Handle frame rate usually '30/1' or '24000/1001'
            if "/" in stream["r_frame_rate"]:
                num, den = map(int, stream["r_frame_rate"].split("/"))
                self.fps = num / den
            else:
                self.fps = float(stream["r_frame_rate"])
                
            logger.info(f"Video Info: {self.width}x{self.height} @ {self.fps}fps")
        except Exception as e:
            logger.error(f"Error getting video info: {e}")
            raise

    def hex_to_color(self, hex_str, opacity=255):
        """Convert hex string (e.g. '#FF0000') to skia.Color."""
        if hex_str.startswith("#"):
            hex_str = hex_str[1:]
        r = int(hex_str[0:2], 16)
        g = int(hex_str[2:4], 16)
        b = int(hex_str[4:6], 16)
        return skia.Color(r, g, b, int(opacity))

    def render(self):
        """Render the video with subtitles."""
        self.get_video_info()
        
        # Decoder command: Read raw video
        decoder_cmd = [
            "ffmpeg",
            "-i", self.input_path,
            "-f", "image2pipe",
            "-pix_fmt", "bgra", # Use BGRA for compatibility with Skia default
            "-vcodec", "rawvideo",
            "-"
        ]
        
        # Encoder command: Write raw video
        encoder_cmd = [
            "ffmpeg",
            "-y",
            "-f", "rawvideo",
            "-vcodec", "rawvideo",
            "-s", f"{self.width}x{self.height}",
            "-pix_fmt", "bgra",
            "-r", str(self.fps),
            "-i", "-",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            "-crf", "23",
            "-c:a", "copy", # We need to map audio from original input, see below
             # Note: Simple pipe doesn't bring audio automatically for complex filters,
             # but for direct pipe-to-pipe, we might lose audio if we don't map it from source file.
             # However, pipe input to encoder considers standard input as source 0.
             # We need to map audio from the ORIGINAL file.
            "-map", "0:v", # Map video from stdin (index 0)
            "-map", "1:a?", # Map audio from original file (will be index 1 provided as input)
            self.output_path
        ]
        
        # We need to pass the original file as a second input to the encoder for audio mapping
        encoder_cmd = [
            "ffmpeg",
            "-y",
            "-f", "rawvideo",
            "-vcodec", "rawvideo",
            "-s", f"{self.width}x{self.height}",
            "-pix_fmt", "bgra",
            "-r", str(self.fps),
            "-i", "-",             # Input 0: Raw video from stdin
            "-i", self.input_path, # Input 1: Original file (for audio)
            "-map", "0:v",         # Take video from Input 0
            "-map", "1:a?",        # Take audio from Input 1 (if exists)
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            "-crf", "23",
            "-c:a", "aac",         # Re-encode audio to aac to be safe, or copy
            self.output_path
        ]

        logger.info(f"Starting decoding: {' '.join(decoder_cmd)}")
        decoder = subprocess.Popen(decoder_cmd, stdout=subprocess.PIPE, bufsize=10**7)
        
        logger.info(f"Starting encoding: {' '.join(encoder_cmd)}")
        encoder = subprocess.Popen(encoder_cmd, stdin=subprocess.PIPE, bufsize=10**7)

        frame_size = self.width * self.height * 4 # BGRA = 4 bytes per pixel
        frame_idx = 0
        
        try:
            while True:
                raw_frame = decoder.stdout.read(frame_size)
                if not raw_frame or len(raw_frame) != frame_size:
                    break

                # Create Skia surface from raw bytes
                # Note: creating Image from bytes directly is efficient
                array = np.frombuffer(raw_frame, dtype=np.uint8).reshape((self.height, self.width, 4))
                
                # Make a mutable copy for Skia to draw on? 
                # Or create a surface and draw the image onto it. 
                # Better: Create a Surface, draw the frame, then draw text.
                
                surface = skia.Surface(self.width, self.height)
                with surface as canvas:
                    # Draw video frame
                    params = skia.ImageInfo.Make(
                        self.width, self.height, 
                        skia.ColorType.kBGRA_8888_ColorType, 
                        skia.AlphaType.kUnpremul_AlphaType
                    )
                    image = skia.Image.MakeRasterData(
                        params, 
                        skia.Data.MakeWithoutCopy(raw_frame), 
                        self.width * 4
                    )
                    canvas.drawImage(image, 0, 0)
                    
                    # Calculate current time
                    current_time = frame_idx / self.fps
                    
                    # Draw Subtitles
                    self.draw_subtitles(canvas, current_time)

                # Get the modified frame as bytes
                # readPixels returns bytes
                image = surface.makeImageSnapshot()
                # To read pixels back, we can use peekPixels() or similar, 
                # but making a snapshot and converting to bytes is easier.
                # However, for performance, readPixels directly from surface is better.
                
                # Using tobytes() from numpy array if we could modify it in place would be great,
                # but Skia Python structure suggests using snapshots.
                # Let's try writing bytes directly.
                
                # Optimized:
                # 1. Create bitmap/pixmap from the numpy array (shared memory if possible)
                # 2. Draw on it
                # 3. Write it out
                # For now, let's stick to the surface.makeImageSnapshot() -> tobytes pathway for safety.
                
                snapshot_image = surface.makeImageSnapshot()
                # Skia image supports buffer protocol if valid
                snapshot = np.array(snapshot_image, copy=False).tobytes()
                encoder.stdin.write(snapshot)
                frame_idx += 1
                
        except Exception as e:
            logger.error(f"Error during render loop: {e}")
            raise
        finally:
            decoder.stdout.close()
            encoder.stdin.close()
            decoder.wait()
            encoder.wait()
            logger.info("Render finished.")

    def draw_subtitles(self, canvas, current_time):
        """Draw active subtitles on the canvas."""
        for sub in self.subtitles:
            start = sub.get("start", 0)
            end = sub.get("end", 0)
            
            if start <= current_time <= end:
                text = sub.get("text", "")
                style = sub.get("style", {})
                
                # Defaults
                font_size = style.get("fontSize", 60)
                font_family = style.get("fontFamily", "Arial")
                
                # Basic Font setup
                font = skia.Font(skia.Typeface(font_family), font_size)

                # Text Wrapping Logic
                max_width = self.width * 0.9 # Use 90% of screen width
                text_width = font.measureText(text)
                
                lines = []
                if text_width > max_width:
                    # Simple word wrap
                    words = text.split()
                    current_line = []
                    current_width = 0
                    
                    for word in words:
                        word_width = font.measureText(word + " ")
                        if current_width + word_width <= max_width:
                            current_line.append(word)
                            current_width += word_width
                        else:
                            lines.append(" ".join(current_line))
                            current_line = [word]
                            current_width = word_width
                    if current_line:
                        lines.append(" ".join(current_line))
                else:
                    lines = [text]

                # Calculate simple animation opacity/scale if needed
                # (Simple fade in/out for now)
                progress = (current_time - start) / (end - start) if (end - start) > 0 else 0
                
                # Example: Pop in effect
                scale = 1.0
                if progress < 0.1:
                    scale = progress * 10 
                elif progress > 0.9:
                    scale = (1.0 - progress) * 10
                
                # Coordinates (default bottom center)
                y_base = self.height * 0.9
                
                # Override with position if provided
                pos = style.get("position", {})
                if pos:
                    y_base = pos.get("y", 0.9) * self.height
                    
                # Calculate total block height to center vertically around y_base? Or just stack up/down.
                # Let's stack upwards from y_base
                line_height = font_size * 1.2
                total_height = len(lines) * line_height
                
                # Save canvas state for transformations
                canvas.save()
                
                # Iterate each line
                for i, line in enumerate(reversed(lines)): # Draw from bottom up
                     line_w = font.measureText(line)
                     x = (self.width - line_w) / 2
                     
                     if pos:
                         x = pos.get("x", 0.5) * self.width - (line_w / 2)
                     
                     y = y_base - (i * line_height)

                     # Apply scaling around center of text (Apply to block or line? Line for now)
                     if scale != 1.0:
                        center_x = x + line_w / 2
                        center_y = y - font_size / 2 
                        canvas.translate(center_x, center_y)
                        canvas.scale(scale, scale)
                        canvas.translate(-center_x, -center_y)

                     # Shadow / Outline (Stroke)
                     paint = skia.Paint()
                     paint.setAntiAlias(True)
                     
                     # Parse Color
                     color_def = style.get("color", "#FFFFFF")
                     if isinstance(color_def, dict):
                         color_hex = color_def.get("start", "#FFFFFF")
                     else:
                        color_hex = color_def

                     # Draw Outline first
                     paint.setStyle(skia.Paint.kStroke_Style)
                     paint.setStrokeWidth(4)
                     paint.setColor(skia.Color(0, 0, 0, 255)) # Black outline
                     canvas.drawString(line, x, y, font, paint)
                     
                     # Draw Fill
                     paint.setStyle(skia.Paint.kFill_Style)
                     paint.setColor(self.hex_to_color(color_hex))
                     canvas.drawString(line, x, y, font, paint)
                
                # Restore
                canvas.restore()
