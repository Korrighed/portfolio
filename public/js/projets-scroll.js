gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('.reel').forEach((reel) => {
  const pin = reel.querySelector('.reel__pin');
  const steps = [...reel.querySelectorAll('.step')].sort(
    (a, b) => Number(a.dataset.step) - Number(b.dataset.step),
  );

  gsap.set(steps, { opacity: 0, y: 24 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: reel,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (steps.length + 0.5),
      scrub: 1,
      pin,
    },
  });

  steps.forEach((step) => {
    tl.to(step, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '+=0.2');
  });
});
