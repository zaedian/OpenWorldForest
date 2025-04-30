const CustomShaderFirstPerson = {
  uniforms: {
    "tDiffuse": { value: null },                             // Rendered texture
    "amount": { value: 0.1 },                                  // Vignette strength
    "center": { value: new THREE.Vector2(0.5, 0.5) },        // Center of effect
    "time": { value: 0.0 },                                  // Time uniform
    "crosshairSize": { value: 0.001 },                         // Size of the crosshair (radius of the dot)
    "crosshairThickness": { value: 0.0003 }                    // Thickness of the crosshair lines (not used here)
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
    uniform float crosshairSize;
    uniform float crosshairThickness;

    varying vec2 vUv;

    void main() {
      vec2 dir = vUv - center;
      float dist = length(dir);

      // Correct for aspect ratio to preserve the circular shape
      float aspect = 1.0;  // Assuming a square aspect ratio for the texture
      if (gl_FragCoord.x / gl_FragCoord.y > 1.0) {
        aspect = gl_FragCoord.x / gl_FragCoord.y;  // Adjust for non-square aspect ratios
      }

      // UV coordinates
      vec2 uv = vUv;

      // Clamp to avoid edge artifacts
      uv = clamp(uv, 0.0, 1.0);

      // Sample the texture
      vec4 texColor = texture2D(tDiffuse, uv);

      // Time-based fluctuation in vignette amount
      float dynamicAmount = amount + sin(time * 5.0) * 0.1;

      // Apply vignette darkening based on original distance
      texColor.rgb *= 1.0 - dist * dynamicAmount;

      // Adjust dist for aspect ratio
      dist = length(vec2(dir.x * aspect, dir.y));  // This ensures that the distance calculation accounts for aspect ratio

      // Draw a small green dot with a black border
      float borderSize = crosshairSize + crosshairThickness; // Border area around the crosshair dot

      if (dist < crosshairSize) {
        texColor = vec4(1.0, 1.0, 1.0, 1.0);  // Lime Green color for crosshair (dot)
      } else if (dist < borderSize) {
        texColor = vec4(0.0, 0.0, 0.0, 1.0);  // Black color for crosshair border
      }

      gl_FragColor = texColor;
    }
  `,
};

export { CustomShaderFirstPerson };
