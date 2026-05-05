exports.buildPrompt =
    (requirement, options) => {
        let prompt = `Act as senior QA architect.\n`;
        if (options.testType === 'unit') { prompt += 'Generate unit test cases.\n'; }
        if (options.testType === 'validation') { prompt += 'Generate field validation tests.\n'; }
        if (options.includeEdgeCases) {
            prompt += 'Include edge cases.\n';
        }
        prompt += `Requirement:${requirement}`;
        return prompt;
    }