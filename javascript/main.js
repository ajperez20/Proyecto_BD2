import { exportCVS } from "./exportCVS.js";
import { extractTweets } from "./extractTweets.js";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

async function main() {
    const twitterConfig = {
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
    };

    const supabaseConfig = {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
    };

    const params = {
        accounts: ['rafalejov'],
        maxTweets: 5,
        startDate: '2025-03-20',
        endDate: '2025-03-21',
    };

    try {
        await extractTweets({ ...params, twitterConfig, supabaseConfig });
        await exportCVS(createClient(supabaseConfig.url, supabaseConfig.anonKey));
    } catch (error) {
        console.error('Extracción fallida:', error.message);
    }
}

main()