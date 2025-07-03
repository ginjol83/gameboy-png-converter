import { createCanvas } from 'canvas';
import fs from 'fs';

// Create a variable-size example image with varied colors for testing
function createTestImage(width = 64, height = 64) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Create a colorful gradient to test the conversion
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Create a color pattern based on position
            const r = Math.floor((x / width) * 255);
            const g = Math.floor((y / height) * 255);
            const b = Math.floor(((x + y) / (width + height)) * 255);
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Save the test image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('test_image.png', buffer);
    console.log(`✅ Test image created: test_image.png (${width}x${height})`);
}

// Create 64x64 image by default, but can be changed
const width = process.argv[2] ? parseInt(process.argv[2]) : 64;
const height = process.argv[3] ? parseInt(process.argv[3]) : 64;

createTestImage(width, height);
