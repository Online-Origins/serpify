import { NextResponse } from 'next/server'
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
    const body = await request.json();
    const prompt = body.prompt || "";
    const keywords = body.keywords || '';
    const language = body.language || '';
    const audience = body.audience || '';
    const toneOfVoice = body.toneOfVoice || '';
    const title = body.title || '';
    const heading = body.heading || '';

    const response = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": `Generate the text for the following heading: ${heading}. The text is going to be used for a blog with the title "${title}", ${audience != "" ? `the target audience "${audience}",` : ","} has a ${toneOfVoice} tone of voice, that is in the language with the code ${language} and that contains these keywords: ${keywords.join(',')}. Only give back an string.`
            }
        ],
        model: "gpt-4o",
    });

    const generatedContent = response.choices[0].message.content;
    return NextResponse.json({ generatedContent });
}