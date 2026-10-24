import { useState } from 'react';
import { FiImage } from 'react-icons/fi';

const FALLBACK =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#17171d"/><stop offset="1" stop-color="#0b0b0f"/></linearGradient></defs>
    <rect width="1200" height="800" fill="url(#g)"/>
    <path d="M250 490h700M350 490l75-135h320l105 135" fill="none" stroke="#33333d" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="455" cy="520" r="48" fill="none" stroke="#E10600" stroke-width="16"/>
    <circle cx="765" cy="520" r="48" fill="none" stroke="#E10600" stroke-width="16"/>
    <text x="600" y="690" text-anchor="middle" fill="#5c5c68" font-family="Arial,sans-serif" font-size="28" letter-spacing="8">MOTORA</text>
  </svg>`);

export default function SmartImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  eager = false,
  ...rest
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`relative block overflow-hidden bg-mist ${className}`}>
      {!loaded && (
        <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-ink/[0.07] via-ink/[0.04] to-ink/[0.08]" />
      )}
      {failed ? (
        <span className={`flex h-full w-full items-center justify-center bg-ink text-white/20 ${imgClassName}`}>
          <FiImage size={40} aria-hidden="true" />
          <span className="sr-only">{alt}</span>
        </span>
      ) : (
        <img
          src={src || FALLBACK}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
          {...rest}
        />
      )}
    </span>
  );
}
