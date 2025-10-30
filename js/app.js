class GrowLux {
  constructor() {
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.isRunning = false;
    this.isPlantMode = true;
    this.animationId = null;
    this.currentCamera = 'environment';
    this.frameCount = 0;

    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.startBtn = document.getElementById('startBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.switchBtn = document.getElementById('switchBtn');
    this.plantModeBtn = document.getElementById('plantMode');
    this.rawModeBtn = document.getElementById('rawMode');
    this.measurementDisplay = document.getElementById('measurementDisplay');
    this.luxValue = document.getElementById('luxValue');
    this.percentage = document.getElementById('percentage');
    this.lightFill = document.getElementById('lightFill');
    this.status = document.getElementById('status');
    this.colorDisplay = document.getElementById('colorDisplay');
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.startMeasurement());
    this.stopBtn.addEventListener('click', () => this.stopMeasurement());
    this.switchBtn.addEventListener('click', () => this.switchCamera());
    this.plantModeBtn.addEventListener('click', () => this.setMode(true));
    this.rawModeBtn.addEventListener('click', () => this.setMode(false));
  }

  async startMeasurement() {
    if (this.isRunning) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your device does not support camera access.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.currentCamera }
      });

      this.video.srcObject = stream;
      this.isRunning = true;

      this.startBtn.classList.add('hidden');
      this.stopBtn.classList.remove('hidden');
      this.switchBtn.classList.remove('hidden');
      this.measurementDisplay.classList.remove('hidden');

      this.measureLight();
    } catch (error) {
      alert('Camera access denied or unavailable.');
      console.error('Camera error:', error);
    }
  }

  stopMeasurement() {
    this.isRunning = false;

    if (this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.startBtn.classList.remove('hidden');
    this.stopBtn.classList.add('hidden');
    this.switchBtn.classList.add('hidden');
    this.measurementDisplay.classList.add('hidden');
  }

  measureLight() {
    if (!this.isRunning) return;

    if (this.video.readyState >= 2) {
      this.canvas.width = this.video.videoWidth / 4;
      this.canvas.height = this.video.videoHeight / 4;
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const { brightness, avgColor } = this.calculateBrightnessAndColor(imageData.data);

      if (this.frameCount++ % 5 === 0) {
        this.updateDisplay(brightness, avgColor);
      }
    }

    this.animationId = requestAnimationFrame(() => this.measureLight());
  }

  calculateBrightnessAndColor(pixelData, step = 8) {
    let totalBrightness = 0;
    let totalR = 0, totalG = 0, totalB = 0;
    let count = 0;

    for (let i = 0; i < pixelData.length; i += 4 * step) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];

      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      totalBrightness += luminance;
      totalR += r;
      totalG += g;
      totalB += b;
      count++;
    }

    const avgBrightness = totalBrightness / count;
    const avgColor = {
      r: Math.round(totalR / count),
      g: Math.round(totalG / count),
      b: Math.round(totalB / count)
    };

    return { brightness: avgBrightness, avgColor };
  }

  updateDisplay(brightness, avgColor) {
    const percentage = Math.round((brightness / 255) * 100);
    const estimatedLux = Math.round(Math.pow(brightness / 255, 2.2) * 1000);

    if (this.isPlantMode) {
      this.updatePlantMode(percentage, avgColor);
    } else {
      this.updateRawMode(estimatedLux, percentage, avgColor);
    }

    this.lightFill.style.width = `${percentage}%`;
    this.lightFill.style.background = this.getColorForBrightness(percentage);
  }

  updatePlantMode(percentage, avgColor) {
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
    this.status.textContent = this.getLightAdvice(percentage, avgColor);
  }

  updateRawMode(lux, percentage, avgColor) {
    this.luxValue.textContent = `${lux} lux`;
    this.luxValue.style.color = '#2d5a2d';
    this.percentage.textContent = `${percentage}%`;
    this.status.textContent = this.getColorSummary(avgColor);
  }

  getLightAdvice(percentage, avgColor) {
    const spectrum = this.getDominantColor(avgColor);
    if (percentage < 20) return `Low light — move closer to source (${spectrum} light).`;
    if (percentage < 40) return `Good for low-light plants (${spectrum} tone).`;
    if (percentage < 70) return `Perfect for most plants (${spectrum} tone).`;
    return `Excellent for sun-loving plants (${spectrum} rich).`;
  }

  getColorSummary(avgColor) {
    const { r, g, b } = avgColor;
    const spectrum = this.getDominantColor(avgColor);
    return `Dominant tone:\n ${spectrum} (R:${r} G:${g} B:${b})`;
  }

  getDominantColor({ r, g, b }) {
    if (r > g && r > b) return 'red';
    if (g > r && g > b) return 'green';
    if (b > r && b > g) return 'blue';
    return 'balanced white';
  }

  getColorForBrightness(percentage) {
    if (percentage < 20) return '#e74c3c';
    if (percentage < 40) return '#f39c12';
    if (percentage < 70) return '#f1c40f';
    return '#27ae60';
  }

  async switchCamera() {
    if (!this.isRunning) return;

    this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';

    if (this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.currentCamera }
      });
      this.video.srcObject = stream;
    } catch (error) {
      console.error('Camera switch error:', error);
      this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
    }
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new GrowLux();
});
