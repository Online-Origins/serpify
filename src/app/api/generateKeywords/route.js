import { NextResponse } from 'next/server'
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
    const body = await request.json();
    const keywords = body.keywords || '';
    const language = body.language || '';
    const wordsLength = body.wordsLength || '';

    const response = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": `Generate 10 meta keywords that are good for SEO and are related to the subjects ${keywords.join(',')}. Make sure that the keywords are in the language with the code ${language} and are ${wordsLength.join(' and ')}. Also check if you can combine the subjects into keywords. Only give back an array in json format with the keywords and nothing more, for code purposes`
            }
        ],
        model: "gpt-4o",
        response_format: { type: "json_object" },
    });

    const generatedKeywordsJson = response.choices[0].message.content;
    const generatedKeywordsList = JSON.parse(generatedKeywordsJson);
    return NextResponse.json({ generatedKeywordsList });
}