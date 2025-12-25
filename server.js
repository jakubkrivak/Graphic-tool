import express from 'express'
import multer from 'multer'
import cors from 'cors'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Pouze obrázky jsou povoleny'))
    }
  }
})

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
})

// Generate posts endpoint
app.post('/api/generate-posts', upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Žádné fotky nebyly nahrány' })
    }

    const posts = []

    // Process each photo
    for (const file of req.files) {
      const imagePath = file.path
      
      // Read image as base64
      const imageBuffer = fs.readFileSync(imagePath)
      const base64Image = imageBuffer.toString('base64')
      const mimeType = file.mimetype

      // Analyze image and generate posts
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
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

      // Clean up uploaded file
      fs.unlinkSync(imagePath)
    }

    res.json({ posts })
  } catch (error) {
    console.error('Chyba při generování příspěvků:', error)
    
    // Clean up files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      })
    }

    res.status(500).json({ 
      error: 'Chyba při generování příspěvků',
      message: error.message 
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server běží na http://localhost:${PORT}`)
  console.log(`📝 Ujistěte se, že máte nastavený OPENAI_API_KEY v .env souboru`)
})
