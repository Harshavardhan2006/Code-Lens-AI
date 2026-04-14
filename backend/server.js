import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// Llama 3.3 70B is excellent for coding tasks and very fast on Groq
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

app.post('/api/detect-language', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing code.' });
    const prompt = `Detect the programming language of this code snippet. Return ONLY a JSON object with a single key "language" whose value is a lowercase string matching one of: javascript, python, java, cpp, typescript, go, rust, csharp, php, ruby, swift, kotlin. If unsure, return your best guess.\n\nCode:\n\`\`\`\n${code.slice(0, 500)}\n\`\`\``;
    
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });
    
    const text = response.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to detect language.' });
  }
});

app.post('/api/explain', async (req, res) => {
  try {
    const { code, language, difficulty } = req.body;
    if (!code || !language || !difficulty) return res.status(400).json({ error: 'Missing required parameters.' });
    const prompt = `You are an expert programming explainer called "CodeLens AI".
I have the following ${language} code:
\`\`\`${language}
${code}
\`\`\`
Explain this code for a user at the "${difficulty}" level.
Return your response STRICTLY as a JSON object:
{
  "summary": "A concise paragraph summarizing what the code does.",
  "stepByStep": ["Step 1 explanation", "Step 2 explanation"],
  "lineByLine": [{ "line": 1, "code": "first line of code", "explanation": "what this line does" }]
}
Ensure the response is valid JSON and nothing else. Do not wrap it in markdown codeblocks.`;
    
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });
    
    const text = response.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate explanation.' });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) return res.status(400).json({ error: 'Missing code or language.' });
    const prompt = `You are a senior software engineer. Analyze this ${language} code and return a JSON object with exactly this structure:
{
  "complexity": {
    "time": "O(n) or similar Big O notation",
    "space": "O(n) or similar Big O notation",
    "explanation": "Brief explanation of why"
  },
  "scores": {
    "readability": 85,
    "maintainability": 70,
    "performance": 60
  },
  "smells": [
    {
      "type": "smell type e.g. Magic Number, God Function, Deep Nesting",
      "line": 3,
      "description": "What the problem is",
      "fix": "How to fix it concisely"
    }
  ]
}
scores are integers 0-100. smells is an empty array [] if none found. Return only valid JSON.

Code:
\`\`\`${language}
${code}
\`\`\``;
    
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });
    
    const text = response.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to analyze code.' });
  }
});

app.post('/api/rewrite', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) return res.status(400).json({ error: 'Missing code or language.' });
    const prompt = `You are a senior software engineer. Rewrite this ${language} code to be cleaner, more readable, and follow best practices. Return ONLY a JSON object:
{
  "rewritten": "the full rewritten code as a string",
  "changes": [
    "Change 1: what was changed and why",
    "Change 2: what was changed and why"
  ]
}
Do not wrap in markdown. Return valid JSON only.

Original code:
\`\`\`${language}
${code}
\`\`\``;
    
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });
    
    const text = response.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to rewrite code.' });
  }
});

app.post('/api/flowchart', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) return res.status(400).json({ error: 'Missing code or language.' });
    const prompt = `You are a software architect. Analyze this ${language} code and return a flowchart as a JSON object describing the logic flow:
{
  "nodes": [
    { "id": "1", "type": "start", "label": "Start" },
    { "id": "2", "type": "process", "label": "Initialize variables" },
    { "id": "3", "type": "decision", "label": "Is x > 0?" },
    { "id": "4", "type": "process", "label": "Execute loop body" },
    { "id": "5", "type": "end", "label": "Return result" }
  ],
  "edges": [
    { "from": "1", "to": "2" },
    { "from": "2", "to": "3" },
    { "from": "3", "to": "4", "label": "Yes" },
    { "from": "3", "to": "5", "label": "No" },
    { "from": "4", "to": "3" }
  ]
}
Node types: "start", "end", "process", "decision". Keep labels short (max 6 words). Maximum 12 nodes. Return only valid JSON.

Code:
\`\`\`${language}
${code}
\`\`\``;
    
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });
    
    const text = response.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate flowchart.' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { code, language, explanation, question, history } = req.body;
    if (!code || !question) return res.status(400).json({ error: 'Missing code or question.' });
    const systemContext = `You are CodeLens AI, an expert code explainer assistant. The user is asking follow-up questions about a code snippet that was already explained.\n\nCode (${language}):\n\`\`\`${language}\n${code}\n\`\`\`\n\nPrevious explanation summary: ${explanation?.summary || 'N/A'}\n\nAnswer concisely and clearly. If showing code examples, wrap them in triple backticks with the language.`;
    
    const messages = [
      { role: 'system', content: systemContext },
      ...(history || []).map((msg) => ({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.content })),
      { role: 'user', content: question },
    ];
    
    const response = await groq.chat.completions.create({
      messages: messages,
      model: GROQ_MODEL,
    });
    
    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to answer question.' });
  }
});

app.listen(port, () => {
  console.log(`CodeLens AI backend running on http://localhost:${port}`);
});