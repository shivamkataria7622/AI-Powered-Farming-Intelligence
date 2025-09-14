// Smart Agriculture Assistant - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeTheme();
    initializeMobileMenu();
    initializeToasts();
    initializeFileUpload();
    setupTabNavigation();
}

// ==================== THEME MANAGEMENT ====================
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const root = document.documentElement;
    const storageKey = 'agriculture-theme';

    // Get initial theme
    const getInitialTheme = () => {
        const saved = localStorage.getItem(storageKey);
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Apply theme
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
            if (themeIcon) themeIcon.textContent = '☀️';
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
            if (themeIcon) themeIcon.textContent = '🌙';
        }
    };

    // Initialize theme
    const currentTheme = getInitialTheme();
    applyTheme(currentTheme);

    // Theme toggle handler
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = root.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem(storageKey, newTheme);
            applyTheme(newTheme);
            
            // Animate the toggle button
            themeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                themeToggle.style.transform = 'scale(1)';
            }, 100);
        });
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(storageKey)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// ==================== MOBILE MENU ====================
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            
            // Animate menu button
            const isOpen = !mobileMenu.classList.contains('hidden');
            mobileMenuBtn.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.style.transform = 'rotate(0deg)';
            }
        });
    }
}

// ==================== TAB NAVIGATION ====================
function setupTabNavigation() {
    // Update tab button styling and add smooth scrolling
    window.showTab = function(event, tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Show selected tab with animation
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.classList.add('active');
            selectedTab.style.animation = 'fadeIn 0.3s ease-in-out';
        }
        
        // Activate button
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }
        
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
        
        // Smooth scroll to the tab content area
        const tabContainer = selectedTab ? selectedTab.closest('.bg-white.dark\\:bg-gray-800') : null;
        if (tabContainer) {
            // Small delay to ensure tab is shown first
            setTimeout(() => {
                tabContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }, 100);
        }
        
        // Alternative: scroll to specific section if container not found
        if (!tabContainer && selectedTab) {
            setTimeout(() => {
                selectedTab.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }, 100);
        }
    };
    
    // Add smooth scrolling to navbar links
    setupNavbarScrolling();
}

// New function to handle navbar scrolling
function setupNavbarScrolling() {
    // Handle desktop navbar links
    const navLinks = document.querySelectorAll('.nav-link[onclick*="showTab"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Extract tab name from onclick attribute
            const onclickAttr = this.getAttribute('onclick');
            const tabMatch = onclickAttr.match(/showTab\(event,\s*['"](.+?)['"]\)/);
            
            if (tabMatch) {
                const tabName = tabMatch[1];
                
                // Prevent default if it's an anchor
                if (this.tagName === 'A' && this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                }
                
                // Call showTab with smooth scrolling
                window.showTab(e, tabName);
            }
        });
    });
    
    // Handle mobile menu links
    const mobileNavLinks = document.querySelectorAll('#mobileMenu a[onclick*="showTab"]');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const onclickAttr = this.getAttribute('onclick');
            const tabMatch = onclickAttr.match(/showTab\(event,\s*['"](.+?)['"]\)/);
            
            if (tabMatch) {
                const tabName = tabMatch[1];
                
                // Prevent default if it's an anchor
                if (this.tagName === 'A' && this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                }
                
                // Call showTab with smooth scrolling
                window.showTab(e, tabName);
            }
        });
    });
}

// ==================== TOAST NOTIFICATIONS ====================
function initializeToasts() {
    // Auto-hide toast messages
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
        // Add entrance animation
        toast.classList.add('toast-enter');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
        
        // Manual close on click
        toast.addEventListener('click', () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        });
    });
}

