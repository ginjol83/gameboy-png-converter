# 🎮 Game Boy PNG Converter

Una librería y herramienta CLI de Node.js que convierte imágenes PNG a la paleta de colores clásica de Game Boy y genera código C compatible con GBDK.

[![npm version](https://badge.fury.io/js/gameboy-png-converter.svg)](https://badge.fury.io/js/gameboy-png-converter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Características

- 🖼️ **Convierte imágenes PNG de cualquier tamaño**
- 🎨 **Utiliza la paleta auténtica de 4 colores de Game Boy**
- 🎮 **Genera código C para GBDK** (Game Boy Development Kit)
- 📦 **Librería NPM reutilizable**
- 💻 **CLI fácil de usar**
- 🔧 **API programática completa**
- 📏 **Convierte a formato de tiles de 8x8 píxeles**
- ⚡ **Procesamiento rápido y eficiente**

## 📦 Instalación

### Como dependencia en tu proyecto:
```bash
npm install gameboy-png-converter
```

### Como herramienta global:
```bash
npm install -g gameboy-png-converter
```

### Uso con npx (sin instalación):
```bash
npx gameboy-png-converter imagen.png --gbdk
```

## 🎨 Paleta de Colores Game Boy

La librería utiliza la paleta de colores original de Game Boy:
- Verde más claro: `#9BBC0F` (RGB: 155, 188, 15) → Valor GBDK: 0
- Verde claro: `#8BAC0F` (RGB: 139, 172, 15) → Valor GBDK: 1
- Verde oscuro: `#306230` (RGB: 48, 98, 48) → Valor GBDK: 2
- Verde más oscuro: `#0F380F` (RGB: 15, 56, 15) → Valor GBDK: 3

## 💻 Uso como CLI

### Sintaxis básica:
```bash
gameboy-convert <archivo_entrada.png> [archivo_salida.png] [opciones]
```

### Opciones:
- `--gbdk`: Genera también código C compatible con GBDK
- `--var <nombre>`: Nombre personalizado para variables GBDK
- `--quiet`: Modo silencioso (sin output verbose)

### Ejemplos:

```bash
# Conversión básica
gameboy-convert sprite.png

# Con nombre personalizado
gameboy-convert sprite.png sprite_gb.png

# Generar código GBDK
gameboy-convert sprite.png --gbdk

# Con variable personalizada para GBDK
gameboy-convert player.png --gbdk --var player_sprite

# Modo silencioso
gameboy-convert background.png --gbdk --quiet

# Usando npx
npx gameboy-png-converter imagen.png --gbdk
```

## 📚 Uso como Librería

### Importación:
```javascript
const { 
    convertImage, 
    convertToGameBoy, 
    generateGBDKCode,
    GAMEBOY_PALETTE 
} = require('gameboy-png-converter');
```

### Función principal (recomendada):
```javascript
// Conversión simple
const result = await convertImage('sprite.png');

// Conversión con código GBDK
const result = await convertImage('sprite.png', {
    outputPath: 'sprite_gb.png',
    generateGBDK: true,
    variableName: 'player_sprite',
    verbose: true
});

console.log(result);
// {
//   success: true,
//   conversion: { success: true, outputPath: '...', width: 16, height: 16 },
//   gbdk: { success: true, outputPath: '...', tilesGenerated: 4 }
// }
```

### Funciones individuales:
```javascript
// Solo conversión de imagen
const convResult = await convertToGameBoy(
    'input.png', 
    'output.png',
    { verbose: false }
);

// Solo generación de código GBDK
const gbdkResult = await generateGBDKCode(
    'sprite_gb.png',
    'sprite.c',
    { variableName: 'my_sprite' }
);
```

### Opciones disponibles:
```javascript
const options = {
    outputPath: 'custom_output.png',  // Ruta personalizada
    generateGBDK: true,               // Generar código GBDK
    verbose: true,                    // Mostrar información
    variableName: 'custom_sprite'     // Nombre para variables GBDK
};
```

## 🎮 Integración con GBDK

### Ejemplo del código C generado:
```c
#include <gb/gb.h>

// Datos del sprite/tile
const unsigned char player_sprite_data[] = {
    0x00, 0x00, 0x3C, 0x3C, 0x42, 0x7E, 0x99, 0xFF,
    0x99, 0xFF, 0x7E, 0x42, 0x3C, 0x3C, 0x00, 0x00,
    // ... más datos
};

// Definiciones útiles
#define PLAYER_SPRITE_WIDTH 16
#define PLAYER_SPRITE_HEIGHT 16
#define PLAYER_SPRITE_TILE_WIDTH 2
#define PLAYER_SPRITE_TILE_HEIGHT 2
#define PLAYER_SPRITE_TILE_COUNT 4
#define PLAYER_SPRITE_SIZE 64

// Ejemplo de uso:
// set_sprite_data(0, 4, player_sprite_data);
// set_sprite_tile(0, 0);
```

### Uso en tu proyecto GBDK:
```c
#include <gb/gb.h>
#include "player_sprite.c"

void main() {
    // Cargar datos del sprite
    set_sprite_data(0, PLAYER_SPRITE_TILE_COUNT, player_sprite_data);
    
    // Configurar sprite
    set_sprite_tile(0, 0);
    move_sprite(0, 50, 50);
    
    // Mostrar sprites
    SHOW_SPRITES;
    
    // Tu lógica del juego...
}
```

## 🧪 Pruebas

Ejecutar las pruebas incluidas:
```bash
npm test
```

Ver ejemplos de uso:
```bash
npm run example
```

## 📁 Estructura del Proyecto

```
gameboy-png-converter/
├── lib/
│   └── gameboy-converter.js      # Librería principal
├── bin/
│   └── cli.js                    # Interfaz CLI
├── examples/
│   └── usage-example.js          # Ejemplos de uso
├── test/
│   └── test.js                   # Pruebas básicas
├── package.json                  # Configuración NPM
├── README.md                     # Este archivo
└── LICENSE                       # Licencia MIT
```

## 🔧 API Reference

### `convertImage(inputPath, options)`
Función principal que combina conversión e generación de GBDK.

**Parámetros:**
- `inputPath` (string): Ruta del archivo PNG
- `options` (object): Opciones de configuración

**Retorna:** Promise<Object> con resultado de la conversión

### `convertToGameBoy(inputPath, outputPath, options)`
Convierte una imagen PNG a paleta de Game Boy.

### `generateGBDKCode(imagePath, outputPath, options)`
Genera código C para GBDK desde una imagen convertida.

### `findClosestGameBoyColor(r, g, b)`
Encuentra el color más cercano en la paleta de Game Boy.

### `GAMEBOY_PALETTE`
Array con los 4 colores de la paleta de Game Boy.

## ⚠️ Limitaciones

- Solo acepta archivos PNG
- El canal alpha se mantiene pero puede verse afectado
- Los tiles de GBDK son siempre de 8x8 píxeles (estándar de Game Boy)
- Requiere Node.js 14 o superior

## 🛠️ Algoritmo de Conversión

### Conversión de Color
Utiliza distancia euclidiana para encontrar el color más cercano:
```
distancia = √[(r1-r2)² + (g1-g2)² + (b1-b2)²]
```

### Conversión a GBDK
1. **Mapeo de colores**: Cada color → valor de 2 bits (0-3)
2. **División en tiles**: Imagen → tiles de 8x8 píxeles
3. **Codificación**: Cada fila → dos bytes (formato Game Boy)
4. **Generación**: Código C con arrays y definiciones

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🔗 Enlaces

- [NPM Package](https://www.npmjs.com/package/gameboy-png-converter)
- [GitHub Repository](https://github.com/ginjol83/gameboy-png-converter)
- [GBDK Documentation](https://gbdk-2020.github.io/gbdk-2020/)
- [Game Boy Development Community](https://gbdev.io/)

## 📊 Versiones

### v1.0.0
- ✅ Conversión de PNG a paleta Game Boy
- ✅ Generación de código GBDK
- ✅ CLI y API programática
- ✅ Soporte para cualquier tamaño de imagen
- ✅ Pruebas básicas incluidas
