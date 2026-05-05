const agentService = require('../services/agent.service');
const GroqService =require('../services/agent_groq.service');
//  const pdf = require('pdf-parse');
const pdfModule = require('pdf-parse');
const pdfParse = pdfModule.default || pdfModule;
const fs = require('fs');


// 🔹 TEXT INPUT API
exports.generateTestCases = async (req, res) => {
  try {

    const requirement = req.body.requirement;

    if (!requirement?.trim()) {
      return res.json({
        testCases: [{
          id: 'EMPTY',
          scenario: 'No requirement provided',
          type: 'System',
          priority: 'High'
        }]
      });
    }

    // const result = await agentService.generate(requirement);
    const result = await GroqService.agentGroqService(requirement)
    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'AI generation failed'
    });
  }
};


// 🔹 FILE UPLOAD API (PDF)
exports.uploadFrs = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;

    const dataBuffer = fs.readFileSync(filePath);

    // const pdfData = await pdfModule(dataBuffer);
    const pdfData = await pdfParse(dataBuffer);
    let requirement = pdfData.text;

    // 🔥 LIMIT TEXT SIZE (IMPORTANT)
    requirement = requirement.substring(0, 5000);

    // cleanup file
    fs.unlinkSync(filePath);

    if (!requirement.trim()) {
      return res.json({
        testCases: [{
          id: 'EMPTY',
          scenario: 'No readable content in file',
          type: 'System',
          priority: 'High'
        }]
      });
    }

    // const result = await agentService.generate(requirement);
    const result = await GroqService.agentGroqService(requirement);
    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message // better debugging
    });
  }
};