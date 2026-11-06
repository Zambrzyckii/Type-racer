import React from "react";

// Pixel icons from pixelarticons 2.4.1 by Gerrit Halfmann (MIT), https://github.com/halfmage/pixelarticons
// Some icons are drawn as two paths; joining them changes the anti-aliasing where they meet.
const PATHS = {
  freeze: "M13 24h-2v-2h2v2Zm-2-2H9v-2H7v2H2v-5h2v3h3v-2h2v-2h2v6Zm4-4h2v2h-2v2h-2v-6h2v2Zm7 4h-5v-2h3v-3h2v5ZM4 15H2v-2h6v2H6v2H4v-2Zm18 0h-2v2h-2v-2h-2v-2h6v2ZM2 13H0v-2h2v2Zm22 0h-2v-2h2v2ZM6 9h2v2H2V9h2V7h2v2Zm14 0h2v2h-6V9h2V7h2v2Zm-9-1H9V6H7V4h2V2h2v6Zm4-4h2V2h5v5h-2V4h-3v2h-2v2h-2V2h2v2ZM7 4H4v3H2V2h5v2Zm6-2h-2V0h2v2Z",
  flashbang: "M4 13h8v6h2v2h-2v2h-2v-8H2v-4h2v2Zm12 6h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2v-2h2v2Zm-6-6h8v4h-2v-2h-8V5h-2V3h2V1h2v8Zm-8 2H4V9h2v2Zm2-2H6V7h2v2Zm2-2H8V5h2v2Z",
  chaos: "M10 19H2v-2h8v2Zm12 0h-8v-2h8v2Zm-10-2h-2v-6h2v6Zm6-10h2v2h2v2h-2v2h-2v2h-2v-4h-4V9h4V5h2v2ZM8 11H2V9h6v2Z",
  bomb: "M12 6H14V10H16V12H18V18H16V20H14V22H6V20H4V18H2V12H4V10H6V6H10V4H12V6ZM12 16H14V14H12V16ZM10 14H12V12H10V14ZM22 13H20V11H22V13ZM22 10H20V6H22V10ZM20 6H18V4H20V6ZM18 4H12V2H18V4Z",
  shield: "M4 2h16v2H4zM2 4h2v10H2zm18 0h2v10h-2zM4 14h2v2H4zm2 2h2v2H6zm4 4h4v2h-4zm10-6h-2v2h2zm-2 2h-2v2h2zm-2 2h-2v2h2zm-6 0H8v2h2z",
  host: ["M3 3h2v12H3zm16 0h2v12h-2zm-8 0h2v2h-2zM9 5h2v2H9zM5 5h2v2H5z", "M3 3h2v2H3zm4 4h2v2H7zm6-2h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zM5 15h14v2H5zm-2 4h18v2H3z"],
  guest: "M9 2h6v2H9zm0 8h6v2H9zm6-6h2v6h-2zM7 4h2v6H7zM4 18h2v4H4zm14 0h2v4h-2zM8 14h8v2H8zm-2 2h2v2H6zm10 0h2v2h-2z",
  logout: ["M8 11h12v2H8zm8-2h2v2h-2z", "M14 7h2v10h-2zm2 6h2v2h-2zM6 2h12v2H6zm0 18h12v2H6zM4 4h2v16H4zm14 0h2v3h-2zm0 13h2v3h-2z"],
  error: "M7 19H5V17H7V19ZM19 19H17V17H19V19ZM9 15V17H7V15H9ZM17 17H15V15H17V17ZM11 15H9V13H11V15ZM15 15H13V13H15V15ZM13 13H11V11H13V13ZM11 11H9V9H11V11ZM15 11H13V9H15V11ZM9 9H7V7H9V9ZM17 9H15V7H17V9ZM7 7H5V5H7V7ZM19 7H17V5H19V7Z",
};

function Icon({ name }) {
  if (!PATHS[name]) return null;

  return (
    <span className="tr-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
        {[].concat(PATHS[name]).map((d, index) => (
          <path key={index} d={d} />
        ))}
      </svg>
    </span>
  );
}

export default Icon;
