const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// Prepare prompt for GenAI
function createPrompt(suppliers, requirement) {
  return `
You are a procurement AI assistant. Analyze the following suppliers:

${JSON.stringify(suppliers, null, 2)}

Based on performance_score, pricing, quality_score, and potential risks, recommend the best supplier(s) for: ${requirement}.
Justify your recommendation.
`;
}

// Endpoint to get supplier recommendation
app.get('/recommend', async (req, res) => {
  const requirement = req.query.requirement || 'General electronics components sourcing';

  try {
    const suppliers = await loadSuppliers();
    const prompt = createPrompt(suppliers, requirement);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    });

    const response = completion.choices[0].message.content;
    res.json({ recommendation: response });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing supplier data.');
  }
});

app.listen(port, () => {
  console.log(`GenAI Supplier Selection running at http://localhost:${port}`);
});
