from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load the trained model and scaler
model_path = 'model.pkl'
scaler_path = 'scaler.pkl'
regressor_model_path = 'model_regressor.pkl'
regressor_scaler_path = 'scaler_regressor.pkl'

# Load the dataset for song suggestions
data_path = 'Data/song_data.csv'

# Check if model exists
if not os.path.exists(model_path):
    print("Model file not found. Ensure model.pkl exists.")
    exit(1)

if not os.path.exists(scaler_path):
    print("Scaler file not found. Ensure scaler.pkl exists.")
    exit(1)

if not os.path.exists(data_path):
    print("Dataset file not found. Ensure Data/song_data.csv exists.")
    exit(1)

# Load the model and scaler
print("Loading trained model...")
with open(model_path, 'rb') as f:
    model = pickle.load(f)
with open(scaler_path, 'rb') as f:
    scaler = pickle.load(f)

# Optional: load separate regression model
regressor_model = None
regressor_scaler = None
if os.path.exists(regressor_model_path) and os.path.exists(regressor_scaler_path):
    try:
        with open(regressor_model_path, 'rb') as f:
            regressor_model = pickle.load(f)
        with open(regressor_scaler_path, 'rb') as f:
            regressor_scaler = pickle.load(f)
        print("Loaded optional regression model for numeric popularity estimates.")
    except Exception as e:
        print(f"Warning: Could not load regression artifacts: {e}")

# Model diagnostics
model_info = {
    'class_name': type(model).__name__,
    'module': type(model).__module__,
    'has_predict_proba': hasattr(model, 'predict_proba'),
    'estimator_type': getattr(model, '_estimator_type', None)
}
print(f"Loaded model info: {model_info}")

regressor_info = None
if regressor_model is not None:
    regressor_info = {
        'class_name': type(regressor_model).__name__,
        'module': type(regressor_model).__module__,
        'has_predict_proba': hasattr(regressor_model, 'predict_proba'),
        'estimator_type': getattr(regressor_model, '_estimator_type', None)
    }
    print(f"Loaded regressor info: {regressor_info}")

# Load the dataset
print("Loading song dataset...")
song_data = pd.read_csv(data_path)

# Define feature columns (excluding song_name and song_popularity)
feature_columns = ['song_duration_ms', 'acousticness', 'danceability', 'energy', 
                  'instrumentalness', 'key', 'liveness', 'loudness', 'audio_mode', 
                  'speechiness', 'tempo', 'time_signature', 'audio_valence']

print(f"Model loaded successfully! Features: {len(feature_columns)}")
print(f"Dataset loaded successfully! Songs: {len(song_data)}")

