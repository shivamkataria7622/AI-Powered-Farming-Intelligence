from flask import Flask, request, jsonify, render_template
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import io
import os
import uuid
import requests
from datetime import datetime, timedelta

# Initialize the Flask application
app = Flask(__name__)

# --- Create a folder for temporary uploads ---
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# --- Global variables for models and data ---
disease_model = None
weed_model = None
crop_recommendation_model = None
disease_class_names = []
weed_class_names = []
crop_model_features = []
all_states = []
all_crops_for_fertilizer = []

# --- Data Dictionaries ---
CROP_MAP = {
    'AREC': 'Arecanut', 'ARHR': 'Arhar/Tur', 'BAJR': 'Bajra', 'BANA': 'Banana', 'BARL': 'Barley',
    'BLAC': 'Black pepper', 'COTN': 'Cotton', 'GNUT': 'Groundnut', 'JOWA': 'Jowar', 
    'MAIZ': 'Maize', 'MOOG': 'Moong (Green Gram)', 'ONIO': 'Onion', 'POTA': 'Potato',
    'RAGI': 'Ragi', 'RICE': 'Rice', 'RM': 'Rapeseed & Mustard', 'SOYB': 'Soyabean', 
    'SUGC': 'Sugarcane', 'WHEAT': 'Wheat', 'CPEA': 'Cowpea', 'TURM': 'Turmeric'
}
CROP_NUTRIENTS = {
    'Rice': {'N': 120, 'P': 60, 'K': 60}, 'Wheat': {'N': 150, 'P': 75, 'K': 60},
    'Maize': {'N': 180, 'P': 80, 'K': 70}, 'Sugarcane': {'N': 250, 'P': 85, 'K': 120},
    'Cotton': {'N': 120, 'P': 60, 'K': 60}, 'Soyabean': {'N': 25, 'P': 60, 'K': 40},
    'Potato': {'N': 180, 'P': 100, 'K': 120}, 'Onion': {'N': 100, 'P': 50, 'K': 50},
    'Groundnut': {'N': 20, 'P': 40, 'K': 40}, 'Bajra': {'N': 80, 'P': 40, 'K': 40}
}
all_crops_for_fertilizer = sorted(CROP_NUTRIENTS.keys())
STATE_MAP_PRICES = { 'Chhattisgarh': 'Chattisgarh' }


def train_crop_recommender():
    global crop_recommendation_model, crop_model_features, all_states
    try:
        df = pd.read_csv('final_cleaned_data.csv')
        print("✅ Full dataset 'final_cleaned_data.csv' loaded for recommender.")
        MAJOR_CROPS = list(CROP_MAP.keys())
        df = df[df['Crop'].isin(MAJOR_CROPS)]
        all_states = sorted(df['STNAME'].unique())
        
        features = df.drop(columns=['Yield_tonnes_per_hectare', 'date', 'DISTNAME', 'Area_hectares', 'Production_tonnes', 'Latitude', 'Longitude', 'latitude', 'longitude', 'Crop', 'Year.1'], errors='ignore')
        target = df['Crop']
        
        features_encoded = pd.get_dummies(features, columns=['STNAME', 'Season'], drop_first=True)
        crop_model_features = features_encoded.columns.tolist()

        print("Training the Crop Recommendation model...")
        model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
        model.fit(features_encoded, target)
        crop_recommendation_model = model
        print("✅ Crop recommendation model trained successfully!")
    except Exception as e:
        print(f"❌ CRITICAL ERROR: Could not train crop recommendation model: {e}")

# --- Load all models at startup ---
with app.app_context():
    try:
        disease_model = tf.keras.models.load_model('disease_detection_model.h5')
        disease_class_names = sorted([ 'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy', 'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy' ])
        print("✅ Disease detection model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading disease detection model: {e}")

    try:
        weed_model = tf.keras.models.load_model('weed_detection_model.h5')
        weed_class_names = sorted([ 'Black-grass', 'Charlock', 'Cleavers', 'Common Chickweed', 'Common wheat', 'Fat Hen', 'Loose Silky-bent', 'Maize', 'Scentless Mayweed', "Shepherd’s Purse", 'Small-flowered Cranesbill', 'Sugar beet' ])
        print("✅ Weed detection model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading weed detection model: {e}")

    train_crop_recommender()

def preprocess_image(file_path, target_size=(128, 128)):
    img = image.load_img(file_path, target_size=target_size)
    img_array = image.img_to_array(img)
    img_batch = np.expand_dims(img_array, axis=0)
    return img_batch / 255.0

@app.route('/')
def home():
    return render_template('index.html', states=all_states, fertilizer_crops=all_crops_for_fertilizer)

