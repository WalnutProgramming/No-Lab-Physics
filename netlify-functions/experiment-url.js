// This file is a Netlify serverless function that creates short
// URLs and uses MongoDB to store them.

const { nanoid } = require("nanoid");
const { MongoClient } = require('mongodb');

exports.handler = async function (event, context) {
  const client = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  await client.connect();
  const collection = client.db("physics").collection("urls");

  try {
    if (event.httpMethod === "POST") {
      const id = nanoid();

      const { state } = JSON.parse(event.body);

      await collection.insertOne({ _id: id, state })
      
      return {
        statusCode: 200,
        body: JSON.stringify({ id }),
      }
    } else {
      const { id } = event.queryStringParameters;
      if (typeof id !== "string") return { statusCode: 422, body: "" };

      const { state } = await collection.findOne({ _id: id });

      return {
        statusCode: 200,
        body: JSON.stringify({ state }),
      };
    }
  } finally {
    await client.close();
  }
};
