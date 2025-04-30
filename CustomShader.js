const CustomShader = {
  uniforms: {
    "tDiffuse": { value: null },                             // Rendered texture
    "amount": { value: 2 },                                  // Vignette strength
    "center": { value: new THREE.Vector2(0.5, 0.5) },        // Center of effect
    "time": { value: 0.0 },                                  // Time uniform
    "fisheyeStrength": { value: 0.1 },                       // Bulge amount
    "fisheyeRadius": { value: 2.0 }                          // Area affected
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float amount;
    uniform vec2 center;
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float fisheyeStrength;
    uniform float fisheyeRadius;

    varying vec2 vUv;

    void main() {
      vec2 dir = vUv - center;
      float dist = length(dir);

      vec2 uv = vUv;

      // Apply fisheye distortion only within the radius
      if (dist < fisheyeRadius) {
        float normDist = dist / fisheyeRadius; // Normalize distance to 0–1
        vec2 distorted = center + normalize(dir) * pow(normDist, 1.0 - fisheyeStrength) * fisheyeRadius;
        uv = distorted;
      }

      // Clamp to avoid edge artifacts
      uv = clamp(uv, 0.0, 1.0);

      // Sample distorted texture
      vec4 texColor = texture2D(tDiffuse, uv);

      // Time-based fluctuation in vignette amount
      float dynamicAmount = amount + sin(time * 5.0) * 0.1;

      // Apply vignette darkening based on original distance
      texColor.rgb *= 1.0 - dist * dynamicAmount;

      gl_FragColor = texColor;
    }
  `,
};

export { CustomShader };
