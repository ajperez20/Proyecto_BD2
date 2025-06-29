# Módulo de Extracción - Documentación Completa

## 📋 Descripción General

El módulo de extracción es responsable de recolectar tweets relacionados con la Vinotinto (Selección de Venezuela) desde Twitter API v2. Este módulo incluye funcionalidades de filtrado, almacenamiento en Supabase y exportación a CSV.

## 🏗️ Arquitectura del Módulo

```
extraction/
├── src/
│   ├── core/                 # Lógica principal del módulo
│   │   ├── main.js          # Punto de entrada principal
│   │   ├── extractTweets.js # Extracción de tweets
│   │   ├── tweetFilter.js   # Filtrado de contenido
│   │   ├── saveTweets.js    # Almacenamiento en Supabase
│   │   ├── exportCVS.js     # Exportación a CSV
│   │   └── setupClients.js  # Configuración de clientes
│   ├── data/                # Datos extraídos
│   └── database/            # Scripts de base de datos
├── package.json
├── env.example              # Ejemplo de variables de entorno
└── .env                     # Variables de entorno (crear desde env.example)
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd extraction
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `extraction/`:

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar con tus credenciales
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configurar Base de Datos

Ejecuta el script SQL en tu proyecto Supabase:

```sql
-- Ver: src/database/tweets_nosql.sql
CREATE TABLE tweets_nosql (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tweet_data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  username TEXT NOT NULL
);
```

## 📖 Uso del Módulo

### Ejecución Básica

```bash
# Desde la raíz del proyecto
npm run extract

# O directamente desde la carpeta extraction
cd extraction
node src/core/main.js
```

### Configuración Personalizada

Modifica los parámetros en `src/core/main.js`:

```javascript
const params = {
    accounts: ['tomapapa', 'vinotinto', 'fvf_oficial'], // Cuentas a monitorear
    maxTweets: 15,                                      // Tweets por cuenta
    startDate: '2024-06-21',                           // Fecha de inicio
    endDate: '2024-06-30',                             // Fecha de fin
};
```

## 🔍 Funcionalidades Principales

### 1. Extracción de Tweets (`extractTweets.js`)

**Propósito**: Extrae tweets de cuentas específicas dentro de un rango de fechas.

**Parámetros**:
- `accounts`: Array de usernames de Twitter
- `maxTweets`: Número máximo de tweets por cuenta (1-100)
- `startDate`: Fecha de inicio (YYYY-MM-DD)
- `endDate`: Fecha de fin (YYYY-MM-DD)
- `twitterConfig`: Configuración de Twitter API
- `supabaseConfig`: Configuración de Supabase

**Validaciones**:
- Máximo 10 cuentas por ejecución
- Entre 1-100 tweets por cuenta
- Fechas de inicio y fin requeridas

**Ejemplo de uso**:
```javascript
import { extractTweets } from './extractTweets.js';

