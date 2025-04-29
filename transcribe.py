from vosk import Model, KaldiRecognizer
import wave
import sys
import json

def format_time(seconds):
    """Formateer tijd in het juiste formaat voor VTT."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = seconds % 60
    milliseconds = int((seconds % 1) * 1000)
    return f"{hours:02}:{minutes:02}:{int(seconds):02}.{milliseconds:03}"

def split_text_by_word_limit(text, limit=10):
    """Splits tekst in chunks van maximaal 10 woorden."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), limit):
        chunks.append(" ".join(words[i:i + limit]))
    return chunks

def transcribe(audio_path):
    model_path = "C:/xampp/htdocs/project/models/en"  
    model = Model(model_path)

    try:
        wf = wave.open(audio_path, "rb")
    except FileNotFoundError:
        print("Bestand niet gevonden!")
        return
    except wave.Error as e:
        print(f"Fout bij het lezen van het audiobestand: {str(e)}")
        return

    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)

    transcript = ""
    last_end_time = None

    while True:
        data = wf.readframes(1000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result_json = json.loads(rec.Result())
            if 'result' in result_json:
                words = result_json['result']
                if words:
                    start_time = format_time(words[0]['start'])
                    end_time = format_time(words[-1]['end'])
                    text = result_json['text']

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

    final_result = json.loads(rec.FinalResult())
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

    wf.close()
    print(transcript)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Gebruik: python transcribe.py <pad_naar_audiobestand>")
    else:
        audio_path = sys.argv[1]
        transcribe(audio_path)
