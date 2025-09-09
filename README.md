# Music Popularity Predictor

Overview
- This app implements the modeling work from `Backend/Main_Project.ipynb` end‑to‑end. In that analysis, multiple algorithms were trained and evaluated; the Extra Trees Classifier achieved the best held‑out accuracy for predicting Popular vs Not Popular, so it is the decision model deployed here.
- Goal: classify whether a track is Popular or Not Popular using Spotify audio features only (no lyrics, no metadata).
- Definition: Popular = Spotify popularity score ≥ 56; otherwise Not Popular. The classifier is trained to learn this label.
- Additionally, a Random Forest Regressor provides a 0–100 “estimated popularity” number for context. It is shown in the UI but does not drive the final decision.

Data
- ~18,800 tracks with 13 Spotify audio features:
  acousticness, danceability, energy, instrumentalness, key, liveness,
  loudness, mode, speechiness, tempo, time_signature, valence, duration_ms.
- Ground truth shown as “Spotify popularity score.” The Popular/Not Popular label is derived from that score using the 56 threshold.

User flow
1. Search and select a track from the dataset.
2. Choose your own guess (Popular / Not Popular).
3. Results display:
   - Extra Trees prediction: Popular / Not Popular (authoritative)
   - Random Forest prediction: estimated popularity (0–100), when available
   - Actual: Popular / Not Popular and the Spotify popularity score
4. The threshold (≥ 56) is documented on the page for clarity.

Models
- Extra Trees Classifier: trained on the 13 audio features; used for the final decision.
- Random Forest Regressor (optional): trained on the same features to estimate the 0–100 score.

Run locally
```bash
# Backend (Flask)
cd Music_Model/Backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py   # http://localhost:5001

# Frontend (React)
cd ../Frontend
npm install
npm start       # http://localhost:3000
```

Artifacts
- `Music_Model/Backend/model.pkl` — Extra Trees Classifier (decision model)
- `Music_Model/Backend/scaler.pkl` — StandardScaler for the classifier
- `Music_Model/Backend/model_regressor.pkl` (optional) — Random Forest Regressor
- `Music_Model/Backend/scaler_regressor.pkl` (optional) — Scaler for the regressor

Notes
- Popularity is defined from the dataset’s score and the 56 threshold for a consistent binary decision.
- Outputs depend solely on audio features; factors like release timing or marketing are out of scope.

Demo
- A short video is recommended: select a song → choose Popular/Not Popular → view Extra Trees prediction, Random Forest estimate, and the actual Spotify popularity score.
