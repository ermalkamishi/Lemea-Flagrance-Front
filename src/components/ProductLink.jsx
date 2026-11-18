import { Link } from 'react-router-dom';

/**
 * A real <a href="/produktet/:id"> around a product name.
 * Search engines only follow real links, so this makes every product discoverable.
 * stopPropagation keeps the surrounding card's own onClick from navigating a second time.
 * Looks identical to plain text (inherits colour, no underline).
 */
export default function ProductLink({ id, children }) {
  if (!id) return children;
  return (
    <Link
      to={`/produktet/${id}`}
      onClick={(e) => e.stopPropagation()}
      className="text-inherit no-underline hover:text-inherit"
      style={{ color: 'inherit', textDecoration: 'none' }}
    >
      {children}
    </Link>
  );
}
