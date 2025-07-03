const { 
    convertImage, 
    convertToGameBoy, 
    generateGBDKCode,
    findClosestGameBoyColor,
    colorToGBDKValue,
    GAMEBOY_PALETTE 
} = require('../lib/gameboy-converter');
const fs = require('fs');

async function runTests() {
    console.log('🧪 Ejecutando pruebas para gameboy-png-converter\n');
    
    let passed = 0;
    let failed = 0;
    
    function test(name, condition, expected = true) {
        const result = condition === expected;
        console.log(`${result ? '✅' : '❌'} ${name}`);
        if (result) passed++;
        else failed++;
        return result;
    }
    
    // Test 1: Verificar paleta de Game Boy
    test(
        'Paleta de Game Boy tiene 4 colores',
        GAMEBOY_PALETTE.length,
        4
    );
    
    // Test 2: Función findClosestGameBoyColor
    const whiteColor = findClosestGameBoyColor(255, 255, 255);
    test(
        'Color blanco se mapea al verde más claro',
        whiteColor.r === 155 && whiteColor.g === 188 && whiteColor.b === 15
    );
    
    const blackColor = findClosestGameBoyColor(0, 0, 0);
    test(
        'Color negro se mapea al verde más oscuro',
        blackColor.r === 15 && blackColor.g === 56 && blackColor.b === 15
    );
    
    // Test 3: Función colorToGBDKValue
    test(
        'Verde más claro = valor GBDK 0',
        colorToGBDKValue(155, 188, 15),
        0
    );
    
    test(
        'Verde más oscuro = valor GBDK 3',
        colorToGBDKValue(15, 56, 15),
        3
    );
    
    // Test 4: Verificar que existe imagen de prueba
    const testImageExists = fs.existsSync('test_image.png');
    test(
        'Imagen de prueba existe',
        testImageExists
    );
    
    if (testImageExists) {
        // Test 5: Conversión de imagen
        const conversionResult = await convertToGameBoy(
            'test_image.png',
            'test_output.png',
            { verbose: false }
        );
        
        test(
            'Conversión de imagen exitosa',
            conversionResult.success
        );
        
        if (conversionResult.success) {
            test(
                'Archivo de salida creado',
                fs.existsSync('test_output.png')
            );
            
            // Test 6: Generación de código GBDK
            const gbdkResult = await generateGBDKCode(
                'test_output.png',
                'test_output.c',
                { verbose: false, variableName: 'test_sprite' }
            );
            
            test(
                'Generación de código GBDK exitosa',
                gbdkResult.success
            );
            
            if (gbdkResult.success) {
                test(
                    'Archivo .c creado',
                    fs.existsSync('test_output.c')
                );
                
                const cContent = fs.readFileSync('test_output.c', 'utf8');
                test(
                    'Código C contiene variable personalizada',
                    cContent.includes('test_sprite_data')
                );
                
                test(
                    'Código C contiene definiciones',
                    cContent.includes('#define TEST_SPRITE_WIDTH')
                );
            }
        }
        
        // Test 7: Función convertImage completa
        const fullResult = await convertImage('test_image.png', {
            outputPath: 'full_test.png',
            generateGBDK: true,
            verbose: false,
            variableName: 'full_test'
        });
        
        test(
            'Función convertImage completa exitosa',
            fullResult.success
        );
        
        test(
            'Conversión incluida en resultado',
            fullResult.conversion && fullResult.conversion.success
        );
        
        test(
            'GBDK incluido en resultado',
            fullResult.gbdk && fullResult.gbdk.success
        );
    }
    
    // Test 8: Manejo de errores
    const errorResult = await convertImage('archivo_inexistente.png', {
        verbose: false
    });
    
    test(
        'Manejo correcto de archivo inexistente',
        !errorResult.success
    );
    
    // Limpiar archivos de prueba
    const testFiles = [
        'test_output.png',
        'test_output.c',
        'full_test.png',
        'full_test.c'
    ];
    
    testFiles.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });
    
    // Resumen
    console.log('\n' + '═'.repeat(50));
    console.log(`🎯 Resumen de pruebas:`);
    console.log(`✅ Pasaron: ${passed}`);
    console.log(`❌ Fallaron: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);
    
    if (failed === 0) {
        console.log('🎉 ¡Todas las pruebas pasaron!');
    } else {
        console.log('⚠️  Algunas pruebas fallaron');
        process.exit(1);
    }
}

// Ejecutar pruebas si es llamado directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };
