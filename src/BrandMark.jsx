/* Himanshu Garg monogram — the two initials paired by a thin gold rule,
   echoing the gold dividers used across the site. `ring` draws the badge
   circle for standalone use (loader); omit it inside a chip that already
   provides its own circle (footer). Colors adapt: the H takes currentColor,
   the G and rule stay gold, so it reads on both light and dark surfaces. */
export function BrandMark({ className = "", ring = false, ariaLabel = "Himanshu Garg" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`brandmark ${className}`.trim()}
      role="img"
      aria-label={ariaLabel}
    >
      {ring && (
        <>
          <circle cx="50" cy="50" r="47" className="brandmark__ring" />
          <circle cx="50" cy="50" r="42.5" className="brandmark__ring brandmark__ring--in" />
        </>
      )}
      <text x="33" y="63" className="brandmark__letter brandmark__h">H</text>
      <line x1="50" y1="33" x2="50" y2="67" className="brandmark__rule" />
      <text x="67" y="63" className="brandmark__letter brandmark__g">G</text>
    </svg>
  );
}
