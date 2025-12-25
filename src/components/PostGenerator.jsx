import { useState } from 'react'
import './PostGenerator.css'

function PostGenerator({ posts }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Chyba při kopírování:', err)
    }
  }

  return (
    <div className="post-generator">
      <h2>Vygenerované příspěvky</h2>
      <div className="posts-container">
        {posts.map((post, index) => (
          <div key={index} className="post-card">
            <div className="post-header">
              <h3>{post.platform}</h3>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(post.content, index)}
                title="Kopírovat"
              >
                {copiedIndex === index ? '✓ Zkopírováno' : '📋 Kopírovat'}
              </button>
            </div>
            <div className="post-content">
              <p>{post.content}</p>
            </div>
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="post-hashtags">
                {post.hashtags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="hashtag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PostGenerator
