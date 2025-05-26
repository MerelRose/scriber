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
pip3 -v install git+https://github.com/openai/whisper.git
or
pip3 -v install Flask
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

## Optional Open-Source API
This API is open-source and may present security risks. Use it at your own discretion:

```sh
git clone https://github.com/ismalzikri/free-translate-api.git
cd free-translate-api
```

To run the open-source translation API, you need to install **Go**. Download Go from [the official website](https://go.dev/doc/install) and follow the instructions. Then, start the API with:

```sh
go run main.go
```

## Start the Application
Run your project using:

```sh
npm start
```

Enjoy!