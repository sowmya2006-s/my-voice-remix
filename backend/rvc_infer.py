"""
RVC Inference Script
This is a simplified wrapper for RVC voice conversion.
For production, integrate with the full RVC-Project.
"""

import argparse
import os
import shutil

def main():
    parser = argparse.ArgumentParser(description="RVC Voice Conversion")
    parser.add_argument("--input", required=True, help="Input audio file")
    parser.add_argument("--output", required=True, help="Output audio file")
    parser.add_argument("--voice", required=True, help="Voice model/sample file")
    parser.add_argument("--pitch", type=int, default=0, help="Pitch shift in semitones")
    
    args = parser.parse_args()
    
    # Check if RVC is properly installed
    try:
        from rvc.infer import infer_audio
        
        # Run actual RVC inference
        result = infer_audio(
            input_path=args.input,
            output_path=args.output,
            model_path=args.voice,
            pitch_shift=args.pitch
        )
        
        if result:
            print(f"Successfully converted: {args.output}")
        else:
            raise Exception("RVC inference returned no result")
            
    except ImportError:
        print("RVC not fully installed. Using passthrough mode.")
        print("To enable real voice conversion, install RVC-Project:")
        print("  git clone https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI.git")
        
        # Fallback: copy input to output (for testing without RVC)
        shutil.copy(args.input, args.output)
        print(f"Copied input to output: {args.output}")
        
    except Exception as e:
        print(f"RVC Error: {e}")
        # Fallback
        shutil.copy(args.input, args.output)

if __name__ == "__main__":
    main()
