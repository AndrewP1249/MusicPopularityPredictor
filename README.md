# Spotify Song Popularity Prediction

This project explores and models Spotify audio metrics to predict whether a song is likely to be popular. It involves data inspection, exploration, preprocessing, and machine learning model testing/optimization.  

## Dataset

- Source: Spotify audio metrics dataset (`song_data.csv`)  
- Size: ~18,800 rows × 15 columns  
- Key features:  
  - Acousticness, Danceability, Energy, Instrumentalness  
  - Loudness, Tempo, Speechiness, Valence  
  - Duration, Key, Mode, Time Signature  

The target variable is `song_popularity`, which was binarized:  
- `1` = Not Popular (below median, popularity < 56)  
- `0` = Popular (≥ 56)  

## Data Exploration

- Checked for missing values and duplicates  
- Visualized relationships with scatterplots and pairplots  
- Identified multicollinearity (notably between energy and loudness)  
- Generated a correlation matrix heatmap  

## Data Processing

- Dropped categorical column `song_name` (to avoid overfitting)  
- Scaled features using StandardScaler  
- Split dataset into training/testing sets (75/25)  
- Binarized popularity for classification  

## Models Tested

The following models were implemented using scikit-learn:  

- Logistic Regression  
- K-Nearest Neighbors (KNN)  
- Decision Tree Classifier  
- Multi-Layer Perceptron (Neural Network)  
- Support Vector Classifier (SVC)  
- Random Forest Classifier  
- Gradient Boosting Classifier  
- Extra Trees Classifier (best performing)  

## Results

| Model                    | Accuracy |
|---------------------------|----------|
| Logistic Regression       | ~59.7%   |
| KNN                       | ~62.8%   |
| Decision Tree             | ~68.9%   |
| MLP (Neural Network)      | ~61.4%   |
| Support Vector Classifier | ~61.3%   |
| Random Forest             | ~73.4%   |
| Gradient Boosting         | ~63.2%   |
| Extra Trees Classifier    | **~73.8%** |

The Extra Trees Classifier achieved the highest accuracy, performing approximately 35% better than similar baseline models published online.  

## Additional Experiments

- Hyperparameter tuning for Decision Tree (GridSearchCV) — minimal improvement  
- Isolation Forest applied to remove outliers — did not yield performance gains 
