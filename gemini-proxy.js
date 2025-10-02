// This is a Netlify Function that acts as a secure proxy to the Gemini API.
// It retrieves the API key from environment variables and forwards the user's prompt.

exports.handler = async function(event) {
    // We only accept POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Get the user's prompt from the request body
    const body = JSON.parse(event.body);
    const userPrompt = body.prompt;

    if (!userPrompt) {
        return { statusCode: 400, body: 'Prompt is required' };
    }

    // Get the API key from the secure environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // This is the specific instruction we give to the AI
    const systemPrompt = "Provide a short, quick, and brief explanation for an undergraduate electrical engineering student. The explanation should be a single, concise paragraph.";

    // The data we send to the Gemini API
    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // If the API returns an error, pass it along
            const errorBody = await response.text();
            return { statusCode: response.status, body: `Error from Gemini API: ${errorBody}` };
        }

        const result = await response.json();
        
        // Send the successful response back to the front-end
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        return { statusCode: 500, body: `Server error: ${error.toString()}` };
    }
};