require ('dotenv').config();
const { mongoClient } = require('mongodb');

async function main() {
    const client = new mongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

main().catch(console.error);