await extractTweets({
    accounts: ['tomapapa'],
    maxTweets: 15,
    startDate: '2024-06-21',
    endDate: '2024-06-30',
    twitterConfig: { bearerToken: process.env.TWITTER_BEARER_TOKEN },
    supabaseConfig: { 
        url: process.env.SUPABASE_URL, 
        anonKey: process.env.SUPABASE_ANON_KEY 
    }
});
```

### 2. Filtrado de Tweets (`tweetFilter.js`)

**Propósito**: Filtra tweets basándose en palabras clave y fechas específicas.

**Criterios de Filtrado**:

#### Palabras Clave (Keywords)
```javascript
const allKeywords = [
    // Países
    "ecuador", "ecu", "mexico", "mex", "jamaica", "jam", "canada", "can",
    // Venezuela
    "venezuela", "vinotinto", "fvf_oficial",
    // Jugadores
    "romo", "rafa", "bello", "rondon", "soteldo", "batista",
    // Términos futbolísticos
    "gol", "goles", "partido", "partidos", "penal", "penales", "victoria",
    "gano", "gana", "derrota", "perdio", "pierde", "empate", "empataron",
    "clasificado", "clasificacion", "semifinal", "final",
    // Eventos específicos
    "copa america 2024", "copa america usa 2024",
    "rafael romo", "eduard bello", "salomon rondon", "bocha batista",
    "cuartos de final", "4tos de final"
];
```

#### Fechas Permitidas
```javascript
const allowedDates = [
    "21-06-2024", "22-06-2024", "23-06-2024", "25-06-2024",
    "26-06-2024", "27-06-2024", "29-06-2024", "30-06-2024",
    "01-07-2024", "04-07-2024", "05-07-2024", "06-07-2024"
];
```

**Lógica de Filtrado**:
1. **Filtro de Texto**: Requiere al menos 2 palabras clave coincidentes
2. **Filtro de Fecha**: Solo tweets de fechas específicas
3. **Normalización**: Elimina acentos y normaliza caracteres repetidos

**Funciones Exportadas**:
- `textFilter(tweetText)`: Filtra por contenido de texto
- `dateFilter(createdAt)`: Filtra por fecha de creación
- `tweetFilter(tweet)`: Filtro principal que combina ambos criterios
- `metricsFilter(public_metrics, minLikes, minRetweets)`: Filtro por métricas

### 3. Almacenamiento (`saveTweets.js`)

**Propósito**: Guarda tweets filtrados en Supabase.

**Estructura de Datos**:
```javascript
{
    tweet_data: {
        tweet_id: "1234567890",
        text: "Contenido del tweet",
        created_at: "2024-06-21T10:30:00Z",
        metrics: {
            likes: 150,
            retweets: 25
        }
    },
    username: "tomapapa",
    created_at: "2024-06-21T10:30:00Z"
}
```

**Tabla Supabase**: `tweets_nosql`

### 4. Exportación a CSV (`exportCVS.js`)

**Propósito**: Exporta datos de Supabase a archivo CSV.

**Formato de Salida**:
```csv
tweet_id,username,text,created_at
1234567890,tomapapa,"Contenido del tweet",2024-06-21T10:30:00Z
```

**Ubicación**: `extraction/tweets.csv`

### 5. Configuración de Clientes (`setupClients.js`)

**Propósito**: Inicializa clientes de Twitter API y Supabase.

**Clientes Configurados**:
- `twitterClient`: Cliente de Twitter API v2
- `supabaseClient`: Cliente de Supabase

## 📊 Monitoreo y Logging

### Logs Generados

El módulo genera logs detallados durante la ejecución:

```
Extrayendo hasta 15 tweets por cuenta desde 2024-06-21 hasta 2024-06-30
Procesando cuenta: tomapapa
Extraídos 12 tweets para tomapapa
Extracción completada. Total de solicitudes API: 2
Tweet 1234567890 saved successfully
Datos exportados a /path/to/tweets.csv
```

### Métricas de API

- **Total de solicitudes**: Contador de llamadas a Twitter API
- **Tweets extraídos**: Número de tweets procesados por cuenta
- **Tweets guardados**: Número de tweets que pasaron el filtro

## ⚠️ Limitaciones y Consideraciones

### Límites de Twitter API

- **Rate Limits**: 300 requests/15min para User Timeline
- **Máximo tweets**: 100 por solicitud
- **Fechas**: Solo tweets de los últimos 7 días (API gratuita)

### Validaciones Implementadas

- Máximo 10 cuentas por ejecución
- Entre 1-100 tweets por cuenta
- Validación de fechas requeridas
- Manejo de errores por cuenta individual

### Casos Edge

- Usuarios no encontrados
- Cuentas privadas
- Tweets eliminados
- Errores de red temporales

## 🔧 Personalización

### Agregar Nuevas Palabras Clave

Edita `src/core/tweetFilter.js`:

```javascript
const allKeywords = [
    // ... palabras existentes ...
    "nueva_palabra_clave",
    "otra_palabra"
];
```

### Modificar Fechas Permitidas

```javascript
const allowedDates = [
    // ... fechas existentes ...
    "07-07-2024", "08-07-2024"
];
```

### Cambiar Criterios de Filtrado

```javascript
// En tweetFilter.js, modifica la lógica de filtrado
export const textFilter = (tweetText) => {
    // Tu lógica personalizada aquí
    return matches.length >= 1; // Cambiar de 2 a 1
};
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de autenticación Twitter**:
   ```
   Error: Invalid or expired token
   ```
   **Solución**: Verificar `TWITTER_BEARER_TOKEN` en `.env`

