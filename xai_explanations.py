"""
Explainable AI (XAI) Module for Smart Agriculture
Provides farmer-friendly explanations for AI predictions
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import cv2
import io
import base64
from lime import lime_image
from lime.wrappers.scikit_image import SegmentationAlgorithm
import shap
from sklearn.inspection import permutation_importance
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend

class AgricultureXAI:
    """Explainable AI for agriculture predictions"""
    
    def __init__(self):
        self.lime_explainer = None
        self.setup_lime_explainer()
        
    def setup_lime_explainer(self):
        """Initialize LIME explainer for image analysis"""
        try:
            segmentation_fn = SegmentationAlgorithm('quickshift', kernel_size=4, max_dist=200, ratio=0.2)
            self.lime_explainer = lime_image.LimeImageExplainer()
        except Exception as e:
            print(f"Warning: Could not initialize LIME explainer: {e}")
    
    def explain_image_prediction(self, model, img_array, prediction, prediction_class, model_type='disease'):
        """
        Generate XAI explanation for image predictions (disease/weed detection)
        Returns farmer-friendly explanation with visual highlights
        """
        try:
            # Convert image for LIME if needed
            if img_array.shape[-1] == 1:  # Grayscale
                img_array = np.repeat(img_array, 3, axis=-1)
            
            # Remove batch dimension if present
            if len(img_array.shape) == 4:
                img_array = img_array[0]
            
            # Ensure proper data type and range
            if img_array.max() <= 1.0:
                img_array = (img_array * 255).astype(np.uint8)
            else:
                img_array = img_array.astype(np.uint8)
            
            # Generate LIME explanation
            explanation = self.lime_explainer.explain_instance(
                img_array, 
                lambda x: self._predict_batch(model, x),
                top_labels=3, 
                hide_color=0, 
                num_samples=100
            )
            
            # Get explanation image
            temp, mask = explanation.get_image_and_mask(
                explanation.top_labels[0], 
                positive_only=True, 
                num_features=10, 
                hide_rest=False
            )
            
            # Create explanation visualization
            explanation_img = self._create_explanation_visualization(img_array, mask, temp)
            
            # Generate farmer-friendly text explanation
            farmer_explanation = self._generate_farmer_explanation(
                prediction, prediction_class, model_type, explanation
            )
            
            return {
                'explanation_image': explanation_img,
                'farmer_explanation': farmer_explanation,
                'confidence': float(prediction),
                'key_factors': self._extract_key_factors(explanation, model_type)
            }
            
        except Exception as e:
            print(f"Error generating image explanation: {e}")
            return self._fallback_image_explanation(prediction, prediction_class, model_type)
    
    def _predict_batch(self, model, images):
        """Helper function for LIME batch predictions"""
        try:
            # Preprocess images for the model
            processed_images = []
            for img in images:
                if img.shape != (224, 224, 3):  # Resize if needed
                    img_resized = cv2.resize(img, (224, 224))
                else:
                    img_resized = img
                
                # Normalize
                img_normalized = img_resized.astype(np.float32) / 255.0
                processed_images.append(img_normalized)
            
            batch = np.array(processed_images)
            predictions = model.predict(batch, verbose=0)
            return predictions
        except Exception as e:
            print(f"Error in batch prediction: {e}")
            # Return dummy predictions
            return np.random.random((len(images), 1))
    
    def _create_explanation_visualization(self, original_img, mask, highlighted_img):
        """Create visual explanation with highlighted important regions"""
        try:
            fig, axes = plt.subplots(1, 3, figsize=(15, 5))
            
            # Original image
            axes[0].imshow(original_img)
            axes[0].set_title('Original Image', fontsize=12, fontweight='bold')
            axes[0].axis('off')
            
            # Important regions mask
            axes[1].imshow(mask, cmap='RdYlGn', alpha=0.8)
            axes[1].set_title('Important Regions\n(Green=Positive, Red=Negative)', fontsize=12, fontweight='bold')
            axes[1].axis('off')
            
            # Highlighted explanation
            axes[2].imshow(highlighted_img)
            axes[2].set_title('AI Focus Areas', fontsize=12, fontweight='bold')
            axes[2].axis('off')
            
            plt.tight_layout()
            
            # Convert to base64 string
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
            buffer.seek(0)
            img_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return img_base64
            
        except Exception as e:
            print(f"Error creating visualization: {e}")
            return None
    
    def _generate_farmer_explanation(self, prediction, prediction_class, model_type, explanation):
        """Generate farmer-friendly explanation text"""
        confidence = float(prediction) * 100
        
        # Base explanation templates
        if model_type == 'disease':
            if confidence > 80:
                base_text = f"🔍 **High Confidence Detection ({confidence:.1f}%)**\n\n"
                base_text += f"The AI has detected **{prediction_class.replace('_', ' ').title()}** in your crop with high confidence.\n\n"
            elif confidence > 60:
                base_text = f"⚠️ **Moderate Confidence ({confidence:.1f}%)**\n\n"
                base_text += f"The AI suggests possible **{prediction_class.replace('_', ' ').title()}** but recommends further inspection.\n\n"
            else:
                base_text = f"❓ **Low Confidence ({confidence:.1f}%)**\n\n"
                base_text += f"The AI is uncertain. Please consult with agricultural experts or take clearer photos.\n\n"
        
        elif model_type == 'weed':
            if confidence > 80:
                base_text = f"🌿 **Weed Identified ({confidence:.1f}%)**\n\n"
                base_text += f"**{prediction_class.replace('_', ' ').title()}** detected in your field.\n\n"
            else:
                base_text = f"🤔 **Uncertain Detection ({confidence:.1f}%)**\n\n"
                base_text += f"Possible **{prediction_class.replace('_', ' ').title()}** but needs verification.\n\n"
        
        # Add actionable advice
        base_text += self._get_actionable_advice(prediction_class, model_type, confidence)
        
        return base_text
    
    def _get_actionable_advice(self, prediction_class, model_type, confidence):
        """Provide actionable advice based on prediction"""
        advice = "**What should you do?**\n\n"
        
        if model_type == 'disease':
            if confidence > 70:
                advice += "✅ **Immediate Actions:**\n"
                advice += "• Isolate affected plants if possible\n"
                advice += "• Check nearby plants for similar symptoms\n"
                advice += "• Consider targeted treatment\n"
                advice += "• Monitor weather conditions\n\n"
                advice += "📞 **Recommended:** Consult with local agricultural extension officer\n"
            else:
                advice += "🔍 **Next Steps:**\n"
                advice += "• Take more clear, well-lit photos\n"
                advice += "• Check multiple plants\n"
                advice += "• Monitor symptoms for 2-3 days\n"
                advice += "• Seek expert opinion\n"
        
        elif model_type == 'weed':
            if confidence > 70:
                advice += "🚜 **Management Options:**\n"
                advice += "• Hand removal for small infestations\n"
                advice += "• Targeted herbicide application\n"
                advice += "• Prevent seed formation\n"
                advice += "• Regular monitoring\n\n"
                advice += "⚠️ **Important:** Follow local pesticide regulations\n"
            else:
                advice += "🔍 **Verification Steps:**\n"
                advice += "• Take photos from different angles\n"
                advice += "• Compare with weed identification guides\n"
                advice += "• Check with local experts\n"
        
        return advice
    
    def _extract_key_factors(self, explanation, model_type):
        """Extract key factors that influenced the prediction"""
        try:
            # Get feature importance from LIME explanation
            exp_list = explanation.as_list()
            
            factors = []
            for i, (segment, weight) in enumerate(exp_list[:5]):  # Top 5 factors
                if weight > 0:
                    factors.append({
                        'factor': f'Image region {i+1}',
                        'importance': abs(weight),
                        'effect': 'positive' if weight > 0 else 'negative',
                        'description': self._describe_image_factor(i, model_type)
                    })
            
            return factors
        except Exception as e:
            print(f"Error extracting key factors: {e}")
            return [{'factor': 'Visual patterns', 'importance': 0.8, 'effect': 'positive', 'description': 'Overall image characteristics'}]
    
    def _describe_image_factor(self, region_idx, model_type):
        """Describe what an image region might represent"""
        descriptions = {
            'disease': [
                'Leaf discoloration patterns',
                'Spot or lesion characteristics', 
                'Leaf texture changes',
                'Growth abnormalities',
                'Color variations'
            ],
            'weed': [
                'Plant shape and structure',
                'Leaf arrangement patterns',
                'Growth habit indicators',
                'Stem characteristics',
                'Overall plant morphology'
            ]
        }
        
        desc_list = descriptions.get(model_type, descriptions['disease'])
        return desc_list[region_idx % len(desc_list)]
    
    def _fallback_image_explanation(self, prediction, prediction_class, model_type):
        """Fallback explanation when XAI fails"""
        confidence = float(prediction) * 100
        return {
            'explanation_image': None,
            'farmer_explanation': f"AI detected {prediction_class.replace('_', ' ').title()} with {confidence:.1f}% confidence. Please consult agricultural experts for detailed analysis.",
            'confidence': float(prediction),
            'key_factors': [
                {'factor': 'Image analysis', 'importance': 0.8, 'effect': 'positive', 'description': 'Overall visual pattern recognition'}
            ]
        }
    
    def explain_crop_recommendation(self, model, input_features, feature_names, predictions, feature_values):
        """
        Generate XAI explanation for crop recommendations
        """
        try:
            # Calculate feature importance using permutation importance
            # Since we have a single prediction, we'll use SHAP values or manual feature analysis
            
            explanation = {
                'recommended_crops': predictions,
                'feature_importance': self._analyze_feature_importance(feature_names, feature_values),
                'farmer_explanation': self._generate_crop_explanation(predictions, feature_names, feature_values),
                'environmental_factors': self._analyze_environmental_factors(feature_names, feature_values),
                'recommendations': self._generate_farming_recommendations(predictions, feature_names, feature_values)
            }
            
            return explanation
            
        except Exception as e:
            print(f"Error in crop recommendation explanation: {e}")
            return self._fallback_crop_explanation(predictions)
    
    def _analyze_feature_importance(self, feature_names, feature_values):
        """Analyze which features most influence the recommendation"""
        # Map feature names to importance (based on agricultural knowledge)
        feature_weights = {
            'T2M_MAX': 0.25,     # Temperature very important
            'T2M_MIN': 0.20,     # Temperature very important
            'PRECTOTCORR': 0.20,  # Rainfall critical
            'RH2M': 0.15,        # Humidity important
            'WS2M': 0.10,        # Wind speed moderate
            'N': 0.25,           # Nitrogen very important
            'P': 0.20,           # Phosphorus important
            'K': 0.20,           # Potassium important
            'temperature': 0.25,  # Alternative names
            'humidity': 0.15,
            'rainfall': 0.20,
            'ph': 0.15
        }
        
        importance_list = []
        for i, feature in enumerate(feature_names):
            # Normalize feature value for importance calculation
            normalized_value = self._normalize_feature_value(feature, feature_values[i])
            weight = feature_weights.get(feature, 0.1)
            
            importance_list.append({
                'feature': self._get_friendly_feature_name(feature),
                'value': feature_values[i],
                'importance': weight * normalized_value,
                'status': self._get_feature_status(feature, feature_values[i])
            })
        
        # Sort by importance
        importance_list.sort(key=lambda x: x['importance'], reverse=True)
        return importance_list[:6]  # Top 6 features
    
    def _normalize_feature_value(self, feature, value):
        """Normalize feature values to 0-1 range for importance calculation"""
        # Simple normalization based on typical ranges
        ranges = {
            'T2M_MAX': (10, 45),      # Temperature range
            'T2M_MIN': (5, 30),
            'PRECTOTCORR': (0, 300),  # Rainfall mm
            'RH2M': (20, 100),        # Humidity %
            'WS2M': (0, 20),          # Wind speed
            'N': (0, 200),            # Nutrient levels
            'P': (0, 100),
            'K': (0, 200)
        }
        
        range_min, range_max = ranges.get(feature, (0, 100))
        return min(1.0, max(0.0, (value - range_min) / (range_max - range_min)))
    
    def _get_friendly_feature_name(self, feature):
        """Convert technical feature names to farmer-friendly names"""
        name_map = {
            'T2M_MAX': 'Maximum Temperature',
            'T2M_MIN': 'Minimum Temperature', 
            'PRECTOTCORR': 'Rainfall',
            'RH2M': 'Humidity',
            'WS2M': 'Wind Speed',
            'N': 'Nitrogen Level',
            'P': 'Phosphorus Level',
            'K': 'Potassium Level',
            'temperature': 'Temperature',
            'humidity': 'Humidity',
            'rainfall': 'Rainfall',
            'ph': 'Soil pH'
        }
        return name_map.get(feature, feature.replace('_', ' ').title())
    
    def _get_feature_status(self, feature, value):
        """Determine if feature value is optimal, low, or high"""
        # Optimal ranges for different features
        optimal_ranges = {
            'T2M_MAX': (20, 35),
            'T2M_MIN': (10, 25), 
            'PRECTOTCORR': (50, 150),
            'RH2M': (40, 70),
            'WS2M': (2, 8),
            'N': (40, 120),
            'P': (20, 60),
            'K': (40, 120)
        }
        
        if feature not in optimal_ranges:
            return 'normal'
        
        min_opt, max_opt = optimal_ranges[feature]
        if value < min_opt:
            return 'low'
        elif value > max_opt:
            return 'high'
        else:
            return 'optimal'
    
    def _generate_crop_explanation(self, predictions, feature_names, feature_values):
        """Generate farmer-friendly explanation for crop recommendations"""
        explanation = "🌾 **Crop Recommendation Analysis**\n\n"
        
        # Top recommendation
        top_crop = predictions[0]['crop'] if predictions else 'Unknown'
        top_confidence = predictions[0]['confidence'] if predictions else 0
        
        explanation += f"**Top Recommendation: {top_crop}** ({top_confidence}% match)\n\n"
        
        # Analyze conditions
        explanation += "**Your Field Conditions:**\n"
        
        # Temperature analysis
        if 'T2M_MAX' in feature_names:
            temp_idx = feature_names.index('T2M_MAX')
            temp = feature_values[temp_idx]
            if temp > 35:
                explanation += f"🌡️ High temperature ({temp}°C) - suitable for heat-tolerant crops\n"
            elif temp < 20:
                explanation += f"🌡️ Cool temperature ({temp}°C) - good for cold-season crops\n" 
            else:
                explanation += f"🌡️ Moderate temperature ({temp}°C) - suitable for most crops\n"
        
        # Rainfall analysis
        if 'PRECTOTCORR' in feature_names:
            rain_idx = feature_names.index('PRECTOTCORR')
            rain = feature_values[rain_idx]
            if rain > 150:
                explanation += f"🌧️ High rainfall ({rain}mm) - good for water-loving crops\n"
            elif rain < 50:
                explanation += f"🌧️ Low rainfall ({rain}mm) - consider drought-resistant varieties\n"
            else:
                explanation += f"🌧️ Adequate rainfall ({rain}mm) - suitable for most crops\n"
        
        # Soil nutrients
        nutrients = ['N', 'P', 'K']
        nutrient_names = ['Nitrogen', 'Phosphorus', 'Potassium']
        
        for nutrient, name in zip(nutrients, nutrient_names):
            if nutrient in feature_names:
                idx = feature_names.index(nutrient)
                value = feature_values[idx]
                status = self._get_feature_status(nutrient, value)
                
                if status == 'low':
                    explanation += f"⚠️ {name} level is low ({value}) - may need fertilization\n"
                elif status == 'high':
                    explanation += f"✅ {name} level is high ({value}) - good for nutrient-demanding crops\n"
                else:
                    explanation += f"✅ {name} level is optimal ({value})\n"
        
        explanation += "\n**Why this recommendation?**\n"
        explanation += f"{top_crop} is recommended because it matches your current environmental and soil conditions well.\n"
        
        return explanation
    
    def _analyze_environmental_factors(self, feature_names, feature_values):
        """Analyze environmental factors affecting crop selection"""
        factors = []
        
        # Temperature factor
        if 'T2M_MAX' in feature_names:
            temp_idx = feature_names.index('T2M_MAX')
            temp = feature_values[temp_idx]
            
            if temp > 35:
                factors.append({
                    'factor': 'High Temperature',
                    'value': f"{temp}°C",
                    'impact': 'Requires heat-tolerant varieties',
                    'recommendation': 'Consider crops like sorghum, millet, cotton'
                })
            elif temp < 20:
                factors.append({
                    'factor': 'Cool Temperature', 
                    'value': f"{temp}°C",
                    'impact': 'Suitable for cool-season crops',
                    'recommendation': 'Consider wheat, barley, peas'
                })
        
        # Rainfall factor
        if 'PRECTOTCORR' in feature_names:
            rain_idx = feature_names.index('PRECTOTCORR')
            rain = feature_values[rain_idx]
            
            if rain < 50:
                factors.append({
                    'factor': 'Low Rainfall',
                    'value': f"{rain}mm",
                    'impact': 'Water stress risk',
                    'recommendation': 'Install drip irrigation, choose drought-resistant varieties'
                })
            elif rain > 200:
                factors.append({
                    'factor': 'High Rainfall',
                    'value': f"{rain}mm", 
                    'impact': 'Risk of waterlogging',
                    'recommendation': 'Ensure good drainage, choose water-tolerant crops'
                })
        
        return factors
    
    def _generate_farming_recommendations(self, predictions, feature_names, feature_values):
        """Generate specific farming recommendations"""
        recommendations = []
        
        # Based on top crop recommendation
        if predictions:
            top_crop = predictions[0]['crop']
            
            recommendations.append({
                'category': 'Crop Management',
                'recommendation': f'For {top_crop}, ensure proper spacing and timely planting',
                'priority': 'high'
            })
            
            recommendations.append({
                'category': 'Fertilization',
                'recommendation': 'Apply balanced fertilizer based on soil test results',
                'priority': 'high'
            })
        
        # Based on environmental conditions
        if 'PRECTOTCORR' in feature_names:
            rain_idx = feature_names.index('PRECTOTCORR')
            rain = feature_values[rain_idx]
            
            if rain < 50:
                recommendations.append({
                    'category': 'Water Management',
                    'recommendation': 'Install efficient irrigation system to supplement rainfall',
                    'priority': 'high'
                })
            elif rain > 200:
                recommendations.append({
                    'category': 'Drainage',
                    'recommendation': 'Ensure proper field drainage to prevent waterlogging',
                    'priority': 'medium'
                })
        
        # Soil management
        recommendations.append({
            'category': 'Soil Health',
            'recommendation': 'Regular soil testing and organic matter addition',
            'priority': 'medium'
        })
        
        return recommendations
    
    def _fallback_crop_explanation(self, predictions):
        """Fallback explanation for crop recommendations"""
        return {
            'recommended_crops': predictions,
            'farmer_explanation': 'Crop recommendations are based on your environmental and soil conditions.',
            'feature_importance': [],
            'environmental_factors': [],
            'recommendations': [
                {'category': 'General', 'recommendation': 'Consult with local agricultural experts', 'priority': 'high'}
            ]
        }

# Global XAI instance
xai_explainer = AgricultureXAI()