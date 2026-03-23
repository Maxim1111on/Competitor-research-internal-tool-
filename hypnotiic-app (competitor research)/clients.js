export const CLIENTS = [
  {
    id: 'patrick',
    name: 'Patrick',
    niche: 'business coaching for male entrepreneurs',
    color: '#7F77DD',
    lightColor: '#EEEDFE',
    content_pillars: ['mindset', 'sales', 'business growth', 'entrepreneurship'],
    target_audience: 'male entrepreneurs aged 25-45',
    search_hashtags: ['businesscoach','entrepreneurmindset','businesscoaching','onlinebusiness','salescoach','wealthmindset'],
  },
  {
    id: 'cohen',
    name: 'Cohen',
    niche: 'high-performance coaching for men',
    color: '#378ADD',
    lightColor: '#E6F1FB',
    content_pillars: ['discipline', 'mindset', 'fitness', 'leadership'],
    target_audience: 'men aged 20-40 seeking high performance',
    search_hashtags: ['highperformance','menscoaching','disciplinemotivation','masculinity','mentalstrength','selfimprovement'],
  },
  {
    id: 'daniel',
    name: 'Daniel',
    niche: 'online business and digital marketing',
    color: '#1D9E75',
    lightColor: '#E1F5EE',
    content_pillars: ['passive income', 'digital products', 'marketing', 'systems'],
    target_audience: 'entrepreneurs building online businesses',
    search_hashtags: ['onlinebusiness','digitalmarketing','passiveincome','digitalproducts','contentmarketing','makemoneyonline'],
  },
]

export function getClient(id) {
  return CLIENTS.find(c => c.id === id?.toLowerCase()) || null
}
