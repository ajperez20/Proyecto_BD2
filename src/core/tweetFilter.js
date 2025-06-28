const allKeywords = [
    "ecuador", "ecu", "mexico", "mex", "jamaica", "jam", "canada", "can",
    "venezuela", "vinotinto", "fvf_oficial",
    "romo", "rafa", "bello", "rondon", "soteldo", "batista",
    "gol", "goles", "partido", "partidos", "penal", "penales", "victoria",
    "gano", "gana", "derrota", "perdio", "pierde", "empate", "empataron",
    "clasificado", "clasificacion", "semifinal", "final",
    "copa america 2024",
    "copa america usa 2024",
    "rafael romo",
    "eduard bello",
    "salomon rondon",
    "bocha batista",
    "cuartos de final",
    "4tos de final"
];

const allowedDates = [
    "21-06-2024", "22-06-2024", "23-06-2024", "25-06-2024",
    "26-06-2024", "27-06-2024", "29-06-2024", "30-06-2024",
    "01-07-2024", "04-07-2024", "05-07-2024", "06-07-2024"
];

const normalizeRepeatedChars = (str) => {
    return str.replace(/(.)\1{1,}/g, '$1');  // Reduce cualquier repetición (>1) a 1 carácter
};

export const textFilter = (tweetText) => {
    if (typeof tweetText !== 'string') return false;
    
    const normalizedText = normalizeRepeatedChars(
        tweetText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    );
    
    let matches = [];
    
    for (const keyword of allKeywords) {
        if (keyword.includes(' ')) {
            if (normalizedText.includes(keyword)) {
                matches.push(keyword);
            }
        }
    }
    
    const words = normalizedText.split(/\W+/);
    for (const keyword of allKeywords) {
        if (!keyword.includes(' ') && !matches.includes(keyword)) {
            if (words.includes(keyword)) {
                matches.push(keyword);
            }
        }
    }
    
    return matches.length >= 2;
};

export const dateFilter = (createdAt) => {
    if (!createdAt) return false;

    try {
        const dateObj = new Date(createdAt);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const formattedDate = `${day}-${month}-${dateObj.getFullYear()}`;

        return allowedDates.includes(formattedDate);
    } catch (error) {
        console.error("Error formateando fecha:", error);
        return false;
    }
};

// Función principal tweetFilter
export const tweetFilter = async (tweet) => {
    try {
        if (!tweet || typeof tweet.text !== 'string' || !tweet.created_at) {
            return {};
        }

        if (textFilter(tweet.text) && dateFilter(tweet.created_at)) {
            return tweet;
        }

        return {};

    } catch (error) {
        console.error("Error filtrando tweet:", error);
        return {};
    }
};

export const metricsFilter = (public_metrics, minLikes = 0, minRetweets = 0) => {
    if (!public_metrics) return false;
    return (public_metrics.like_count || 0) >= minLikes &&
        (public_metrics.retweet_count || 0) >= minRetweets;
};