import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = "http://localhost:3000/analytics";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

export async function POST(req) {
  const body = await req.json();
  const accessToken = body.accessToken;
  const siteUrl = body.websiteUrl;
    try {
        oauth2Client.setCredentials({ access_token: accessToken });

        const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });

        const requestBody = {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            dimensions: ['date'],
        };

        const response = await searchconsole.searchanalytics.query({
            siteUrl,
            requestBody,
        });


        return NextResponse.json(response.data);
    } catch (error) {
        console.error(error);
        return NextResponse.error();
    }
}
