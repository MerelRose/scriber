# Importeer de benodigde modules
import whisper  # OpenAI's Whisper-model voor spraakherkenning
import sys      # Voor toegang tot command-line argumenten
import os       # Voor bestandscontrole
import json
from flask import jsonify

# Functie om seconden om te zetten naar het formaat HH:MM:SS.mmm
def format_time(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = seconds % 60
    milliseconds = int((seconds % 1) * 1000)
    return f"{hours:02}:{minutes:02}:{int(seconds):02}.{milliseconds:03}"

# Functie om tekst op te splitsen in stukken van maximaal 'limit' woorden
def split_text_by_word_limit(text, limit=10):
    words = text.split()
    chunks = []
    for i in range(0, len(words), limit):
        chunks.append(" ".join(words[i:i + limit]))
    return chunks

def transcribe(audio_path):
    model = whisper.load_model("base")
    result = model.transcribe(audio_path, word_timestamps=True)
    
    output = []
    segments = result.get("segments", [])

    for segment in segments:
        start_raw = segment["start"]
        end_raw = segment["end"]
        duration = end_raw - start_raw

        start = format_time(segment["start"])
        end = format_time(segment["end"])
        text = segment["text"].strip()
        chunks = split_text_by_word_limit(text, 10)

        for chunk in chunks:
            output.append({
                "start": start,
                "end": end,
                "duration": duration,
                "chunk": chunk
            })

    return {"segments": output}

# Controleer script correct wordt aangeroepen via command-line
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Gebruik: python transcribe_whisper.py <pad_naar_audio>")
    else:
        audio_path = sys.argv[1]
        if not os.path.exists(audio_path):
            print("Bestand niet gevonden!")
        else:
            result = transcribe(audio_path)
            print(json.dumps({"segments": result}, ensure_ascii=False))