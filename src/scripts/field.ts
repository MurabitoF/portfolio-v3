// Ambient background: contour lines of a slowly drifting height field, every fifth one
// an index line in the accent. The pointer raises the ground a little; scroll moves it.

const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uScroll;
uniform vec3 uBg; uniform vec3 uLine; uniform vec3 uAccent;
out vec4 o;

float hash(vec3 p) { p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= .5; } return v; }

void main() {
  float s = min(uRes.x, uRes.y);
  vec2 uv = (gl_FragCoord.xy - .5 * uRes) / s;
  vec2 m = (uMouse - .5 * uRes) / s;
  float bump = exp(-dot(uv - m, uv - m) * 18.);
  float h = fbm(vec3(uv * 1.6 + vec2(0., uScroll * .6), uTime * .04)) + bump * .12;
  float n = h * 22.;
  float line = 1. - min(abs(fract(n - .5) - .5) / fwidth(n), 1.);
  bool index = mod(floor(n + .5), 5.) == 0.;
  float x = gl_FragCoord.x / uRes.x;
  float quiet = uRes.x < uRes.y ? .45 : mix(.4, 1., smoothstep(.42, .78, x)); // text lives on the left
  o = vec4(mix(uBg, index ? uAccent : uLine, line * (index ? .55 : .22) * quiet), 1.);
}`;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

export function mountField(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
  if (!gl) return; // the page background stands in

  const shader = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const U = { res: u('uRes'), time: u('uTime'), mouse: u('uMouse'), scroll: u('uScroll'), bg: u('uBg'), line: u('uLine'), accent: u('uAccent') };

  // Colours come from the page tokens, so the field follows the light/dark theme.
  const paint = () => {
    const css = getComputedStyle(document.documentElement);
    const token = (name: string) => rgb(css.getPropertyValue(name).trim());
    gl.uniform3fv(U.bg, token('--bg'));
    gl.uniform3fv(U.line, token('--field-line'));
    gl.uniform3fv(U.accent, token('--accent'));
  };
  paint();
  new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', paint);

  // ponytail: renders at 0.75x device pixels; the field is soft, raise if lines look blurry on 1x screens
  const dpr = Math.min(devicePixelRatio, 2) * 0.75;
  const resize = () => {
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.res, canvas.width, canvas.height);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  const target = { x: -1e4, y: -1e4 }, mouse = { x: -1e4, y: -1e4 };
  addEventListener('pointermove', (e) => {
    target.x = e.clientX * dpr;
    target.y = canvas.height - e.clientY * dpr;
    if (mouse.x < -1e3) Object.assign(mouse, target);
  }, { passive: true });

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw = (now: number) => {
    mouse.x += (target.x - mouse.x) * 0.06;
    mouse.y += (target.y - mouse.y) * 0.06;
    gl.uniform1f(U.time, still ? 20 : now / 1000);
    gl.uniform2f(U.mouse, mouse.x, mouse.y);
    gl.uniform1f(U.scroll, scrollY / innerHeight);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  if (still) {
    draw(0);
    addEventListener('scroll', () => draw(0), { passive: true });
    new MutationObserver(() => draw(0)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return;
  }
  const loop = (now: number) => {
    if (!document.hidden) draw(now);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