2. **Error de conexión Supabase**:
   ```
   Error: Invalid API key
   ```
   **Solución**: Verificar `SUPABASE_URL` y `SUPABASE_ANON_KEY`

3. **No se extraen tweets**:
   - Verificar que las cuentas existan
   - Comprobar que haya tweets en el rango de fechas
   - Revisar criterios de filtrado

4. **Archivo CSV no generado**:
   - Verificar permisos de escritura
   - Comprobar que haya datos en Supabase

### Debugging

Habilita logs detallados:

```javascript
// En main.js
console.log('Configuración:', { twitterConfig, supabaseConfig });
console.log('Parámetros:', params);
```

## 📈 Optimización

### Mejoras de Rendimiento

1. **Procesamiento en lotes**: Procesar múltiples cuentas en paralelo
2. **Caché de usuarios**: Evitar consultas repetidas de información de usuario
3. **Filtrado optimizado**: Usar índices en base de datos

### Escalabilidad

- Implementar cola de trabajos para grandes volúmenes
- Usar workers para procesamiento paralelo
- Implementar retry logic para errores temporales

## 🔄 Integración con Pipeline

El módulo se integra con el pipeline principal a través de:

1. **Archivo CSV**: `extraction/tweets.csv` para el módulo de transformación
2. **Base de datos**: Tabla `tweets_nosql` para consultas directas
3. **API REST**: Endpoint `/api/extract` en el módulo de orquestación

## 📝 Ejemplos de Uso

### Ejemplo 1: Extracción Básica

```javascript
import { extractTweets } from './src/core/extractTweets.js';

const config = {
    twitterConfig: { bearerToken: process.env.TWITTER_BEARER_TOKEN },
    supabaseConfig: { 
        url: process.env.SUPABASE_URL, 
        anonKey: process.env.SUPABASE_ANON_KEY 
    }
};

await extractTweets({
    accounts: ['tomapapa'],
    maxTweets: 10,
    startDate: '2024-06-21',
    endDate: '2024-06-22',
    ...config
});
```

### Ejemplo 2: Filtrado Personalizado

```javascript
import { tweetFilter } from './src/core/tweetFilter.js';

const customFilter = async (tweet) => {
    const filtered = await tweetFilter(tweet);
    if (Object.keys(filtered).length > 0) {
        // Lógica adicional de filtrado
        if (filtered.public_metrics.like_count > 100) {
            return filtered;
        }
    }
    return {};
};
```

## 🔐 Variables de Entorno

### Configuración Requerida

Crea un archivo `.env` basado en `env.example`:

```bash
# ========================================
# CONFIGURACIÓN TWITTER API v2
# ========================================
TWITTER_BEARER_TOKEN=tu_twitter_bearer_token_aqui

# ========================================
# CONFIGURACIÓN SUPABASE
# ========================================
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui

# ========================================
# CONFIGURACIÓN DE EXTRACCIÓN
# ========================================
MAX_TWEETS_PER_ACCOUNT=15
EXTRACTION_START_DATE=2024-06-21
EXTRACTION_END_DATE=2024-06-30
TARGET_ACCOUNTS=tomapapa,vinotinto,fvf_oficial
```

### Obtención de Credenciales

#### Twitter API v2
1. Ve a [Twitter Developer Portal](https://developer.twitter.com/)
2. Crea una aplicación
3. Obtén el Bearer Token

#### Supabase
1. Ve a [Supabase](https://supabase.com/)
2. Crea un proyecto
3. Obtén la URL y claves API

## 📞 Soporte

Si encuentras problemas:

1. Revisa la sección de troubleshooting
2. Verifica la configuración de variables de entorno
3. Consulta los logs de error
4. Abre un issue en el repositorio

---

**Última actualización**: Diciembre 2024  
**Versión del módulo**: 1.0.0  
**Compatibilidad**: Node.js 18+, Twitter API v2, Supabase 