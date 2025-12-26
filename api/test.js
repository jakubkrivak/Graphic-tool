export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  return res.status(200).json({ 
    message: 'API funguje!',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    method: req.method,
    timestamp: new Date().toISOString()
  })
}
