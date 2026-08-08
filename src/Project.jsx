import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import './project.css';

// Import 9 Foto Project Marsya
import img1 from './assets/realbalidriver.png';
import img2 from './assets/vegetable.png';
import img3 from './assets/iot.png';
import img4 from './assets/nails.png';
import img5 from './assets/e-parking.png';
import img6 from './assets/microplayground.png';
import img7 from './assets/inaram2.png';
import img8 from './assets/habitwel.png';
import img9 from './assets/cimora.png';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger, Flip);

function Project() {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ==========================================
  // FUNGSI ANIMASI KELUAR PROJECT (FADE OUT)
  // ==========================================
  const handleNavigate = (path) => {
    setIsMenuOpen(false);
    gsap.to(pageRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => {
        navigate(path);
      }
    });
  };

  useEffect(() => {
    // ==========================================
    // ANIMASI MASUK PROJECT (FADE IN)
    // ==========================================
    gsap.fromTo(pageRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const domRestores = []; 

    let ctx = gsap.context(() => {
      // CEK LAYAR: HANYA JALANKAN ANIMASI FLIP KOMPLEKS JIKA DESKTOP (> 848px)
      if (window.innerWidth > 848) {
        const wraps = pageRef.current.querySelectorAll('.content-wrap');
        
        wraps.forEach((el) => {
          const titleWrap = el.querySelector('.title-wrap');
          const titleUp = el.querySelector('.title--up');
          const titleDown = el.querySelector('.title--down');
          const contentBoxes = el.querySelectorAll('.content');
          const mask = el.querySelector('.mask');
          const image = el.querySelector('image');

          if (!titleWrap || !titleUp || !titleDown || !mask || !image) return;

          domRestores.push(() => {
            titleWrap.appendChild(titleUp);
            titleWrap.appendChild(titleDown);
          });

          const flipstate = Flip.getState([titleUp, titleDown]);
          
          if (contentBoxes[1]) {
            contentBoxes[1].prepend(titleUp, titleDown);
          }

          const isCircle = mask.tagName.toLowerCase() === 'circle';

          const flip = Flip.from(flipstate, {
            ease: 'none',
            simple: true,
          })
          .fromTo(mask, {
            attr: isCircle ? { r: mask.getAttribute('r') } : { d: mask.getAttribute('d') },
          }, {
            ease: 'none',
            attr: isCircle ? { r: mask.dataset.valueFinal } : { d: mask.dataset.valueFinal },
          }, 0)
          .fromTo(image, {
            transformOrigin: '50% 50%',
            filter: 'brightness(80%)',
          }, {
            ease: 'none',
            scale: isCircle ? 1.05 : 1, 
            filter: 'brightness(105%)',
          }, 0);

          ScrollTrigger.create({
            trigger: titleWrap,
            ease: 'none',
            start: 'clamp(top bottom-=10%)',
            end: '+=40%',
            scrub: true,
            animation: flip,
          });
        });
      } else {
        // KHUSUS HP (MOBILE): ANIMASI ON-SCROLL SEDERHANA
        const wraps = pageRef.current.querySelectorAll('.content-wrap');
        wraps.forEach((el) => {
          gsap.fromTo(el, 
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });
      }

      ScrollTrigger.refresh();
    }, pageRef); 

    return () => {
      lenis.destroy();
      ctx.revert(); 
      domRestores.forEach(restore => restore());
    };
  }, []);

  const isMobile = window.innerWidth <= 848;

  return (
    <div className="project-page" ref={pageRef} style={{ opacity: 0 }}>
      
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

      {/* NAVBAR */}
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

      <main>
        {/* Intro Section */}
        <div className="intro"> 
          <h1 className="intro__title"> 
            <span className="intro__title-pre">Selected Works</span> 
            <span className="intro__title-sub">Explore my recent web development projects</span> 
          </h1> 
          <span className="intro__info">Scroll moderately to fully experience the animations</span> 
        </div>

        {/* Project 1 (Real Bali Driver) */}
        <div className="content-wrap">
          <div className="content">
            <div className="title-wrap">
              <span className="title title--up">Real Bali</span>
              <span className="title title--down">Driver</span>
            </div>
          </div>
          <div className="content content--layout content--layout-odd">
            <svg className="content__img" width="800" height="500" viewBox="0 0 800 500">
              {!isMobile && (
                <defs>
                  <filter id="displacementFilter1">
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <mask id="circleMask1">
                    <circle cx="50%" cy="50%" r="0" data-value-final="800" fill="white" className="mask" style={{ filter: 'url(#displacementFilter1)' }} />
                  </mask>
                </defs>
              )}
              <image href={img1} width="800" height="500" mask={isMobile ? undefined : "url(#circleMask1)"} preserveAspectRatio="xMidYMid meet" />
            </svg>
            <p className="content__text">A modern and clean travel booking platform featuring seamless multilingual support in English, Indonesian, and Mandarin to cater to a global audience.</p>
          </div>
        </div>

        {/* Project 2 (Smart E-Nota) */}
        <div className="content-wrap">
          <div className="content">
            <div className="title-wrap">
              <span className="title title--up">Smart</span>
              <span className="title title--down">E-Nota</span>
            </div>
          </div>
          <div className="content content--layout content--layout-even">
            <svg className="content__img" width="800" height="500" viewBox="0 0 800 500">
              {!isMobile && (
                <defs>
                  <filter id="displacementFilter2">
                    <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="1" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" result="displacement" scale="50" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <mask id="circleMask2">
                    <circle cx="50%" cy="50%" r="0" data-value-final="800" fill="white" className="mask" style={{ filter: 'url(#displacementFilter2)' }} />
                  </mask>
                </defs>
              )}
              <image href={img2} width="800" height="500" mask={isMobile ? undefined : "url(#circleMask2)"} preserveAspectRatio="xMidYMid meet" />
            </svg>
            <p className="content__text">A streamlined digital invoicing system tailored for fresh produce distributors. It features comprehensive CRUD management for products and clients, printable invoices, and complete transaction histories to simplify daily business operations.</p>
          </div>
        </div>

        {/* Project 3 (Smart Trash Bin) */}
        <div className="content-wrap">
          <div className="content">
            <div className="title-wrap">
              <span className="title title--up">Smart</span>
              <span className="title title--down">Trash Bin</span>
            </div>
          </div>
          <div className="content content--layout content--layout-odd">
            <svg className="content__img" width="800" height="500" viewBox="0 0 800 500">
              {!isMobile && (
                <defs>
                  <filter id="displacementFilter3">
                    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="40" result="displacement" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <mask id="circleMask3">
                    <circle cx="50%" cy="50%" r="0" data-value-final="800" fill="white" className="mask" style={{ filter: 'url(#displacementFilter3)' }} />
                  </mask>
                </defs>
              )}
              <image href={img3} width="800" height="500" mask={isMobile ? undefined : "url(#circleMask3)"} preserveAspectRatio="xMidYMid meet" />
            </svg>
            <p className="content__text">An innovative IoT Smart Trash Bin engineered with Arduino Uno. Utilizing ultrasonic sensors and servo motors, it automatically opens the lid when movement is detected within 30cm, offering a highly responsive and hygienic touchless experience.</p>
          </div>
        </div>

        {/* Project 4 (Nails Studio) */}
        <div className="content-wrap">
          <div className="content">
            <div className="title-wrap">
              <span className="title title--up">Nails</span>
              <span className="title title--down">Studio</span>
            </div>
          </div>
          <div className="content content--layout content--layout-even">
            <svg className="content__img" width="800" height="500" viewBox="0 0 800 500">
              {!isMobile && (
                <defs>
                  <filter id="displacementFilter4">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <mask id="circleMask4">
                    <circle cx="50%" cy="50%" r="0" data-value-final="800" fill="white" className="mask" style={{ filter: 'url(#displacementFilter4)' }} />
                  </mask>
                </defs>
              )}
              <image href={img4} width="800" height="500" mask={isMobile ? undefined : "url(#circleMask4)"} preserveAspectRatio="xMidYMid meet" />
            </svg>
            <p className="content__text">A luxurious, multi-page studio website designed with a highly aesthetic and modern approach, seamlessly integrated with WhatsApp API for direct, fast, and easy appointment bookings.</p>
          </div>
        </div>

        {/* Project 5 (Smart Parking) */}
        <div className="content-wrap">
          <div className="content">
            <div className="title-wrap">
              <span className="title title--up">Smart</span>
              <span className="title title--down">Parking</span>
            </div>
          </div>
          <div className="content content--layout content--layout-odd">
            <svg className="content__img" width="800" height="500" viewBox="0 0 800 500">
              {!isMobile && (
                <defs>
                  <filter id="displacementFilter5">
                    <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <mask id="circleMask5">
                    <circle cx="50%" cy="50%" r="0" data-value-final="800" fill="white" className="mask" style={{ filter: 'url(#displacementFilter5)' }} />
                  </mask>
                </defs>
              )}
              <image href={img5} width="800" height="500" mask={isMobile ? undefined : "url(#circleMask5)"} preserveAspectRatio="xMidYMid meet" />
            </svg>
            <p className="content__text">An automated commercial parking management system. It features ticket generation at entry, automated fee calculation at exit via barcode scanning, and PDF revenue reporting. The web interface is fully integrated with a physical hardware prototype utilizing Arduino Uno.</p>
          </div>
        </div>

        {/* Project 6 (Micro Playground) */}
        <div className="content-wrap">
          <div className="content">
            <div className="title-wrap">
              <span className="title title--up">Micro</span>
              <span className="title title--down">Playground</span>
            </div>
          </div>
          <div className="content content--layout content--layout-even">
            <svg className="content__img" width="800" height="500" viewBox="0 0 800 500">
              {!isMobile && (
                <defs>
                  <filter id="displacementFilter6">
                    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" result="displacement" scale="60" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <mask id="circleMask6">
                    <circle cx="50%" cy="50%" r="0" data-value-final="800" fill="white" className="mask" style={{ filter: 'url(#displacementFilter6)' }} />
                  </mask>
                </defs>
              )}
              <image href={img6} width="800" height="500" mask={isMobile ? undefined : "url(#circleMask6)"} preserveAspectRatio="xMidYMid meet" />
            </svg>
            <p className="content__text">An interactive e-learning platform dedicated to IoT education. It offers comprehensive study materials, curated projects with source code, quizzes, and a built-in AI assistant to seamlessly guide users through their learning journey.</p>
          </div>
        </div>

        {/* Project 7 (Inaram Digital) */}
        <div className="content-wrap">
          <div className="content">
            <div className="title-wrap">
              <span className="title title--up">Inaram</span>
              <span className="title title--down">Digital</span>
            </div>
          </div>
          <div className="content content--layout content--layout-odd">
            <svg className="content__img" width="800" height="500" viewBox="0 0 800 500">
              {!isMobile && (
                <defs>
                  <filter id="displacementFilter7">
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="1" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <mask id="circleMask7">
                    <circle cx="50%" cy="50%" r="0" data-value-final="800" fill="white" className="mask" style={{ filter: 'url(#displacementFilter7)' }} />
                  </mask>
                </defs>
              )}
              <image href={img7} width="800" height="500" mask={isMobile ? undefined : "url(#circleMask7)"} preserveAspectRatio="xMidYMid meet" />
            </svg>
            <p className="content__text">A minimalist yet highly modern company profile website for a digital agency, focusing on clean aesthetics, straightforward navigation, and impactful brand representation.</p>
          </div>
        </div>

        {/* Project 8 (Habit Wel) */}
        <div className="content-wrap">
          <div className="content">
            <div className="title-wrap">
              <span className="title title--up">Habit</span>
              <span className="title title--down">Wel</span>
            </div>
          </div>
          <div className="content content--layout content--layout-even">
            <svg className="content__img" width="800" height="500" viewBox="0 0 800 500">
              {!isMobile && (
                <defs>
                  <filter id="displacementFilter8">
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <mask id="circleMask8">
                    <circle cx="50%" cy="50%" r="0" data-value-final="800" fill="white" className="mask" style={{ filter: 'url(#displacementFilter8)' }} />
                  </mask>
                </defs>
              )}
              <image href={img8} width="800" height="500" mask={isMobile ? undefined : "url(#circleMask8)"} preserveAspectRatio="xMidYMid meet" />
            </svg>
            <p className="content__text">A comprehensive wellness platform designed to cultivate healthy lifestyles. Features include ideal body weight calculation, hydration and calorie trackers, daily health challenges, dark/light mode toggles, and an integrated AI health consultant.</p>
          </div>
        </div>

        {/* Project 9 (Cimora LMS) */}
        <div className="content-wrap">
          <div className="content">
            <div className="title-wrap">
              <span className="title title--up">Cimora</span>
              <span className="title title--down">LMS</span>
            </div>
          </div>
          <div className="content content--layout content--layout-odd">
            <svg className="content__img" width="800" height="500" viewBox="0 0 800 500">
              {!isMobile && (
                <defs>
                  <filter id="displacementFilter9">
                    <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="1" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" result="displacement" scale="50" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <mask id="circleMask9">
                    <circle cx="50%" cy="50%" r="0" data-value-final="800" fill="white" className="mask" style={{ filter: 'url(#displacementFilter9)' }} />
                  </mask>
                </defs>
              )}
              <image href={img9} width="800" height="500" mask={isMobile ? undefined : "url(#circleMask9)"} preserveAspectRatio="xMidYMid meet" />
            </svg>
            <p className="content__text">An advanced Learning Management System (LMS) serving as an educational hub for schools. It includes bilingual support (English/Indonesian), customizable themes, and a specialized AI assistant to provide students with instant access to school-related information.</p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Project;