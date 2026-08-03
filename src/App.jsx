import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import Lenis from 'lenis'
import SplitType from 'split-type'

import './app.css' 

import fotoLokal1 from './assets/foto_1.jpg' 
import fotoLokal2 from './assets/foto_2.jpg' 
import leptopImg from './assets/leptop.glb' 

gsap.registerPlugin(ScrollTrigger);

function App() {
  const loaderRef = useRef(null)
  const threeModelRef = useRef(null)
  const appRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  
  const [showLoader, setShowLoader] = useState(true)

  // ==========================================
  // FUNGSI TRANSISI NAVIGASI (SWIPE & BLOCKS)
  // ==========================================
  const handleNavigate = (path) => {
    if (path === '/project') {
      gsap.fromTo('.swipe-transition', 
        { yPercent: 100 }, 
        { 
          yPercent: 0, 
          duration: 0.8, 
          ease: 'power4.inOut',
          onComplete: () => navigate(path)
        }
      )
      return;
    }

    const blocks = document.querySelectorAll('.block')
    if (blocks.length > 0) {
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
        onComplete: () => navigate(path) 
      })
    } else {
      navigate(path);
    }
  }

  // ========================================
  // ANIMASI GSAP LOADER
  // ========================================
  useEffect(() => {
    if (!loaderRef.current) return;
    const ctx = gsap.context(() => {
      const loadingLetter = gsap.utils.toArray(".willem__letter");
      const box = gsap.utils.toArray(".willem-loader__box");
      const growingImage = gsap.utils.toArray(".willem__growing-image");
      const headingStart = gsap.utils.toArray(".willem__h1-start");
      const headingEnd = gsap.utils.toArray(".willem__h1-end");
      const coverImageExtra = gsap.utils.toArray(".willem__cover-image-extra");
      const headerLetter = gsap.utils.toArray(".willem__letter-white");
      const navLinks = gsap.utils.toArray(".willen-nav .willem-nav__link, .osmo-credits__p");

      gsap.set(headerLetter, { yPercent: 110 });
      gsap.set(navLinks, { yPercent: 110 });

      const tl = gsap.timeline({
        defaults: { ease: "expo.inOut" },
        onStart: () => loaderRef.current.classList.remove("is--hidden"),
        onComplete: () => {
          gsap.to(loaderRef.current, {
            opacity: 0, duration: 1, delay: 1.5,
            onComplete: () => setShowLoader(false) 
          })
        }
      });

      if (loadingLetter.length) tl.from(loadingLetter, { yPercent: 100, stagger: 0.025, duration: 1.25 });
      if (box.length) tl.fromTo(box, { width: "0em" }, { width: "1em", duration: 1.25 }, "< 1.25");
      if (growingImage.length) tl.fromTo(growingImage, { width: "0%" }, { width: "100%", duration: 1.25 }, "<");
      if (headingStart.length) tl.fromTo(headingStart, { x: "0em" }, { x: "-0.05em", duration: 1.25 }, "<");
      if (headingEnd.length) tl.fromTo(headingEnd, { x: "0em" }, { x: "0.05em", duration: 1.25 }, "<");
      if (coverImageExtra.length) tl.fromTo(coverImageExtra, { opacity: 1 }, { opacity: 0, duration: 0.05, ease: "none", stagger: 0.5 }, "-=0.05");
      
      if (growingImage.length) {
        tl.to(growingImage, { width: "100vw", height: "100dvh", backgroundColor: "#030615", duration: 2 }, "< 1.25");
        const growingWrap = gsap.utils.toArray(".willem__growing-image-wrap");
        if (growingWrap.length) {
          tl.to(growingWrap, { width: "30vw", height: "70vh", top: "15vh", left: "35vw", borderRadius: "0px", duration: 2 }, "<");
          tl.to(".willem__vignette-overlay", { opacity: 1, duration: 2 }, "<");
        }
      }
      if (box.length) tl.to(box, { width: "110vw", duration: 2 }, "<");
      if (headerLetter.length) tl.to(headerLetter, { yPercent: 0, duration: 1.25, ease: "expo.out", stagger: 0.025 }, "< 1.2");
      if (navLinks.length) tl.to(navLinks, { yPercent: 0, duration: 1.25, ease: "expo.out", stagger: 0.1 }, "<");
    }, loaderRef); 
    return () => ctx.revert(); 
  }, []);

  // ========================================
  // ANIMASI 3D SCROLL EXPERIENCE
  // ========================================
  useEffect(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const container = threeModelRef.current;
    if (!container) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 7;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); 
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 5);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 3);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    let modelObj = null;

    const loader = new GLTFLoader();
    loader.load(leptopImg, (gltf) => {
      modelObj = gltf.scene;
      
      modelObj.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(modelObj);
      const center = box.getCenter(new THREE.Vector3());
      modelObj.position.sub(center);
      scene.add(modelObj);
      
      modelObj.scale.set(0, 0, 0);
      modelObj.rotation.set(0, 0.5, 0);
      
      gsap.to(modelObj.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 1.5, ease: "power2.out", delay: 1 });
    });

    let currentScroll = 0;
    lenis.on("scroll", (e) => { currentScroll = e.scroll; });

    let animationFrameId;
    const floatSpeed = 1.5;
    const floatAmplitude = 0.2;

    const animateThree = () => {
      if (modelObj) {
        modelObj.position.y = Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
        const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = totalScrollHeight > 0 ? Math.min(currentScroll / totalScrollHeight, 1) : 0;
        const baseTilt = 0.5;
        modelObj.rotation.x = scrollProgress * Math.PI * 4 + baseTilt;
      }
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animateThree);
    };
    animateThree();

    const splitText = new SplitType(".outro-copy h2", { types: "lines", lineClass: "line" });
    splitText.lines.forEach((line) => {
      const text = line.innerHTML;
      line.innerHTML = `<span style="display: block; transform: translateY(70px);">${text}</span>`;
    });

    ScrollTrigger.create({
      trigger: ".outro",
      start: "top center",
      onEnter: () => gsap.to(".outro-copy h2 .line span", { translateY: 0, duration: 1, stagger: 0.1, ease: "power3.out" }),
      onLeaveBack: () => gsap.to(".outro-copy h2 .line span", { translateY: 70, duration: 1, stagger: 0.1, ease: "power3.out" }),
      toggleActions: "play reverse play reverse",
    });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      lenis.destroy();
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="index" ref={appRef}>
      {/* ---------------- LAYER ANIMASI SWIPE PUTIH ---------------- */}
      <div className="swipe-transition"></div>

      {/* ---------------- LOADER OVERLAY ---------------- */}
      {showLoader && (
        <section ref={loaderRef} className="willem-header is--loading is--hidden">
          <div className="willem-loader">
            <div className="willem__h1">
              <div className="willem__h1-start">
                <span className="willem__letter">M</span>
                <span className="willem__letter">a</span>
                <span className="willem__letter">r</span>
              </div>
              <div className="willem-loader__box">
                <div className="willem-loader__box-inner">
                  <div className="willem__growing-image">
                    <div className="willem__growing-image-wrap">
                      <img className="willem__cover-image-extra is--1" src={fotoLokal1} loading="eager" alt="Marsya A" />
                      <img className="willem__cover-image-extra is--2" src={fotoLokal2} loading="eager" alt="Marsya B" />
                      <img className="willem__cover-image-extra is--3" src={fotoLokal1} loading="eager" alt="Marsya C" />
                      <img className="willem__cover-image" src={fotoLokal2} loading="eager" alt="Marsya D" />
                      <div className="willem__vignette-overlay"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="willem__h1-end">
                <span className="willem__letter">s</span>
                <span className="willem__letter">y</span>
                <span className="willem__letter">a</span>
              </div>
            </div>
          </div>
          <div className="willem-header__content">
            <div className="willem-header__bottom">
              <div className="willem__h1">
                <span className="willem__letter-white">M</span>
                <span className="willem__letter-white">A</span>
                <span className="willem__letter-white">R</span>
                <span className="willem__letter-white">S</span>
                <span className="willem__letter-white">Y</span>
                <span className="willem__letter-white">A</span>
                <span className="willem__letter-white is--space"></span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- NAVBAR ---------------- */}
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

      <div className="stage"></div>
      <div className="model" ref={threeModelRef}></div>

      {/* Kontainer utama */}
      <div className="app-wrapper">
        <div className="scroll-container">
          <section className="intro">
            <div className="header-row">
              <h1 style={{ marginLeft: '90px', color: '#ffffff', textShadow: '0 4px 15px rgba(51, 199, 255, 0.15)' }}>Code for</h1>
            </div>
            <div className="header-row">
              {/* Teks "The Future" diberi warna biru terang, efek glow, dan underline modern */}
              <h1 style={{ 
                marginLeft: '85px', 
                color: '#33c7ff', 
                textShadow: '0 0 25px rgba(51, 199, 255, 0.6)', 
                textDecoration: 'underline', 
                textDecorationColor: 'rgba(51, 199, 255, 0.7)', 
                textDecorationThickness: '3px', 
                textUnderlineOffset: '8px' 
              }}>
                The Future
              </h1>
              <p>
                An active informatics student and passionate software developer. 
                Crafting scalable systems, interactive websites, and intuitive mobile apps 
                for modern clients.
              </p>
            </div>
            <div className="header-row">
              <h1 style={{ marginLeft: '80px', marginBottom: '80px', color: '#ffffff', textShadow: '0 4px 15px rgba(51, 199, 255, 0.15)' }}>Starts Here</h1>
            </div>
          </section>

          <section className="archive">
            <div className="archive-header">
              <p>Expertise & Services</p>
            </div>
            <div className="archive-item interactive-card">
              <h2 style={{ color: '#33c7ff', textShadow: '0 2px 12px rgba(51, 199, 255, 0.4)' }}>Web Development</h2>
              <div className="archive-info">
                <p>ID / Global</p>
                <p>Freelance</p>
                <p>Fullstack</p>
                <p>Modern</p>
              </div>
            </div>
            <div className="archive-item interactive-card">
              <h2 style={{ color: '#33c7ff', textShadow: '0 2px 12px rgba(51, 199, 255, 0.4)' }}>Mobile Apps</h2>
              <div className="archive-info">
                <p>ID / Global</p>
                <p>Development</p>
                <p>React Native</p>
                <p>Interactive</p>
              </div>
            </div>
            <div className="archive-item interactive-card">
              <h2 style={{ color: '#33c7ff', textShadow: '0 2px 12px rgba(51, 199, 255, 0.4)' }}>System Solutions</h2>
              <div className="archive-info">
                <p>ID / Global</p>
                <p>Client Project</p>
                <p>Database</p>
                <p>Scalable</p>
              </div>
            </div>
          </section>

          <section className="outro">
            <div className="outro-copy" style={{ marginLeft: '90px' }}>
              <h2 className="text-white-half" style={{ marginBottom: "0.2em" }}>
                I am an active student and freelance developer specializing in functional software solutions,
              </h2>
              <h2 className="text-blue-half" >
                beautiful digital interfaces, and turning complex ideas into seamless code.
              </h2>
            </div>
          </section>

          {/* =========================================
              FOOTER ESTETIK: BENTO GRID & UNIQUE GLOW
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
      </div>
    </div>
  )
}

export default App