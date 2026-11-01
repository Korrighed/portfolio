// Fond du hero : points animes (Vanta « dots »). Charge apres three.min.js et vanta.dots.min.js (public/vendor/).
if (typeof VANTA !== 'undefined') {
  VANTA.DOTS({
    el: '#hero',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0xb4cded, // Powder Blue
    color2: 0x344966, // Yale Blue
    backgroundColor: 0x0d1821, // Ink Black
    size: 6.3,
    spacing: 34.0,
    showLines: false,
  });
}
