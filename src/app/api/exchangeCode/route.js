import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const { OAuth2 } = google.auth;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = "http://localhost:3000/analytics";

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

export async function POST(req, res) {
    try {
        const { code } = await req.json();
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Verify ownership or permissions for the site
        const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
        const response = await searchconsole.sites.list();


        return NextResponse.json({ accessToken: tokens.access_token, entries: response.data.siteEntry});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
