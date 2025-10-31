# gFactz

**gFactz** is a tool that helps you quickly verify claims, headlines, or statements using trusted fact-checking databases. It leverages the Google Fact Check Tools API to aggregate fact checks from reputable sources like BBC, PolitiFact, FactCheck.org, and more.

---

## Features

- Search any claim or headline to find relevant fact checks.
- Displays verdicts with publisher details and review dates.
- Privacy-respecting: no queries or data are stored.

---

## Installation & Usage

1. **Clone the repo:**

   ```bash
   git clone https://github.com/j4gwire/gfactz.git
   cd gfactz


2. **Add your Google Fact Check API key:**


**Open js/app.js and replace the placeholder:**
``const API_KEY = "YOUR_GOOGLE_API_KEY_HERE";``
``const API_KEY = "YOUR_GOOGLE_API_KEY_HERE";``
with your own API key. You can get a key here:
https://developers.google.com/fact-check/tools/api


3. **Open index.html in your browser.**

**API Key Setup**
The app uses the Google Fact Check Tools API.

You must obtain your own API key.


**Tech Stack**
- HTML5 & CSS with Tailwind CSS for styling

- Vanilla JavaScript for logic and API calls

- Google Fact Check Tools API for data


**License**
MIT License — See LICENSE file.
