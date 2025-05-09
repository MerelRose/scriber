# Scriber

## Installation

### Python and Vosk
First, ensure that Python and pip are up to date. Then, install Vosk on Linux/macOS using pip:

```sh
pip3 install vosk
```

**Note:** Some platforms are not fully supported by pip. For example, on riscv64, you need to install it using a released wheel:

```sh
pip3 install https://github.com/alphacep/vosk-api/releases/download/v0.3.42/vosk-0.3.42-py3-none-linux_riscv64.whl
```

If you encounter installation issues, check the output of the following commands and provide it for reference:

```sh
python3 --version
pip3 --version
pip3 -v install vosk
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