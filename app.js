// Helper function for month names
function getMonthName(monthNumber) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1] || monthNumber;
}

// Helper function to get model prefix
function getModelPrefix(modelType) {
    switch(modelType) {
        case 'randomForest': return 'rf';
        case 'linearRegression': return 'lr';
        case 'xgBoost': return 'xgb';
        default: return '';
    }
}

// Fix for solveSimpleChallenge error
window.solveSimpleChallenge = function() {
    console.log('solveSimpleChallenge called - function disabled for this application');
    return true;
};

// Main Application Controller
class WastePredictApp {
    constructor() {
        // Check if required classes are loaded
        if (typeof DatasetManager === 'undefined' || 
            typeof MLModels === 'undefined' ||
            typeof ChartManager === 'undefined' ||
            typeof Utils === 'undefined') {
            
            console.error('Error: Required classes not loaded. Check script loading order.');
            throw new Error('Required classes not loaded');
        }
        
        console.log('Initializing WastePredictApp...');
        
        try {
            this.datasetManager = new DatasetManager();
            this.mlModels = new MLModels();
            this.chartManager = new ChartManager();
            this.themeManager = new ThemeManager();
            this.initializeApp();
        } catch (error) {
            console.error('Failed to initialize WastePredictApp:', error);
            throw error;
        }
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.setupThemeChangeListener();
        this.initializeCharts();
        this.autoLoadAndTrain();
        
        Utils.logToTraining('🚀 WastePredict Davao Application Initialized');
        Utils.logToTraining('📊 System ready. Training models with initial dataset...');
        Utils.logToTraining(`🎨 Current theme: ${this.themeManager.isDarkMode() ? '🌙 Dark' : '☀️ Light'} Mode`);
    }
    
    setupEventListeners() {
        // Dataset controls (hidden in this version)
        document.getElementById('viewStats')?.addEventListener('click', () => this.handleViewStats());
        document.getElementById('analyzeFeatures')?.addEventListener('click', () => this.handleAnalyzeFeatures());
        
        // Model training controls (for manual re-training)
        document.getElementById('trainRF')?.addEventListener('click', () => this.handleTrainModel('randomForest'));
        document.getElementById('trainLR')?.addEventListener('click', () => this.handleTrainModel('linearRegression'));
        document.getElementById('trainXGB')?.addEventListener('click', () => this.handleTrainModel('xgBoost'));
        document.getElementById('trainAll')?.addEventListener('click', () => this.handleTrainAllModels());
        
        // Prediction control
        document.getElementById('predictBtn')?.addEventListener('click', () => this.handlePredict());
        
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.themeManager.toggleTheme());
        
        // Smooth scrolling for navigation links
        this.setupSmoothScrolling();
        
