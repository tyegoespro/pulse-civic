import Icon from './Icon'

export default function QuestionBadge({ scope = 'local', size = 'sm' }) {
  const accent = scope === 'state' ? '#D97706' : '#6366F1'
  const isMd = size === 'md'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isMd ? 4 : 3,
      fontSize: isMd ? 10 : 9,
      fontWeight: 800,
      letterSpacing: '0.06em',
      color: accent,
      background: `${accent}1a`,
      border: `1px solid ${accent}40`,
      padding: isMd ? '2px 7px' : '1px 5px',
      borderRadius: 4,
      whiteSpace: 'nowrap',
      flexShrink: 0,
      textTransform: 'uppercase'
    }}>
      <Icon name="ui-comments" size={isMd ? 10 : 9} />
      Question
    </span>
  )
}
