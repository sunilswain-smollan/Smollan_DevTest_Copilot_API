const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.agentGroqService = async (requirement) => {
  try {

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
          Return ONLY JSON in this format:
          
          {
            "testCases": [
              {
                "testCaseId": "",
                "testCaseName": "",
                "description": "",
                "steps": [
                  {
                    "stepId": "",
                    "action": "",
                    "expectedResult": ""
                  }
                ]
              }
            ]
          }
          
          Do not change keys.
          Do not add extra text.
          `        },
        {
          role: "user",
          content: requirement
        }
      ],
      temperature: 0.3
    });

    let output = response.choices[0].message.content;

// 🔥 Extract JSON from markdown (```json ... ```)
const jsonMatch = output.match(/```json([\s\S]*?)```/);

let cleanJson = jsonMatch ? jsonMatch[1] : output;

let parsed;

try {
  parsed = JSON.parse(cleanJson);
} catch (e) {
  parsed = {
    testCases: [{
      id: "PARSE_ERROR",
      scenario: output,
      type: "System",
      priority: "High"
    }]
  };
}

// return parsed;
return {
  testCases: parsed.testCases.map((t, index) => ({
    id: t.testCaseId || `TC${index + 1}`,
    scenario: t.testCaseName || t.description,
    type: "Functional",
    priority: "Medium"
  }))
};

  } catch (error) {
    console.error("Groq Error:", error);
    throw error;
  }
};