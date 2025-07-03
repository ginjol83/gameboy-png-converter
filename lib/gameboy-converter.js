const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Paleta de colores de Game Boy (4 tonos de verde)
const GAMEBOY_PALETTE = [
    { r: 155, g: 188, b: 15 },   // Verde más claro
    { r: 139, g: 172, b: 15 },   // Verde claro
    { r: 48, g: 98, b: 48 },     // Verde oscuro
    { r: 15, g: 56, b: 15 }      // Verde más oscuro
];

/**
 * Calcula la distancia euclidiana entre dos colores RGB
 * @param {Object} color1 - Color RGB {r, g, b}
 * @param {Object} color2 - Color RGB {r, g, b}
 * @returns {number} Distancia euclidiana
 */
function colorDistance(color1, color2) {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Encuentra el color más cercano en la paleta de Game Boy
 * @param {number} r - Componente rojo (0-255)
 * @param {number} g - Componente verde (0-255)
 * @param {number} b - Componente azul (0-255)
 * @returns {Object} Color más cercano {r, g, b}
 */
function findClosestGameBoyColor(r, g, b) {
    let minDistance = Infinity;
    let closestColor = GAMEBOY_PALETTE[0];
    
    for (const paletteColor of GAMEBOY_PALETTE) {
        const distance = colorDistance({ r, g, b }, paletteColor);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = paletteColor;
        }
    }
    
    return closestColor;
}

/**
 * Convierte colores de Game Boy a valores de 2 bits para GBDK
 * @param {number} r - Componente rojo
 * @param {number} g - Componente verde
 * @param {number} b - Componente azul
 * @returns {number} Valor de 2 bits (0-3)
 */
function colorToGBDKValue(r, g, b) {
    // Mapear colores de Game Boy a valores de 2 bits (0-3)
    if (r === 155 && g === 188 && b === 15) return 0; // Verde más claro
    if (r === 139 && g === 172 && b === 15) return 1; // Verde claro  
    if (r === 48 && g === 98 && b === 48) return 2;   // Verde oscuro
    if (r === 15 && g === 56 && b === 15) return 3;   // Verde más oscuro
    return 0; // Por defecto
}

/**
 * Convierte una imagen PNG a paleta de Game Boy
 * @param {string} inputPath - Ruta del archivo de entrada
 * @param {string} outputPath - Ruta del archivo de salida
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.verbose - Mostrar información detallada
 * @returns {Promise<Object>} Información sobre la conversión
 */
async function convertToGameBoy(inputPath, outputPath, options = {}) {
    const { verbose = true } = options;
    
    try {
        // Cargar la imagen
        const image = await loadImage(inputPath);
        
        if (verbose) {
            console.log(`📏 Procesando imagen de ${image.width}x${image.height} píxeles`);
        }
        
        // Crear canvas para procesar la imagen (usar el tamaño original)
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        // Dibujar la imagen original
        ctx.drawImage(image, 0, 0);
        
        // Obtener los datos de píxeles (usar las dimensiones originales)
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        
        // Convertir cada píxel a la paleta de Game Boy
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // data[i + 3] es el canal alpha, lo mantenemos
            
            // Encontrar el color más cercano en la paleta
            const gameBoyColor = findClosestGameBoyColor(r, g, b);
            
            // Reemplazar el color
            data[i] = gameBoyColor.r;
            data[i + 1] = gameBoyColor.g;
            data[i + 2] = gameBoyColor.b;
            // Mantener el canal alpha original
        }
        
        // Aplicar los nuevos datos de píxeles
        ctx.putImageData(imageData, 0, 0);
        
        // Guardar la imagen convertida
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        if (verbose) {
            console.log(`✅ Imagen convertida exitosamente: ${outputPath}`);
        }
        
        return {
            success: true,
            inputPath,
            outputPath,
            width: image.width,
            height: image.height,
            message: `Imagen convertida exitosamente: ${outputPath}`
        };
        
    } catch (error) {
        const errorMessage = `Error al convertir la imagen: ${error.message}`;
        if (verbose) {
            console.error(`❌ ${errorMessage}`);
        }
        
        return {
            success: false,
            error: errorMessage,
            inputPath,
            outputPath
        };
    }
}

/**
 * Genera código C para GBDK desde una imagen convertida
 * @param {string} imagePath - Ruta de la imagen convertida
 * @param {string} outputPath - Ruta del archivo de código C
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.verbose - Mostrar información detallada
 * @param {string} options.variableName - Nombre personalizado para la variable
 * @returns {Promise<Object>} Información sobre la generación
 */
