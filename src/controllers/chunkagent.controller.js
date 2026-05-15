const GroqService =
    require('../services/agent_groq.service');

const PDFParser =
    require('pdf2json');

const fs =
    require('fs');

exports.uploadFrs =
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    error: 'No file uploaded'
                });

            }

            // 🔥 filePath INSIDE function
            const filePath =
                req.file.path;

            const pdfParser =
                new PDFParser();

            // 🔥 INSIDE function
            pdfParser.loadPDF(filePath);

            pdfParser.on(
                "pdfParser_dataError",
                errData => {

                    console.error(
                        errData.parserError
                    );

                    return res.status(500).json({
                        error: "PDF parsing failed"
                    });

                });

            pdfParser.on(
                "pdfParser_dataReady",
                async pdfData => {

                    try {

                        let allTestCases = [];

                        for (const page of pdfData.Pages) {

                            let pageText = "";

                            page.Texts.forEach(text => {

                                text.R.forEach(r => {

                                    try {
                                
                                        pageText +=
                                            decodeURIComponent(r.T) + " ";
                                
                                    } catch {
                                
                                        pageText +=
                                            r.T + " ";
                                
                                    }
                                
                                });

                            });

                            pageText =
                                pageText.trim();

                            if (!pageText)
                                continue;

                            const result =
                                await GroqService
                                    .agentGroqService(pageText);

                            if (result?.testCases?.length) {

                                allTestCases.push(
                                    ...result.testCases
                                );

                            }

                        }

                        // 🔥 re-number IDs
                        allTestCases =
                            allTestCases.map((tc, index) => ({

                                ...tc,

                                id:
                                    `TC${String(index + 1)
                                        .padStart(3, '0')}`

                            }));

                        fs.unlinkSync(filePath);

                        res.json({
                            testCases: allTestCases
                        });

                    } catch (error) {
                        console.error(error);

                        res.status(500).json({
                            error: error.message
                        });

                    }

                });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: error.message
            });

        }

    };

exports.generateTestCases = async (req, res) => {

    try {

        const requirement =
            req.body.requirement;

        if (!requirement?.trim()) {

            return res.json({

                testCases: [{

                    id: 'EMPTY',

                    scenario:
                        'No requirement provided',

                    type: 'System',

                    priority: 'High'

                }]
            });

        }

        const result =
            await GroqService
                .agentGroqService(requirement);

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'AI generation failed'
        });

    }

};