@app.route('/predict_disease', methods=['POST'])
def predict_disease():
    # ... (code remains the same)
    if not disease_model: return jsonify({'error': 'Model not available'}), 500
    file = request.files.get('file')
    if not file: return jsonify({'error': 'No file provided'}), 400
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], str(uuid.uuid4()))
    file.save(filepath)
    processed_image = preprocess_image(filepath)
    prediction = disease_model.predict(processed_image)
    os.remove(filepath)
    confidence = float(np.max(prediction))
    predicted_class = disease_class_names[np.argmax(prediction)]
    return jsonify({'prediction': predicted_class.replace('___', ' - ').replace('_', ' '), 'confidence': confidence})

@app.route('/predict_weed', methods=['POST'])
def predict_weed():
    # ... (code remains the same)
    if not weed_model: return jsonify({'error': 'Model not available'}), 500
    file = request.files.get('file')
    if not file: return jsonify({'error': 'No file provided'}), 400
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], str(uuid.uuid4()))
    file.save(filepath)
    processed_image = preprocess_image(filepath)
    prediction = weed_model.predict(processed_image)
    os.remove(filepath)
    confidence = float(np.max(prediction))
    predicted_class = weed_class_names[np.argmax(prediction)]
    return jsonify({'prediction': predicted_class.replace('_', ' '), 'confidence': confidence})

@app.route('/recommend_crop', methods=['POST'])
def recommend_crop():
    if not crop_recommendation_model: return jsonify({'error': 'Model not available'}), 500
    try:
        data = request.get_json()
        input_df = pd.DataFrame([data])
        input_encoded = pd.get_dummies(input_df)
        final_input = input_encoded.reindex(columns=crop_model_features, fill_value=0)
        
        probabilities = crop_recommendation_model.predict_proba(final_input)[0]
        class_names = crop_recommendation_model.classes_
        results = list(zip(class_names, probabilities))
        top_3_results = sorted(results, key=lambda x: x[1], reverse=True)[:3]
        
        recommendations = []
        for crop_code, confidence in top_3_results:
            full_name = CROP_MAP.get(crop_code, crop_code)
            recommendations.append({'crop': full_name, 'confidence': round(confidence * 100, 2)})
        
        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_live_weather', methods=['POST'])
def get_live_weather():
    # ... (code remains the same)
    try:
        data = request.get_json()
        lat, lon = data['lat'], data['lon']
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min"
        response = requests.get(url)
        weather_data = response.json()
        result = { "T2M_MAX": weather_data['daily']['temperature_2m_max'][0], "T2M_MIN": weather_data['daily']['temperature_2m_min'][0], "RH2M": weather_data['current']['relative_humidity_2m'], "PRECTOTCORR": weather_data['current']['precipitation'], "WS2M": weather_data['current']['wind_speed_10m'] }
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/calculate_fertilizer', methods=['POST'])
def calculate_fertilizer():
    # ... (code remains the same)
    try:
        data = request.get_json()
        crop, n_val, p_val, k_val = data['crop'], float(data['n']), float(data['p']), float(data['k'])
        recommendations = CROP_NUTRIENTS.get(crop)
        if not recommendations: return jsonify({'error': 'Nutrient data not available for this crop.'}), 404
        n_needed = max(0, recommendations['N'] - n_val)
        p_needed = max(0, recommendations['P'] - p_val)
        k_needed = max(0, recommendations['K'] - k_val)
        return jsonify({ 'n_needed': round(n_needed, 2), 'p_needed': round(p_needed, 2), 'k_needed': round(k_needed, 2) })
    except Exception as e:
        return jsonify({'error': str(e)}), 400
        
# --- RESTORED LIVE API CALL for Market Prices ---
@app.route('/get_market_prices', methods=['POST'])
def get_market_prices():
    try:
        data = request.get_json()
        state_from_user = data['state']
        
        api_state_name = STATE_MAP_PRICES.get(state_from_user, state_from_user)
        api_key = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"
        
        # Fetch latest 1000 records from the API
        url = (f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
               f"?api-key={api_key}&format=json&limit=1000&sort[arrival_date]=desc")
        
        response = requests.get(url, timeout=20) # Added a timeout for safety
        price_data = response.json()
        
        # Convert to a DataFrame and filter by state in our code
        all_records = pd.DataFrame(price_data.get('records', []))
        if all_records.empty:
            return jsonify({'prices': []})

        state_records_df = all_records[all_records['state'] == api_state_name]

        final_records = [
            {
                'commodity': row.get('commodity'),
                'market': row.get('market'),
                'price': row.get('modal_price')
            }
            for index, row in state_records_df.head(100).iterrows()
        ]
        
        return jsonify({'prices': final_records})
    except Exception as e:
        return jsonify({'error': f'API Error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)

