// Simple test endpoint for Vercel
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  res.status(200).json({ 
    message: 'Hello from Vercel API!',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    method: req.method
  })
}
