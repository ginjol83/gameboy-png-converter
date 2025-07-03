#!/usr/bin/env node

const { convertImage } = require('../lib/gameboy-converter');
const path = require('path');

/**
 * Función principal del CLI
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('🎮 Convertidor de imágenes PNG a paleta Game Boy');
        console.log('');
        console.log('Uso:');
        console.log('  npx gameboy-png-converter <archivo_entrada.png> [archivo_salida.png] [--gbdk]');
        console.log('  gameboy-convert <archivo_entrada.png> [archivo_salida.png] [--gbdk]');
        console.log('');
        console.log('Opciones:');
        console.log('  --gbdk              Genera también código C para GBDK');
        console.log('  --var <nombre>      Nombre personalizado para variables GBDK');
        console.log('  --quiet             Modo silencioso (sin output verbose)');
        console.log('');
        console.log('Ejemplos:');
        console.log('  gameboy-convert imagen.png');
        console.log('  gameboy-convert imagen.png imagen_gameboy.png');
        console.log('  gameboy-convert imagen.png --gbdk');
        console.log('  gameboy-convert sprite.png --gbdk --var player_sprite');
        console.log('  gameboy-convert imagen.png output.png --gbdk --quiet');
        console.log('');
        console.log('Nota: Acepta imágenes PNG de cualquier tamaño');
        return;
    }
    
    // Procesar argumentos
    const generateGBDK = args.includes('--gbdk');
    const quiet = args.includes('--quiet');
    
    let variableName = null;
    const varIndex = args.indexOf('--var');
    if (varIndex !== -1 && varIndex + 1 < args.length) {
        variableName = args[varIndex + 1];
    }
    
    const filteredArgs = args.filter(arg => 
        !['--gbdk', '--quiet', '--var'].includes(arg) && 
        arg !== variableName
    );
    
    const inputPath = filteredArgs[0];
    const outputPath = filteredArgs[1];
    
    if (!inputPath) {
        console.error('❌ Debes especificar un archivo de entrada');
        return;
    }
    
    // Ejecutar conversión
    const result = await convertImage(inputPath, {
        outputPath,
        generateGBDK,
        verbose: !quiet,
        variableName
    });
    
    if (!result.success) {
        process.exit(1);
    }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };
