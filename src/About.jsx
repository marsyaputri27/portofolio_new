import React, { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import './about.css'
import fotoMarsya from './assets/foto_hd.png'

function About() {
  const navigate = useNavigate()
  const location = useLocation()
  const lightRaysRef = useRef(null)

  // ==========================================
  // FUNGSI TRANSISI NAVIGASI (DENGAN KONDISI)
  // ==========================================
  const handleNavigate = (path) => {
    // 1. Jika tujuannya ke halaman Project, gunakan animasi Fade mulus
    if (path === '/project') {
      gsap.to('.about-page', {
        opacity: 0,
        y: -30,
        duration: 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          navigate(path)
        },
      })
      return // Hentikan fungsi di sini agar animasi kotak tidak jalan
    }

    // 2. Jika tujuannya ke halaman selain Project (misal ke '/'), gunakan animasi Kotak-kotak (Blocks)
    const blocks = document.querySelectorAll('.block')
    
    gsap.set(blocks, { visibility: 'visible', scaleY: 0 })
    
    gsap.to(blocks, {
      scaleY: 1,
      duration: 0.8,
      stagger: {
        each: 0.08,
        from: 'start',
        grid: [2, 5],
        axis: 'x',
      },
      ease: 'power4.inOut',
      onComplete: () => {
        navigate(path)
      },
    })
  }

  // ==========================================
  // ANIMASI BACKGROUND WEBGL LIGHT RAYS
  // ==========================================
  useEffect(() => {
    gsap.fromTo('.about-page',
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
    const container = lightRaysRef.current
    if (!container) return

    const hexToRgb = (hex) => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return m
        ? [
            parseInt(m[1], 16) / 255,
            parseInt(m[2], 16) / 255,
            parseInt(m[3], 16) / 255,
          ]
        : [1, 1, 1]
    }

    const getAnchorAndDir = (origin, w, h) => {
      const outside = 0.2
      switch (origin) {
        case 'top-left':
          return { anchor: [0, -outside * h], dir: [0, 1] }
        case 'top-right':
          return { anchor: [w, -outside * h], dir: [0, 1] }
        case 'left':
          return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] }
        case 'right':
          return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] }
        case 'bottom-left':
          return { anchor: [0, (1 + outside) * h], dir: [0, -1] }
        case 'bottom-center':
          return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] }
        case 'bottom-right':
          return { anchor: [w, (1 + outside) * h], dir: [0, -1] }
        default:
          return { anchor: [0.5 * w, -outside * h], dir: [0, 1] }
      }
    }

    const vert = `
      attribute vec2 position;
      varying vec2 vUv;
      void main(){
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const frag = `
      precision highp float;
      uniform float iTime;
      uniform vec2  iResolution;
      uniform vec2  rayPos;
      uniform vec2  rayDir;
      uniform vec3  raysColor;
      uniform float raysSpeed;
      uniform float lightSpread;
      uniform float rayLength;
      uniform float pulsating;
      uniform float fadeDistance;
      uniform float saturation;
      uniform vec2  mousePos;
      uniform float mouseInfluence;
      uniform float noiseAmount;
      uniform float distortion;
      varying vec2 vUv;

      float noise(vec2 st){
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed){
        vec2 sourceToCoord = coord - raySource;
        vec2 dirNorm = normalize(sourceToCoord);
        float cosAngle = dot(dirNorm, rayRefDirection);
        float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
        float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
        float distance = length(sourceToCoord);
        float maxDistance = iResolution.x * rayLength;
        float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
        float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
        float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;
        float baseStrength = clamp(
          (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
          (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
          0.0, 1.0
        );
        return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
      }

      void mainImage(out vec4 fragColor, in vec2 coord){
        vec2 fragCoord = vec2(coord.x, iResolution.y - coord.y);
        vec2 finalRayDir = rayDir;
        if (mouseInfluence > 0.0){
          vec2 mouseScreenPos = mousePos * iResolution.xy;
          vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
          finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
        }
        vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, fragCoord, 36.2214, 21.11349, 1.5 * raysSpeed);
        vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, fragCoord, 22.3991, 18.0234, 1.1 * raysSpeed);
        fragColor = rays1 * 0.5 + rays2 * 0.4;
        if (noiseAmount > 0.0){
          float n = noise(fragCoord * 0.01 + iTime * 0.1);
          fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
        }
        float brightness = 1.0 - (fragCoord.y / iResolution.y);
        fragColor.x *= 0.1 + brightness * 0.8;
        fragColor.y *= 0.3 + brightness * 0.6;
        fragColor.z *= 0.5 + brightness * 0.5;
        if (saturation != 1.0){
          float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
          fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
        }
        fragColor.rgb *= raysColor;
      }

      void main(){
        vec4 color;
        mainImage(color, gl_FragCoord.xy);
        gl_FragColor = color;
      }
    `

    const origin = 'top-center'
    const raysColor = '#ffffff'
    const raysSpeed = 1
    const lightSpread = 0.5
    const rayLength = 3
    const pulsating = false
    const fadeDistance = 1
    const saturation = 1
    const followMouse = true
    const mouseInfluence = 0.1
    const noiseAmount = 0
    const distortion = 0

    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    container.appendChild(canvas)

    const gl =
      canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false }) ||
      canvas.getContext('experimental-webgl', { alpha: true, antialias: true, premultipliedAlpha: false })

    if (!gl) return

    gl.clearColor(0, 0, 0, 0)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const compile = (type, src) => {
      const sh = gl.createShader(type)
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null
    }

    const link = (vs, fs) => {
      const p = gl.createProgram()
      gl.attachShader(p, vs)
      gl.attachShader(p, fs)
      gl.linkProgram(p)
      return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null
    }

    const vs = compile(gl.VERTEX_SHADER, vert)
    const fs = compile(gl.FRAGMENT_SHADER, frag)
    if (!vs || !fs) return

    const program = link(vs, fs)
    if (!program) return

    gl.useProgram(program)

    const posLoc = gl.getAttribLocation(program, 'position')
    const uTimeLoc = gl.getUniformLocation(program, 'iTime')
    const uResLoc = gl.getUniformLocation(program, 'iResolution')
    const uRayPosLoc = gl.getUniformLocation(program, 'rayPos')
    const uRayDirLoc = gl.getUniformLocation(program, 'rayDir')
    const uRaysColorLoc = gl.getUniformLocation(program, 'raysColor')
    const uRaysSpeedLoc = gl.getUniformLocation(program, 'raysSpeed')
    const uLightSpreadLoc = gl.getUniformLocation(program, 'lightSpread')
    const uRayLengthLoc = gl.getUniformLocation(program, 'rayLength')
    const uPulsatingLoc = gl.getUniformLocation(program, 'pulsating')
    const uFadeDistanceLoc = gl.getUniformLocation(program, 'fadeDistance')
    const uSaturationLoc = gl.getUniformLocation(program, 'saturation')
    const uMousePosLoc = gl.getUniformLocation(program, 'mousePos')
    const uMouseInfluenceLoc = gl.getUniformLocation(program, 'mouseInfluence')
    const uNoiseAmountLoc = gl.getUniformLocation(program, 'noiseAmount')
    const uDistortionLoc = gl.getUniformLocation(program, 'distortion')

    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uniforms = {
      iTime: 0,
      iResolution: [1, 1],
      rayPos: [0, 0],
      rayDir: [0, 1],
      raysColor: hexToRgb(raysColor),
      raysSpeed,
      lightSpread,
      rayLength,
      pulsating: pulsating ? 1.0 : 0.0,
      fadeDistance,
      saturation,
      mousePos: [0.5, 0.5],
      mouseInfluence,
      noiseAmount,
      distortion,
    }

    const mouse = { x: 0.5, y: 0.5 }
    const smooth = { x: 0.5, y: 0.5 }

    const setMouse = (clientX, clientY) => {
      const rect = container.getBoundingClientRect()
      mouse.x = (clientX - rect.left) / rect.width
      mouse.y = (clientY - rect.top) / rect.height
    }

    const onMouse = (e) => setMouse(e.clientX, e.clientY)
    const onTouch = (e) => {
      const t = e.touches[0]
      if (t) setMouse(t.clientX, t.clientY)
    }

    const updatePlacement = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const wCSS = container.clientWidth
      const hCSS = container.clientHeight
      const w = Math.max(1, Math.floor(wCSS * dpr))
      const h = Math.max(1, Math.floor(hCSS * dpr))
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      uniforms.iResolution = [w, h]
      const ad = getAnchorAndDir(origin, w, h)
      uniforms.rayPos = ad.anchor
      uniforms.rayDir = ad.dir
    }

    updatePlacement()
    window.addEventListener('resize', updatePlacement)

    if (followMouse) {
      window.addEventListener('mousemove', onMouse)
      window.addEventListener('touchmove', onTouch, { passive: true })
    }

    gl.uniform3fv(uRaysColorLoc, new Float32Array(uniforms.raysColor))
    gl.uniform1f(uRaysSpeedLoc, uniforms.raysSpeed)
    gl.uniform1f(uLightSpreadLoc, uniforms.lightSpread)
    gl.uniform1f(uRayLengthLoc, uniforms.rayLength)
    gl.uniform1f(uPulsatingLoc, uniforms.pulsating)
    gl.uniform1f(uFadeDistanceLoc, uniforms.fadeDistance)
    gl.uniform1f(uSaturationLoc, uniforms.saturation)
    gl.uniform1f(uMouseInfluenceLoc, uniforms.mouseInfluence)
    gl.uniform1f(uNoiseAmountLoc, uniforms.noiseAmount)
    gl.uniform1f(uDistortionLoc, uniforms.distortion)

    let raf = 0
    const loop = (t) => {
      uniforms.iTime = t * 0.001

      if (followMouse && uniforms.mouseInfluence > 0) {
        const s = 0.92
        smooth.x = smooth.x * s + mouse.x * (1 - s)
        smooth.y = smooth.y * s + mouse.y * (1 - s)
        uniforms.mousePos = [smooth.x, smooth.y]
      }

      gl.uniform1f(uTimeLoc, uniforms.iTime)
      gl.uniform2fv(uResLoc, new Float32Array(uniforms.iResolution))
      gl.uniform2fv(uRayPosLoc, new Float32Array(uniforms.rayPos))
      gl.uniform2fv(uRayDirLoc, new Float32Array(uniforms.rayDir))
      gl.uniform2fv(uMousePosLoc, new Float32Array(uniforms.mousePos))

      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', updatePlacement)
      if (followMouse) {
        window.removeEventListener('mousemove', onMouse)
        window.removeEventListener('touchmove', onTouch)
      }
      try {
        const lose = gl.getExtension('WEBGL_lose_context')
        if (lose) lose.loseContext()
      } catch {}
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
    }
  }, [])

  // Komponen Reusable untuk item-item tech stack
  const TechStackItems = () => (
    <>
      <div className="footer-logo">
        <svg viewBox="0 0 24 24" className="logo-svg" fill="currentColor">
          <path d="M1.5 0h21l-1.91 21.563L11.97 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.236-2.658-12.912-.003.705 8.035h8.922l-.36 4.02-3.882 1.05-3.88-1.05-.25-2.827H5.212l.45 5.58 6.308 1.751 6.31-1.75.832-9.412H8.531z"/>
        </svg>
        <span>HTML</span>
      </div>

      <div className="footer-logo">
        <svg viewBox="0 0 24 24" className="logo-svg" fill="currentColor">
          <path d="M1.5 0h21l-1.91 21.563L11.97 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.236-2.658-12.912-.003.705 8.035h8.922l-.36 4.02-3.882 1.05-3.88-1.05-.25-2.827H5.212l.45 5.58 6.308 1.751 6.31-1.75.832-9.412H8.531z"/>
        </svg>
        <span>CSS</span>
      </div>

      <div className="footer-logo">
        <svg viewBox="0 0 24 24" className="logo-svg" fill="currentColor">
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path d="M3 3h18v18H3V3zm11.708 15.309c-.279.79-1.077 1.156-2.072 1.156-1.076 0-1.897-.336-2.527-1.002l.745-.668c.502.502 1.05.748 1.704.748.513 0 1.037-.168 1.037-.604 0-.392-.387-.534-.897-.732-.971-.371-2.18-.744-2.18-2.22 0-1.12.871-1.874 1.956-1.874.925 0 1.545.242 2.112.784l-.693.682c-.443-.442-.87-.604-1.396-.604-.492 0-.853.197-.853.565 0 .373.342.505.975.765 1.082.441 2.083.744 2.083 2.174l.006.83zM11.666 18H9.684v-7.143h1.982V18z"/>
        </svg>
        <span>JS</span>
      </div>

      <div className="footer-logo">
        <svg viewBox="0 0 24 24" className="logo-svg" fill="currentColor">
          <path d="M12 2.74c-5.93 0-10.74 3.32-10.74 7.42 0 4.11 4.81 7.43 10.74 7.43 5.94 0 10.75-3.32 10.75-7.43 0-4.1-4.81-7.42-10.75-7.42zm2.89 9.38h-1.36l-.55 2.58h-1.36l1.37-6.38h2.24c1.11 0 1.63.34 1.76.99.11.53-.02.94-.3 1.25-.26.83-.98 1.15-2.06 1.15zm-6.2 0H7.33l-.55 2.58H5.42l1.37-6.38h2.24c1.11 0 1.63.34 1.76.99.11.53-.02.94-.3 1.25-.26.83-.98 1.15-2.06 1.15zm9.14-1.15c-.11.53-.44.89-.92 1.05-.38.13-.84.18-1.46.18h-1.36l-.55 2.58h-1.36l1.37-6.38h2.24c1.11 0 1.63.34 1.76.99.11.53-.02.94-.3 1.25zM7.64 8.74H6.62l-.32 1.5h1.02c.48 0 .66-.1.74-.32.06-.2.02-.44-.12-.6-.1-.14-.24-.18-.3-.18zm6.2 0h-1.02l-.32 1.5h1.02c.48 0 .66-.1.74-.32.06-.2.02-.44-.12-.6-.1-.14-.24-.18-.3-.18zm4.39 0h-1.02l-.32 1.5h1.02c.48 0 .66-.1.74-.32.06-.2.02-.44-.12-.6-.1-.14-.24-.18-.3-.18z"/>
        </svg>
        <span>PHP</span>
      </div>

      <div className="footer-logo">
        <svg viewBox="0 0 24 24" className="logo-svg" fill="currentColor">
          <path d="M21.571 5.885l-8.643-5.011c-.572-.332-1.285-.332-1.857 0L2.429 5.885c-.571.332-.929.951-.929 1.615V17.5c0 .664.357 1.283.929 1.615l8.643 5.011c.286.166.607.249.929.249.321 0 .643-.083.929-.249l8.643-5.011c.571-.332.929-.951.929-1.615V7.5c0-.664-.358-1.283-.929-1.615zM12 2.296l7.55 4.378L12 11.052 4.45 6.674 12 2.296zM3.5 8.138l7.5 4.351v8.718l-7.5-4.351V8.138zm17 8.718l-7.5 4.351v-8.718l7.5-4.351v8.718z"/>
        </svg>
        <span>Laravel</span>
      </div>

      <div className="footer-logo">
        <svg viewBox="0 0 24 24" className="logo-svg" fill="currentColor">
          <path d="M12 2C6.48 2 2 4.02 2 6.5s4.48 4.5 10 4.5 10-2.02 10-4.5S17.52 2 12 2zm0 3c-3.87 0-7-1.12-7-1.5S8.13 3.5 12 3.5s7 1.12 7 1.5-3.13 1.5-7 1.5zm0 5c-5.52 0-10-2.02-10-4.5V10c0 2.48 4.48 4.5 10 4.5s10-2.02 10-4.5V5.5c0 2.48-4.48 4.5-10 4.5zm0 3c-3.87 0-7-1.12-7-1.5s3.13-1.5 7-1.5 7 1.12 7 1.5-3.13 1.5-7 1.5zm0 5c-5.52 0-10-2.02-10-4.5V18c0 2.48 4.48 4.5 10 4.5s10-2.02 10-4.5v-4.5c0 2.48-4.48 4.5-10 4.5zm0 3c-3.87 0-7-1.12-7-1.5s3.13-1.5 7-1.5 7 1.12 7 1.5-3.13 1.5-7 1.5z"/>
        </svg>
        <span>Database</span>
      </div>

      <div className="footer-logo">
        <svg viewBox="0 0 24 24" className="logo-svg" fill="currentColor">
          <path d="M12 12c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm-6 6c0-1.657 1.343-3 3-3h3v3c0 1.657-1.343 3-3 3s-3-1.343-3-3zm0-6c0-1.657 1.343-3 3-3h3v6H9c-1.657 0-3-1.343-3-3zm6-9h3c1.657 0 3 1.343 3 3s-1.343 3-3 3h-3V3zm-6 3c0-1.657 1.343-3 3-3h3v6H9c-1.657 0-3-1.343-3-3z"/>
        </svg>
        <span>Figma</span>
      </div>

      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-logo">
        <svg viewBox="0 0 24 24" className="logo-svg" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
        </svg>
        <span>GitHub</span>
      </a>

      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-logo">
        <svg viewBox="0 0 24 24" className="logo-svg" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
        <span>LinkedIn</span>
      </a>

      <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="footer-logo">
        <svg viewBox="0 0 512 512" className="logo-svg" fill="currentColor" style={{ width: '16px', height: '16px', filter: 'brightness(1.5)' }}>
          <path d="M256,48,496,464H16Z"/>
        </svg>
        <span>Vercel</span>
      </a>
    </>
  )

  return (
    <div className="about-page">
      {/* Background WebGL Light Rays */}
      <div className="light-rays-bg" ref={lightRaysRef}></div>
      
      <nav className="portfolio-nav">
        <div className="nav-left" onClick={() => handleNavigate('/')} style={{ cursor: 'pointer' }}>
          <span className="back-arrow">←</span>
        </div>
        <div className="nav-right">
          <span className={`portfolio-nav__link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => handleNavigate('/about')}>About</span>
          <span className={`portfolio-nav__link ${location.pathname === '/project' ? 'active' : ''}`} onClick={() => handleNavigate('/project')}>Project</span>
          <span className={`portfolio-nav__link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => handleNavigate('/contact')}>Contact</span>
        </div>
      </nav>

      {/* Main Content Layout */}
      <div className="portfolio-wrapper">
        <div className="grid-container">
          {/* Left Content Column */}
          <div className="left-column" >
            <span className="sub-tag">Web Developer</span>
            <h1 className="name-title">Marsya Putri</h1>
            <div className="yellow-accent"></div>
            <p className="description-text">
              "A passionate Web Developer with 3 years of practical coding experience through vocational studies. I specialize in building responsive user interfaces, writing clean code, and continuously exploring new technologies to turn ideas into functional digital solutions."
            </p>
            <div className="btn-container">
              <a href="#contact" className="talk-btn">
                Let's talk <span className="arrow-small">→</span>
              </a>
            </div>
          </div>

          {/* Center Profile Image Column */}
          <div className="center-column">
            <div className="image-frame-marsya">
              <img src={fotoMarsya} alt="Marsya Putri" className="marsya-profile-image" />
            </div>
          </div>

          {/* Right Stats Column */}
          <div className="right-column" >
            <div className="stat-card">
              <span className="stat-label">Years of Coding</span>
              <h2 className="stat-value">3+</h2>
            </div>
            <div className="stat-card">
              <span className="stat-label">GitHub Repos</span>
              <h2 className="stat-value">10+</h2>
            </div>
            <div className="stat-card">
              <span className="stat-label">Cups of Coffee</span>
              <h2 className="stat-value">100++</h2>
            </div>
          </div>
        </div>

        {/* Bottom Tech Stack Running Marquee Section */}
        <div className="portfolio-footer">
          <div className="marquee-container">
            <div className="marquee-track">
              {/* Set Pertama */}
              <div className="marquee-group">
                <TechStackItems />
              </div>
              {/* Set Kedua (Duplikat agar looping animasi mulus tanpa jeda) */}
              <div className="marquee-group" aria-hidden="true">
                <TechStackItems />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          FOOTER BENTO GRID SEPERTI DI HALAMAN APP.JS
      ========================================= */}
      <footer className="unique-bento-footer">
        <div className="footer-bento-container">
          
          {/* KARTU 1: BRAND & STATUS (BESAR) */}
          <div className="bento-card bento-main">
            <div className="bento-glow"></div>
            <div className="live-status-badge">
              <span className="pulse-dot"></span> Available for Projects
            </div>
            <h3>Marsya Putri</h3>
            <p>Informatics Student & Software Developer crafting clean code and immersive digital experiences from Bali, Indonesia.</p>
          </div>

          {/* KARTU 2: QUICK NAVIGATION */}
          <div className="bento-card bento-nav-card">
            <div className="bento-glow"></div>
            <h4>Explore</h4>
            <ul>
              <li onClick={() => handleNavigate('/about')}>About</li>
              <li onClick={() => handleNavigate('/project')}>Projects</li>
              <li onClick={() => handleNavigate('/contact')}>Contact</li>
            </ul>
          </div>

          {/* KARTU 3: SOCIAL CONNECTIONS */}
          <div className="bento-card bento-social-card">
            <div className="bento-glow"></div>
            <h4>Connect</h4>
            <div className="social-links-grid">
              <a href="https://github.com/marsyaputri08" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href="https://www.linkedin.com/in/marsya-putri08" target="_blank" rel="noreferrer">LinkedIn ↗</a>
              <a href="mailto:marsyaputri086@gmail.com">Email ↗</a>
            </div>
          </div>

          {/* KARTU 4: COPYRIGHT & DOMAIN (FULL WIDTH BAWAH) */}
          <div className="bento-card bento-bottom-card">
            <p>© {new Date().getFullYear()} Marsya Putri. With love and cup of coffee.</p>
          </div>

        </div>
      </footer>
    </div>
  )
}

export default About