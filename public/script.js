const socket = io('http://localhost:3000');
const uploadForm = document.getElementById('uploadForm');
const uploadLinkForm = document.getElementById('uploadLinkForm');
const transcriptionDisplay = document.getElementById('transcription');
const transcriptionMSG = document.getElementById('transcriptionMSG');
const progressBar = document.getElementById('progressBar');
const triggerEventButton = document.getElementById('triggerEventButton');
const downloadButton = document.getElementById('downloadButton');
const translateButton = document.getElementById('translateButton');
const languageSelect = document.getElementById('languageSelect');
const videoSelect = document.getElementById('videoSelect');
const uploadButton = document.getElementById('uploadButton');
const submitButton = document.getElementById('submitButton');
const submitButton2 = document.getElementById('submitButton2');
const videoUpload = document.getElementById('videoUpload');
const scriptOphalen = document.getElementById('scriptOphalen');

let transcriptionStarted = false;

uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(uploadForm);
    transcriptionMSG.textContent = "Bestand uploaden...";
    triggerEventButton.style.display = 'none'; 

    try {
        const transcribeResponse = await fetch('/transcribe', {
            method: 'POST',
            body: formData,
        });

        if (!transcribeResponse.ok) throw new Error('Probleem met de server (transcribe).');

        const transcribeData = await transcribeResponse?.json();
        transcriptionDisplay.textContent = `${transcribeData.transcript}`;
        transcriptionStarted = true; 
        downloadButton.style.display = 'block'; 
        languageSelect.style.display = 'block'; 
        videoSelect.style.display = 'block'; 
        translateButton.style.display = 'block';
        uploadButton.style.display = 'block';
        scriptOphalen.style.display = 'block';

        transcriptionMSG.textContent = "Transcriptie voltooid!";
        fetch('http://localhost:3000/talen')
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('languageSelect');
                data.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.afkorting;
                option.textContent = lang.naam;
                option.title = lang.afkorting;

                if (lang.naam === "DUTCH") {
                    option.selected = true;
                }

                select.appendChild(option);
                });
            })
            .catch(error => console.error('Fout bij ophalen talen:', error));

    } catch (error) {
        console.error(error);
        transcriptionMSG.textContent = `Fout: ${error.message}`;
        transcriptionStarted = false; 
        triggerEventButton.style.display = 'block'; 
    }
});

uploadLinkForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    transcriptionMSG.textContent = "Bestand uploaden...";
    triggerEventButton.style.display = 'none'; 

    const videoUrl = document.getElementById('videoUrl').value;
    console.log('dfsaffs'+videoUrl);

    try {
        const transcribeResponse2 = await fetch('/transcribe/link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoUrl })
        });

        if (!transcribeResponse2.ok) throw new Error('Probleem met de server (transcribe).');

        const transcribeData = await transcribeResponse2.json();
        transcriptionDisplay.textContent = `${transcribeData.transcript}`;
        transcriptionStarted = true; 
        downloadButton.style.display = 'block'; 
        languageSelect.style.display = 'block'; 
        videoSelect.style.display = 'block'; 
        translateButton.style.display = 'block';
        uploadButton.style.display = 'block';
        scriptOphalen.style.display = 'block';

        transcriptionMSG.textContent = "Transcriptie voltooid!";
        fetch('http://localhost:3000/talen')
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('languageSelect');
                data.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.afkorting;
                option.textContent = lang.naam;
                option.title = lang.afkorting;

                if (lang.naam === "DUTCH") {
                    option.selected = true;
                }

                select.appendChild(option);
                });
            })
            .catch(error => console.error('Fout bij ophalen talen:', error));

    } catch (error) {
        console.error(error);
        transcriptionMSG.textContent = `Fout: ${error.message}`;
        transcriptionStarted = false; 
        triggerEventButton.style.display = 'block'; 
    }
});

document.querySelector('#scriptOphalen').addEventListener('click', () => {
    const video_id = document.getElementById('videoSelect').value;
    console.log('video:' + video_id);
    transcriptionMSG.textContent = "Transcripties opgehaald!";

    fetch(`http://localhost:3000/transcript/${video_id}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      
      if (Array.isArray(data)) {
        let transcript = data.map(item => 
          `${item.time_stamp_start}\n${item.tekst}\n`
        ).join('');
        transcriptionDisplay.textContent = transcript;
      } else {
        transcriptionDisplay.textContent = 'Unexpected data format.';
      }
    })
    .catch(error => {
      console.error('Error during fetch:', error);
      transcriptionDisplay.textContent = 'An error occurred while fetching the transcript.';
    });  
});

document.querySelector('#editOphalen').addEventListener('click', () => {
    const video_id = document.getElementById('videoSelectChange').value;
    const taal = document.getElementById('languageSelectChange').value;
    transcriptionMSG.textContent = "Transcripties opgehaald!";
    
    const container = document.createElement("div"); 

    fetch(`http://localhost:3000/transcript/${video_id}/${taal}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
            data.forEach(item => {
                const row = document.createElement("div"); 
                row.style.display = "flex"; 

                const tekstInput = document.createElement("input");
                tekstInput.value = item.tekst;
                tekstInput.type = 'text';
                tekstInput.name = 'tekst[]';
                tekstInput.dataset.id = item.id;
                row.appendChild(tekstInput); 

                const timeInput = document.createElement("input");
                timeInput.value = item.time_stamp_start;
                timeInput.type = 'text';
                timeInput.name = 'timeStampStart[]';
                timeInput.dataset.id = item.id;
                row.appendChild(timeInput);  

                const idInput = document.createElement("input");
                idInput.type = 'hidden';
                idInput.name = 'id[]'; 
                idInput.value = item.id;
                row.appendChild(idInput);
                container.appendChild(row); 
            });
    
        document.getElementById("change").appendChild(container);
        submitButton2.style.display = 'block';    
      } else {
        transcriptionDisplay.textContent = 'Unexpected data format.';
      }
    })
    .catch(error => {
      console.error('Error during fetch:', error);
      transcriptionDisplay.textContent = 'An error occurred while fetching the transcript.';
    });  
});
  
