const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.agentGroqService = async (requirement) => {

  try {

    const response =
      await groq.chat.completions.create({

      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",

          content: `
You are a senior QA engineer.

Generate concise software test cases.

Rules:
- Return plain text only
- One test case per line
- No JSON
- No markdown
- No numbering

Format strictly:
Scenario | Type | Priority

Allowed Types:
Functional
Validation
Boundary
Negative
UI
Security
Performance

Allowed Priorities:
Low
Medium
High
Critical

Example:
Verify login with valid credentials | Functional | High
`
        },

        {
          role: "user",
          content: requirement
        }
      ],

      temperature:1

    });

    let output =
      response.choices[0].message.content;

    console.log("Raw Output:", output);

    const lines = output
      .split('\n')
      .map(x => x.trim())
      .filter(x => x);

    const testCases =
      lines.map((line, index) => {

      const parts =
        line.split('|');

      return {

        id:
          `TC${String(index + 1).padStart(3, '0')}`,

        scenario:
          parts[0]?.trim() || '',

        type:
          parts[1]?.trim() || 'NA',

        priority:
          parts[2]?.trim() || 'NA'

      };

    });

    return {
      testCases
    };

  } catch (error) {

    console.error("Groq Error:", error);

    return {

      testCases: [{

        id: 'ERROR',

        scenario: error.message,

        type: 'System',

        priority: 'High'

      }]
    };
  }
};