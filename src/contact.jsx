import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";
import "./contact.css";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const pageRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ==========================================
  // FUNGSI TRANSISI NAVIGASI (SWIPE KELUAR)
  // ==========================================
  const handleNavigate = (path) => {
    setIsMenuOpen(false);
    gsap.fromTo('.swipe-transition', 
      { yPercent: 100 }, 
      { 
        yPercent: 0, 
        duration: 0.8, 
        ease: 'expo.inOut',
        onComplete: () => navigate(path)
      }
    );
  };

  useEffect(() => {
    gsap.fromTo('.swipe-transition',
      { yPercent: 0 },
      { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }
    );

    gsap.fromTo('.contact-hero-content > *, .contact-bento-grid > *',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.3 }
    );

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    const container = canvasContainerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x33c7ff, 3);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const cubesGroup = new THREE.Group();
    scene.add(cubesGroup);

    const cubeData = [];
    
    // Konfigurasi 10 Balok Tersebar Abstrak
    const itemsConfig = [
      { x: -7.5, y: 3.5, z: -2, size: 1.5, speedFactor: 0.8 },
      { x: 7.8, y: 3.0, z: -4, size: 0.6, speedFactor: 1.2 },
      { x: -7.8, y: -3.0, z: -1, size: 0.8, speedFactor: 0.9 },
      { x: 7.5, y: -3.2, z: -3, size: 1.7, speedFactor: 1.1 },
      { x: -5.8, y: -0.2, z: -5, size: 0.5, speedFactor: 1.4 },
      { x: 6.2, y: 0.2, z: -4, size: 0.7, speedFactor: 0.7 },
      { x: -3.5, y: 4.2, z: -3, size: 1.4, speedFactor: 1.0 },
      { x: 4.0, y: 4.0, z: -5, size: 0.6, speedFactor: 1.3 },
      { x: -2.8, y: -4.2, z: -2, size: 0.7, speedFactor: 0.8 },
      { x: 3.2, y: -4.3, z: -4, size: 1.0, speedFactor: 1.1 }
    ];

    itemsConfig.forEach((cfg, index) => {
      const geometry = new THREE.BoxGeometry(cfg.size, cfg.size, cfg.size);
      const material = new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0x33c7ff : 0xffd043,
        wireframe: true,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      cubesGroup.add(mesh);

      const pGroup = new THREE.Group();
      pGroup.position.set(cfg.x, cfg.y, cfg.z);
      pGroup.visible = false;
      cubesGroup.add(pGroup);

      const particles = [];
      const pCount = Math.floor(16 * (cfg.size * 0.7));
      const pGeo = new THREE.BoxGeometry(cfg.size * 0.18, cfg.size * 0.18, cfg.size * 0.18);
      
      for (let i = 0; i < pCount; i++) {
        const pMat = new THREE.MeshStandardMaterial({ 
          color: index % 2 === 0 ? 0x33c7ff : 0xffd043, 
          roughness: 0.3,
          transparent: true,
          opacity: 1
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = 1.0 + Math.random() * 1.5;

        const targetOffset = new THREE.Vector3(
          speed * Math.sin(phi) * Math.cos(theta),
          speed * Math.sin(phi) * Math.sin(theta),
          speed * Math.cos(phi)
        );

        pMesh.position.set(0, 0, 0);
        pGroup.add(pMesh);
        particles.push({ mesh: pMesh, targetOffset });
      }

      cubeData.push({
        mesh,
        pGroup,
        particles,
        isExploded: false,
        animProgress: { value: 0 },
        originX: cfg.x,
        originY: cfg.y,
        originZ: cfg.z,
        speedX: (Math.random() - 0.5) * 1.5 * cfg.speedFactor,
        speedY: (Math.random() - 0.5) * 1.5 * cfg.speedFactor,
        speedZ: (Math.random() - 0.5) * 1.0 * cfg.speedFactor,
        amplitudeX: 0.8 + Math.random() * 1.2,
        amplitudeY: 0.8 + Math.random() * 1.2,
        randomOffset: Math.random() * 50,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        rotSpeedZ: (Math.random() - 0.5) * 0.02
      });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = cubeData.map(c => c.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      cubeData.forEach(cube => {
        const hit = intersects.find(intersect => intersect.object === cube.mesh);
        
        if (hit && !cube.isExploded) {
          cube.isExploded = true;
          cube.pGroup.visible = true;
          
          gsap.killTweensOf(cube.animProgress);
          gsap.to(cube.animProgress, {
            value: 1,
            duration: 0.8,
            ease: "power3.out",
            onUpdate: () => {
              const prog = cube.animProgress.value;
              cube.mesh.material.opacity = 0.85 * (1 - prog);
              cube.particles.forEach(p => {
                const currentPos = p.targetOffset.clone().multiplyScalar(prog);
                p.mesh.position.copy(currentPos);
                p.mesh.rotation.x += 0.02;
                p.mesh.rotation.y += 0.02;
              });
            },
            onComplete: () => {
              cube.mesh.visible = false;
            }
          });

        } else if (!hit && cube.isExploded) {
          cube.isExploded = false;
          cube.mesh.visible = true;

          gsap.killTweensOf(cube.animProgress);
          gsap.to(cube.animProgress, {
            value: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onUpdate: () => {
              const prog = cube.animProgress.value;
              cube.mesh.material.opacity = 0.85 * (1 - prog);
              cube.particles.forEach(p => {
                const currentPos = p.targetOffset.clone().multiplyScalar(prog);
                p.mesh.position.copy(currentPos);
              });
            },
            onComplete: () => {
              cube.pGroup.visible = false;
              cube.mesh.material.opacity = 0.85;
            }
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      cubeData.forEach((cube) => {
        const absX = cube.originX + Math.sin(time * cube.speedX + cube.randomOffset) * cube.amplitudeX + Math.cos(time * 0.5) * 0.3;
        const absY = cube.originY + Math.cos(time * cube.speedY + cube.randomOffset) * cube.amplitudeY + Math.sin(time * 0.4) * 0.3;
        const absZ = cube.originZ + Math.sin(time * cube.speedZ) * 0.5;
        
        cube.mesh.position.x = absX;
        cube.mesh.position.y = absY;
        cube.mesh.position.z = absZ;

        cube.pGroup.position.x = absX;
        cube.pGroup.position.y = absY;
        cube.pGroup.position.z = absZ;

        if (!cube.isExploded) {
          cube.mesh.rotation.x += cube.rotSpeedX;
          cube.mesh.rotation.y += cube.rotSpeedY;
          cube.mesh.rotation.z += cube.rotSpeedZ;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (renderer) renderer.dispose();
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="contact-page" ref={pageRef}>
      <div className="swipe-transition"></div>
      <div className="central-gradient-bg"></div>
      <div className="three-canvas-container" ref={canvasContainerRef}></div>

      {/* MOBILE MENU OVERLAY */}
      <div className={`mobile-overlay ${isMenuOpen ? 'is-open' : ''}`}>
        <div className="mobile-close-btn" onClick={() => setIsMenuOpen(false)}>
          <span>CLOSE</span>
          <span className="close-icon">✕</span>
        </div>

        <div className="mobile-overlay-content">
          <div className="mobile-link-wrapper" onClick={() => handleNavigate('/about')}>
            <span className={`mobile-link-text ${location.pathname === '/about' ? 'active' : ''}`}>About</span>
          </div>
          <div className="mobile-link-wrapper" onClick={() => handleNavigate('/project')}>
            <span className={`mobile-link-text ${location.pathname === '/project' ? 'active' : ''}`}>Project</span>
          </div>
          <div className="mobile-link-wrapper" onClick={() => handleNavigate('/contact')}>
            <span className={`mobile-link-text ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="portfolio-nav">
        <div className="nav-left" onClick={() => handleNavigate('/')} style={{ cursor: 'pointer' }}>
          <span className="back-arrow">←</span>
        </div>

        <div className={`custom-menu-btn ${isMenuOpen ? 'is-active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="menu-text">{isMenuOpen ? 'CLOSE' : 'MENU'}</span>
          <div className="menu-lines">
            <span className="line line-1"></span>
            <span className="line line-2"></span>
          </div>
        </div>

        <div className="nav-right desktop-only">
          <span className={`portfolio-nav__link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => handleNavigate('/about')}>About</span>
          <span className={`portfolio-nav__link ${location.pathname === '/project' ? 'active' : ''}`} onClick={() => handleNavigate('/project')}>Project</span>
          <span className={`portfolio-nav__link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => handleNavigate('/contact')}>Contact</span>
        </div>
      </nav>

      {/* Main Container */}
      <main className="contact-main" style={{ marginTop: '60px' }}>
        <div className="contact-hero-content">
          <h1 className="contact-title">Let's Connect</h1>
          <p className="contact-subtitle">Available for freelance work, web development, and collaborations.</p>
        </div>

        {/* Bento Grid Asimetris */}
        <div className="contact-bento-grid">
          
          <div className="bento-card card-email interactive-card">
            <div className="card-top-row">
              <h3>Email</h3>
              <span className="card-badge">Direct Contact</span>
            </div>
            <p className="card-detail">marsyaputri086@gmail.com</p>
            <a href="mailto:marsyaputri086@gmail.com" className="card-action-btn">
              <span>Send Email</span> <span className="arrow-icon">→</span>
            </a>
          </div>

          <div className="bento-card card-github interactive-card">
            <div className="card-top-row">
              <h3>GitHub</h3>
              <span className="card-badge">Code</span>
            </div>
            <p className="card-detail">Explore repositories & open-source work.</p>
            <a href="https://github.com/marsyaputri27?tab=repositories" target="_blank" rel="noreferrer" className="card-action-btn">
              <span>View GitHub</span> <span className="arrow-icon">→</span>
            </a>
          </div>

          <div className="bento-card card-linkedin interactive-card">
            <div className="card-top-row">
              <h3>LinkedIn</h3>
              <span className="card-badge">Network</span>
            </div>
            <p className="card-detail">www.linkedin.com/in/marsya-putri08</p>
            <a href="https://www.linkedin.com/in/marsya-putri08" target="_blank" rel="noreferrer" className="card-action-btn">
              <span>Connect</span> <span className="arrow-icon">→</span>
            </a>
          </div>

          <div className="bento-card card-instagram interactive-card">
            <div className="card-top-row">
              <h3>Instagram</h3>
              <span className="card-badge">Social</span>
            </div>
            <p className="card-detail">@marsya_aca086</p>
            <a href="https://www.instagram.com/marsya_aca086/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noreferrer" className="card-action-btn">
              <span>Follow Instagram</span> <span className="arrow-icon">→</span>
            </a>
          </div>

        </div>

        {/* Footer Status */}
        <div className="contact-footer-info">
          <div className="status-indicator">
            <span className="pulsing-dot"></span>
            <span>Based in Bali, Indonesia • Open for Opportunities</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;