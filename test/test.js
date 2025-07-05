import { 
    convertImage, 
    convertToGameBoy, 
    generateGBDKCode,
    findClosestGameBoyColor,
    colorToGBDKValue,
    GAMEBOY_PALETTE 
} from '../lib/gameboy-converter.js';
import fs from 'fs';

async function runTests() {
    console.log('🧪 Running tests for gameboy-png-converter\n');
    
    // Functional test runner - returns result object instead of mutating counters
    const createTestRunner = () => {
        const results = [];
        
        const test = (name, condition, expected = true) => {
            const result = condition === expected;
            console.log(`${result ? '✅' : '❌'} ${name}`);
            results.push({ name, passed: result });
            return result;
        };
        
        const getStats = () => {
            const passed = results.filter(r => r.passed).length;
            const failed = results.filter(r => !r.passed).length;
            return { passed, failed, total: results.length };
        };
        
        return { test, getStats };
    };
    
    const { test, getStats } = createTestRunner();
    
    // Test 1: Verify Game Boy palette
    test(
        'Game Boy palette has 4 colors',
        GAMEBOY_PALETTE.length,
        4
    );
    
    // Test 2: findClosestGameBoyColor function
    const whiteColor = findClosestGameBoyColor(255, 255, 255);
    test(
        'White color maps to lightest green',
        whiteColor.r === 155 && whiteColor.g === 188 && whiteColor.b === 15
    );
    
    const blackColor = findClosestGameBoyColor(0, 0, 0);
    test(
        'Black color maps to darkest green',
        blackColor.r === 15 && blackColor.g === 56 && blackColor.b === 15
    );
    
    // Test 3: colorToGBDKValue function
    test(
        'Lightest green = GBDK value 0',
        colorToGBDKValue(155, 188, 15),
        0
    );
    
    test(
        'Darkest green = GBDK value 3',
        colorToGBDKValue(15, 56, 15),
        3
    );
    
    // Test 4: Verify test image exists
    const testImageExists = fs.existsSync('test_image.png');
    test(
        'Test image exists',
        testImageExists
    );
    
    if (testImageExists) {
        // Test 5: Image conversion
        const conversionResult = await convertToGameBoy(
            'test_image.png',
            'test_output.png',
            { verbose: false }
        );
        
        test(
            'Image conversion successful',
            conversionResult.success
        );
        
        if (conversionResult.success) {
            test(
                'Output file created',
                fs.existsSync('test_output.png')
            );
            
            // Test 6: GBDK code generation
            const gbdkResult = await generateGBDKCode(
                'test_output.png',
                'test_output.c',
                { verbose: false, variableName: 'test_sprite' }
            );
            
            test(
                'GBDK code generation successful',
                gbdkResult.success
            );
            
            if (gbdkResult.success) {
                test(
                    '.c file created',
                    fs.existsSync('test_output.c')
                );
                
                const cContent = fs.readFileSync('test_output.c', 'utf8');
                test(
                    'C code contains custom variable',
                    cContent.includes('test_sprite_data')
                );
                
                test(
                    'C code contains definitions',
                    cContent.includes('#define TEST_SPRITE_WIDTH')
                );
            }
        }
        
        // Test 7: Complete convertImage function
        const fullResult = await convertImage('test_image.png', {
            outputPath: 'full_test.png',
            generateGBDK: true,
            verbose: false,
            variableName: 'full_test'
        });
        
        test(
            'Complete convertImage function successful',
            fullResult.success
        );
        
        test(
            'Conversion included in result',
            fullResult.conversion && fullResult.conversion.success
        );
        
        test(
            'GBDK included in result',
            fullResult.gbdk && fullResult.gbdk.success
        );
    }
    
    // Test 8: Error handling
    const errorResult = await convertImage('nonexistent_file.png', {
        verbose: false
    });
    
    test(
        'Correct handling of nonexistent file',
        !errorResult.success
    );
    
    // Clean up test files (functional approach)
    const testFiles = [
        'test_output.png',
        'test_output.c',
        'full_test.png',
        'full_test.c'
    ];
    
    testFiles
        .filter(file => fs.existsSync(file))
        .forEach(file => fs.unlinkSync(file));
    
    // Summary (functional approach)
    const { passed, failed, total } = getStats();
    
    console.log('\n' + '═'.repeat(50));
    console.log(`🎯 Test summary:`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${total}`);
    
    if (failed === 0) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️  Some tests failed');
        process.exit(1);
    }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}

export { runTests };
