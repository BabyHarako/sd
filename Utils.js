class Utils {
    static updateProgressBar(percentage) {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.textContent = `${percentage}%`;
            
            // Change color based on percentage
            if (percentage >= 80) {
                progressBar.style.background = 'linear-gradient(90deg, #4CAF50, #2E7D32)';
            } else if (percentage >= 50) {
                progressBar.style.background = 'linear-gradient(90deg, #FF9800, #F57C00)';
            } else {
                progressBar.style.background = 'linear-gradient(90deg, #F44336, #D32F2F)';
            }
        }
    }
    
    static logToTraining(message) {
        const trainingLog = document.getElementById('trainingLog');
        if (trainingLog) {
            const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const logEntry = document.createElement('div');
            logEntry.innerHTML = `<span style="color: var(--text-light);">[${timestamp}]</span> ${message}`;
            trainingLog.appendChild(logEntry);
            trainingLog.scrollTop = trainingLog.scrollHeight;
            
            // Keep only last 50 messages
            const messages = trainingLog.querySelectorAll('div');
            if (messages.length > 50) {
                for (let i = 0; i < messages.length - 50; i++) {
                    messages[i].remove();
                }
            }
        }
    }
    
    static calculateAccuracyFromMAPE(mape) {
        return Math.max(0, 100 - mape);
    }
    
    static getAccuracyClass(value) {
        if (value > 95) return 'high-accuracy';
        if (value > 90) return 'medium-accuracy';
        return 'low-accuracy';
    }
    
    static updateModelResults(modelPrefix, rmse, mae, mape) {
        const accuracy = this.calculateAccuracyFromMAPE(mape);
        
        const accuracyElement = document.getElementById(`${modelPrefix}Accuracy`);
        const rmseElement = document.getElementById(`${modelPrefix}RMSE`);
        const maeElement = document.getElementById(`${modelPrefix}MAE`);
        const mapeElement = document.getElementById(`${modelPrefix}MAPE`);
        
        if (accuracyElement) {
            accuracyElement.textContent = `${accuracy.toFixed(1)}%`;
            accuracyElement.className = `accuracy-value ${this.getAccuracyClass(accuracy)}`;
        }
        
        if (rmseElement) rmseElement.textContent = rmse.toFixed(2);
        if (maeElement) maeElement.textContent = mae.toFixed(2);
        if (mapeElement) mapeElement.textContent = mape.toFixed(2);
    }
    
    static updateStatistics(stats) {
        const elements = ['avgWaste', 'minWaste', 'maxWaste', 'wasteRange', 'startYear', 'endYear', 
                         'totalRecords', 'timeSpan', 'avgPopulation', 'avgIncome', 'avgRainfall', 'avgTemperature'];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element && stats[id]) {
                element.textContent = typeof stats[id] === 'number' ? stats[id].toFixed(1) : stats[id];
            }
        });
    }
    
    static updateFeatureCorrelations(correlations) {
        const elements = ['corrPopulation', 'corrIncome', 'corrRainfall', 'corrTemperature', 'corrTrucks', 'corrRecycling'];
        
        elements.forEach(id => {
            const feature = id.replace('corr', '').toLowerCase();
            const element = document.getElementById(id);
            if (element && correlations[feature] !== undefined) {
                element.textContent = correlations[feature].toFixed(3);
            }
        });
    }
    
    static getPredictionInputs() {
        return {
            population: parseFloat(document.getElementById('population').value) || 8500,
            income: parseFloat(document.getElementById('income').value) || 25000,
            urbanArea: parseFloat(document.getElementById('urbanArea').value) || 280,
            rainfall: parseFloat(document.getElementById('rainfall').value) || 150,
            temperature: parseFloat(document.getElementById('temperature').value) || 28,
            trucks: parseFloat(document.getElementById('trucks').value) || 45,
            recycling: parseFloat(document.getElementById('recycling').value) || 18,
            month: parseInt(document.getElementById('month').value) || 1,
            year: parseInt(document.getElementById('year').value) || 2024
        };
    }
    
    static showPredictionResults(predictions) {
        // Clear previous results with animation
        const resultElement = document.getElementById('predictionResult');
        if (!resultElement) return;
        
        resultElement.style.opacity = '0';
        
        setTimeout(() => {
            // Update prediction values
            if (predictions.randomForest) {
                document.getElementById('rfPrediction').textContent = `${predictions.randomForest} tons`;
            }
            if (predictions.linearRegression) {
                document.getElementById('lrPrediction').textContent = `${predictions.linearRegression} tons`;
            }
            if (predictions.xgBoost) {
                document.getElementById('xgbPrediction').textContent = `${predictions.xgBoost} tons`;
            }
            
            // Show result with animation
            resultElement.style.display = 'block';
            setTimeout(() => {
                resultElement.style.opacity = '1';
            }, 10);
            
            // Scroll to results
            resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }
    
    static formatNumber(num) {
        return num.toLocaleString();
    }
    
    static showLoading() {
        const predictBtn = document.getElementById('predictBtn');
        if (predictBtn) {
            const originalText = predictBtn.innerHTML;
            predictBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Predicting...';
            predictBtn.disabled = true;
            
            return () => {
                predictBtn.innerHTML = originalText;
                predictBtn.disabled = false;
            };
        }
        return () => {};
    }
    
    static showError(message) {
        this.logToTraining(`<span style="color: #f44336;">❌ ${message}</span>`);
        
        // Show error alert
        const errorAlert = document.createElement('div');
        errorAlert.className = 'error-alert';
        errorAlert.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        errorAlert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(errorAlert);
        
        setTimeout(() => {
            errorAlert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorAlert.remove(), 300);
        }, 5000);
    }
    
    static showSuccess(message) {
        this.logToTraining(`<span style="color: #4CAF50;">✅ ${message}</span>`);
    }
}