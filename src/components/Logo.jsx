import { Link } from 'react-router-dom';

export default function Logo({ light = true, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="group inline-flex items-center gap-2.5"
      aria-label="Motora Car Dealers — Home"
    >
      <span
        className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border transition-colors ${
          light ? 'border-white/15 bg-white/[0.07]' : 'border-ink/10 bg-ink'
        }`}
      >
        <svg width="26" height="26" viewBox="0 0 40 40" aria-hidden="true">
          <path
            d="M7 30V12h5.6L20 23.5 27.4 12H33v18h-5.4V21.1L20 32.4l-7.6-11.3V30H7z"
            fill="white"
          />
          <circle cx="32.4" cy="8.2" r="3.4" fill="#E10600" />
        </svg>
        <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-racing transition-transform duration-500 group-hover:scale-x-100" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[21px] font-extrabold tracking-[0.17em] ${
            light ? 'text-white' : 'text-ink'
          }`}
        >
          MOTORA
        </span>
        <span
          className={`mt-1 text-[7px] font-semibold uppercase tracking-[0.34em] ${
            light ? 'text-white/35' : 'text-ink/40'
          }`}
        >
          Car Dealers
        </span>
      </span>
    </Link>
  );
}
