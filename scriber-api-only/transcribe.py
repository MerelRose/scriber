# Importeer de Vosk-bibliotheek voor spraakherkenning
from vosk import Model, KaldiRecognizer
import wave  # Importeer de wave-module om audiobestanden te verwerken
import sys   # Importeer de sys-module om command-line argumenten te gebruiken
import json  # Importeer de json-module om resultaten te verwerken

def format_time(seconds):
    """Formateer tijd in het juiste VTT-formaat (uur:minuut:seconde.milliseconden)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = seconds % 60
    milliseconds = int((seconds % 1) * 1000)
    return f"{hours:02}:{minutes:02}:{int(seconds):02}.{milliseconds:03}"

def split_text_by_word_limit(text, limit=10):
    """Splits de transcriptie in stukken van maximaal 10 woorden."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), limit):
        chunks.append(" ".join(words[i:i + limit]))
    return chunks

def transcribe(audio_path):
    """Voert spraakherkenning uit op een audiobestand en genereert een transcriptie met tijdcodes."""
    model_path = "C:/xampp/htdocs/project/models/en"  # Pad naar het Vosk-model voor spraakherkenning
    model = Model(model_path)  # Laad het spraakmodel

    try:
        wf = wave.open(audio_path, "rb")  # Open het audiobestand in leesmodus
    except FileNotFoundError:
        print("Bestand niet gevonden!")  # Foutmelding als het bestand niet bestaat
        return
    except wave.Error as e:
        print(f"Fout bij het lezen van het audiobestand: {str(e)}")  # Foutmelding bij een onjuist audiobestand
        return

    rec = KaldiRecognizer(model, wf.getframerate())  # Initialiseer de spraakherkenner met de juiste sample rate
    rec.SetWords(True)  # Zorg ervoor dat woorden en hun tijdcodes worden opgenomen in het resultaat

    transcript = ""  # Houdt de uiteindelijke transcriptie bij
    last_end_time = None  # Houdt de eindtijd van het vorige blok tekst bij

    while True:
        data = wf.readframes(1000)  # Lees 1000 audiobits tegelijk
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):  # Verwerk het geluid en check of de herkenning succesvol is
            result_json = json.loads(rec.Result())  # Converteer de JSON-uitvoer naar een Python-object
            if 'result' in result_json:
                words = result_json['result']
                if words:
                    start_time = format_time(words[0]['start'])  # Starttijd van het eerste woord
                    end_time = format_time(words[-1]['end'])  # Eindtijd van het laatste woord
                    text = result_json['text']  # Herkende tekst

                    # Splits de tekst in kleinere stukken
                    text_chunks = split_text_by_word_limit(text, 10)
                    for idx, chunk in enumerate(text_chunks):
                        if idx == 0:
                            chunk_start_time = start_time
                        else:
                            chunk_start_time = last_end_time

                        if idx == len(text_chunks) - 1:
                            chunk_end_time = end_time
                        else:
                            chunk_end_time = format_time(words[min((idx + 1) * 10, len(words)) - 1]['end'])

                        # Voeg de transcriptieregel toe aan het eindresultaat
                        transcript += f"{chunk_start_time} --> {chunk_end_time}\n"
                        transcript += f"{chunk}\n"

                        last_end_time = chunk_end_time  # Werk de eindtijd bij

    final_result = json.loads(rec.FinalResult())  # Verwerk de definitieve resultaten na het einde van het audiobestand
    if 'result' in final_result:
        words = final_result['result']
        if words:
            start_time = format_time(words[0]['start'])
            end_time = format_time(words[-1]['end'])
            text = final_result['text']

            text_chunks = split_text_by_word_limit(text, 10)
            for idx, chunk in enumerate(text_chunks):
                if idx == 0:
                    chunk_start_time = start_time
                else:
                    chunk_start_time = last_end_time

                if idx == len(text_chunks) - 1:
                    chunk_end_time = end_time
                else:
                    chunk_end_time = format_time(words[min((idx + 1) * 10, len(words)) - 1]['end'])

                transcript += f"{chunk_start_time} --> {chunk_end_time}\n"
                transcript += f"{chunk}\n"

                last_end_time = chunk_end_time

    wf.close()  # Sluit het audiobestand
    print(transcript)  # Druk de uiteindelijke transcriptie af

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Gebruik: python transcribe.py <pad_naar_audiobestand>")  # Geef een foutmelding bij onjuiste invoer
    else:
        audio_path = sys.argv[1]  # Verkrijg het audiobestandspad van de command-line argumenten
        transcribe(audio_path)  # Voer de transcriptie uit
