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
    # Laad het Whisper-model (in dit geval de 'base'-versie)
    model = whisper.load_model("base")

    # Transcribeer het audiobestand en vraag ook om woord-timestamps
    result = model.transcribe(audio_path, word_timestamps=True)

    output = []
    # Haal de segmenten op uit het resultaat (elk segment bevat een stuk tekst met tijdstempels)
    segments = result.get("segments", [])

    for segment in segments:
        # Ruwe start- en eindtijd van het segment in seconden
        start_raw = segment["start"]
        end_raw = segment["end"]
        duration = end_raw - start_raw  # Totale duur van het segment

        # Haal de tekst uit het segment en verwijder eventuele spaties aan het begin/einde
        text = segment["text"].strip()

        # Splits de tekst in kleinere stukken van maximaal 10 woorden
        chunks = split_text_by_word_limit(text, 10)

        # Bereken het totaal aantal woorden in het segment
        total_words = sum(len(chunk.split()) for chunk in chunks)

        # Verdeel het segment in kleinere stukjes met bijbehorende tijdstempels
        current_time = start_raw
        for chunk in chunks:
            word_count = len(chunk.split())
            # Verhoudingsgewijze duur op basis van het aantal woorden
            # chunk_duration = (word_count / total_words) * duration
            chunk_duration = round((word_count / total_words) * duration, 3)


            chunk_start_raw = current_time
            chunk_end_raw = chunk_start_raw + chunk_duration
            duration_raw = chunk_duration

            output.append({
                "start": format_time(chunk_start_raw),
                "end": format_time(chunk_end_raw),
                "duration": duration_raw,
                "chunk": chunk
            })

            current_time = chunk_end_raw  # Volgende chunk begint waar de vorige eindigde
            
    # Geef de uiteindelijke lijst van gesegmenteerde transcripties terug
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