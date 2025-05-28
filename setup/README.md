# Scriber

## Installation Backend

### Python and Vosk
First, ensure that Python and pip are up to date. Then, if you have not already installed Whisper and Flask, install Whisper and Flask on Linux/macOS using:

```sh
python -m pip install git+https://github.com/openai/whisper.git
python -m pip install Flask
```

If you encounter installation issues, check the output of the following commands and provide it for reference:

```sh
python3 --version
pip3 --version
pip -v install git+https://github.com/openai/whisper.git
pip -v install Flask
```

### NPM Packages
Install the required Node.js packages:

```sh
npm install node express cors mysql2 socket.io dotenv multer fluent-ffmpeg node-fetch express-rate-limit
```

### Additional Dependencies
Update npm:

```sh
npm update
```

Install and update **yt-dlp**:

```sh
pip install -U yt-dlp
```

## AI stanslater
This AI model is recommended because of its capebilities. If you rather have another model from Ollama you can simply run and pull the model, no need for code changes!:

To run the recommended model install Ollama from their official site: "https://ollama.com", folow their instuctions and pull gemma3

```sh
Ollama pull gemma3:1b
```
NOTE:: this may take a few minutes mattering on your specs.

To run gemma3:

```sh
Ollama run gemma3
```

## Start the Application
Run your project using:

```sh
npm start
```

Enjoy!