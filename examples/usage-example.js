const { convertImage, convertToGameBoy, generateGBDKCode } = require('../lib/gameboy-converter');
const path = require('path');

async function exampleUsage() {
    console.log('🎮 Ejemplo de uso de gameboy-png-converter como librería\n');
    
    // Ejemplo 1: Conversión simple
    console.log('📝 Ejemplo 1: Conversión simple');
    const result1 = await convertImage('test_image.png', {
        verbose: true
    });
    
    if (result1.success) {
        console.log('✅ Conversión exitosa:', result1.conversion.outputPath);
    } else {
        console.log('❌ Error:', result1.conversion?.error || 'Error desconocido');
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
    
    // Ejemplo 2: Conversión con código GBDK
    console.log('📝 Ejemplo 2: Conversión con código GBDK');
    const result2 = await convertImage('test_image.png', {
        outputPath: 'sprite_player.png',
        generateGBDK: true,
        variableName: 'player_sprite',
        verbose: true
    });
    
    if (result2.success) {
        console.log('✅ Conversión exitosa:', result2.conversion.outputPath);
        if (result2.gbdk?.success) {
            console.log('✅ Código GBDK generado:', result2.gbdk.outputPath);
            console.log(`📊 Tiles: ${result2.gbdk.tilesGenerated}`);
        }
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
    
    // Ejemplo 3: Uso de funciones individuales
    console.log('📝 Ejemplo 3: Uso de funciones individuales');
    
    try {
        // Solo conversión
        const conversionResult = await convertToGameBoy(
            'test_image.png', 
            'manual_convert.png',
            { verbose: false }
        );
        
        if (conversionResult.success) {
            console.log('✅ Conversión manual exitosa');
            
            // Solo generación GBDK
            const gbdkResult = await generateGBDKCode(
                'manual_convert.png',
                'manual_convert.c',
                { 
                    verbose: false, 
                    variableName: 'manual_sprite' 
                }
            );
            
            if (gbdkResult.success) {
                console.log('✅ Código GBDK manual generado');
                console.log(`📊 Tamaño de datos: ${gbdkResult.dataSize} bytes`);
            }
        }
    } catch (error) {
        console.error('❌ Error en conversión manual:', error.message);
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
    
    // Ejemplo 4: Modo silencioso
    console.log('📝 Ejemplo 4: Modo silencioso');
    const result4 = await convertImage('test_image.png', {
        outputPath: 'silent_output.png',
        generateGBDK: true,
        verbose: false  // Sin output en consola
    });
    
    console.log('Conversión silenciosa completada:', {
        success: result4.success,
        hasConversion: !!result4.conversion,
        hasGBDK: !!result4.gbdk
    });
}

// Ejecutar ejemplo si es llamado directamente
if (require.main === module) {
    exampleUsage().catch(console.error);
}

module.exports = { exampleUsage };
