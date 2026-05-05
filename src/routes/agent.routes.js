const express = require('express');
const router = express.Router();
const multer = require('multer');
const agentController = require('../controllers/agent.controller');
const upload = multer({
    dest: 'uploads/'
});

router.get(
    '/health',
    (req, res) => {
        res.json({
            status: 'API Running'
        });
    }
);


router.get('/gemini-test',
    async (req, res) => {

        try {

            const {
                GoogleGenerativeAI
            } = require(
                '@google/generative-ai'
            );

            const genAI =
                new GoogleGenerativeAI(
                    process.env.GEMINI_API_KEY
                );

            const model =
                genAI.getGenerativeModel({
                    model: 'gemini-2.0-flash'
                });

            const result =
                await model.generateContent(
                    'Say hello'
                );

            res.json({
                message:
                    result.response.text()
            });

        }
        catch (error) {

            console.error(error);

            res.status(500).json({
                error: error.message
            });

        }

    }
);


router.post('/generate-testcases',
    agentController.generateTestCases
);

router.post('/upload-frs',
    upload.single('file'),
    agentController.uploadFrs
);
module.exports = router;