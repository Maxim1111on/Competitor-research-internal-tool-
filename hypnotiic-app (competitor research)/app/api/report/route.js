import { NextResponse } from 'next/server'
import { getClient } from '../../../lib/clients'

export async function POST(request) {
  try {
    const { clientId, notes } = await request.json()
    const client = getClient(clientId)
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 400 })

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

    const prompt = `Write a weekly content performance report for a coaching client.

Client: ${client.name}
Niche: ${client.niche}
Date: ${today}
Notes from the team this week: ${notes || 'No specific notes provided.'}

Write a professional, plain-English report that:
- Opens with a brief summary of the week
- Highlights what content worked well
- Identifies what to improve next week
- Ends with 3 specific recommendations for next week

Keep it concise — under 300 words. Warm but professional tone.
Return only the report text, no subject line or JSON.`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await res.json()
    const reportText = data.content[0].text

    console.log('Weekly report generated for', client.name)
    // Email sending handled by nodemailer in production

    return NextResponse.json({ success: true, preview: reportText.slice(0, 200) + '...' })

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