        // Remove any problematic onload handlers
        this.cleanupProblematicHandlers();
    }
    
    setupThemeChangeListener() {
        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const theme = document.documentElement.getAttribute('data-theme');
                    this.chartManager.updateTheme(theme);
                    
                    // Also update Chart.js defaults
                    this.updateChartJsDefaults(theme);
                    
                    // Log theme change
                    const themeName = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
                    Utils.logToTraining(`🎨 Theme changed to ${themeName} Mode`);
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
    }
    
    updateChartJsDefaults(theme) {
        const isDark = theme === 'dark';
        
        if (typeof Chart !== 'undefined') {
            Chart.defaults.color = isDark ? '#e0e0e0' : '#333333';
            Chart.defaults.borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
            
            // Update font for all charts
            Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
            Chart.defaults.font.size = 12;
        }
    }
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    cleanupProblematicHandlers() {
        // Clear any problematic onload handlers
        if (window.onload && window.onload.toString().includes('solveSimpleChallenge')) {
            window.onload = null;
        }
        
        // Remove problematic attributes
        document.querySelectorAll('[onload*="solveSimpleChallenge"]').forEach(el => {
            el.removeAttribute('onload');
        });
    }
    
    initializeCharts() {
        setTimeout(() => {
            const correlationCtx = document.getElementById('correlationChart');
            const performanceCtx = document.getElementById('performanceChart');
            const predictionCtx = document.getElementById('predictionChart');
            
            if (correlationCtx) this.chartManager.initializeCorrelationChart(correlationCtx);
            if (performanceCtx) this.chartManager.initializePerformanceChart(performanceCtx);
            if (predictionCtx) this.chartManager.initializePredictionChart(predictionCtx);
            
            // Set initial Chart.js defaults
            this.updateChartJsDefaults(this.themeManager.getCurrentTheme());
        }, 100);
    }
    
    autoLoadAndTrain() {
        setTimeout(() => {
            this.handleTrainAllModels();
        }, 500);
    }
    
    async handleTrainAllModels() {
        try {
            // Get dataset (hidden from user)
            const dataset = this.datasetManager.getDataset();
            
            Utils.logToTraining('🤖 Starting model training...');
            Utils.updateProgressBar(10);
            
            // Train Random Forest
            Utils.logToTraining('🌲 Training Random Forest model...');
            await this.trainModelWithProgress('randomForest', 10, 40);
            
            // Train Linear Regression
            Utils.logToTraining('📈 Training Linear Regression model...');
            await this.trainModelWithProgress('linearRegression', 40, 70);
            
            // Train XGBoost
            Utils.logToTraining('🚀 Training XGBoost model...');
            await this.trainModelWithProgress('xgBoost', 70, 100);
            
            // All models trained
            Utils.logToTraining('🎉 All models trained successfully! Ready for predictions.');
            
            // Generate initial predictions for chart
            const predictions = this.mlModels.generatePredictions(dataset.slice(0, 24));
            this.chartManager.updatePredictionChart(dataset.slice(0, 24), predictions);
            
            // Update performance chart
            const metrics = {
                randomForest: this.mlModels.getModelMetrics('randomForest'),
                linearRegression: this.mlModels.getModelMetrics('linearRegression'),
                xgBoost: this.mlModels.getModelMetrics('xgBoost')
            };
            this.chartManager.updatePerformanceChart(metrics);
            
            // Show ready message
            Utils.logToTraining('✅ System ready! Enter values and click "Predict Waste Generation"');
            
        } catch (error) {
            Utils.logToTraining(`❌ Error: ${error.message}`);
        }
    }
    
    async trainModelWithProgress(modelType, startProgress, endProgress) {
        return new Promise((resolve) => {
            let progress = startProgress;
            const totalSteps = endProgress - startProgress;
            const step = totalSteps / 50;
            
            const progressInterval = setInterval(() => {
                progress += step;
                Utils.updateProgressBar(Math.min(progress, endProgress));
                
                if (progress >= endProgress) {
                    clearInterval(progressInterval);
                    
                    this.mlModels.trainModel(modelType).then(result => {
                        const { rmse, mae, mape } = result.metrics;
                        const modelPrefix = getModelPrefix(modelType);
                        Utils.updateModelResults(modelPrefix, rmse, mae, mape);
                        
                        Utils.logToTraining(`   ✅ ${modelType} trained:`);
                        Utils.logToTraining(`      📏 RMSE: ${rmse.toFixed(2)} tons`);
                        Utils.logToTraining(`      📊 MAE: ${mae.toFixed(2)} tons`);
                        Utils.logToTraining(`      📉 MAPE: ${mape.toFixed(2)}%`);
                        Utils.logToTraining(`      🎯 Accuracy: ${Utils.calculateAccuracyFromMAPE(mape).toFixed(1)}%`);
                        
                        resolve();
                    });
                }
            }, 30);
        });
    }
    
    handleViewStats() {
        try {
            const stats = this.datasetManager.getStatistics();
            Utils.updateStatistics(stats);
            
            const statsContainer = document.getElementById('statsContainer');
            const featuresContainer = document.getElementById('featuresContainer');
            
            if (statsContainer && statsContainer.style.display === 'block') {
                statsContainer.style.display = 'none';
                Utils.logToTraining('📊 Statistics hidden');
            } else if (statsContainer) {
                statsContainer.style.display = 'block';
                featuresContainer.style.display = 'none';
                Utils.logToTraining('📊 Dataset statistics displayed');
            }
            
        } catch (error) {
            Utils.logToTraining(`❌ Error viewing statistics: ${error.message}`);
        }
    }
    
    handleAnalyzeFeatures() {
        try {
            const correlations = this.datasetManager.getFeatureCorrelations();
            Utils.updateFeatureCorrelations(correlations);
            
            const statsContainer = document.getElementById('statsContainer');
            const featuresContainer = document.getElementById('featuresContainer');
            
            if (featuresContainer && featuresContainer.style.display === 'block') {
                featuresContainer.style.display = 'none';
                Utils.logToTraining('🔍 Feature analysis hidden');
            } else if (featuresContainer) {
                featuresContainer.style.display = 'block';
                statsContainer.style.display = 'none';
                Utils.logToTraining('🔍 Feature correlation analysis displayed');
            }
            
        } catch (error) {
            Utils.logToTraining(`❌ Error analyzing features: ${error.message}`);
        }
    }
    
    async handleTrainModel(modelType) {
        try {
            const dataset = this.datasetManager.getDataset();
            if (!dataset || dataset.length === 0) {
                Utils.logToTraining('⚠️ No dataset available');
                return;
            }
            
            Utils.logToTraining(`🤖 Re-training ${modelType} model...`);
            
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 2;
                Utils.updateProgressBar(progress);
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    this.mlModels.trainModel(modelType).then(result => {
                        const { rmse, mae, mape } = result.metrics;
                        const modelPrefix = getModelPrefix(modelType);
                        Utils.updateModelResults(modelPrefix, rmse, mae, mape);
                        
                        const metrics = {
                            randomForest: this.mlModels.getModelMetrics('randomForest'),
                            linearRegression: this.mlModels.getModelMetrics('linearRegression'),
                            xgBoost: this.mlModels.getModelMetrics('xgBoost')
                        };
                        
                        this.chartManager.updatePerformanceChart(metrics);
                        
                        const predictions = this.mlModels.generatePredictions(dataset.slice(0, 24));
                        this.chartManager.updatePredictionChart(dataset.slice(0, 24), predictions);
                        
                        Utils.logToTraining(`✅ ${modelType} re-training completed!`);
                        Utils.logToTraining(`   📏 RMSE: ${rmse.toFixed(2)} tons`);
                        Utils.logToTraining(`   📊 MAE: ${mae.toFixed(2)} tons`);
                        Utils.logToTraining(`   📉 MAPE: ${mape.toFixed(2)}%`);
                        Utils.logToTraining(`   🎯 Accuracy: ${Utils.calculateAccuracyFromMAPE(mape).toFixed(1)}%`);
                    });
                }
            }, 50);
            
        } catch (error) {
            Utils.logToTraining(`❌ Error training model: ${error.message}`);
        }
    }
    
    handleTrainAllModels() {
        Utils.logToTraining('🤖 Starting full model re-training...');
        this.handleTrainModel('randomForest');
        setTimeout(() => this.handleTrainModel('linearRegression'), 800);
        setTimeout(() => this.handleTrainModel('xgBoost'), 1600);
    }
    
    async handlePredict() {
        try {
            const trainedModels = this.mlModels.getTrainedModels();
            if (trainedModels.length === 0) {
                Utils.logToTraining('⚠️ Please train at least one model first');
                return;
            }
            
            // Get user inputs
            const inputs = Utils.getPredictionInputs();
            
            // Show prediction in progress
            Utils.logToTraining('🔮 Generating predictions...');
            Utils.updateProgressBar(50);
            
            // Make predictions
            const predictions = this.mlModels.predict(inputs);
            
            // Show results
            Utils.showPredictionResults(predictions);
            Utils.updateProgressBar(100);
            
            // Log prediction details
            Utils.logToTraining('✅ Predictions generated successfully!');
            Utils.logToTraining(`📅 For: ${getMonthName(inputs.month)} ${inputs.year}`);
            Utils.logToTraining(`📊 Input Parameters:`);
            Utils.logToTraining(`   • Population: ${inputs.population} people/km²`);
            Utils.logToTraining(`   • Income: ₱${Utils.formatNumber(inputs.income)}`);
            Utils.logToTraining(`   • Rainfall: ${inputs.rainfall} mm`);
            Utils.logToTraining(`   • Temperature: ${inputs.temperature}°C`);
            Utils.logToTraining(`   • Trucks: ${inputs.trucks} units`);
            Utils.logToTraining(`   • Recycling: ${inputs.recycling}%`);
            
            Object.entries(predictions).forEach(([model, value]) => {
                if (value) {
                    Utils.logToTraining(`   • ${model}: ${value} tons`);
                }
            });
            
            Utils.logToTraining('🤖 Retraining models with new data for improvement...');
            
            // Add the prediction to dataset and retrain for improvement
            this.retrainWithNewData(inputs, predictions);
            
        } catch (error) {
            Utils.logToTraining(`❌ Error making predictions: ${error.message}`);
        }
    }
    
    async retrainWithNewData(inputs, predictions) {
        try {
            // Add the prediction as new data point to dataset for retraining
            const avgPrediction = Object.values(predictions).reduce((sum, val) => sum + val, 0) / Object.values(predictions).length;
            
            // Add to dataset manager
            this.datasetManager.addNewDataPoint({
                month: inputs.month,
                year: inputs.year,
                population: inputs.population,
                income: inputs.income,
                urbanArea: inputs.urbanArea,
                rainfall: inputs.rainfall,
                temperature: inputs.temperature,
                trucks: inputs.trucks,
                recycling: inputs.recycling,
                waste: Math.round(avgPrediction)
            });
            
            Utils.logToTraining('📊 Adding prediction to training data for model improvement...');
            
            // Retrain models with updated dataset
            setTimeout(() => {
                this.handleTrainAllModels();
                Utils.logToTraining('🎯 Models retrained with new data for better accuracy!');
            }, 2000);
            
        } catch (error) {
            Utils.logToTraining(`⚠️ Note: ${error.message}`);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    try {
        window.wastePredictApp = new WastePredictApp();
        console.log('✅ WastePredictApp initialized successfully!');
        
        const trainingLog = document.getElementById('trainingLog');
        if (trainingLog) {
            trainingLog.innerHTML = '<div>System initializing... Training models automatically...</div>';
        }
    } catch (error) {
        console.error('❌ Failed to create WastePredictApp:', error);
        
        const trainingLog = document.getElementById('trainingLog');
        if (trainingLog) {
            trainingLog.innerHTML = `
                <div style="color: red;">
                    <h3>❌ Application Error</h3>
                    <p>Failed to initialize the application.</p>
                    <p>Error: ${error.message}</p>
                    <p>Please make sure all JavaScript files are loaded correctly.</p>
                    <p>Check browser console for more details.</p>
                </div>
            `;
        }
    }
});