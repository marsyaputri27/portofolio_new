import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import './PageTransition.css'

function PageTransition({ children }) {
  const location = useLocation()
  const blocksRef = useRef([])

  useEffect(() => {
    const ease = 'power4.inOut'

    // 1. Setiap kali URL berpindah, kembalikan posisi kotak memenuhi layar
    gsap.set(blocksRef.current, { visibility: 'visible', scaleY: 1 })

    // 2. Jalankan animasi GSAP: Kotak-kotak 'membuka' layar
    gsap.to(blocksRef.current, {
      scaleY: 0,
      duration: 1,
      stagger: {
        each: 0.08,
        from: 'start',
        grid: [2, 5],
        axis: 'x',
      },
      ease,
      onComplete: () => {
        // Sembunyikan blok jika selesai agar halaman bisa diklik
        gsap.set(blocksRef.current, { visibility: 'hidden' })
      },
    })
  }, [location.pathname]) // Terpicu otomatis setiap kali 'location.pathname' berubah

  return (
    <>
      {/* Tirai Kotak-Kotak GSAP Overlay */}
      <div className="transition-overlay">
        <div className="transition-row row-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={`r1-${i}`}
              className="block"
              ref={(el) => (blocksRef.current[i] = el)}
            ></div>
          ))}
        </div>
        <div className="transition-row row-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={`r2-${i}`}
              className="block"
              ref={(el) => (blocksRef.current[i + 5] = el)}
            ></div>
          ))}
        </div>
      </div>

      {/* Menampilkan isi halaman aktif (App / About) */}
      {children}
    </>
  )
}

export default PageTransition