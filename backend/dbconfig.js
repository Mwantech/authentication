const { MongoClient } = require('mongodb');

// Replace the following with your MongoDB connection string
const uri = 'mongodb+srv://mwantech005:Amnjeri@2005@cluster0.npsa0.mongodb.net/mytestdb?retryWrites=true&w=majority&appName=Cluster0';
 // For local MongoDB
// const uri = 'mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority'; // For MongoDB Atlas

// Database and collection names
const dbName = 'testDB';
const collectionName = 'testCollection';

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to MongoDB');

    // Access the database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert a test document
    const testDoc = { name: 'Test', date: new Date() };
    const result = await collection.insertOne(testDoc);

    console.log('Test document inserted with _id:', result.insertedId);

    // Retrieve the document to verify
    const retrievedDoc = await collection.findOne({ _id: result.insertedId });
    console.log('Retrieved document:', retrievedDoc);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    // Close the connection
    await client.close();
  }
}

run().catch(console.dir);
