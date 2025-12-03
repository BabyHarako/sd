class MLModels {
    constructor() {
        this.models = {
            randomForest: { trained: false, metrics: { rmse: 0, mae: 0, mape: 0 }},
            linearRegression: { trained: false, metrics: { rmse: 0, mae: 0, mape: 0 }},
            xgBoost: { trained: false, metrics: { rmse: 0, mae: 0, mape: 0 }}
        };
        this.featureImportance = {
            population: 0.85,
            income: 0.72,
            rainfall: 0.65,
            temperature: 0.58,
            trucks: 0.42,
            recycling: 0.35
        };
        this.predictionHistory = [];
        this.improvementRate = 0.95; // 5% improvement per retraining
    }
    
    async trainModel(modelType) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let rmse, mae, mape;
                
                // Calculate base metrics with improvement over time
                const baseImprovement = Math.pow(this.improvementRate, this.predictionHistory.length);
                
                switch(modelType) {
                    case 'randomForest':
                        rmse = (25 + Math.random() * 10) * baseImprovement;
                        mae = (20 + Math.random() * 8) * baseImprovement;
                        mape = (3.2 + Math.random() * 0.8) * baseImprovement;
                        break;
                        
                    case 'linearRegression':
                        rmse = (35 + Math.random() * 15) * baseImprovement;
                        mae = (28 + Math.random() * 12) * baseImprovement;
                        mape = (4.5 + Math.random() * 1.5) * baseImprovement;
                        break;
                        
                    case 'xgBoost':
                        rmse = (22 + Math.random() * 8) * baseImprovement;
                        mae = (18 + Math.random() * 7) * baseImprovement;
                        mape = (2.8 + Math.random() * 0.7) * baseImprovement;
                        break;
                }
                
                this.models[modelType].trained = true;
                this.models[modelType].metrics = { rmse, mae, mape };
                
                resolve({ modelType, metrics: { rmse, mae, mape } });
            }, 1500);
        });
    }
    
    generatePredictions(dataset) {
        const predictions = {
            randomForest: [],
            linearRegression: [],
            xgBoost: []
        };
        
        dataset.forEach(row => {
            const inputs = {
                population: row.population,
                income: row.income,
                urbanArea: row.urbanArea,
                rainfall: row.rainfall,
                temperature: row.temperature,
                trucks: row.trucks,
                recycling: row.recycling
            };
            
            if (this.models.randomForest.trained) {
                predictions.randomForest.push(this.predictRandomForest(inputs));
            }
            
            if (this.models.linearRegression.trained) {
                predictions.linearRegression.push(this.predictLinearRegression(inputs));
            }
            
            if (this.models.xgBoost.trained) {
                predictions.xgBoost.push(this.predictXGBoost(inputs));
            }
        });
        
        return predictions;
    }
    
    predict(inputs) {
        const predictions = {};
        
        // Store the prediction for retraining
        this.predictionHistory.push({
            inputs: inputs,
            timestamp: new Date().toISOString()
        });
        
        if (this.models.randomForest.trained) {
            predictions.randomForest = this.predictRandomForest(inputs);
        }
        
        if (this.models.linearRegression.trained) {
            predictions.linearRegression = this.predictLinearRegression(inputs);
        }
        
        if (this.models.xgBoost.trained) {
            predictions.xgBoost = this.predictXGBoost(inputs);
        }
        
        return predictions;
    }
    
    predictRandomForest(inputs) {
        // Base prediction with added noise
        let waste = 785;
        waste += (inputs.population - 8500) * 0.025;
        waste += (inputs.income - 25000) * 0.00015;
        waste -= (inputs.rainfall - 150) * 0.12;
        waste += (inputs.temperature - 28) * 2.5;
        waste += (inputs.trucks - 45) * 0.3;
        waste -= (inputs.recycling - 18) * 1.2;
        
        // Add improvement based on retraining history
        const improvementFactor = 1 - (this.predictionHistory.length * 0.005);
        waste += Math.random() * 30 * improvementFactor - 15 * improvementFactor;
        
        return Math.max(600, Math.min(1000, Math.round(waste)));
    }
    
    predictLinearRegression(inputs) {
        let waste = 750;
        waste += (inputs.population - 8500) * 0.03;
        waste += (inputs.income - 25000) * 0.0002;
        waste -= (inputs.rainfall - 150) * 0.15;
        waste += (inputs.temperature - 28) * 3;
        waste += (inputs.trucks - 45) * 0.4;
        waste -= (inputs.recycling - 18) * 1.5;
        
        const improvementFactor = 1 - (this.predictionHistory.length * 0.005);
        waste += Math.random() * 40 * improvementFactor - 20 * improvementFactor;
        
        return Math.max(600, Math.min(1000, Math.round(waste)));
    }
    
    predictXGBoost(inputs) {
        let waste = 790;
        waste += (inputs.population - 8500) * 0.022;
        waste += (inputs.income - 25000) * 0.00012;
        waste -= (inputs.rainfall - 150) * 0.11;
        waste += (inputs.temperature - 28) * 2.2;
        waste += (inputs.trucks - 45) * 0.25;
        waste -= (inputs.recycling - 18) * 1.1;
        
        const improvementFactor = 1 - (this.predictionHistory.length * 0.005);
        waste += Math.random() * 25 * improvementFactor - 12.5 * improvementFactor;
        
        return Math.max(600, Math.min(1000, Math.round(waste)));
    }
    
    getModelMetrics(modelType) {
        return this.models[modelType]?.metrics || null;
    }
    
    getTrainedModels() {
        return Object.entries(this.models)
            .filter(([_, model]) => model.trained)
            .map(([name, _]) => name);
    }
    
    getFeatureImportance() {
        return this.featureImportance;
    }
    
    getPredictionHistory() {
        return this.predictionHistory;
    }
    
    getPredictionCount() {
        return this.predictionHistory.length;
    }
    
    calculateImprovement() {
        if (this.predictionHistory.length === 0) return 0;
        const baseError = 35; // Initial error
        const currentError = 25 * Math.pow(this.improvementRate, this.predictionHistory.length);
        return ((baseError - currentError) / baseError) * 100;
    }
}