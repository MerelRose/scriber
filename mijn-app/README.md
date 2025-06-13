# 🖥️ Frontend: Transcriptie- en Vertaaltool (React)

Deze React-applicatie biedt een gebruikersinterface voor:

* Uploaden of invoeren van videolinks voor transcriptie
* Bekijken en bewerken van transcriptie-segmenten
* Vertalen van tekst (NL → EN, DE, enz.)
* Spellingscontrole (NL en vertaald)

---

## ✅ Vereisten

* Node.js (v18+ aanbevolen)
* Backend moet lokaal draaien op `http://localhost:4000`
* Toegang tot geldige `apikey` en `jwtToken`

---

## 🛠️ Installatie

1. **Clone de repository**:

```bash
git clone <REPO_URL>
cd frontend
```

2. **Installeer dependencies**:

```bash
npm install
```

3. **Voeg je API-sleutels toe**:

Maak een bestand `access.js` in de `src/` map met daarin:

```js
// access.js
export const apikey = 'JOUW_API_KEY_HIER';
export const jwtToken = 'JOUW_JWT_TOKEN_HIER';
```

4. **Start de app**:

```bash
npm start
```

App draait dan op: [http://localhost:3000](http://localhost:3000)

---

## 📁 Projectstructuur (samenvatting)

```
src/
├── access.js          // Bevat API key + JWT
├── Transcribe_demo.js // Hoofdcomponent voor transcriptie/vertaling/spelling
├── App.js             // App entrypoint
```

---

## 🚀 Gebruik

1. Vul een videolink in (bijv. `.mp4`, YouTube, S3-link).
2. Klik op **Transcript Video**.
3. Wacht op transcriptie.
4. Klik op **Vertaal naar Engels**.
5. Klik op **Spellingcontrole** om fouten te markeren.

Segmenten worden weergegeven in een tabel:

* Originele tekst (met spellingfouten in rood)
* Vertaald segment (eveneens met visuele markering voor fouten)
* Tooltip met suggesties door op ⚠ te klikken

---

## 🔍 Beschikbare Functionaliteiten

| Functie                  | Uitleg                                                  |
| ------------------------ | ------------------------------------------------------- |
| 🎥 Transcriptie via link | Haalt audio op via backend, stuurt naar `transcribe.py` |
| 🌐 Vertaling via Ollama  | Stuurt transcripties naar `translate/mistral`           |
| 📝 Spellingscontrole NL  | Via `/spelling/qwen` (Qwen AI-model)                    |
| 📝 Spellingscontrole EN  | Op de vertaalde tekst, via aangepaste prompt            |
| ✅ Inline bewerking      | Segmenten zijn direct aanpasbaar in tabel               |

---

## 🔗 Externe API's

* **Backend API**: `http://localhost:4000`
* **Ollama vertaalmodel**: `gemma3:12b-it-qat`
* **Qwen spellingmodel**: `gemma3:12b`
* **LanguageTool (optioneel)**: `https://api.languagetool.org`

---