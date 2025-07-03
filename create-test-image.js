const { createCanvas } = require('canvas');
const fs = require('fs');

// Crear una imagen de ejemplo de tamaño variable con colores variados para probar
function createTestImage(width = 64, height = 64) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Crear un gradiente colorido para probar la conversión
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Crear un patrón de colores basado en la posición
            const r = Math.floor((x / width) * 255);
            const g = Math.floor((y / height) * 255);
            const b = Math.floor(((x + y) / (width + height)) * 255);
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Guardar la imagen de prueba
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('test_image.png', buffer);
    console.log(`✅ Imagen de prueba creada: test_image.png (${width}x${height})`);
}

// Crear imagen de 64x64 por defecto, pero se puede cambiar
const width = process.argv[2] ? parseInt(process.argv[2]) : 64;
const height = process.argv[3] ? parseInt(process.argv[3]) : 64;

createTestImage(width, height);
