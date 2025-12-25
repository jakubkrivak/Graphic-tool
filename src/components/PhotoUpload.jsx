import { useState, useRef } from 'react'
import './PhotoUpload.css'

function PhotoUpload({ onPhotosUploaded, onGeneratePosts, loading }) {
  const [photos, setPhotos] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = (files) => {
    const fileArray = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    )

    const newPhotos = fileArray.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }))

    setPhotos(prev => [...prev, ...newPhotos])
    onPhotosUploaded([...photos, ...newPhotos])
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removePhoto = (id) => {
    setPhotos(prev => {
      const updated = prev.filter(photo => photo.id !== id)
      onPhotosUploaded(updated)
      return updated
    })
  }

  const handleGenerate = () => {
    if (photos.length > 0) {
      onGeneratePosts(photos)
    }
  }

  return (
    <div className="photo-upload">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <div className="upload-content">
          <div className="upload-icon">📷</div>
          <p className="upload-text">
            Klikněte nebo přetáhněte fotky sem
          </p>
          <p className="upload-hint">
            Podporované formáty: JPG, PNG, GIF, WEBP
          </p>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="photos-preview">
          <h3>Nahrané fotky ({photos.length})</h3>
          <div className="photos-grid">
            {photos.map(photo => (
              <div key={photo.id} className="photo-item">
                <img src={photo.preview} alt="Preview" />
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    removePhoto(photo.id)
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || photos.length === 0}
          >
            {loading ? 'Generuji příspěvky...' : '🎨 Vygenerovat příspěvky'}
          </button>
        </div>
      )}
    </div>
  )
}

export default PhotoUpload
