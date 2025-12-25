import { useState } from 'react'
import PhotoUpload from './components/PhotoUpload'
import PostGenerator from './components/PostGenerator'
import './App.css'

function App() {
  const [uploadedPhotos, setUploadedPhotos] = useState([])
  const [generatedPosts, setGeneratedPosts] = useState([])
  const [loading, setLoading] = useState(false)

  const handlePhotosUploaded = (photos) => {
    setUploadedPhotos(photos)
  }

  const handleGeneratePosts = async (photos) => {
    setLoading(true)
    try {
      const formData = new FormData()
      photos.forEach((photo, index) => {
        formData.append('photos', photo.file)
      })

      const response = await fetch('/api/generate-posts', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Chyba při generování příspěvků')
      }

      const data = await response.json()
      setGeneratedPosts(data.posts)
    } catch (error) {
      console.error('Chyba:', error)
      alert('Nepodařilo se vygenerovat příspěvky. Zkontrolujte, zda je server spuštěn a máte nastavený OPENAI_API_KEY.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📸 Generátor příspěvků na sociální sítě</h1>
        <p>Nahrajte fotky a nechte si vygenerovat příspěvky pro Instagram, Facebook a Twitter</p>
      </header>

      <main className="app-main">
        <PhotoUpload 
          onPhotosUploaded={handlePhotosUploaded}
          onGeneratePosts={handleGeneratePosts}
          loading={loading}
        />

        {generatedPosts.length > 0 && (
          <PostGenerator posts={generatedPosts} />
        )}
      </main>
    </div>
  )
}

export default App
