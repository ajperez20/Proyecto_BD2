import { createObjectCsvWriter } from 'csv-writer';
import { join } from 'path';

export const exportCVS = async (supabaseClient) => {
    try {
        const { data } = await supabaseClient.from('tweets_nosql').select('tweet_data, username');

        const outputPath = join(process.cwd(), 'tweets.csv');
        const csvWriter = createObjectCsvWriter({
            path: outputPath,
            header: [
                { id: 'tweet_id', title: 'tweet_id' },
                { id: 'username', title: 'username' },
                { id: 'text', title: 'text' },
                { id: 'created_at', title: 'created_at' },
            ]
        });

        const records = data.map(row => {
            return {
                tweet_id: row.tweet_data.tweet_id,
                username: row.username,
                text: row.tweet_data.text,
                created_at: row.tweet_data.created_at
            }
        });

        await csvWriter.writeRecords(records);

        console.log(`Datos exportados a ${outputPath}`);
    } catch (error) {
        console.error('Error exportando a CSV:', error.message);
    }
}