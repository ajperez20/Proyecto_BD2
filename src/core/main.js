import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { exportCVS } from "./exportCVS.js";
import { extractTweets } from "./extractTweets.js";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

async function main() {
    const argv = yargs(hideBin(process.argv))
        .option('accounts', {
            alias: 'a',
            type: 'string',
            description: 'Comma-separated list of Twitter accounts',
            default: 'tomapapa'
        })
        .option('maxTweets', {
            alias: 'm',
            type: 'number',
            description: 'Maximum number of tweets to extract',
            default: 15
        })
        .option('startDate', {
            alias: 's',
            type: 'string',
            description: 'Start date (YYYY-MM-DD)',
            default: '2024-06-21'
        })
        .option('endDate', {
            alias: 'e',
            type: 'string',
            description: 'End date (YYYY-MM-DD)',
            default: '2024-06-30'
        })
        .help()
        .alias('help', 'h')
        .argv;

    const twitterConfig = {
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
    };

    const supabaseConfig = {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
    };

    const params = {
        accounts: argv.accounts.split(','),
        maxTweets: argv.maxTweets,
        startDate: argv.startDate,
        endDate: argv.endDate,
    };

    try {
        await extractTweets({ ...params, twitterConfig, supabaseConfig });
        await exportCVS(createClient(supabaseConfig.url, supabaseConfig.anonKey));
    } catch (error) {
        console.error('Extracción fallida:', error.message);
    }
}

main()