// Function to show custom toast
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const colors = {
        success: 'border-green-500',
        error: 'border-red-500',
        warning: 'border-yellow-500',
        info: 'border-blue-500'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast max-w-sm p-4 rounded-lg shadow-lg border-l-4 bg-white dark:bg-gray-800 ${colors[type]} animate-slide-up`;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <span>${icons[type]}</span>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">${message}</p>
            </div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-hide
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
    
    // Manual close
    toast.addEventListener('click', () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-20 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
}

// ==================== FILE UPLOAD ENHANCEMENTS ====================
function initializeFileUpload() {
    const uploadAreas = document.querySelectorAll('.upload-area, [class*="border-dashed"]');
    
    uploadAreas.forEach(area => {
        // Add drag and drop functionality
        area.addEventListener('dragover', handleDragOver);
        area.addEventListener('dragenter', handleDragEnter);
        area.addEventListener('dragleave', handleDragLeave);
        area.addEventListener('drop', handleDrop);
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
        e.currentTarget.classList.remove('dragover');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const input = e.currentTarget.querySelector('input[type="file"]');
        if (input) {
            input.files = files;
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }
    }
}

// Enhanced image preview function
window.previewImage = function(type) {
    const fileInput = document.getElementById(`${type}Upload`);
    const previewContainer = document.getElementById(`${type}Preview`);
    const imageEl = document.getElementById(`${type}Image`);
    
    if (!fileInput.files[0]) return;
    
    const file = fileInput.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file.', 'error');
        return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        imageEl.src = e.target.result;
        if (previewContainer) {
            previewContainer.classList.remove('hidden');
            previewContainer.style.animation = 'slideUp 0.3s ease-out';
        } else {
            imageEl.classList.remove('hidden');
            imageEl.style.animation = 'slideUp 0.3s ease-out';
        }
    };
    reader.readAsDataURL(file);
};

// ==================== API FUNCTIONS ====================

// Enhanced prediction function with XAI explanations
window.predictImage = async function(type) {
    const resultDiv = document.getElementById(`${type}Result`);
    const loader = document.getElementById(`${type}Loader`);
    const fileInput = document.getElementById(`${type}Upload`);
    
    // Validation
    if (!fileInput.files[0]) {
        showToast('Please select an image first.', 'warning');
        return;
    }
    
    // UI Setup
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    resultDiv.innerHTML = '';
    resultDiv.classList.remove('hidden');
    loader.classList.remove('hidden');
    loader.style.display = 'block';
    
    // Button loading state
    const button = document.querySelector(`[onclick="predictImage('${type}')"]`);
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<div class="loader inline"></div> Analyzing...';
    
    try {
        const endpoint = type === 'disease' ? '/predict_disease' : '/predict_weed';
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error) {
            showToast(`Error: ${data.error}`, 'error');
            resultDiv.innerHTML = createErrorCard(data.error);
        } else {
            const confidencePercent = (data.confidence * 100).toFixed(1);
            let resultHTML = createResultCard(data.prediction, confidencePercent, type);
            
            // Add XAI explanation if available
            if (data.xai) {
                resultHTML += createXAIExplanation(data.xai, type);
            }
            
            resultDiv.innerHTML = resultHTML;
            showToast(`Analysis complete: ${data.prediction}`, 'success');
            
            // Animate feature importance bars if present
            setTimeout(() => {
                animateFeatureBars();
            }, 500);
        }
    } catch (error) {
        console.error('Prediction error:', error);
        showToast('Network error. Please try again.', 'error');
        resultDiv.innerHTML = createErrorCard('Network error occurred');
    } finally {
        loader.style.display = 'none';
        loader.classList.add('hidden');
        button.disabled = false;
        button.innerHTML = originalText;
    }
};

// Create result card HTML
function createResultCard(prediction, confidence, type) {
    const icon = type === 'disease' ? '🩺' : '🌿';
    const color = parseFloat(confidence) > 80 ? 'text-green-600' : 'text-yellow-600';
    
    return `
        <div class="result-card">
            <div class="result-header">
                <div class="result-icon">${icon}</div>
                <div>
                    <h3 class="result-title">Analysis Result</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">AI-powered identification</p>
                </div>
            </div>
            <div class="space-y-4">
                <div>
                    <h4 class="text-lg font-semibold ${color} mb-2">${prediction.replace(/_/g, ' ')}</h4>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence}%"></div>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${confidence}% confidence</p>
                </div>
                ${parseFloat(confidence) < 80 ? '<p class="text-sm text-amber-600 dark:text-amber-400">⚠️ Low confidence result. Consider retaking the photo with better lighting.</p>' : ''}
            </div>
        </div>
    `;
}

function createErrorCard(error) {
    return `
        <div class="result-card border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div class="result-header">
                <div class="result-icon bg-red-100 text-red-600">❌</div>
                <div>
                    <h3 class="result-title text-red-800 dark:text-red-200">Error</h3>
                    <p class="text-sm text-red-600 dark:text-red-400">${error}</p>
                </div>
            </div>
        </div>
    `;
}

// Enhanced crop recommendation with XAI
window.recommendCrop = async function() {
    const resultDiv = document.getElementById('recommendResult');
    const loader = document.getElementById('recommendLoader');
    const form = document.getElementById('recommendForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Button loading state
    const button = document.querySelector('[onclick="recommendCrop()"]');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<div class="loader inline"></div> Analyzing conditions...';
    
    resultDiv.classList.remove('hidden');
    loader.classList.remove('hidden');
    
    try {
        const response = await fetch('/recommend_crop', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const resultData = await response.json();
        
        if (resultData.error) {
            showToast(`Error: ${resultData.error}`, 'error');
            resultDiv.innerHTML = createErrorCard(resultData.error);
        } else {
            let resultHTML = createCropRecommendationCard(resultData.recommendations);
            
            // Add XAI explanation if available
            if (resultData.xai) {
                resultHTML += createCropXAIExplanation(resultData.xai);
            }
            
            resultDiv.innerHTML = resultHTML;
            showToast('Crop recommendations generated!', 'success');
            
            // Animate feature importance bars if present
            setTimeout(() => {
                animateFeatureBars();
            }, 500);
        }
    } catch (error) {
        console.error('Recommendation error:', error);
        showToast('Failed to get recommendations. Please try again.', 'error');
        resultDiv.innerHTML = createErrorCard('Network error occurred');
    } finally {
        loader.classList.add('hidden');
        button.disabled = false;
        button.innerHTML = originalText;
    }
};

function createCropRecommendationCard(recommendations) {
    let html = `
        <div class="result-card">
            <div class="result-header">
                <div class="result-icon">🌾</div>
                <div>
                    <h3 class="result-title">Crop Recommendations</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Based on your field conditions</p>
                </div>
            </div>
            <div class="space-y-3">
    `;
    
    recommendations.forEach((rec, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        html += `
            <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${medal}</span>
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-gray-100">${rec.crop}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Match confidence</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-lg font-bold text-green-600">${rec.confidence}%</span>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Enhanced weather fetching
window.getLiveWeather = async function() {
    const button = document.querySelector('[onclick="getLiveWeather()"]');
    const originalText = button.innerHTML;
    
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by this browser.', 'error');
        return;
    }
    
    button.disabled = true;
    button.innerHTML = '<div class="loader inline"></div> Getting location...';
    
    const getPosition = () => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            });
        });
    };
    
    try {
        button.innerHTML = '<div class="loader inline"></div> Fetching weather...';
        const position = await getPosition();
        const { latitude, longitude } = position.coords;
        
        const response = await fetch('/get_live_weather', {
            method: 'POST',
            body: JSON.stringify({ lat: latitude, lon: longitude }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const weather = await response.json();
        
        if (weather.error) {
            showToast('Could not fetch weather data.', 'error');
        } else {
            // Update form fields
            const form = document.getElementById('recommendForm');
            form.querySelector('[name="T2M_MAX"]').value = weather.T2M_MAX.toFixed(1);
            form.querySelector('[name="T2M_MIN"]').value = weather.T2M_MIN.toFixed(1);
            form.querySelector('[name="RH2M"]').value = weather.RH2M.toFixed(1);
            form.querySelector('[name="PRECTOTCORR"]').value = weather.PRECTOTCORR.toFixed(1);
            form.querySelector('[name="WS2M"]').value = weather.WS2M.toFixed(1);
            
            // Animate updated fields
            const updatedFields = ['T2M_MAX', 'T2M_MIN', 'RH2M', 'PRECTOTCORR', 'WS2M'];
            updatedFields.forEach(field => {
                const input = form.querySelector(`[name="${field}"]`);
                input.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                setTimeout(() => {
                    input.style.backgroundColor = '';
                }, 2000);
            });
            
            showToast('Weather data updated successfully!', 'success');
        }
    } catch (error) {
        if (error.code === error.PERMISSION_DENIED) {
            showToast('Location access denied. Please enable location services.', 'error');
        } else if (error.code === error.TIMEOUT) {
            showToast('Location request timed out. Please try again.', 'error');
        } else {
            showToast('Could not get your location. Please try again.', 'error');
        }
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
};

// Enhanced fertilizer calculation
window.calculateFertilizer = async function() {
    const resultDiv = document.getElementById('fertilizerResult');
    const loader = document.getElementById('fertilizerLoader');
    const form = document.getElementById('fertilizerForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const button = document.querySelector('[onclick="calculateFertilizer()"]');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<div class="loader inline"></div> Calculating...';
    
    resultDiv.classList.remove('hidden');
    loader.classList.remove('hidden');
    
    try {
        const response = await fetch('/calculate_fertilizer', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const resultData = await response.json();
        
        if (resultData.error) {
            showToast(`Error: ${resultData.error}`, 'error');
            resultDiv.innerHTML = createErrorCard(resultData.error);
        } else {
            resultDiv.innerHTML = createFertilizerCard(resultData);
            showToast('Fertilizer recommendations calculated!', 'success');
        }
    } catch (error) {
        console.error('Fertilizer calculation error:', error);
        showToast('Failed to calculate fertilizer needs. Please try again.', 'error');
        resultDiv.innerHTML = createErrorCard('Network error occurred');
    } finally {
        loader.classList.add('hidden');
        button.disabled = false;
        button.innerHTML = originalText;
    }
};

function createFertilizerCard(data) {
    return `
        <div class="result-card">
            <div class="result-header">
                <div class="result-icon">🧪</div>
                <div>
                    <h3 class="result-title">Fertilizer Recommendations</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Additional nutrients needed (kg/ha)</p>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${data.n_needed}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Nitrogen (N)</div>
                </div>
                <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${data.p_needed}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Phosphorus (P)</div>
                </div>
                <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">${data.k_needed}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Potassium (K)</div>
                </div>
            </div>
            ${(data.n_needed === 0 && data.p_needed === 0 && data.k_needed === 0) ? 
                '<p class="mt-4 text-center text-green-600 dark:text-green-400">✅ Your soil has adequate nutrient levels for the selected crop!</p>' : 
                '<p class="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">💡 Consider applying fertilizers with these N-P-K ratios for optimal crop growth.</p>'
            }
        </div>
    `;
}

// Enhanced market prices
window.getMarketPrices = async function() {
    const tableBody = document.getElementById('pricesTableBody');
    const loader = document.getElementById('pricesLoader');
    const state = document.getElementById('priceStateSelect').value;
    
    const button = document.querySelector('[onclick="getMarketPrices()"]');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<div class="loader inline"></div> Fetching...';
    
    tableBody.innerHTML = '<tr><td colspan="3" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Loading market prices...</td></tr>';
    loader.classList.remove('hidden');
    
    try {
        const response = await fetch('/get_market_prices', {
            method: 'POST',
            body: JSON.stringify({ state: state }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.error) {
            tableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-8 text-center text-red-500 dark:text-red-400">❌ Error: ${data.error}</td></tr>`;
            showToast(`Error fetching prices: ${data.error}`, 'error');
        } else if (data.prices.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">📋 No recent price data found for ${state}.</td></tr>`;
            showToast(`No price data available for ${state}`, 'warning');
        } else {
            let rows = '';
            data.prices.forEach((record, index) => {
                rows += `
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" style="animation: slideUp 0.3s ease-out ${index * 0.1}s both;">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${record.commodity}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${record.market}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 font-semibold">₹ ${record.price}</td>
                    </tr>
                `;
            });
            tableBody.innerHTML = rows;
            showToast(`Found ${data.prices.length} price records for ${state}`, 'success');
        }
    } catch (error) {
        console.error('Market prices error:', error);
        tableBody.innerHTML = '<tr><td colspan="3" class="px-6 py-8 text-center text-red-500 dark:text-red-400">❌ Network error occurred. Please try again.</td></tr>';
        showToast('Network error while fetching prices', 'error');
    } finally {
        loader.classList.add('hidden');
        button.disabled = false;
        button.innerHTML = originalText;
    }
};

// ==================== XAI EXPLANATION FUNCTIONS ====================

// Create XAI explanation HTML for image predictions
function createXAIExplanation(xai, type) {
    const confidenceClass = xai.confidence > 0.8 ? 'confidence-high' : 
                           xai.confidence > 0.6 ? 'confidence-medium' : 'confidence-low';
    
    let html = `
        <div class="xai-explanation" id="xai-${type}">
            <div class="xai-header">
                <div class="xai-icon">🧠</div>
                <div>
                    <h3 class="xai-title">AI Explanation</h3>
                    <div class="confidence-indicator">
                        <div class="confidence-circle ${confidenceClass}"></div>
                        <span class="text-sm text-gray-600 dark:text-gray-400">
                            ${xai.confidence > 0.8 ? 'High' : xai.confidence > 0.6 ? 'Medium' : 'Low'} Confidence Prediction
                        </span>
                    </div>
                </div>
            </div>
    `;
    
    // Add visualization if available
    if (xai.explanation_image) {
        html += `
            <div class="xai-visualization">
                <img src="data:image/png;base64,${xai.explanation_image}" 
                     alt="AI Analysis Visualization" 
                     class="xai-image">
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                    Visual analysis showing which parts of the image influenced the AI's decision
                </p>
            </div>
        `;
    }
    
    // Add farmer explanation
    if (xai.farmer_explanation) {
        html += `
            <div class="farmer-explanation">
                ${formatFarmerExplanation(xai.farmer_explanation)}
            </div>
        `;
    }
    
    // Add key factors
    if (xai.key_factors && xai.key_factors.length > 0) {
        html += `
            <div class="feature-importance">
                <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    🔍 Key Factors Analyzed
                </h4>
        `;
        
        xai.key_factors.forEach((factor, index) => {
            const importancePercent = Math.round(factor.importance * 100);
            html += `
                <div class="importance-item">
                    <div class="flex-shrink-0">
                        <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                            ${factor.factor}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            ${factor.description}
                        </p>
                    </div>
                    <div class="importance-bar">
                        <div class="importance-fill" 
                             data-width="${importancePercent}" 
                             style="--fill-width: ${importancePercent}%"></div>
                    </div>
                    <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ${importancePercent}%
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    html += `</div>`;
    return html;
}

// Create XAI explanation HTML for crop recommendations
function createCropXAIExplanation(xai) {
    let html = `
        <div class="xai-explanation" id="xai-crop">
            <div class="xai-header">
                <div class="xai-icon">🧠</div>
                <div>
                    <h3 class="xai-title">Why These Recommendations?</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Understanding the AI's decision process
                    </p>
                </div>
            </div>
    `;
    
    // Add farmer explanation
    if (xai.farmer_explanation) {
        html += `
            <div class="farmer-explanation">
                ${formatFarmerExplanation(xai.farmer_explanation)}
            </div>
        `;
    }
    
    // Add feature importance
    if (xai.feature_importance && xai.feature_importance.length > 0) {
        html += `
            <div class="feature-importance">
                <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    📊 Most Important Factors
                </h4>
        `;
        
        xai.feature_importance.forEach((feature, index) => {
            const importancePercent = Math.round(feature.importance * 100);
            const statusClass = `feature-status ${feature.status}`;
            
            html += `
                <div class="importance-item">
                    <div class="flex-shrink-0">
                        <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                            ${feature.feature}
                        </span>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                Value: ${feature.value}
                            </span>
                            <span class="${statusClass}">${feature.status}</span>
                        </div>
                    </div>
                    <div class="importance-bar">
                        <div class="importance-fill" 
                             data-width="${importancePercent}" 
                             style="--fill-width: ${importancePercent}%"></div>
                    </div>
                    <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ${importancePercent}%
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    // Add environmental factors
    if (xai.environmental_factors && xai.environmental_factors.length > 0) {
        html += `
            <div class="recommendation-factors">
                <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 col-span-full">
                    🌍 Environmental Analysis
                </h4>
        `;
        
        xai.environmental_factors.forEach(factor => {
            html += `
                <div class="factor-card">
                    <div class="factor-header">
                        <span class="factor-title">${factor.factor}</span>
                        <span class="factor-value">${factor.value}</span>
                    </div>
                    <p class="factor-impact">${factor.impact}</p>
                    <p class="factor-recommendation">${factor.recommendation}</p>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    // Add farming recommendations
    if (xai.recommendations && xai.recommendations.length > 0) {
        html += `
            <div class="farming-recommendations">
                <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    💡 Farming Recommendations
                </h4>
        `;
        
        xai.recommendations.forEach(rec => {
            const priorityClass = `recommendation-priority ${rec.priority}`;
            const priorityIcon = rec.priority === 'high' ? '🔴' : 
                                rec.priority === 'medium' ? '🟡' : '🟢';
            
            html += `
                <div class="recommendation-item">
                    <div class="flex-shrink-0">
                        <span class="${priorityClass}">${priorityIcon} ${rec.priority}</span>
                    </div>
                    <div class="flex-grow">
                        <h5 class="font-medium text-gray-900 dark:text-gray-100">
                            ${rec.category}
                        </h5>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            ${rec.recommendation}
                        </p>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    html += `</div>`;
    return html;
}

// Format farmer explanation with markdown-like formatting
function formatFarmerExplanation(explanation) {
    return explanation
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
        .replace(/^(#{1,6})\s*(.*?)$/gm, '<h$1>$2</h$1>')  // Headers
        .replace(/•\s*(.*?)$/gm, '<li>$1</li>')            // List items
        .replace(/^\d+\.\s*(.*?)$/gm, '<li>$1</li>')       // Numbered list
        .replace(/\n\n/g, '</p><p>')                       // Paragraphs
        .replace(/\n/g, '<br>')                            // Line breaks
        .replace(/^/, '<p>')                               // Start paragraph
        .replace(/$/, '</p>');                             // End paragraph
}

// Animate feature importance bars
function animateFeatureBars() {
    const bars = document.querySelectorAll('.importance-fill');
    bars.forEach((bar, index) => {
        setTimeout(() => {
            const width = bar.dataset.width || '0';
            bar.style.width = width + '%';
        }, index * 200);
    });
}

// Toggle XAI explanation visibility
function toggleXAIExplanation(type) {
    const xaiElement = document.getElementById(`xai-${type}`);
    if (xaiElement) {
        xaiElement.style.display = xaiElement.style.display === 'none' ? 'block' : 'none';
    }
}

// ==================== UTILITY FUNCTIONS ====================

// Smooth scrolling for navigation links
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Helper function to scroll to features section
function scrollToFeatures() {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
        featuresSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Form validation helper
function validateForm(formId) {
    const form = document.getElementById(formId);
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('border-red-500');
            isValid = false;
        } else {
            field.classList.remove('border-red-500');
        }
    });
    
    return isValid;
}

// Loading state helper
function setLoadingState(element, isLoading, originalText = '') {
    if (isLoading) {
        element.disabled = true;
        element.innerHTML = '<div class="loader inline"></div> Loading...';
    } else {
        element.disabled = false;
        element.innerHTML = originalText;
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showToast('An unexpected error occurred. Please refresh the page.', 'error');
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Future PWA implementation
    });
}

console.log('🌱 Smart Agriculture Assistant initialized successfully!');