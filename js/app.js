class GrowLux {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.isPlantMode = true;
        this.animationId = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.plantModeBtn = document.getElementById('plantMode');
        this.rawModeBtn = document.getElementById('rawMode');
        this.measurementDisplay = document.getElementById('measurementDisplay');
        this.luxValue = document.getElementById('luxValue');
        this.percentage = document.getElementById('percentage');
        this.lightFill = document.getElementById('lightFill');
        this.status = document.getElementById('status');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startMeasurement());
        this.stopBtn.addEventListener('click', () => this.stopMeasurement());
        this.plantModeBtn.addEventListener('click', () => this.setMode(true));
        this.rawModeBtn.addEventListener('click', () => this.setMode(false));
    }

    async startMeasurement() {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera
            });
            
            this.video.srcObject = stream;
            this.isRunning = true;
            
            // Update UI
            this.startBtn.classList.add('hidden');
            this.stopBtn.classList.remove('hidden');
            this.measurementDisplay.classList.remove('hidden');
            
            // Start measurement loop
            this.measureLight();
        } catch (error) {
            alert('Camera access denied or not available');
            console.error('Camera error:', error);
        }
    }

    stopMeasurement() {
        this.isRunning = false;
        
        // Stop camera stream
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }
        
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Update UI
        this.startBtn.classList.remove('hidden');
        this.stopBtn.classList.add('hidden');
        this.measurementDisplay.classList.add('hidden');
    }

    measureLight() {
        if (!this.isRunning) return;
        
        // Set canvas size to match video
        this.canvas.width = this.video.videoWidth || 640;
        this.canvas.height = this.video.videoHeight || 480;
        
        // Draw current video frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Get image data and calculate brightness
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const brightness = this.calculateBrightness(imageData.data);
        
        // Update display
        this.updateDisplay(brightness);
        
        // Continue measurement loop
        this.animationId = requestAnimationFrame(() => this.measureLight());
    }

    calculateBrightness(pixelData) {
        let totalBrightness = 0;
        const pixelCount = pixelData.length / 4; // RGBA format
        
        // Calculate average brightness using luminance formula
        // Y = 0.299*R + 0.587*G + 0.114*B (standard luminance weights)
        for (let i = 0; i < pixelData.length; i += 4) {
            const r = pixelData[i];
            const g = pixelData[i + 1];
            const b = pixelData[i + 2];
            
            // Calculate luminance (perceived brightness)
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += luminance;
        }
        
        // Return average brightness (0-255 scale)
        return totalBrightness / pixelCount;
    }

    updateDisplay(brightness) {
        // Convert brightness to percentage (0-100)
        const percentage = Math.round((brightness / 255) * 100);
        
        // Estimate lux value (rough approximation)
        // This is a simplified conversion - real lux meters use calibrated sensors
        const estimatedLux = Math.round(brightness * 4); // Rough scaling factor
        
        if (this.isPlantMode) {
            this.updatePlantMode(percentage);
        } else {
            this.updateRawMode(estimatedLux, percentage);
        }
        
        // Update progress bar
        this.lightFill.style.width = `${percentage}%`;
        this.lightFill.style.background = this.getColorForBrightness(percentage);
    }

    updatePlantMode(percentage) {
        let status, color;
        
        if (percentage < 20) {
            status = 'Low Light';
            color = '#e74c3c';
        } else if (percentage < 60) {
            status = 'Moderate Light';
            color = '#f39c12';
        } else {
            status = 'Good Light';
            color = '#27ae60';
        }
        
        this.luxValue.textContent = status;
        this.luxValue.style.color = color;
        this.percentage.textContent = `${percentage}%`;
        this.status.textContent = this.getLightAdvice(percentage);
    }

    updateRawMode(lux, percentage) {
        this.luxValue.textContent = `${lux} lux`;
        this.luxValue.style.color = '#2d5a2d';
        this.percentage.textContent = `${percentage}%`;
        this.status.textContent = 'Raw Light Measurement';
    }

    getLightAdvice(percentage) {
        if (percentage < 20) return 'Move to brighter location';
        if (percentage < 40) return 'Good for low-light plants';
        if (percentage < 70) return 'Perfect for most plants';
        return 'Great for sun-loving plants';
    }

    getColorForBrightness(percentage) {
        if (percentage < 20) return '#e74c3c';
        if (percentage < 40) return '#f39c12';
        if (percentage < 70) return '#f1c40f';
        return '#27ae60';
    }

    setMode(isPlantMode) {
        this.isPlantMode = isPlantMode;
        
        if (isPlantMode) {
            this.plantModeBtn.classList.add('active');
            this.rawModeBtn.classList.remove('active');
        } else {
            this.plantModeBtn.classList.remove('active');
            this.rawModeBtn.classList.add('active');
        }
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GrowLux();
});