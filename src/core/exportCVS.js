import { writeFileSync } from 'fs';
import { join } from 'path';
export const exportCVS = async (supabaseClient) => {
    try {
        const { data } = await supabaseClient.from('tweets_nosql').select('tweet_data, username');
        const csv = data.map(row => {
            const d = row.tweet_data;
            return `${d.tweet_id},${row.username},${d.text.replace(/,/g, '')},${d.created_at}`;
        }).join('\n');
        // Guardar el archivo en extraction/tweets.csv
        const outputPath = join(process.cwd(), 'tweets.csv');
        writeFileSync(outputPath, `tweet_id,username,text,created_at\n${csv}`);
        console.log(`Datos exportados a ${outputPath}`);
    } catch (error) {
        console.error('Error exportando a CSV:', error.message);
    }
}