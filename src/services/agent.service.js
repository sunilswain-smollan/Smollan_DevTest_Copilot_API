const { GoogleGenerativeAI } = require('@google/generative-ai');
// const OpenAI = require('openai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });
exports.generate = async (requirement) => {

    try {

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash'
        });

        const prompt = `
Act as a senior QA engineer.

Generate test cases in STRICT JSON format.

Rules:
- Return ONLY valid JSON
- No extra text
- Fields: id, scenario, type, priority

Requirement: ${requirement}
`;

        const result = await model.generateContent(prompt);

        const text = result.response.text();

        let parsed;

        try {
            parsed = JSON.parse(text);
        } catch (e) {

            parsed = [{
                id: 'AI001',
                scenario: text,
                type: 'General',
                priority: 'Medium'
            }];
        }

        return {
            testCases: parsed
        };

    } catch (error) {

        console.error('Gemini Error:', error);

        if (error.status === 429) {

            let retryMessage = 'Rate limit reached. Try again later.';

            if (error.errorDetails) {
                const retryInfo = error.errorDetails.find(
                    d => d['@type']?.includes('RetryInfo')
                );

                if (retryInfo?.retryDelay) {
                    retryMessage =
                        `Rate limit reached. Retry after ${retryInfo.retryDelay}`;
                }
            }

            return {
                testCases: [
                    {
                        id: 'RATE_LIMIT',
                        scenario: retryMessage,
                        type: 'System',
                        priority: 'High'
                    }
                ]
            };
        }

        return {
            testCases: [
                {
                    id: 'ERROR',
                    scenario: error.message,
                    type: 'System',
                    priority: 'High'
                }
            ]
        };
    }
};


// open AI 
// exports.generate = async (requirement) => {

//     try {
  
//       const prompt = `
//   Act as a senior QA engineer.
  
//   Generate test cases in STRICT JSON format.
  
//   Rules:
//   - Return ONLY valid JSON array
//   - No extra text
//   - Fields: id, scenario, type, priority
  
//   Requirement: ${requirement}
//   `;
  
//       const response = await openai.chat.completions.create({
//         model: 'gpt-4o-mini',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are a QA test case generator.'
//           },
//           {
//             role: 'user',
//             content: prompt
//           }
//         ],
//         temperature: 0.3,
//         response_format: { type: "json_object" }
//       });
  
//       const text = response.choices[0].message.content;
  
//       let parsed;
  
//       try {
//         parsed = JSON.parse(text);
//       } catch (e) {
  
//         // fallback if JSON breaks
//         parsed = [{
//           id: 'AI001',
//           scenario: text,
//           type: 'General',
//           priority: 'Medium'
//         }];
//       }
  
//       return {
//         testCases: parsed
//       };
  
//     } catch (error) {
  
//       console.error('OpenAI Error:', error);
  
//       // OpenAI rate limit
//       if (error.status === 429) {
//         return {
//           testCases: [
//             {
//               id: 'RATE_LIMIT',
//               scenario: 'Rate limit reached. Please retry shortly.',
//               type: 'System',
//               priority: 'High'
//             }
//           ]
//         };
//       }
  
//       return {
//         testCases: [
//           {
//             id: 'ERROR',
//             scenario: error.message,
//             type: 'System',
//             priority: 'High'
//           }
//         ]
//       };
//     }
//   };