import React, { useLayoutEffect } from "react";
import "./Scene.css";
import sky from "./assets/scene/sky.png";
import cloudsFar from "./assets/scene/clouds-far.png";
import cloudsNear from "./assets/scene/clouds-near.png";
import town from "./assets/scene/town.png";
import treeline from "./assets/scene/treeline.png";
import ground from "./assets/scene/ground.png";
import oak from "./assets/scene/oak.png";
import bushA from "./assets/scene/bush-a.png";
import bushB from "./assets/scene/bush-b.png";
import shafts from "./assets/scene/shafts.png";
import laptop from "./assets/scene/stump-laptop.png";
import poppy from "./assets/scene/poppy.png";
import daisy from "./assets/scene/daisy.png";
import bell from "./assets/scene/bell.png";

const TARGET_ROWS = 240;
const MIN_PX = 2;
const MAX_PX = 6;

// One art pixel is a whole number of device pixels, or the artwork blurs.
const useArtScale = () => {
  useLayoutEffect(() => {
    const apply = () => {
      const dpr = window.devicePixelRatio || 1;
      const wanted = Math.round((window.innerHeight * dpr) / TARGET_ROWS);
      const device = Math.min(Math.max(wanted, Math.ceil(MIN_PX * dpr)), Math.floor(MAX_PX * dpr));
      const root = document.documentElement;
      root.style.setProperty("--px", `${device / dpr}px`);
      root.style.setProperty("--cx", `${Math.round((root.clientWidth / 2) * dpr) / dpr}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
};

const BACKDROP = [
  { src: sky, anchor: "bottom", repeat: true, w: 4, h: 210, y: 84 },
  { src: cloudsFar, cls: "sk-drift", anchor: "bottom", repeat: true, w: 640, h: 60, y: 96, ox: 40, ms: 1000 },
  { src: cloudsNear, cls: "sk-drift", anchor: "bottom", repeat: true, w: 640, h: 176, y: 116, ox: -40, ms: 520 },
  { src: town, anchor: "bottom", repeat: true, w: 640, h: 50, y: 93, ox: 60 },
  { src: treeline, anchor: "bottom", repeat: true, w: 640, h: 34, y: 75 },
  { src: ground, anchor: "bottom", repeat: true, w: 640, h: 92, ox: -320 },
];

const PROPS = [
  { src: oak, anchor: "bottom-left", w: 210, h: 250, x: -24, y: 30 },
  { src: bushA, anchor: "bottom-left", w: 58, h: 34, x: 58, y: 20 },
  { src: bushB, anchor: "bottom-right", w: 44, h: 26, x: 150, y: 14 },
  { src: shafts, cls: "sk-shafts", anchor: "top-right", w: 230, h: 250, x: 0, y: 0 },
  { src: laptop, cls: "sk-frames sk-laptop", anchor: "bottom-right", frames: true, w: 136, h: 112, n: 2, x: 34, y: 6, dur: "1100ms" },
  { src: poppy, cls: "sk-sway", anchor: "bottom-right", w: 12, h: 13, x: 176, y: 8, dur: "1900ms", lean: 7, delay: "-300ms" },
  { src: poppy, cls: "sk-sway", anchor: "bottom-right", w: 12, h: 13, x: 192, y: 3, dur: "1600ms", lean: 9, delay: "-1100ms" },
  { src: daisy, cls: "sk-sway", anchor: "bottom-right", w: 9, h: 9, x: 20, y: 2, dur: "1500ms", lean: 8, delay: "-700ms" },
  { src: poppy, cls: "sk-sway", anchor: "bottom-left", w: 12, h: 13, x: 128, y: 10, dur: "1750ms", lean: 8, delay: "-1500ms" },
  { src: daisy, cls: "sk-sway", anchor: "bottom-left", w: 9, h: 9, x: 150, y: 12, dur: "1450ms", lean: 7, delay: "-200ms" },
  { src: bell, cls: "sk-sway", anchor: "bottom-left", w: 9, h: 9, x: 166, y: 5, dur: "2050ms", lean: 10, delay: "-900ms" },
  { src: daisy, cls: "sk-sway", anchor: "bottom-center", w: 9, h: 9, x: 36, y: 4, dur: "1650ms", lean: 8, delay: "-1300ms" },
  { src: bell, cls: "sk-sway", anchor: "bottom-center", w: 9, h: 9, x: -100, y: 9, dur: "1850ms", lean: 9, delay: "-500ms" },
];

const CLOTH_COLUMNS = [0, 1, 2, 3, 4, 5, 6, 7];

// Everything except src, cls, anchor, repeat and frames becomes a CSS custom property of the layer.
const Layer = ({ src, cls, anchor, repeat, frames, ...vars }) => {
  const style = { backgroundImage: `url(${src})` };
  Object.entries(vars).forEach(([name, value]) => {
    style[`--${name}`] = value;
  });
  return (
    <div
      className={cls ? `tr-layer ${cls}` : "tr-layer"}
      data-anchor={anchor}
      data-repeat={repeat ? "x" : undefined}
      data-frames={frames ? "" : undefined}
      style={style}
    />
  );
};

function Scene() {
  useArtScale();

  return (
    <div className="tr-scene" aria-hidden="true">
      {BACKDROP.map((layer, index) => (
        <Layer key={index} {...layer} />
      ))}
      <div className="tr-layer sk-flag" data-anchor="bottom-center" style={{ "--w": 14, "--h": 14, "--x": -63, "--y": 70 }}>
        <i className="sk-pole" />
        {CLOTH_COLUMNS.map((k) => (
          <i key={k} className="sk-cloth" style={{ "--k": k }} />
        ))}
      </div>
      {PROPS.map((layer, index) => (
        <Layer key={index} {...layer} />
      ))}
      <div className="sk-cold" />
    </div>
  );
}

export default Scene;
