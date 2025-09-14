# Smart Agriculture Assistant

This web application is a comprehensive tool designed to assist farmers by leveraging the power of AI and data. It provides three core features: AI-powered crop recommendation, real-time plant disease detection, and weed identification from images.

## Features

- **Crop Recommendation**: Recommends the best crop to plant based on the user's local soil and weather conditions. The model is a RandomForestClassifier trained on historical agricultural data for various states in India.
- **Disease Detection**: Identifies 38 different types of plant diseases from an uploaded image of a plant leaf. This feature uses a Convolutional Neural Network (CNN) built with TensorFlow/Keras.
- **Weed Detection**: Identifies 12 different types of common weeds and crop seedlings from an uploaded image. This also uses a CNN built with TensorFlow/Keras.
- **Live Market Prices**: Fetches recent commodity prices for a selected state to provide economic context for farming decisions.
- **Fertilizer Calculator**: Recommends the amount of Nitrogen (N), Phosphorus (P), and Potassium (K) needed for a specific crop based on current soil nutrient levels.

## Tech Stack

- **Backend**: Python, Flask
- **Machine Learning**: Scikit-learn, TensorFlow/Keras, Pandas
- **Frontend**: HTML, Tailwind CSS, JavaScript
- **UI/UX**: Responsive design with dark mode support

## Setup and Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd Smart-Agriculture-WebApp
```

2. Create and activate a virtual environment:

**For Windows PowerShell:**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**For Windows Command Prompt:**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**For Git Bash on Windows:**
```bash
python -m venv venv
source venv/Scripts/activate
```

**Note**: If PowerShell blocks script execution, run this command first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

3. Install the required libraries:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python app.py
```

5. Open your browser and navigate to http://127.0.0.1:5000

## New Features in This Version

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes with system preference detection
- **Gradient Backgrounds**: Beautiful gradient designs throughout the application
- **Smooth Animations**: Enhanced user experience with CSS animations and transitions

### 🔧 Enhanced Functionality
- **Drag & Drop Upload**: Easily upload images by dragging and dropping
- **Real-time Preview**: See image previews before processing
- **Toast Notifications**: Informative success/error messages
- **Loading States**: Visual feedback during processing
- **Better Error Handling**: More robust error management and user feedback

### 📱 Mobile-First Design
- **Mobile Navigation**: Collapsible navigation menu for mobile devices
- **Touch-Friendly**: Optimized buttons and interactions for touch devices
- **Responsive Layout**: Content adapts perfectly to different screen sizes

### 🚀 Performance Improvements
- **Optimized Code**: Clean, maintainable JavaScript and CSS
- **Fast Loading**: Efficient asset loading and caching
- **Progressive Enhancement**: Graceful degradation for older browsers

## API Endpoints

- `POST /predict_disease` - Disease detection from plant images
- `POST /predict_weed` - Weed identification from plant images
- `POST /recommend_crop` - Crop recommendations based on conditions
- `POST /calculate_fertilizer` - Fertilizer need calculations
- `POST /get_live_weather` - Live weather data fetching
- `POST /get_market_prices` - Current market prices by state

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- TensorFlow team for the machine learning framework
- OpenWeatherMap for weather data
- Government of India for market price data API
- Tailwind CSS for the styling framework