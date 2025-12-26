import OpenAI from 'openai'
import busboy from 'busboy'

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 30, // Vercel Pro plan allows up to 60s
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda není povolena' })
  }

  try {
    // Check API key first
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY není nastaven')
      return res.status(500).json({ 
        error: 'OPENAI_API_KEY není nastaven. Nastavte ho v Environment Variables na Vercelu.' 
      })
    }

    // Parse multipart form data using busboy
    const formData = await parseMultipartFormData(req)
    
    if (!formData.files || formData.files.length === 0) {
      return res.status(400).json({ error: 'Žádné fotky nebyly nahrány' })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const posts = []

    // Process each photo
    for (const file of formData.files) {
      const base64Image = file.buffer.toString('base64')
      const mimeType = file.mimetype

      // Analyze image and generate posts
      // Try gpt-4o first, fallback to gpt-4-turbo if needed
      let response
      try {
        response = await openai.chat.completions.create({
          model: 'gpt-4o', // Supports vision API
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyzuj tento obrázek a vytvoř tři různé příspěvky pro sociální sítě:
1. Instagram - kreativní popisek s emoji, 2-3 relevantní hashtagy
2. Facebook - delší popis, přátelský tón, 1-2 hashtagy
3. Twitter/X - stručný, vtipný nebo zajímavý tweet, max 280 znaků, 1-2 hashtagy

Odpověz ve formátu JSON:
{
  "instagram": {
    "content": "...",
    "hashtags": ["#tag1", "#tag2"]
  },
  "facebook": {
    "content": "...",
    "hashtags": ["#tag1"]
  },
  "twitter": {
    "content": "...",
    "hashtags": ["#tag1"]
  }
}

Použij češtinu pro všechny příspěvky.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
      } catch (modelError) {
        // Fallback to gpt-4-turbo if gpt-4o is not available
        console.warn('gpt-4o není dostupný, používám gpt-4-turbo', modelError.message)
        response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyzuj tento obrázek a vytvoř tři různé příspěvky pro sociální sítě:
1. Instagram - kreativní popisek s emoji, 2-3 relevantní hashtagy
2. Facebook - delší popis, přátelský tón, 1-2 hashtagy
3. Twitter/X - stručný, vtipný nebo zajímavý tweet, max 280 znaků, 1-2 hashtagy

Odpověz ve formátu JSON:
{
  "instagram": {
    "content": "...",
    "hashtags": ["#tag1", "#tag2"]
  },
  "facebook": {
    "content": "...",
    "hashtags": ["#tag1"]
  },
  "twitter": {
    "content": "...",
    "hashtags": ["#tag1"]
  }
}

Použij češtinu pro všechny příspěvky.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      }

      const content = response.choices[0].message.content
      
      // Try to parse JSON from response
      let postData
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/)
        const jsonString = jsonMatch ? jsonMatch[1] : content
        postData = JSON.parse(jsonString)
      } catch (parseError) {
        // Fallback: create posts from text response
        console.warn('Nepodařilo se parsovat JSON, používám fallback')
        postData = {
          instagram: { content: content, hashtags: ['#foto', '#social'] },
          facebook: { content: content, hashtags: ['#foto'] },
          twitter: { content: content.substring(0, 280), hashtags: ['#foto'] }
        }
      }

      // Add platform posts
      posts.push({
        platform: 'Instagram',
        content: postData.instagram?.content || postData.instagram || content,
        hashtags: postData.instagram?.hashtags || []
      })

      posts.push({
        platform: 'Facebook',
        content: postData.facebook?.content || postData.facebook || content,
        hashtags: postData.facebook?.hashtags || []
      })

      posts.push({
        platform: 'Twitter/X',
        content: postData.twitter?.content || postData.twitter || content.substring(0, 280),
        hashtags: postData.twitter?.hashtags || []
      })
    }

    return res.status(200).json({ posts })
  } catch (error) {
    console.error('Chyba při generování příspěvků:', error)
    console.error('Error stack:', error.stack)
    return res.status(500).json({ 
      error: 'Chyba při generování příspěvků',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Parse multipart form data using busboy for Vercel serverless
async function parseMultipartFormData(req) {
  return new Promise((resolve, reject) => {
    const files = []
    const filePromises = []
    let hasError = false
    
    try {
      const bb = busboy({ 
        headers: req.headers,
        limits: {
          fileSize: 10 * 1024 * 1024 // 10MB limit
        }
      })
      
      bb.on('file', (name, file, info) => {
        const { filename, mimeType } = info
        const chunks = []
        
        const filePromise = new Promise((fileResolve, fileReject) => {
          file.on('data', (chunk) => {
            chunks.push(chunk)
          })
          
          file.on('end', () => {
            if (!hasError) {
              files.push({
                fieldname: name,
                originalname: filename,
                mimetype: mimeType,
                buffer: Buffer.concat(chunks)
              })
            }
            fileResolve()
          })
          
          file.on('error', (err) => {
            hasError = true
            fileReject(err)
          })
        })
        
        filePromises.push(filePromise)
      })
      
      bb.on('finish', async () => {
        try {
          await Promise.all(filePromises)
          if (!hasError) {
            resolve({ files })
          }
        } catch (error) {
          reject(error)
        }
      })
      
      bb.on('error', (err) => {
        hasError = true
        reject(err)
      })
      
      // Pipe the request to busboy
      if (req.pipe) {
        req.pipe(bb)
      } else {
        // If req is not a stream, read it as buffer
        const chunks = []
        req.on('data', chunk => chunks.push(chunk))
        req.on('end', () => {
          const buffer = Buffer.concat(chunks)
          const { Readable } = require('stream')
          const stream = Readable.from(buffer)
          stream.pipe(bb)
        })
        req.on('error', reject)
      }
    } catch (err) {
      reject(err)
    }
  })
}
