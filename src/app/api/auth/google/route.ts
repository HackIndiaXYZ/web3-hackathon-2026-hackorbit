import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code'
      })
    });

    const data = await res.json();
    
    if (data.error) {
      console.error('Google token exchange error:', data);
      return NextResponse.json({ success: false, error: data.error_description || data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, tokens: data });
  } catch (error) {
    console.error('API /auth/google error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
