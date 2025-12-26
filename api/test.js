export default async function handler(req, res) {
  return res.status(200).json({ 
    message: 'API funguje!',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    method: req.method
  })
}
