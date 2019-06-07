import React from 'react';
import Color from 'color';

const toBase64 = source => {
  if (this && this.btoa instanceof Function) this.btoa(source);
  return Buffer.from(source).toString('base64');
};

function makeSvg(src) {
  const [size, color] = src.split('/');
  const [w, h] = size.split('x');
  const textSize = 14;
  const fillRect = Color(/^#[0-9abcdef]{3,6}/.test(color) ? color : '#888888');
  const fillText = fillRect.darken(0.2).desaturate(0.4);
  console.log(Math.abs(fillRect.luminosity() - fillText.luminosity()));

  const x = (w / 2).toFixed(2);
  const y = (h / 2 + textSize / 2).toFixed(2);
  const fontSize = `${textSize}pt`;
  return `data:image/svg+xml;base64,${toBase64(`
<svg 
  width="${w}" 
  height="${h}" 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 ${w} ${h}" 
  preserveAspectRatio="none">
  <defs>
    <style type="text/css">
      #holder text { 
        fill: ${fillText.hex()};
        font-weight: bold;
        font-family: Arial, Helvetica, Open Sans, sans-serif, monospace;
        font-size: ${fontSize};
      }
    </style>
  </defs>
  <g id="holder">
      <rect width="${w}" height="${h}" fill="${fillRect.hex()}"/>
      <g>
          <text x="${x}" y="${y}" text-anchor="middle" alignment-baseline="middle">${size}</text>
      </g>
  </g>
</svg>`)}`;
}

export default function Holder(props) {
  const { className, src } = props;
  return <img className={className} src={makeSvg(src)} alt="" />;
}
