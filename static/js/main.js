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

// Enhanced prediction function with better UI feedback
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
            resultDiv.innerHTML = createResultCard(data.prediction, confidencePercent, type);
            showToast(`Analysis complete: ${data.prediction}`, 'success');
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

// Enhanced crop recommendation
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
            resultDiv.innerHTML = createCropRecommendationCard(resultData.recommendations);
            showToast('Crop recommendations generated!', 'success');
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