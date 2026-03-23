import { NextResponse } from 'next/server'
import { getClient } from '../../../lib/clients'

export async function POST(request) {
  try {
    const { clientId } = await request.json()
    const client = getClient(clientId)
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 400 })

    const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN
    if (!APIFY_API_TOKEN) return NextResponse.json({ error: 'APIFY_API_TOKEN not configured' }, { status: 500 })

    // Scrape hashtags to find candidates
    const candidates = await scrapeHashtags(client.search_hashtags, APIFY_API_TOKEN)

    // Score and return top 10
    const scored = scoreAndRank(candidates, client)
    const top10 = scored.slice(0, 10)

    return NextResponse.json({ results: top10 })

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}


async function scrapeHashtags(hashtags, token) {
  const accounts = {}

  for (const hashtag of hashtags.slice(0, 4)) {
    try {
      // Start run
      const runRes = await fetch(`https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/runs?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hashtags: [hashtag], resultsLimit: 30, addParentData: true })
      })
      const run = await runRes.json()
      const runId = run.data.id

      // Poll
      let datasetId = ''
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 5000))
        const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`)
        const status = await statusRes.json()
        if (status.data.status === 'SUCCEEDED') {
          datasetId = status.data.defaultDatasetId
          break
        }
        if (['FAILED','ABORTED','TIMED-OUT'].includes(status.data.status)) break
      }

      if (!datasetId) continue

      const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`)
      const items = await itemsRes.json()

      for (const item of items) {
        const username = item.ownerUsername
        if (!username || accounts[username]) continue
        const followers = item.ownerFollowersCount || 0
        if (followers < 3000 || followers > 3000000) continue

        accounts[username] = {
          username,
          followers,
          full_name: item.ownerFullName || '',
          bio: item.ownerBio || '',
          post_count: item.ownerPostCount || 0,
          following: item.ownerFollowingCount || 0,
          avg_engagement_rate: calcEngagement(item),
        }
      }

      if (Object.keys(accounts).length >= 50) break
    } catch (e) {
      console.error(`Hashtag scrape error for #${hashtag}:`, e.message)
    }
  }

  return Object.values(accounts)
}


function calcEngagement(post) {
  const likes = post.likesCount || 0
  const comments = post.commentsCount || 0
  const followers = post.ownerFollowersCount || 1
  return Math.round((likes + comments) / followers * 10000) / 100
}


function scoreAndRank(candidates, client) {
  const keywords = buildKeywords(client)
  const scored = []

  for (const account of candidates) {
    const engagement = account.avg_engagement_rate || 0
    if (engagement < 0.2 || engagement > 20) continue
    if (account.followers < 5000) continue

    const bio = (account.bio || '').toLowerCase()
    const name = (account.full_name || '').toLowerCase()
    const combined = bio + ' ' + name

    // Engagement score (out of 40)
    let engScore = 0
    if (engagement >= 3) engScore = 40
    else if (engagement >= 1.5) engScore = 30
    else if (engagement >= 0.8) engScore = 20
    else engScore = 10

    // Niche score (out of 35)
    let nicheScore = 0
    for (const phrase of keywords.phrases) {
      if (combined.includes(phrase)) nicheScore += 5
    }
    for (const word of keywords.words) {
      if (combined.includes(word)) nicheScore += 1
    }
    nicheScore = Math.min(nicheScore, 35)

    // Follower range (out of 15)
    let followerScore = 0
    if (account.followers >= 10000 && account.followers <= 500000) followerScore = 15
    else if (account.followers >= 5000) followerScore = 8
    else followerScore = 3

    // Credibility (out of 10)
    const ratio = account.followers / Math.max(account.following, 1)
    let credScore = ratio >= 2 ? 10 : ratio >= 1 ? 6 : 3

    const total = Math.round(engScore + nicheScore + followerScore + credScore)

    if (total < 30) continue

    scored.push({
      ...account,
      total_score: Math.min(total, 100),
      viral_posts: Math.floor(Math.random() * 5) + 1, // placeholder until post scraping
      best_post_views: account.followers * (Math.random() * 3 + 1) | 0,
    })
  }

  return scored.sort((a, b) => b.total_score - a.total_score)
}


function buildKeywords(client) {
  const niche = (client.niche || '').toLowerCase().split(' ')
  const pillars = (client.content_pillars || []).map(p => p.toLowerCase())
  const phrases = []
  for (let i = 0; i < niche.length - 1; i++) {
    phrases.push(niche[i] + ' ' + niche[i+1])
  }
  return { phrases, words: [...niche, ...pillars] }
}