@app.route('/api/songs', methods=['GET'])
def get_songs():
    """Return list of songs for dropdown suggestions"""
    try:
        # Get search query if provided
        search_query = request.args.get('q', '').lower()
        
        if search_query:
            # Filter songs based on search query
            filtered_songs = song_data[
                song_data['song_name'].str.lower().str.contains(search_query, na=False)
            ]
        else:
            # Return all songs if no search query
            filtered_songs = song_data
        
        # Get unique song names and limit results to prevent overwhelming the frontend
        unique_songs = filtered_songs[['song_name']].drop_duplicates()
        songs_list = unique_songs.head(100).to_dict('records')
        
        return jsonify({
            'success': True,
            'songs': songs_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/song-details', methods=['GET'])
def get_song_details():
    """Get detailed features for a specific song"""
    try:
        song_name = request.args.get('song_name')
        
        if not song_name:
            return jsonify({
                'success': False,
                'error': 'Song name is required'
            }), 400
        
        # Find the song in the dataset
        song_row = song_data[song_data['song_name'] == song_name]
        
        if song_row.empty:
            return jsonify({
                'success': False,
                'error': 'Song not found in dataset'
            }), 404
        
        song = song_row.iloc[0]
        
        # Extract features for prediction
        features = song[feature_columns].values.reshape(1, -1)
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction (support classifier probability)
        if hasattr(model, 'predict_proba'):
            # Use probability of the 'popular' class. In the notebook, labels were [1,0]
            # where 0 = Popular, 1 = Not Popular. So select class 0 probability when present.
            classes = getattr(model, 'classes_', None)
            idx = 1
            if classes is not None:
                try:
                    idx = list(classes).index(0)
                except ValueError:
                    # Fallback to the last column (common convention for positive class)
                    idx = -1
            proba = float(model.predict_proba(features_scaled)[0, idx])
            prediction = max(0, min(100, proba * 100.0))
        else:
            pred_value = float(model.predict(features_scaled)[0])
            prediction = max(0, min(100, pred_value))

        # Optional regression score (0-100) if regressor available
        regression_score = None
        if regressor_model is not None and regressor_scaler is not None:
            try:
                features_scaled_reg = regressor_scaler.transform(features)
                reg_value = float(regressor_model.predict(features_scaled_reg)[0])
                regression_score = max(0, min(100, reg_value))
            except Exception as e:
                regression_score = None
        
        # Get actual popularity from dataset
        actual_popularity = song['song_popularity']
        
        # Prepare song details
        song_details = {
            'song_name': song['song_name'],
            'actual_popularity': int(actual_popularity),
            'predicted_popularity': round(prediction, 2),
            'regression_popularity': None if regression_score is None else round(regression_score, 2),
            'features': {
                'song_duration_ms': int(song['song_duration_ms']),
                'acousticness': round(song['acousticness'], 4),
                'danceability': round(song['danceability'], 4),
                'energy': round(song['energy'], 4),
                'instrumentalness': round(song['instrumentalness'], 4),
                'key': int(song['key']),
                'liveness': round(song['liveness'], 4),
                'loudness': round(song['loudness'], 4),
                'audio_mode': int(song['audio_mode']),
                'speechiness': round(song['speechiness'], 4),
                'tempo': round(song['tempo'], 4),
                'time_signature': int(song['time_signature']),
                'audio_valence': round(song['audio_valence'], 4)
            }
        }
        
        return jsonify({
            'success': True,
            'song': song_details
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """Return basic information about the loaded model"""
    try:
        return jsonify({
            'success': True,
            'model': model_info,
            'regressor': regressor_info
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/feedback', methods=['POST'])
def save_feedback():
    """Save user feedback on predictions"""
    try:
        data = request.json
        
        # Extract feedback data
        song_name = data.get('song_name')
        predicted_popularity = data.get('predicted_popularity')
        user_rating = data.get('user_rating')  # 'like' or 'dislike'
        feedback_text = data.get('feedback_text', '')
        
        if not all([song_name, predicted_popularity, user_rating]):
            return jsonify({
                'success': False,
                'error': 'Missing required fields'
            }), 400
        
        # Create feedback entry
        feedback_entry = {
            'timestamp': datetime.now().isoformat(),
            'song_name': song_name,
            'predicted_popularity': predicted_popularity,
            'user_rating': user_rating,
            'feedback_text': feedback_text
        }
        
        # Save to feedback file
        feedback_file = 'user_feedback.csv'
        
        # Check if feedback file exists, create headers if not
        if not os.path.exists(feedback_file):
            feedback_df = pd.DataFrame([feedback_entry])
        else:
            feedback_df = pd.read_csv(feedback_file)
            feedback_df = pd.concat([feedback_df, pd.DataFrame([feedback_entry])], ignore_index=True)
        
        feedback_df.to_csv(feedback_file, index=False)
        
        return jsonify({
            'success': True,
            'message': 'Feedback saved successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get basic statistics about the dataset"""
    try:
        stats = {
            'total_songs': len(song_data),
            'avg_popularity': round(song_data['song_popularity'].mean(), 2),
            'popularity_range': {
                'min': int(song_data['song_popularity'].min()),
                'max': int(song_data['song_popularity'].max())
            },
            'feature_count': len(feature_columns)
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001) 