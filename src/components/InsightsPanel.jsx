import { useMemo } from 'react'
import { CATEGORIES, STATE_CATEGORIES } from '../constants'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts'
import Icon from './Icon'

const CHART_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#FF3366', '#22C55E', '#3B82F6', '#F59E0B', '#10B981', '#6B7280']

export default function InsightsPanel({ posts, scope = 'local' }) {
  const activeCategories = scope === 'state' ? STATE_CATEGORIES : CATEGORIES
  const isState = scope === 'state'

  const categoryData = useMemo(() => {
    const map = {}
    posts.forEach(post => {
      if (!map[post.category]) {
        const cat = activeCategories.find(c => c.id === post.category)
        map[post.category] = { name: cat?.label || post.category, value: 0, votes: 0, color: cat?.color || '#6B7280' }
      }
      map[post.category].value += 1
      map[post.category].votes += post.votes
    })
    return Object.values(map).sort((a, b) => b.votes - a.votes)
  }, [posts, activeCategories])

  const topPost = useMemo(() =>
    [...posts].sort((a, b) => b.votes - a.votes)[0],
    [posts]
  )

  const totalVotes = posts.reduce((sum, p) => sum + p.votes, 0)
  const totalPosts = posts.length
  const topCategory = categoryData[0]

  const topCat = topPost ? activeCategories.find(c => c.id === topPost.category) : null

  return (
    <div style={{ paddingBottom: 100 }} className="stagger-children">
      {/* Header */}
      <div className="insights-header animate-slide-up">
        <h2 className="insights-title">
          {isState ? 'State Pulse Report' : 'City Pulse Report'}
        </h2>
        <p className="insights-subtitle">
          {isState
            ? 'Real-time statewide sentiment · Wisconsin'
            : 'Real-time municipal sentiment · Oshkosh, WI'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="insights-grid animate-slide-up">
        <div className="insights-stat">
          <span className="insights-stat-value indigo">{totalVotes.toLocaleString()}</span>
          <span className="insights-stat-label">Total Votes</span>
        </div>
        <div className="insights-stat">
          <span className="insights-stat-value success">{totalPosts}</span>
          <span className="insights-stat-label">Active Issues</span>
        </div>
      </div>

      {/* Trending Topic Card */}
      {topPost && (
        <div className="trending-card animate-slide-up" style={isState ? {
          background: 'linear-gradient(135deg, #D97706, #B45309)',
          boxShadow: '0 4px 24px rgba(217, 119, 6, 0.3)'
        } : {}}>
          <div className="trending-badge">
            <span className="trending-badge-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icon name="ui-trending" size={14} />
              Trending Now
            </span>
            <span className="trending-badge-category" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {topCat?.icon && <Icon name={topCat.icon} size={13} />}
              {topCat?.label}
            </span>
          </div>
          <p className="trending-quote">"{topPost.title}"</p>
          <div className="trending-stats">
            <div>
              <span className="trending-votes">{topPost.votes}</span>
              <span className="trending-votes-label">votes</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="ui-location" size={11} />
                {topPost.location}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{topPost.createdAt}</div>
            </div>
          </div>
        </div>
      )}

      {/* Category Bar Chart */}
      <div className="insights-chart-card animate-slide-up">
        <h3 className="insights-chart-title">Top Issues by Category</h3>
        <div style={{ height: 280, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                width={90}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{
                  background: '#1A1A2E',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#F3F4F6'
                }}
              />
              <Bar dataKey="votes" radius={[0, 6, 6, 0]} barSize={24}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Pie Chart */}
      <div className="insights-chart-card animate-slide-up">
        <h3 className="insights-chart-title">Issue Distribution</h3>
        <div style={{ height: 240, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1A1A2E',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#F3F4F6'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px 16px',
          marginTop: 12
        }}>
          {categoryData.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: d.color }} />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        fontSize: 11,
        color: 'var(--text-muted)',
        padding: '16px 0'
      }}>
        Data updated in real-time based on citizen interactions.
      </div>
    </div>
  )
}
