const axios = require("axios");

async function listModels() {
  const key = "AIzaSyBOm7iiSD7uBuhP2UEA-v5hEr7qQMn7Ano";
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const geminiModels = res.data.models.filter(m => m.name.includes("gemini") && m.supportedGenerationMethods.includes("generateContent"));
    console.log("MODELS:", JSON.stringify(geminiModels, null, 2));
  } catch (err) {
    console.error("FAILURE:", err.response?.data || err.message);
  }
}

listModels();
