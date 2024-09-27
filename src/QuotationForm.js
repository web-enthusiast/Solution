import React, { useState } from 'react';

const QuotationForm = () => {
    const [selectedProposalFile, setSelectedProposalFile] = useState(null);
    const [selectedFinancialFile, setSelectedFinancialFile] = useState(null);
    const [quotationResult, setQuotationResult] = useState(null);
    const [processingSteps, setProcessingSteps] = useState([]);

    const handleProposalFileChange = (event) => {
        setSelectedProposalFile(event.target.files[0]);
    };

    const handleFinancialFileChange = (event) => {
        setSelectedFinancialFile(event.target.files[0]);
    };

    const createQuotation = async () => {
        const formData = new FormData();
        formData.append('proposal_form', selectedProposalFile);
        formData.append('financial_statement', selectedFinancialFile);

        const response = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let result = '';
            const steps = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                result += chunk;

                // Process each line of the chunk as a JSON object
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line) {
                        try {
                            const step = JSON.parse(line);
                            steps.push(step);
                        } catch (error) {
                            // Handle any JSON parse errors
                            console.error('Error parsing JSON:', error);
                        }
                    }
                }

                // Update the processing steps state
                setProcessingSteps(steps);
            }

            // Assuming the last step is the final quotation result
            const finalResult = JSON.parse(result.trim().split('\n').pop());
            setQuotationResult(finalResult);
        } else {
            console.error('Error:', response.statusText);
        }
    };

    return (
        <div>
            <h1>Create Quotation</h1>
            <input type="file" accept=".pdf" onChange={handleProposalFileChange} />
            <input type="file" accept=".csv" onChange={handleFinancialFileChange} />
            <button onClick={createQuotation} disabled={!selectedProposalFile || !selectedFinancialFile}>
                Create Quotation
            </button>

            {processingSteps.length > 0 && (
                <div>
                    <h2>Processing Steps</h2>
                    <ul>
                        {processingSteps.map((step, index) => (
                            <li key={index}>{step.name}: {step.progress}% - {step.description}</li>
                        ))}
                    </ul>
                </div>
            )}

            {quotationResult && (
                <div>
                    <h3>Quotation Result</h3>
                    <p>Premium: {quotationResult.premium}</p>
                    <p>Risk Score: {quotationResult.risk_score}</p>
                    <p>Recommendation: {quotationResult.recommendation}</p>
                </div>
            )}
        </div>
    );
};

export default QuotationForm;
