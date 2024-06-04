import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

export async function POST(req) {
  const body = await req.json();
  const accessToken = body.accessToken;
  const refreshToken = body.refreshToken;
  const siteUrl = body.websiteUrl;
  const startDate = body.startDate;
  const endDate = body.endDate;
  const dimension = body.dimension;

    try {
        oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

        const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });

        const requestBody = {
            startDate: startDate,
            endDate: endDate,
            dimensions: dimension,
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
