import { CATEGORIES } from '../constants'
import Icon from './Icon'

export default function SimilarPostCard({ post, onMerge }) {
  const cat = CATEGORIES.find(c => c.id === post.category)

  return (
    <div className="similar-card">
      <div className="similar-card-info">
        <div className="similar-card-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          {cat?.icon && <Icon name={cat.icon} size={13} style={{ color: cat.color }} />} {post.title}
        </div>
        <div className="similar-card-meta">{post.votes} votes · {post.comments?.length || 0} comments</div>
      </div>
      <button className="similar-card-btn" onClick={() => onMerge(post)}>
        Vote on this
      </button>
    </div>
  )
}
