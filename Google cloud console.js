// Gemini Integration 
// Google cloud console 
// GCP_PROJECT_ID as API Key.

const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config();

const app = express();
const port = 3000;

// Initialize Vertex AI (Gemini)
const vertexAI = new VertexAI({ project: process.env.GCP_PROJECT_ID, location: 'us-central1' });
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: { temperature: 0.2 }
});

// Load suppliers from CSV
function loadSuppliers() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream('data/suppliers.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Create Gemini prompt
function createPrompt(suppliers, requirement) {
  return `You are given the following suppliers:\n${JSON.stringify(suppliers, null, 2)}\n\nRequirement: ${requirement}\n\nPlease recommend the best supplier(s). Justify your recommendation.`;
}

// API endpoint
app.get('/recommend', async (req, res) => {
  const requirement = req.query.requirement || 'General electronics components sourcing';

  try {
    const suppliers = await loadSuppliers();
    const prompt = createPrompt(suppliers, requirement);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const response = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'No recommendation response.';
    res.json({ recommendation: response });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing supplier recommendation.');
  }
});

app.listen(port, () => {
  console.log(`Gemini Supplier Selection running at http://localhost:${port}`);
});
