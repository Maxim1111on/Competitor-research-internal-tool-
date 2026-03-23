import { NextResponse } from 'next/server'
import { getClient } from '../../../lib/clients'

export async function POST(request) {
  try {
    const { clientId, notes } = await request.json()
    const client = getClient(clientId)
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })

    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

    const prompt = `Write a weekly content performance report for coaching client "${client.name}".
Niche: ${client.niche}
Week ending: ${date}
Team notes: ${notes || 'No specific notes this week.'}

Write a professional, warm, plain-English report under 250 words.
Include: brief week summary, what worked well, what to improve, 3 specific recommendations for next week.
Return only the report text — no subject line, no JSON, no formatting.`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const reportText = data?.content?.[0]?.text || ''

    return NextResponse.json({ success: true, preview: reportText.slice(0, 300) })
  } catch (e) {
    console.error('Report error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
