import { NextResponse } from 'next/server'
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
    const body = await request.json();
    const keyword = body.keyword || '';
    const language = body.language || '';
    const toneOfVoice = body.toneOfVoice || '';

    const response = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": `Generate a title for a blog with the following focus keyword: "${keyword}". The tone of voice for the blog should be ${toneOfVoice}. Make sure the title is in ${language}. Only give back an string.`
            }
        ],
        model: "gpt-4o",
    });

    const generatedTitle = response.choices[0].message.content;
    return NextResponse.json({ generatedTitle });
}