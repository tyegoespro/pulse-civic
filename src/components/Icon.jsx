/**
 * Icon — renders a Streamline Plump (line) glyph from the inlined SVG sprite.
 * Sprite is mounted once at the root of <App />. Stroke color follows
 * `color` (or inherited via currentColor), so wrap the icon in any colored
 * container or pass `color` explicitly.
 */
export default function Icon({
  name,
  size = 20,
  color,
  strokeWidth,
  style,
  className,
  title,
  ...rest
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      style={{
        color,
        flexShrink: 0,
        // Plump line icons are authored at 48px with a 3px stroke. Scale
        // the visual stroke weight to the rendered size so it looks crisp.
        ...(strokeWidth ? { '--icon-stroke': strokeWidth } : null),
        ...style
      }}
      {...rest}
    >
      <use href={`#${name}`} />
    </svg>
  )
}
