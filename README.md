# 🌿 GrowLux

A responsive web application that uses your device camera to measure ambient light intensity for plants.

## Features

- 📱 Mobile-responsive design
- 📷 Camera-based light measurement
- 🌱 Plant Mode: Light levels optimized for plant care
- 📊 Raw Mode: Numeric lux values and percentages
- 🎨 Nature-inspired green color palette
- 🔄 Real-time light monitoring

## How it works

GrowLux captures video frames from your device camera and analyzes pixel brightness using the standard luminance formula (Y = 0.299*R + 0.587*G + 0.114*B) to estimate ambient light levels.

## Usage

1. Open `index.html` in a modern web browser
2. Click "Start Measurement" to grant camera access
3. Point your camera at the area you want to measure
4. Toggle between Plant Mode and Raw Mode as needed

## Deployment

The project includes a GitHub Actions workflow that automatically deploys to your server when changes are pushed to the main branch.

### Setup

1. Add these secrets to your GitHub repository:
   - `SSH_USERNAME`: Your server username
   - `SSH_PRIVATE_KEY`: Your SSH private key

2. Push to main branch to trigger deployment

## File Structure

```
GrowLux/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Stylesheet
├── js/
│   └── app.js          # JavaScript functionality
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions workflow
└── README.md           # This file
```

## Browser Compatibility

Requires a modern browser with:
- MediaDevices API support
- Canvas API support
- ES6+ JavaScript features

## License

MIT License
