import skia
import subprocess
import numpy as np
import logging
import json

from schemas.burn import Style

logger = logging.getLogger(__name__)


class VideoTextRenderer:
    def __init__(self, input_url:str, upload_url:str, style:Style,subtitles:list,output_path:str):
        self.input_url = input_url
        self.upload_url = upload_url
        self.output_path = output_path
        self.style = style
        self.subtitles = subtitles
        self.width = 0
        self.height = 0
        self.fps = 30.0

    def get_video_info(self):
        
        cmd = [
            "ffprobe",
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height,r_frame_rate",
            "-of", "json",
            self.input_url
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            info = json.loads(result.stdout)
            stream = info["streams"][0]
            self.width = int(stream["width"])
            self.height = int(stream["height"])

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
            "-i", self.input_url,
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
            "-i", self.input_url, # Input 1: Original file (for audio)
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
                    self.draw_subtitles(canvas, current_time,self.style)

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


    def draw_subtitles(self, canvas, current_time, style: dict):
        """Draw active subtitles on the canvas with progressive highlighting."""
        global_font_size = style.get("font_size")
        global_font_family = style.get("font_family")
        global_font_color = style.get("font_color")
        global_position = style.get("font_position")
        
        for sub in self.subtitles:
            start = sub.get("start", 0)
            end = sub.get("end", 0)

            if start <= current_time <= end:
                text = sub.get("text", "")
                
                # --- APPLY LOCAL STYLE IF AVAILABLE ---
                local_style = sub.get("style", {})
                if local_style:
                     font_size = local_style.get("font_size", global_font_size)
                     font_family = local_style.get("font_family", global_font_family)
                     font_color = local_style.get("font_color", global_font_color)
                     font_style = local_style.get("font_style", "normal") # glow, neon, pop
                     font_position = local_style.get("position", global_position)
                else:
                     font_size = global_font_size
                     font_family = global_font_family
                     font_color = global_font_color
                     font_style = "normal"
                     font_position = global_position
                
                # --- ANIMATION CALCULATIONS ---
                scale = 1.0
                if "pop" in font_style.lower():
                    # Simple pop animation: scale up at start of segment
                    elapsed = current_time - start
                    if elapsed < 0.2:
                         scale = 1.0 + (0.5 * (1 - (elapsed/0.2))) # Pop from 1.5x down to 1.0
                
                # 1. Setup basic Font
                try:
                    typeface = skia.Typeface(font_family)
                except:
                    typeface = skia.Typeface("Arial") # Fallback
                
                font = skia.Font(typeface, font_size * scale)
                
                # Get width of a space for manual layout
                space_width = font.measureText(" ")

                # --- PRE-CALCULATION ---
                
                # Split text into words to handle them individually
                words = text.split()
                if not words:
                    continue

                # Measure every word
                word_widths = [font.measureText(w) for w in words]
                
                # Calculate total line width: sum of words + sum of spaces
                total_text_width = sum(word_widths) + (len(words) - 1) * space_width

                # Calculate Global Progress (0.0 to 1.0)
                duration = end - start
                progress = (current_time - start) / duration if duration > 0 else 0

                # --- POSITIONING ---

                # Calculate Starting X (centered by default)
                start_x = (self.width - total_text_width) / 2
                y = self.height * 0.9

                # Override with user position if provided
                if font_position and isinstance(font_position, dict):
                    # Handle both integer coordinates and relative positions if needed
                    # Assuming font_position might be relative (0-1) or absolute? 
                    # The prompt says {[int,int]}, let's assume absolute or we can adapt.
                    # For safety, if values are small (<1), treat as relative.
                    pos_x = font_position.get("x", 0)
                    pos_y = font_position.get("y", 0)
                    
                    if pos_x <= 1 and pos_x > 0: start_x = pos_x * self.width - (total_text_width/2)
                    elif pos_x > 1: start_x = pos_x
                    
                    if pos_y <= 1 and pos_y > 0: y = pos_y * self.height
                    elif pos_y > 1: y = pos_y

                # --- DRAWING LOOP ---

                canvas.save()
                
                # Setup Paint objects
                # Outline Paint
                paint_stroke = skia.Paint()
                paint_stroke.setAntiAlias(True)
                paint_stroke.setStyle(skia.Paint.kStroke_Style)
                paint_stroke.setStrokeWidth(3) # Thicker outline for viral look
                paint_stroke.setColor(skia.Color(0, 0, 0, 255)) # Black outline

                # Active Fill Paint (The Highlight Color)
                paint_active = skia.Paint()
                paint_active.setAntiAlias(True)
                paint_active.setStyle(skia.Paint.kFill_Style)
                paint_active.setColor(self.hex_to_color(font_color)) 
                
                # GLOW EFFECT
                if "glow" in font_style.lower() or "neon" in font_style.lower():
                    paint_active.setImageFilter(skia.ImageFilters.DropShadow(0, 0, 5, 5, self.hex_to_color(font_color)))

                # Inactive Fill Paint (The Unspoken Color)
                paint_inactive = skia.Paint()
                paint_inactive.setAntiAlias(True)
                paint_inactive.setStyle(skia.Paint.kFill_Style)
                paint_inactive.setColor(skia.Color(230, 230, 230, 200)) # Lighter white/grey

                current_x = start_x
                total_chars = len(text)
                chars_processed = 0

                for i, word in enumerate(words):
                    word_width = word_widths[i]

                    # --- LOGIC: Is this word highlighted? ---
                    # We estimate word timing based on character count ratio.
                    word_start_ratio = chars_processed / total_chars
                    
                    # Determine which paint to use
                    if progress >= word_start_ratio:
                        paint_fill = paint_active
                    else:
                        paint_fill = paint_inactive
                        
                    # SHAKE ANIMATION
                    draw_x, draw_y = current_x, y
                    if "shake" in font_style.lower() and progress >= word_start_ratio and progress <= word_start_ratio + 0.1:
                         # Shake only when currently being spoken
                         draw_x += np.random.randint(-2, 3)
                         draw_y += np.random.randint(-2, 3)

                    # Draw Outline
                    canvas.drawString(word, draw_x, draw_y, font, paint_stroke)
                    
                    # Draw Fill
                    canvas.drawString(word, draw_x, draw_y, font, paint_fill)

                    # Advance cursor: move X to the right for the next word
                    current_x += word_width + space_width
                    
                    # Update char counter (word length + 1 space)
                    chars_processed += len(word) + 1

                canvas.restore()