async function generateGBDKCode(imagePath, outputPath, options = {}) {
    const { verbose = true, variableName } = options;
    
    try {
        const image = await loadImage(imagePath);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        
        // Calcular dimensiones en tiles (8x8 píxeles cada uno)
        const tileWidth = Math.ceil(image.width / 8);
        const tileHeight = Math.ceil(image.height / 8);
        
        let gbdkCode = '';
        gbdkCode += `// Sprite/Tile generado automáticamente\n`;
        gbdkCode += `// Dimensiones: ${image.width}x${image.height} píxeles (${tileWidth}x${tileHeight} tiles)\n`;
        gbdkCode += `// Generado el: ${new Date().toISOString()}\n\n`;
        
        const baseName = variableName || path.parse(imagePath).name.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Generar datos de tiles
        gbdkCode += `#include <gb/gb.h>\n\n`;
        gbdkCode += `// Datos del sprite/tile\n`;
        gbdkCode += `const unsigned char ${baseName}_data[] = {\n`;
        
        const tiles = [];
        
        // Procesar imagen tile por tile (8x8)
        for (let tileY = 0; tileY < tileHeight; tileY++) {
            for (let tileX = 0; tileX < tileWidth; tileX++) {
                const tileData = [];
                
                // Procesar cada fila del tile (8 píxeles)
                for (let row = 0; row < 8; row++) {
                    let lowByte = 0;
                    let highByte = 0;
                    
                    for (let col = 0; col < 8; col++) {
                        const pixelX = tileX * 8 + col;
                        const pixelY = tileY * 8 + row;
                        
                        if (pixelX < image.width && pixelY < image.height) {
                            const pixelIndex = (pixelY * image.width + pixelX) * 4;
                            const r = data[pixelIndex];
                            const g = data[pixelIndex + 1];
                            const b = data[pixelIndex + 2];
                            
                            const colorValue = colorToGBDKValue(r, g, b);
                            
                            // Game Boy usa 2 bits por píxel, divididos en dos bytes
                            const bit = 7 - col;
                            if (colorValue & 1) lowByte |= (1 << bit);
                            if (colorValue & 2) highByte |= (1 << bit);
                        }
                    }
                    
                    tileData.push(lowByte, highByte);
                }
                tiles.push(...tileData);
            }
        }
        
        // Escribir los datos en formato hexadecimal
        for (let i = 0; i < tiles.length; i += 8) {
            gbdkCode += '    ';
            for (let j = 0; j < 8 && i + j < tiles.length; j++) {
                gbdkCode += `0x${tiles[i + j].toString(16).padStart(2, '0').toUpperCase()}`;
                if (i + j < tiles.length - 1) gbdkCode += ', ';
            }
            gbdkCode += '\n';
        }
        
        gbdkCode += `};\n\n`;
        
        // Añadir información útil
        gbdkCode += `// Información del sprite/tile:\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_WIDTH ${image.width}\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_HEIGHT ${image.height}\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_TILE_WIDTH ${tileWidth}\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_TILE_HEIGHT ${tileHeight}\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_TILE_COUNT ${tileWidth * tileHeight}\n`;
        gbdkCode += `#define ${baseName.toUpperCase()}_SIZE ${tiles.length}\n\n`;
        
        // Añadir ejemplo de uso
        gbdkCode += `// Ejemplo de uso:\n`;
        gbdkCode += `// set_sprite_data(0, ${tileWidth * tileHeight}, ${baseName}_data);\n`;
        gbdkCode += `// set_sprite_tile(0, 0); // Para usar el primer tile\n`;
        
        // Guardar archivo
        fs.writeFileSync(outputPath, gbdkCode);
        
        if (verbose) {
            console.log(`🎮 Código GBDK generado: ${outputPath}`);
            console.log(`📊 Tiles generados: ${tileWidth * tileHeight} (${tileWidth}x${tileHeight})`);
        }
        
        return {
            success: true,
            inputPath: imagePath,
            outputPath,
            tilesGenerated: tileWidth * tileHeight,
            tileWidth,
            tileHeight,
            dataSize: tiles.length,
            message: `Código GBDK generado: ${outputPath}`
        };
        
    } catch (error) {
        const errorMessage = `Error al generar código GBDK: ${error.message}`;
        if (verbose) {
            console.error(`❌ ${errorMessage}`);
        }
        
        return {
            success: false,
            error: errorMessage,
            inputPath: imagePath,
            outputPath
        };
    }
}

/**
 * Convierte una imagen y opcionalmente genera código GBDK
 * @param {string} inputPath - Ruta del archivo de entrada
 * @param {Object} options - Opciones de configuración
 * @param {string} options.outputPath - Ruta personalizada de salida
 * @param {boolean} options.generateGBDK - Generar código GBDK
 * @param {boolean} options.verbose - Mostrar información detallada
 * @param {string} options.variableName - Nombre personalizado para variables GBDK
 * @returns {Promise<Object>} Resultado de la conversión
 */
async function convertImage(inputPath, options = {}) {
    const {
        outputPath: customOutputPath,
        generateGBDK = false,
        verbose = true,
        variableName
    } = options;
    
    // Validaciones
    if (!fs.existsSync(inputPath)) {
        const error = `El archivo no existe: ${inputPath}`;
        if (verbose) console.error(`❌ ${error}`);
        return { success: false, error };
    }
    
    if (!inputPath.toLowerCase().endsWith('.png')) {
        const error = 'El archivo debe ser una imagen PNG';
        if (verbose) console.error(`❌ ${error}`);
        return { success: false, error };
    }
    
    // Generar ruta de salida si no se proporciona
    let outputPath = customOutputPath;
    if (!outputPath) {
        const parsedPath = path.parse(inputPath);
        outputPath = path.join(parsedPath.dir, `${parsedPath.name}_gameboy${parsedPath.ext}`);
    }
    
    const result = {
        conversion: null,
        gbdk: null
    };
    
    // Convertir imagen
    if (verbose) {
        console.log(`🔄 Convirtiendo ${inputPath} a paleta Game Boy...`);
    }
    result.conversion = await convertToGameBoy(inputPath, outputPath, { verbose });
    
    // Generar código GBDK si se solicita
    if (generateGBDK && result.conversion.success) {
        if (verbose) {
            console.log('🎮 Generando código GBDK...');
        }
        const parsedPath = path.parse(outputPath);
        const gbdkPath = path.join(parsedPath.dir, `${parsedPath.name}.c`);
        result.gbdk = await generateGBDKCode(outputPath, gbdkPath, { verbose, variableName });
    }
    
    return {
        success: result.conversion.success,
        ...result
    };
}

module.exports = {
    GAMEBOY_PALETTE,
    convertToGameBoy,
    generateGBDKCode,
    convertImage,
    findClosestGameBoyColor,
    colorToGBDKValue,
    colorDistance
};