videoUpload.addEventListener('click', async (event) => {
    event.preventDefault();
    // const formData = new FormData(uploadForm);

    // const audioFile = formData.get('audio');
    const audioFile = document.getElementById('audio');
    // const filename = audioFile.files.name;
    // const source = audioFile ? audioFile.value : document.getElementById('videoUrl').value;    
    const source = audioFile && audioFile.value ? audioFile.value : document.getElementById('videoUrl').value;

    const naam = document.getElementById('video_naam').value;

    console.log(document.getElementById('videoUrl').value);
    console.log(audioFile);
    console.log(source);
    console.log(naam);

    try {
        const videoData = {
            // naam: formData.get('naam'),
            naam: naam,
            // file_name: formData.get('audio').name
            file_name: source
        };

        const videoResponse = await fetch('/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(videoData),
        });

        if (!videoResponse.ok) throw new Error('Probleem met de server (video).');

        // const videoResult = await videoResponse.json();
        transcriptionMSG.textContent = "Video geupload";

        fetch('http://localhost:3000/videos')
            .then(response => response.json())
            .then(data => {
            const select = document.getElementById('videoSelect');
            data.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.id;
                option.textContent = lang.naam;
                option.title = lang.file_name;
                select.appendChild(option);
            });
            })
            .catch(error => console.error('Fout bij ophalen talen:', error));

    } catch (error) {
        console.error(error);
        transcriptionMSG.textContent = `Fout: ${error.message}`;
    }
});

triggerEventButton.addEventListener('click', () => {
    if (!transcriptionStarted) {
        console.log('Triggering transcription manually');
        socket.emit('start_transcription', 'uploads/uploadForm');
        transcriptionMSG.textContent = 'Manueel starten van transcriptie...';
        triggerEventButton.style.display = 'none'; 
    }
});

downloadButton.addEventListener('click', () => {
    const translated = downloadButton.dataset.translated;
    const text = translated || transcriptionDisplay.textContent;
    const blob = new Blob(["WEBVTT\n\n", text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    transcriptionMSG.textContent = "Transcriptie gedownload!";
    a.href = url;
    a.download = 'transcriptie.vtt';
    a.click();
    URL.revokeObjectURL(url);
});

function restoreFormatting(translatedText) {
    let formattedText = translatedText.replace(/\b(\d{2}): (\d{2}): (\d{2}\.\d{3})\b/g, "$1:$2:$3");

    formattedText = formattedText.replace(/ -> /g, " --> ");

    return formattedText;
}

translateButton.addEventListener('click', async () => {
    const text = transcriptionDisplay.textContent;
    const to = document.getElementById('languageSelect').value;
    transcriptionMSG.textContent = "Transcriptie vertalen!";

    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, to })
        });

        if (!response.ok) throw new Error('Probleem met de server.');

        const data = await response.json();
        
        const correctedText = restoreFormatting(data.translatedText);
        transcriptionMSG.textContent = "Transcriptie vertaald!";

        transcriptionDisplay.textContent = correctedText;
        downloadButton.dataset.translated = correctedText;
    } catch (error) {
        console.error(error);
        transcriptionMSG.textContent = `Fout: ${error.message}`;
    }
});

uploadButton.addEventListener('click', async () => {
    const lines = transcriptionDisplay.textContent.split('\n');
    let start = '';
    let text = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        transcriptionMSG.textContent = "Transcriptie geupload!";
        
        if (line.includes('-->')) {
            const [startTime] = line.split('\n');
            start = startTime.trim(); 
        } else if (line) {
            text = line; 

            const taal_afkorting = document.getElementById('languageSelect').value;
            const video_id = document.getElementById('videoSelect').value;

            const transcrip = {
                tekst: text,
                video_id: video_id,
                time_stamp_start: start,
                taal: taal_afkorting
            };

            try {
                const transcriptSubmit = await fetch('/transcript-submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transcrip),
                });

                if (!transcriptSubmit.ok) throw new Error('Probleem met de server (video).');

            } catch (error) {
                console.error('Fout:', error);
            }
        }
    }
});

socket.on('progress', (data) => {
    progressBar.style.width = `${data.percentage}%`;
    // transcriptionDisplay.textContent = data.message;
});

socket.on('error', (error) => {
    transcriptionMSG.textContent = `Fout: ${error.message}`;
});

socket.on('connect', () => {
    console.log('Verbonden met Socket.IO-server');
});
