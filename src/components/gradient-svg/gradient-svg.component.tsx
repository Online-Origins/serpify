function GradientSVG() {
  const idCSS = "hello";
  const gradientTransform = `rotate(90)`;
  return (
    <svg style={{ height: 0, position: "absolute" }}>
      <defs>
        <linearGradient id={idCSS} gradientTransform={gradientTransform}>
          <stop offset="0%" stopColor="rgba(255,77,53,.8)" />
          <stop offset="45%" stopColor="rgba(255,150,53,.8)" />
          <stop offset="100%" stopColor="rgba(16,204,80,1)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default GradientSVG;
