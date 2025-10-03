// This is an updated Netlify Function with better error logging.

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = JSON.parse(event.body);
    const userPrompt = body.prompt;

    if (!userPrompt) {
        return { statusCode: 400, body: 'Error: Prompt is required in the request.' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const systemPrompt = "Provide a short, quick, and brief explanation for an undergraduate electrical engineering student. The explanation should be a single, concise paragraph.";

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // **IMPROVEMENT START**
        // If the response from Google is not OK, we will log the detailed error.
        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            // This log will appear in your Netlify function logs for debugging.
            console.error('Error from Gemini API:', errorBody); 
            
            // Send a clear error back to the browser.
            return { 
                statusCode: geminiResponse.status, 
                body: `An error occurred with the Gemini API. Check the function logs on Netlify for details. Error: ${errorBody}` 
            };
        }
        // **IMPROVEMENT END**

        const result = await geminiResponse.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Server error:', error);
        return { statusCode: 500, body: `Server error: ${error.toString()}` };
    }
};