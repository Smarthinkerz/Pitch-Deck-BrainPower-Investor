import { useEffect, useRef } from "react";

export default function Home() {
  const vpRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Engine
    const TOTAL = 17;
    let cur = 1;
    let busy = false;
    const inited: Record<number, boolean> = {};
    const vp = vpRef.current;
    if (!vp) return;

    function isPortraitMobile() {
      return window.matchMedia("(max-width:768px) and (orientation:portrait)").matches;
    }

    function resize() {
      if (!vp) return;
      if (isPortraitMobile()) {
        vp.style.cssText = "";
        return;
      }
      const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      vp.style.cssText = `width:1920px;height:1080px;transform:scale(${s});transform-origin:center center;`;
    }
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    // Dots
    const dotsEl = document.getElementById("dots");
    if (dotsEl) {
      dotsEl.innerHTML = "";
      for (let i = 1; i <= TOTAL; i++) {
        const d = document.createElement("div");
        d.className = "dot" + (i === 1 ? " active" : "");
        d.onclick = () => goTo(i);
        dotsEl.appendChild(d);
      }
    }

    function updateNav() {
      document.querySelectorAll(".dot").forEach((d, i) => {
        d.className = "dot" + (i + 1 === cur ? " active" : "");
      });
      const counter = document.getElementById("counter");
      if (counter) counter.textContent = `${cur} / ${TOTAL}`;
    }

    function nav(d: number) {
      goTo(cur + d, d);
    }

    function goTo(n: number, dir?: number) {
      if (n < 1 || n > TOTAL || busy || n === cur) return;
      busy = true;
      const d = dir != null ? dir : n > cur ? 1 : -1;
      const out = document.getElementById(`s${cur}`);
      const inn = document.getElementById(`s${n}`);
      if (!out || !inn) { busy = false; return; }
      out.className = "slide active " + (d > 0 ? "slide-exit" : "slide-exit-back");
      inn.style.display = "block";
      inn.className = "slide " + (d > 0 ? "slide-enter" : "slide-enter-back");
      setTimeout(() => {
        out.className = "slide";
        out.style.display = "none";
        inn.className = "slide active";
        cur = n;
        updateNav();
        busy = false;
        initSlide(n);
        inn.querySelectorAll("video").forEach((v) => { v.play().catch(() => {}); });
      }, 480);
    }

    // Keyboard nav
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") nav(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") nav(-1);
    };
    document.addEventListener("keydown", keyHandler);

    // Touch nav
    let tx = 0;
    const touchStart = (e: TouchEvent) => { tx = e.touches[0].clientX; };
    const touchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) nav(dx < 0 ? 1 : -1);
    };
    vp.addEventListener("touchstart", touchStart);
    vp.addEventListener("touchend", touchEnd);

    // Fullscreen
    (window as any).toggleFS = () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    };

    // Nav buttons
    (window as any).navPrev = () => nav(-1);
    (window as any).navNext = () => nav(1);

    // Particles
    function initParticles(id: string) {
      const c = document.getElementById(id) as HTMLCanvasElement;
      if (!c || (c as any)._done) return;
      (c as any)._done = true;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      c.width = 1920;
      c.height = 1080;
      const pts = Array.from({ length: 70 }, () => ({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
      }));
      function draw() {
        ctx!.clearRect(0, 0, 1920, 1080);
        pts.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > 1920) p.vx *= -1;
          if (p.y < 0 || p.y > 1080) p.vy *= -1;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fillStyle = "rgba(108,99,255,.3)";
          ctx!.fill();
        });
        pts.forEach((a, i) =>
          pts.slice(i + 1).forEach((b) => {
            const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < 160) {
              ctx!.beginPath();
              ctx!.moveTo(a.x, a.y);
              ctx!.lineTo(b.x, b.y);
              ctx!.strokeStyle = `rgba(108,99,255,${(1 - d / 160) * 0.12})`;
              ctx!.lineWidth = 0.7;
              ctx!.stroke();
            }
          })
        );
        requestAnimationFrame(draw);
      }
      draw();
    }

    // Stagger helper
    function stagger(sel: string, cls: string, base: number, step: number) {
      document.querySelectorAll(sel).forEach((el, i) =>
        setTimeout(() => el.classList.add(cls), base + i * step)
      );
    }

    // Slide inits
    function i2() { stagger("#s2 .pc", "vis", 150, 180); }
    function i3() {
      stagger("#s3 .wn-card", "vis", 250, 200);
      setTimeout(() => document.querySelectorAll("#s3 .wn-foot").forEach((e) => e.classList.add("vis")), 900);
    }
    function i4() { stagger("#s4 .sp", "vis", 450, 170); }
    function i5() { stagger("#s5 .fi", "vis", 350, 180); }
    function i6() { stagger("#s6 .pd", "vis", 150, 160); }
    function i7() {
      stagger("#s7 .t-row", "vis", 350, 200);
      document.querySelectorAll("#s7 .t-row").forEach((row, i) => {
        setTimeout(() => {
          const cell = row.querySelector(".bpc");
          if (cell) cell.classList.add("glow");
        }, 750 + i * 200);
      });
    }
    function i8() {
      stagger("#s8 .cmp-row", "vis", 300, 160);
      setTimeout(() => document.querySelectorAll("#s8 .cmp-foot").forEach((e) => e.classList.add("vis")), 1200);
    }
    function i9() {
      stagger("#s9 .fn-band", "vis", 300, 200);
      setTimeout(() => document.querySelectorAll("#s9 .som-calc").forEach((e) => e.classList.add("vis")), 900);
    }
    function i10() {
      stagger("#s10 .fs", "vis", 150, 200);
      stagger("#s10 .fa", "vis", 300, 200);
      stagger("#s10 .oc", "vis", 1100, 120);
    }
    function i11() {
      stagger("#s11 .bc", "vis", 200, 200);
      setTimeout(() => {
        document.querySelectorAll("#s11 .bc-num[data-target]").forEach((el) => {
          const target = parseInt((el as HTMLElement).dataset.target || "0");
          let v = 0;
          const step = Math.ceil(target / 60);
          const t = setInterval(() => {
            v = Math.min(v + step, target);
            el.textContent = v.toLocaleString();
            if (v >= target) clearInterval(t);
          }, 30);
        });
      }, 800);
    }
    function i12() {
      stagger("#s12 .ms", "vis", 200, 200);
      stagger("#s12 .ms-card", "vis", 400, 150);
      document.querySelectorAll("#s12 .ms-here").forEach((e) =>
        setTimeout(() => e.classList.add("vis"), 900)
      );
      setTimeout(() => {
        const tf = document.getElementById("trackFill");
        if (tf) tf.style.width = "33%";
      }, 500);
    }
    function i13() {
      stagger("#s13 .acc-card", "vis", 250, 200);
      setTimeout(() => document.querySelectorAll("#s13 .acc-evidence").forEach((e) => e.classList.add("vis")), 1000);
    }
    function i14() {
      stagger("#s14 .tc", "vis", 200, 200);
      setTimeout(() => document.querySelectorAll("#s14 .advisors").forEach((e) => e.classList.add("vis")), 900);
    }
    function i15() { stagger("#s15 .pi", "vis", 350, 200); }
    function i16() {
      stagger("#s16 .ui", "vis", 500, 200);
      stagger("#s16 .plan-step", "vis", 400, 200);
      setTimeout(() => {
        document.querySelectorAll("#s16 .ui-fill").forEach((el) => {
          setTimeout(() => {
            (el as HTMLElement).style.width = (el as HTMLElement).dataset.w || "0%";
          }, 100);
        });
      }, 700);
    }

    const initFns: Record<number, () => void> = { 2: i2, 3: i3, 4: i4, 5: i5, 6: i6, 7: i7, 8: i8, 9: i9, 10: i10, 11: i11, 12: i12, 13: i13, 14: i14, 15: i15, 16: i16 };

    function initSlide(n: number) {
      initParticles(`p${n}`);
      if (inited[n]) return;
      inited[n] = true;
      if (initFns[n]) initFns[n]();
    }

    initParticles("p1");
    inited[1] = true;

    // Hover video play/pause for slide 5
    document.querySelectorAll('.pd').forEach((card) => {
      const vid = card.querySelector('.pd-hover-vid') as HTMLVideoElement;
      if (!vid) return;
      card.addEventListener('mouseenter', () => { vid.play().catch(() => {}); });
      card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
    });

    // Draggable nav
    const navEl = document.getElementById("nav-bar");
    const handle = document.getElementById("nav-handle");
    if (navEl && handle) {
      let dragging = false, ox = 0, oy = 0, sx = 0, sy = 0;
      handle.addEventListener("mousedown", (e) => {
        dragging = true;
        handle.style.cursor = "grabbing";
        ox = e.clientX; oy = e.clientY;
        const r = navEl.getBoundingClientRect();
        sx = r.left; sy = r.top;
        e.preventDefault();
      });
      document.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - ox, dy = e.clientY - oy;
        navEl.style.left = (sx + dx) + "px";
        navEl.style.top = (sy + dy) + "px";
        navEl.style.bottom = "auto";
        navEl.style.transform = "none";
      });
      document.addEventListener("mouseup", () => { if (dragging) { dragging = false; handle.style.cursor = "grab"; } });
      handle.addEventListener("touchstart", (e) => {
        dragging = true;
        const t = e.touches[0]; ox = t.clientX; oy = t.clientY;
        const r = navEl.getBoundingClientRect(); sx = r.left; sy = r.top;
        e.preventDefault();
      }, { passive: false });
      document.addEventListener("touchmove", (e) => {
        if (!dragging) return;
        const t = e.touches[0], dx = t.clientX - ox, dy = t.clientY - oy;
        navEl.style.left = (sx + dx) + "px";
        navEl.style.top = (sy + dy) + "px";
        navEl.style.bottom = "auto";
        navEl.style.transform = "none";
      }, { passive: true });
      document.addEventListener("touchend", () => { dragging = false; });
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      document.removeEventListener("keydown", keyHandler);
      if (vp) {
        vp.removeEventListener("touchstart", touchStart);
        vp.removeEventListener("touchend", touchEnd);
      }
    };
  }, []);

  return (
    <div className="pitch-deck-wrapper">
      {/* Back to the hub. Placed once, outside #deck, and fixed to the
        * viewport: the deck swaps one slide at a time inside #viewport, so a
        * single fixed element is present on all 14 slides. Adding it per-slide
        * would mean 14 copies to keep in step.
        *
        * Points at the apex: smarthinkerz.com answers 200 directly and
        * www.smarthinkerz.com 301s to it. The portal had this link misspelled
        * as smarhinkerz.com, a domain that does not resolve at all — worth not
        * repeating here.
        *
        * zIndex sits above the slide canvases, which use z-index up to 20. */}
      <a
        href="https://smarthinkerz.com"
        title="SmarThinkerz Hub"
        style={{
          position: "fixed",
          top: "16px",
          // Right-aligned. The slide labels ("07 / Market Opportunity") sit top
          // left, so this keeps the two off each other.
          right: "16px",
          zIndex: 200,
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          fontWeight: 600,
          // Neon blue, matching the #00d4ff accent the portal already uses for
          // its stat figures. The glow is what makes it read as neon rather
          // than as flat blue text.
          color: "#00d4ff",
          textShadow: "0 0 8px rgba(0,212,255,0.65), 0 0 18px rgba(0,212,255,0.35)",
          textDecoration: "none",
          padding: "6px 12px",
          borderRadius: "8px",
          background: "rgba(6,12,26,0.6)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(0,212,255,0.45)",
          boxShadow: "0 0 12px rgba(0,212,255,0.25)",
          transition: "color 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#7df3ff";
          e.currentTarget.style.borderColor = "rgba(0,212,255,0.85)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(0,212,255,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#00d4ff";
          e.currentTarget.style.borderColor = "rgba(0,212,255,0.45)";
          e.currentTarget.style.boxShadow = "0 0 12px rgba(0,212,255,0.25)";
        }}
      >
        {/* Arrow trails the label and points forward: this navigates outward
          * to the hub, not back to a previous slide. */}
        <span>SmarThinkerz Hub</span>
        <span aria-hidden="true">→</span>
      </a>
      <div id="deck" ref={deckRef}>
        <div id="viewport" ref={vpRef}>

          {/* S1 COVER */}
          <div className="slide active" id="s1">
            <canvas className="bg-canvas" id="p1"></canvas>
            <div className="wrap">
              <div className="left">
                <div className="slide-label">Decision Intelligence Platform</div>
                <div className="brand">Brain<span>Power</span> AI</div>
                <div className="tagline">The Decision Intelligence Engine</div>
                <div className="sub">Decisions computed, not guessed. A deterministic engine that calculates every score, with 3D simulation to see the outcomes before you act.</div>
                <div className="badge">PRE-SEED</div>
              </div>
              <div className="right">
                <div className="phone-wrap">
                  <div className="orbit o1"><div className="node" style={{ top: 0, left: "50%", transform: "translateX(-50%)" }}></div></div>
                  <div className="orbit o2"><div className="node" style={{ bottom: "10px", right: "10px" }}></div></div>
                  <img className="phone-img" src="https://storage.googleapis.com/runable-templates/cli-uploads%2FkOpJh1WBUGnPVSjlrlo8fC67KBLFJQuR%2FIUoHQ4eKdqF_uKowBtsfK%2Fworlds_first_sBumvs.png" alt="App" />
                </div>
              </div>
            </div>
          </div>

          {/* S2 PROBLEM */}
          <div className="slide" id="s2">
            <canvas className="bg-canvas" id="p2"></canvas>
            <div className="wrap">
              <div className="slide-label">02 / The Problem</div>
              <div className="slide-title">Decision-Makers Are <span>Flying Blind</span></div>
              <div className="cards">
                <div className="pc" style={{ transitionDelay: ".1s" }}><div className="pc-icon"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/mdjYdUZQTstBTWgk.png" alt="Overwhelming Data" /></div><div className="pc-body"><h3>Overwhelming Data</h3><p>Drowning in information with zero clarity on what actually matters</p></div></div>
                <div className="pc" style={{ transitionDelay: ".25s" }}><div className="pc-icon"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/fFcKLkWKzDDMNexH.png" alt="Uncertainty" /></div><div className="pc-body"><h3>Uncertainty Until Execution</h3><p>No visibility into outcomes until after the decision is already made</p></div></div>
                <div className="pc" style={{ transitionDelay: ".4s" }}><div className="pc-icon"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/rHiRnGnTdyDXPKGo.png" alt="High Risk" /></div><div className="pc-body"><h3>High-Risk, Low Visibility</h3><p>Critical decisions made without seeing consequences in advance</p></div></div>
                <div className="pc" style={{ transitionDelay: ".55s" }}><div className="pc-icon"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/hQbOEWiYYueiQgdI.png" alt="AI Tools" /></div><div className="pc-body"><h3>AI Tools That Guess, Not Compute</h3><p>AI tools respond to prompts but never structure or simulate outcomes</p></div></div>
              </div>
              <div className="banner">👉 Critical decisions are made on gut feel and numbers <span>no one can trust</span></div>
            </div>
          </div>

          {/* S3 WHY NOW */}
          <div className="slide" id="s3">
            <canvas className="bg-canvas" id="p3"></canvas>
            <div className="wrap">
              <div className="slide-label">03 / Why Now</div>
              <div className="slide-title">Why <span>Now</span></div>
              <div className="wn-headline">Rising demand for AI that can be trusted and audited, not just generated.</div>
              <div className="glow-line"></div>
              <div className="wn-grid">
                <div className="wn-card" style={{ transitionDelay: ".25s" }}>
                  <div className="wn-num">01</div>
                  <div className="wn-slot"><span className="todo">TODO-FATHI</span></div>
                  <div className="todo-hint">Driver one. The shift in the market, the regulation, or the technology that makes this the moment. One line, with its source.</div>
                </div>
                <div className="wn-card" style={{ transitionDelay: ".45s" }}>
                  <div className="wn-num">02</div>
                  <div className="wn-slot"><span className="todo">TODO-FATHI</span></div>
                  <div className="todo-hint">Driver two. Same rule. If it cannot be sourced, it does not go on the slide.</div>
                </div>
                <div className="wn-card" style={{ transitionDelay: ".65s" }}>
                  <div className="wn-num">03</div>
                  <div className="wn-slot"><span className="todo">TODO-FATHI</span></div>
                  <div className="todo-hint">Driver three. Same rule.</div>
                </div>
              </div>
              <div className="wn-foot">
                <div className="wn-foot-lbl">Why not two years ago, and why not two years from now</div>
                <span className="todo">TODO-FATHI</span>
              </div>
            </div>
          </div>

          {/* S4 SOLUTION */}
          <div className="slide" id="s4">
            <canvas className="bg-canvas" id="p4"></canvas>
            <div className="wrap">
              <div className="left">
                <div className="slide-label">04 / The Solution</div>
                <div className="slide-title">Brain<span>Power</span> AI</div>
                <div style={{ fontSize: "22px", color: "var(--muted)", opacity: 0, animation: "fadeUp .6s .4s forwards", marginBottom: "6px" }}>A Decision Intelligence Platform</div>
                <div className="glow-line"></div>
                <div className="points">
                  <div className="sp" style={{ transitionDelay: ".5s" }}><div className="sp-check">✓</div><p>Compute every score with a deterministic engine, never guessed</p></div>
                  <div className="sp" style={{ transitionDelay: ".65s" }}><div className="sp-check">✓</div><p>Structure complex decisions</p></div>
                  <div className="sp" style={{ transitionDelay: ".8s" }}><div className="sp-check">✓</div><p>Simulate multiple future outcomes</p></div>
                  <div className="sp" style={{ transitionDelay: ".95s" }}><div className="sp-check">✓</div><p>Visualize decisions in an interactive 3D environment</p></div>
                  <div className="sp" style={{ transitionDelay: "1.1s" }}><div className="sp-check">✓</div><p>Understand risks and trade-offs before acting</p></div>
                </div>
              </div>
              <div className="right">
                <div className="video-frame">
                  <video autoPlay loop muted playsInline style={{ height: "620px", width: "auto", display: "block" }}>
                    <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/DefqAGNYyCDaSKqG.mp4" type="video/mp4" />
                  </video>
                  <div className="video-glow"></div>
                </div>
              </div>
            </div>
          </div>

          {/* S5 FUTURESCAPE */}
          <div className="slide" id="s5">
            <canvas className="bg-canvas" id="p5"></canvas>
            <div className="wrap">
              <div className="left">
                <div className="slide-label">05 / The Breakthrough</div>
                <div className="slide-title">Futurescape<br /><span>3D Decision Simulation</span></div>
                <div className="feats">
                  <div className="fi" style={{ transitionDelay: ".4s" }}><div className="fi-dot" style={{ background: "var(--purple)", boxShadow: "0 0 8px var(--purple)" }}></div><p>Decisions become navigable pathways</p></div>
                  <div className="fi" style={{ transitionDelay: ".6s" }}><div className="fi-dot" style={{ background: "#ff4444", boxShadow: "0 0 8px #ff4444" }}></div><p>Risks appear as glowing zones</p></div>
                  <div className="fi" style={{ transitionDelay: ".8s" }}><div className="fi-dot" style={{ background: "var(--green)", boxShadow: "0 0 8px var(--green)" }}></div><p>Opportunities appear as nodes</p></div>
                  <div className="fi" style={{ transitionDelay: "1s" }}><div className="fi-dot" style={{ background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)" }}></div><p>Timelines unfold visually</p></div>
                </div>
              </div>
              <div className="right">
                <div className="s4-vid-box">
                  <video autoPlay loop muted playsInline>
                    <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/vhvQhMRSqOzgLtfZ.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
              <div className="cta">→ The engine computes the outcomes. Futurescape lets you walk through them in 3D.</div>
            </div>
          </div>

          {/* S6 PRODUCT */}
          <div className="slide" id="s6">
            <canvas className="bg-canvas" id="p6"></canvas>
            <div className="wrap">
              <div className="header">
                <div className="slide-label">06 / Product</div>
                <div className="slide-title">The <span>Platform</span></div>
              </div>
              <div className="grid">
                <div className="pd" style={{ transitionDelay: ".1s" }}>
                  <div className="pd-top">
                    <div className="pd-img pd-vid-container">
                      <video className="pd-hover-vid" loop muted playsInline>
                        <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/TYoIICOiYcOXqtXj.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="pd-icon-ring" style={{ borderColor: "rgba(255,107,107,.5)", background: "rgba(255,107,107,.08)" }}>
                      <span className="sword" style={{ fontSize: "36px" }}>⚔️</span>
                    </div>
                    <div className="pd-name">War Room</div>
                    <div className="pd-sub">Deterministic Decision Engine (computes every score)</div>
                  </div>
                  <div className="pd-bottom">
                    <div style={{ fontSize: "13px", color: "#ff8888", fontWeight: 600, letterSpacing: "1px" }}>DECISION ENGINE</div>
                  </div>
                </div>
                <div className="pd" style={{ transitionDelay: ".25s" }}>
                  <div className="pd-top">
                    <div className="pd-img pd-vid-container">
                      <video className="pd-hover-vid" loop muted playsInline>
                        <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/qjGkAuUAbUwGbRnu.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="pd-icon-ring pulse-ring" style={{ borderColor: "rgba(0,212,255,.5)", background: "rgba(0,212,255,.08)" }}>
                      <span className="spin" style={{ fontSize: "36px", display: "block" }}>⚙️</span>
                    </div>
                    <div className="pd-name">Futures Engine</div>
                    <div className="pd-sub">Run 10,000 seeded Monte Carlo iterations per decision. Simulate outcomes before a single dollar is spent.</div>
                  </div>
                  <div className="pd-bottom">
                    <div style={{ fontSize: "13px", color: "var(--cyan)", fontWeight: 600, letterSpacing: "1px" }}>SCENARIO SIM</div>
                  </div>
                </div>
                <div className="pd" style={{ transitionDelay: ".4s" }}>
                  <div className="pd-top">
                    <div className="pd-img pd-vid-container">
                      <video className="pd-hover-vid" loop muted playsInline>
                        <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/fgHQzlHcyocrebkB.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="pd-icon-ring pulse-ring" style={{ borderColor: "rgba(108,99,255,.5)", background: "rgba(108,99,255,.08)" }}>
                      <span style={{ fontSize: "36px" }}>🌐</span>
                    </div>
                    <div className="pd-name">Futurescape</div>
                    <div className="pd-sub">3D Visualization. Navigate your future like a living map.</div>
                  </div>
                  <div className="pd-bottom">
                    <div style={{ fontSize: "13px", color: "var(--purple)", fontWeight: 600, letterSpacing: "1px" }}>3D VISUALIZATION</div>
                  </div>
                </div>
                <div className="pd" style={{ transitionDelay: ".55s" }}>
                  <div className="pd-top">
                    <div className="pd-img pd-vid-container">
                      <video className="pd-hover-vid" loop muted playsInline>
                        <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/lOxfxGUoTQDJFYCD.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="pd-icon-ring" style={{ borderColor: "rgba(0,255,136,.5)", background: "rgba(0,255,136,.08)" }}>
                      <span className="dig-icon" style={{ fontSize: "36px" }}>🔗</span>
                    </div>
                    <div className="pd-name">Decision Graph</div>
                    <div className="pd-sub">Every decision connected over time. A living intelligence layer that grows smarter with use.</div>
                  </div>
                  <div className="pd-bottom">
                    <div style={{ fontSize: "13px", color: "var(--green)", fontWeight: 600, letterSpacing: "1px" }}>INTELLIGENCE LAYER</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* S7 WHY DIFFERENT */}
          <div className="slide" id="s7">
            <canvas className="bg-canvas" id="p7"></canvas>
            <div className="wrap">
              <div className="slide-label">07 / Why Different</div>
              <div className="slide-title">Not a Chatbot. A <span>Decision System.</span></div>
              <div className="table-wrap">
                <div className="t-head">
                  <div className="t-head-cell lbl">Capability</div>
                  <div className="t-head-cell trad">❌ Generative AI Chatbot</div>
                  <div className="t-head-cell bp">✅ BrainPower AI</div>
                </div>
                <div className="t-row highlight-row" style={{ transitionDelay: ".2s" }}>
                  <div className="t-cell feat">🔢 Number Trust</div>
                  <div className="t-cell trd">Guesses its numbers (vary each run)</div>
                  <div className="t-cell bpc">✦ Computes every number (reproducible &amp; auditable)</div>
                </div>
                <div className="t-row" style={{ transitionDelay: ".4s" }}>
                  <div className="t-cell feat">🎯 Core Function</div>
                  <div className="t-cell trd">Answers questions</div>
                  <div className="t-cell bpc">✦ Structures decisions</div>
                </div>
                <div className="t-row" style={{ transitionDelay: ".6s" }}>
                  <div className="t-cell feat">📺 Output Format</div>
                  <div className="t-cell trd">Plain text output</div>
                  <div className="t-cell bpc">✦ Interactive 3D simulation</div>
                </div>
                <div className="t-row" style={{ transitionDelay: ".8s" }}>
                  <div className="t-cell feat">🔭 Outcome Visibility</div>
                  <div className="t-cell trd">No visibility</div>
                  <div className="t-cell bpc">✦ Explore futures before deciding</div>
                </div>
                <div className="t-row" style={{ transitionDelay: "1s" }}>
                  <div className="t-cell feat">🧠 Memory &amp; Context</div>
                  <div className="t-cell trd">No continuity</div>
                  <div className="t-cell bpc">✦ Persistent decision memory</div>
                </div>
              </div>
              <div className="verdict">👉 We don't guess, we compute. We don't answer, we reveal futures</div>
            </div>
          </div>

          {/* S8 COMPETITIVE POSITIONING */}
          <div className="slide" id="s8">
            <canvas className="bg-canvas" id="p8"></canvas>
            <div className="wrap">
              <div className="slide-label">08 / Competition</div>
              <div className="slide-title">Competitive <span>Positioning</span></div>
              <div className="cmp-wrap">
                <div className="cmp-head">
                  <div className="cmp-head-cell name">Vendor</div>
                  <div className="cmp-head-cell">Reproducibility</div>
                  <div className="cmp-head-cell">Auditability</div>
                  <div className="cmp-head-cell">Per-Decision Computation</div>
                  <div className="cmp-head-cell">3D Exploration</div>
                </div>
                <div className="cmp-row us" style={{ transitionDelay: ".25s" }}>
                  <div className="cmp-cell name us-name">BrainPower AI</div>
                  <div className="cmp-cell ours">Same inputs, byte-identical output</div>
                  <div className="cmp-cell ours">Every score traces to a named, approved input</div>
                  <div className="cmp-cell ours">10,000 seeded Monte Carlo runs per decision</div>
                  <div className="cmp-cell ours">Futurescape, navigable in 3D</div>
                </div>
                <div className="cmp-row" style={{ transitionDelay: ".45s" }}>
                  <div className="cmp-cell name">Aera Technology</div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                </div>
                <div className="cmp-row" style={{ transitionDelay: ".7s" }}>
                  <div className="cmp-cell name"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                </div>
                <div className="cmp-row" style={{ transitionDelay: ".85s" }}>
                  <div className="cmp-cell name"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                </div>
                <div className="cmp-row" style={{ transitionDelay: "1s" }}>
                  <div className="cmp-cell name"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                  <div className="cmp-cell"><span className="todo">TODO-FATHI</span></div>
                </div>
              </div>
              <div className="cmp-foot">
                <div className="cmp-foot-lbl">Our positioning against this field</div>
                <span className="todo">TODO-FATHI</span>
                <div className="todo-hint">One honest, specific, defensible line. Nothing about a competitor goes in this table until you have supplied it.</div>
              </div>
            </div>
          </div>

          {/* S9 MARKET */}
          <div className="slide" id="s9">
            <canvas className="bg-canvas" id="p9"></canvas>
            <div className="wrap">
              <div className="left">
                <div className="slide-label">09 / Market Opportunity</div>
                <div className="slide-title">Market <span>Opportunity</span></div>
                <div className="hero-lbl">The Decision Intelligence Market</div>
                <div className="tags">
                  <div className="tpill p">AI</div>
                  <div className="tpill c">Strategy</div>
                  <div className="tpill g">Simulation</div>
                </div>
                <ul className="bullets">
                  <li>Beachhead: enterprise strategy teams, consultancies, and PE/VC decision-makers</li>
                  <li>Expanding to any team making high-stakes, high-complexity decisions</li>
                </ul>
              </div>
              <div className="right">
                <div className="funnel">
                  <div className="fn-band tam" style={{ transitionDelay: ".3s" }}>
                    <div className="fn-tag">TAM</div>
                    <div className="fn-val">USD 16 to 21 billion</div>
                    <div className="fn-desc">Global decision intelligence market, 2026</div>
                    <div className="fn-src">Estimated across major research firms including Grand View Research, Research and Markets, and Fortune Business Insights. Projected CAGRs in the mid to high teens, with forecasts reaching USD 42 to 89 billion by 2030 to 2035 depending on source.</div>
                  </div>
                  <div className="fn-band sam" style={{ transitionDelay: ".5s" }}>
                    <div className="fn-tag">SAM</div>
                    <div className="fn-val"><span className="todo">TODO-FATHI</span></div>
                    <div className="fn-desc">Serviceable addressable market. The segment, geography, and buyer we can actually sell into today.</div>
                  </div>
                  <div className="fn-band som" style={{ transitionDelay: ".7s" }}>
                    <div className="fn-tag">SOM</div>
                    <div className="fn-val"><span className="todo">TODO-FATHI</span></div>
                    <div className="fn-desc">Serviceable obtainable market. Built bottom up from the calculation below.</div>
                  </div>
                </div>
                <div className="som-calc" style={{ transitionDelay: ".9s" }}>
                  <div className="som-calc-lbl">Bottom-up SOM calculation</div>
                  <div className="som-calc-row">
                    <div className="som-field">
                      <div className="som-field-lbl">Target firms in beachhead</div>
                      <span className="todo">TODO-FATHI</span>
                    </div>
                    <div className="som-op">×</div>
                    <div className="som-field">
                      <div className="som-field-lbl">Realistic annual contract value</div>
                      <span className="todo">TODO-FATHI</span>
                    </div>
                    <div className="som-op">=</div>
                    <div className="som-field res">
                      <div className="som-field-lbl">Serviceable obtainable market</div>
                      <span className="todo">TODO-FATHI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* S10 USE CASE */}
          <div className="slide" id="s10">
            <canvas className="bg-canvas" id="p10"></canvas>
            <div className="wrap">
              <div className="slide-label">10 / Use Case</div>
              <div className="slide-title">Enterprise <span>Strategy Decision</span></div>
              <div className="flow-area">
                <div className="flow-row">
                  <div className="fs" style={{ transitionDelay: ".15s" }}><div className="fn done">📋</div><div className="fl">Compare Strategies</div></div>
                  <div className="fa" style={{ transitionDelay: ".3s" }}>→</div>
                  <div className="fs" style={{ transitionDelay: ".35s" }}><div className="fn done">⚡</div><div className="fl">Project results using the deterministic decision engine</div></div>
                  <div className="fa" style={{ transitionDelay: ".5s" }}>→</div>
                  <div className="fs" style={{ transitionDelay: ".55s" }}><div className="fn cur">🗺️</div><div className="fl">Visualize Risk Paths</div></div>
                  <div className="fa" style={{ transitionDelay: ".7s" }}>→</div>
                  <div className="fs" style={{ transitionDelay: ".75s" }}><div className="fn fut">🎯</div><div className="fl">Choose Direction</div></div>
                  <div className="fa" style={{ transitionDelay: ".9s" }}>→</div>
                  <div className="fs" style={{ transitionDelay: ".95s" }}><div className="fn fut">🚀</div><div className="fl">Execute with Confidence</div></div>
                </div>
                <div className="outcomes">
                  <div className="oc" style={{ transitionDelay: "1.1s" }}><div className="oc-icon">⚡</div><div className="oc-label">10,000 Runs</div><div className="oc-sub">Seeded Monte Carlo per decision</div></div>
                  <div className="oc" style={{ transitionDelay: "1.2s" }}><div className="oc-icon">🎯</div><div className="oc-label">Crystal Clarity</div><div className="oc-sub">See outcomes first</div></div>
                  <div className="oc" style={{ transitionDelay: "1.3s" }}><div className="oc-icon">🛡️</div><div className="oc-label">Lower Risk</div><div className="oc-sub">Simulate before committing</div></div>
                  <div className="oc" style={{ transitionDelay: "1.4s" }}><div className="oc-icon">🌐</div><div className="oc-label">3D View</div><div className="oc-sub">Navigate the future visually</div></div>
                  <div className="oc" style={{ transitionDelay: "1.5s" }}><div className="oc-icon">📈</div><div className="oc-label">Reproducible</div><div className="oc-sub">Same inputs, byte-identical output</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* S11 BUSINESS MODEL */}
          <div className="slide" id="s11">
            <canvas className="bg-canvas" id="p11"></canvas>
            <div className="wrap">
              <div className="slide-label">11 / Business Model</div>
              <div className="slide-title">How We <span>Monetize</span></div>
              <div className="cards s11-cards">
                <div className="bc" style={{ transitionDelay: ".2s", borderTop: "3px solid var(--purple)" }}>
                  <div className="bc-img"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/lfSJwoMZDYXWEyos.png" alt="SaaS Dashboard" /></div>
                  <div className="bc-icon-wrap" style={{ borderColor: "rgba(108,99,255,.3)", background: "rgba(108,99,255,.1)" }}><span>💎</span></div>

                  <div className="bc-name">SaaS Subscriptions</div>
                  <div className="bc-desc">Monthly &amp; annual plans for teams and individuals. Tiered pricing scales from solo thinkers to full enterprises.</div>
                  <div className="bc-tag core">CORE REVENUE</div>
                </div>
                <div className="bc" style={{ transitionDelay: ".4s", borderTop: "3px solid var(--cyan)" }}>
                  <div className="bc-img"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/FmRvhUSUpwGMNNZN.png" alt="Enterprise Hub" /></div>
                  <div className="bc-icon-wrap" style={{ borderColor: "rgba(0,212,255,.3)", background: "rgba(0,212,255,.1)" }}><span>🏢</span></div>

                  <div className="bc-name">Enterprise Licensing</div>
                  <div className="bc-desc">Custom deployments for large organizations. White-label options, dedicated infrastructure, and priority support.</div>
                  <div className="bc-tag high">HIGH VALUE</div>
                </div>
                <div className="bc" style={{ transitionDelay: ".6s", borderTop: "3px solid var(--green)" }}>
                  <div className="bc-img"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/YgbVJdOqlfIvJxSr.png" alt="API Connector Hub" /></div>
                  <div className="bc-icon-wrap" style={{ borderColor: "rgba(0,255,136,.3)", background: "rgba(0,255,136,.1)" }}><span>🔌</span></div>

                  <div className="bc-name">Integrations &amp; Modules</div>
                  <div className="bc-desc">API access, premium simulation layers, and add-on modules for specialized sectors and industry verticals.</div>
                  <div className="bc-tag fut">FUTURE</div>
                </div>
              </div>
            </div>
          </div>

          {/* S12 STAGE */}
          <div className="slide" id="s12">
            <canvas className="bg-canvas" id="p12"></canvas>
            <div className="bg-vid-frame">
              <video className="bg-vid-inner" autoPlay loop muted playsInline>
                <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/lVOiupAXAppIoyaM.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="bg-overlay"></div>
            <div className="wrap">
              <div className="slide-label">12 / Stage</div>
              <div className="slide-title">Where <span>We Are</span></div>
              <div className="tl-area">
                <div className="ms-row">
                  <div className="ms" style={{ transitionDelay: ".2s" }}><div className="ms-title">Product Developed</div><div className="ms-sub">Core engine built &amp;<br />running on web, iOS and Android</div></div>
                  <div className="ms" style={{ transitionDelay: ".4s" }}><div className="ms-title">Early Validation</div><div className="ms-sub">Hardening the engine ahead of<br />go-to-market</div><div className="ms-here">← WE ARE HERE</div></div>
                  <div className="ms" style={{ transitionDelay: ".6s" }}><div className="ms-title">Market Adoption</div><div className="ms-sub">Go-to-market launch &amp;<br />customer acquisition</div></div>
                  <div className="ms" style={{ transitionDelay: ".8s" }}><div className="ms-title">Scale &amp; Expand</div><div className="ms-sub">Enterprise &amp; global<br />market penetration</div></div>
                </div>
                <div className="track-row">
                  <div className="track-bg"><div className="track-fill" id="trackFill"></div></div>
                </div>
                <div className="dots-row">
                  <div style={{ flex: 1, display: "flex", justifyContent: "center" }}><div className="ms-dot done"></div></div>
                  <div style={{ flex: 1, display: "flex", justifyContent: "center" }}><div className="ms-dot active"></div></div>
                  <div style={{ flex: 1, display: "flex", justifyContent: "center" }}><div className="ms-dot upcoming"></div></div>
                  <div style={{ flex: 1, display: "flex", justifyContent: "center" }}><div className="ms-dot future"></div></div>
                </div>
                <div className="cards-row">
                  <div className="ms-card" style={{ transitionDelay: ".3s", borderTop: "2px solid var(--green)" }}>
                    <div className="ms-card-num" style={{ color: "var(--green)" }}>✓</div>
                    <div className="ms-card-label">Web App Live</div>
                  </div>
                  <div className="ms-card" style={{ transitionDelay: ".5s", borderTop: "2px solid var(--purple)" }}>
                    <div className="ms-card-num" style={{ color: "var(--purple)" }}>✓</div>
                    <div className="ms-card-label">Determinism Verified</div>
                  </div>
                  <div className="ms-card" style={{ transitionDelay: ".7s", borderTop: "2px solid var(--cyan)" }}>
                    <div className="ms-card-num" style={{ color: "var(--cyan)" }}>Q3</div>
                    <div className="ms-card-label">Launch Target</div>
                  </div>
                  <div className="ms-card" style={{ transitionDelay: ".9s", borderTop: "2px solid var(--muted)" }}>
                    <div className="ms-card-num" style={{ color: "var(--muted)", fontSize: "26px" }}><span className="todo">TODO-FATHI</span></div>
                    <div className="ms-card-label">Raise Goal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* S13 ACCURACY */}
          <div className="slide" id="s13">
            <canvas className="bg-canvas" id="p13"></canvas>
            <div className="wrap">
              <div className="slide-label">13 / Accuracy</div>
              <div className="slide-title">Consistent Is Not the Same as <span>Correct</span></div>
              <div className="acc-lede">Reproducibility is the floor, not the claim. Three things stand between a number you can repeat and a number you can defend.</div>
              <div className="acc-grid">
                <div className="acc-card" style={{ transitionDelay: ".25s", borderTop: "3px solid var(--purple)" }}>
                  <div className="acc-icon">🔒</div>
                  <div className="acc-name">A Sealed Engine</div>
                  <div className="acc-body">The engine is deliberately sealed. It cannot reach outside itself to pull hidden data while it computes, so nothing enters a score that was not put there deliberately.</div>
                  <div className="acc-tag" style={{ color: "var(--purple)", borderColor: "rgba(108,99,255,.4)", background: "rgba(108,99,255,.1)" }}>NO HIDDEN INPUTS</div>
                </div>
                <div className="acc-card" style={{ transitionDelay: ".45s", borderTop: "3px solid var(--cyan)" }}>
                  <div className="acc-icon">📋</div>
                  <div className="acc-name">An Approved Assumption Register</div>
                  <div className="acc-body">Assumptions enter only through a named, approved register. Every assumption behind a number is visible, and can be challenged on its own terms rather than argued about in the abstract.</div>
                  <div className="acc-tag" style={{ color: "var(--cyan)", borderColor: "rgba(0,212,255,.4)", background: "rgba(0,212,255,.1)" }}>EVERY INPUT NAMED</div>
                </div>
                <div className="acc-card" style={{ transitionDelay: ".65s", borderTop: "3px solid var(--green)" }}>
                  <div className="acc-icon">🎯</div>
                  <div className="acc-name">Brier Calibration</div>
                  <div className="acc-body">As decisions resolve, Brier calibration scores the engine’s own predictions against what actually happened. Correctness gets measured against reality over time. It is not asserted up front.</div>
                  <div className="acc-tag" style={{ color: "var(--green)", borderColor: "rgba(0,255,136,.4)", background: "rgba(0,255,136,.1)" }}>SCORED ON OUTCOMES</div>
                </div>
              </div>
              <div className="acc-evidence">
                <div className="acc-ev-left">
                  <div className="acc-ev-lbl">Back-test evidence</div>
                  <div className="acc-ev-note">No completed back-test and no accuracy figure is claimed at this stage. This is where that evidence goes once it exists.</div>
                </div>
                <span className="todo">TODO-FATHI</span>
              </div>
            </div>
          </div>

          {/* S14 TEAM */}
          <div className="slide" id="s14">
            <canvas className="bg-canvas" id="p14"></canvas>
            <div className="wrap">
              <div className="slide-label">14 / Team</div>
              <div className="slide-title">The People <span>Behind It</span></div>
              <div className="cards s14-cards">
                <div className="tc" style={{ transitionDelay: ".2s", borderTop: "3px solid var(--purple)" }}>
                  <div className="tc-photo-wrap">
                    <img className="tc-photo" src="https://storage.googleapis.com/runable-templates/cli-uploads%2FkOpJh1WBUGnPVSjlrlo8fC67KBLFJQuR%2FgtOmY8nlZgG8-oddX9bf6%2FFathi_3__4j-ILf.png" style={{ borderColor: "var(--purple)", boxShadow: "0 0 24px rgba(108,99,255,.4)" }} alt="Fathi" />
                    <div className="tc-ring" style={{ borderColor: "var(--purple)" }}></div>
                  </div>
                  <div className="tc-name">Fathi Al Riyami</div>
                  <div className="tc-role" style={{ color: "var(--purple)", borderColor: "var(--purple)", background: "rgba(108,99,255,.1)" }}>Founder &amp; CEO</div>
                  <div className="tc-bio">AI, systems &amp; product vision. Driving the decision intelligence platform from concept to market reality.</div>
                  <div className="tc-creds">
                    <div className="tc-cred">
                      <div className="tc-cred-lbl">Prior companies</div>
                      <span className="todo">TODO-FATHI</span>
                    </div>
                    <div className="tc-cred">
                      <div className="tc-cred-lbl">Track record</div>
                      <span className="todo">TODO-FATHI</span>
                    </div>
                  </div>
                  <div className="tc-expertise"><span className="tc-tag">AI Systems</span><span className="tc-tag">Product</span><span className="tc-tag">Vision</span></div>
                </div>
                <div className="tc" style={{ transitionDelay: ".4s", borderTop: "3px solid var(--cyan)" }}>
                  <div className="tc-photo-wrap">
                    <img className="tc-photo" src="https://storage.googleapis.com/runable-templates/cli-uploads%2FkOpJh1WBUGnPVSjlrlo8fC67KBLFJQuR%2FNAoANGIHjzl5hHe07kbW0%2FTaimur__hTP2bm.png" style={{ borderColor: "var(--cyan)", boxShadow: "0 0 24px rgba(0,212,255,.35)" }} alt="Taimur" />
                    <div className="tc-ring" style={{ borderColor: "var(--cyan)" }}></div>
                  </div>
                  <div className="tc-name">Taimur Al Said</div>
                  <div className="tc-role" style={{ color: "var(--cyan)", borderColor: "var(--cyan)", background: "rgba(0,212,255,.1)" }}>Chief of Staff</div>
                  <div className="tc-bio">Operations &amp; high-stakes decision environments. Aviation industry expertise in mission-critical execution.</div>
                  <div className="tc-creds">
                    <div className="tc-cred">
                      <div className="tc-cred-lbl">Prior companies</div>
                      <span className="todo">TODO-FATHI</span>
                    </div>
                    <div className="tc-cred">
                      <div className="tc-cred-lbl">Track record</div>
                      <span className="todo">TODO-FATHI</span>
                    </div>
                  </div>
                  <div className="tc-expertise"><span className="tc-tag" style={{ color: "var(--cyan)", borderColor: "rgba(0,212,255,.3)", background: "rgba(0,212,255,.08)" }}>Operations</span><span className="tc-tag" style={{ color: "var(--cyan)", borderColor: "rgba(0,212,255,.3)", background: "rgba(0,212,255,.08)" }}>Aviation</span><span className="tc-tag" style={{ color: "var(--cyan)", borderColor: "rgba(0,212,255,.3)", background: "rgba(0,212,255,.08)" }}>Execution</span></div>
                </div>
                <div className="tc" style={{ transitionDelay: ".6s", borderTop: "3px solid var(--green)" }}>
                  <div className="tc-photo-wrap">
                    <img className="tc-photo" src="https://storage.googleapis.com/runable-templates/cli-uploads%2FkOpJh1WBUGnPVSjlrlo8fC67KBLFJQuR%2F1nGz-ykwIRWzSoVJ4BEnT%2FDragos_xxv2Jg.png" style={{ borderColor: "var(--green)", boxShadow: "0 0 24px rgba(0,255,136,.3)" }} alt="Dragos" />
                    <div className="tc-ring" style={{ borderColor: "var(--green)" }}></div>
                  </div>
                  <div className="tc-name">Dragos Silion</div>
                  <div className="tc-role" style={{ color: "var(--green)", borderColor: "var(--green)", background: "rgba(0,255,136,.1)" }}>Chief Data/AI Officer</div>
                  <div className="tc-bio">XR &amp; immersive systems expert. Powers the 3D visualization layer and the core AI architecture.</div>
                  <div className="tc-creds">
                    <div className="tc-cred">
                      <div className="tc-cred-lbl">Prior companies</div>
                      <span className="todo">TODO-FATHI</span>
                    </div>
                    <div className="tc-cred">
                      <div className="tc-cred-lbl">Track record</div>
                      <span className="todo">TODO-FATHI</span>
                    </div>
                  </div>
                  <div className="tc-expertise"><span className="tc-tag" style={{ color: "var(--green)", borderColor: "rgba(0,255,136,.3)", background: "rgba(0,255,136,.08)" }}>XR/3D</span><span className="tc-tag" style={{ color: "var(--green)", borderColor: "rgba(0,255,136,.3)", background: "rgba(0,255,136,.08)" }}>AI Arch</span><span className="tc-tag" style={{ color: "var(--green)", borderColor: "rgba(0,255,136,.3)", background: "rgba(0,255,136,.08)" }}>Data</span></div>
                </div>
              </div>
              <div className="advisors">
                <div className="adv-lbl">Advisors</div>
                <div className="adv-row">
                  <div className="adv-slot"><span className="todo">TODO-FATHI</span><div className="adv-hint">Name, affiliation, what they actually advise on</div></div>
                  <div className="adv-slot"><span className="todo">TODO-FATHI</span><div className="adv-hint">Name, affiliation, what they actually advise on</div></div>
                  <div className="adv-slot"><span className="todo">TODO-FATHI</span><div className="adv-hint">Name, affiliation, what they actually advise on</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* S15 VISION */}
          <div className="slide" id="s15">
            <canvas className="bg-canvas" id="p15"></canvas>
            <div className="wrap">
              <div className="left">
                <div className="slide-label">15 / Vision</div>
                <div className="headline">To Become the<br /><span>Default System</span><br />for Decision-Making</div>
                <div className="pillars">
                  <div className="pi" style={{ transitionDelay: ".4s" }}><div className="pi-icon">🔢</div><div className="pi-text">Every Number is Computed</div></div>
                  <div className="pi" style={{ transitionDelay: ".6s" }}><div className="pi-icon">🌐</div><div className="pi-text">Futures are Simulated</div></div>
                  <div className="pi" style={{ transitionDelay: ".8s" }}><div className="pi-icon">✨</div><div className="pi-text">Decisions are Clear</div></div>
                </div>
              </div>
              <div className="right">
                <iframe className="phone-img" src="https://www.youtube.com/embed/zgwW209PTnU" title="Vision Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: "315px", height: "560px" }}></iframe>
              </div>
            </div>
          </div>

          {/* S16 THE ASK */}
          <div className="slide" id="s16">
            <canvas className="bg-canvas" id="p16"></canvas>
            <div className="wrap">
              <div className="left">
                <div className="slide-label">16 / The Ask</div>
                <div className="slide-title">The <span>Ask</span></div>
                <div className="raise"><span className="todo">TODO-FATHI</span></div>
                <div className="raise-lbl">PRE-SEED ROUND</div>
                <div className="ask-terms">
                  <div className="ask-term">
                    <div className="ask-term-lbl">Instrument</div>
                    <span className="todo">TODO-FATHI</span>
                  </div>
                  <div className="ask-term">
                    <div className="ask-term-lbl">Valuation or cap</div>
                    <span className="todo">TODO-FATHI</span>
                  </div>
                </div>
                <div className="uses">
                  <div className="ui" style={{ transitionDelay: ".6s" }}>
                    <div className="ui-labels">Product Development <span style={{ color: "var(--purple)" }}>45%</span></div>
                    <div className="ui-sublabel">Hardening, security, enterprise readiness</div>
                    <div className="ui-bg"><div className="ui-fill" data-w="45%" style={{ background: "linear-gradient(90deg,var(--purple),#9f7aea)", boxShadow: "0 0 8px rgba(108,99,255,.4)" }}></div></div>
                  </div>
                  <div className="ui" style={{ transitionDelay: ".8s" }}>
                    <div className="ui-labels">Simulation &amp; 3D Layer <span style={{ color: "var(--cyan)" }}>25%</span></div>
                    <div className="ui-bg"><div className="ui-fill" data-w="25%" style={{ background: "linear-gradient(90deg,var(--cyan),#0099cc)", boxShadow: "0 0 8px rgba(0,212,255,.4)" }}></div></div>
                  </div>
                  <div className="ui" style={{ transitionDelay: "1s" }}>
                    <div className="ui-labels">Go-to-Market <span style={{ color: "var(--green)" }}>30%</span></div>
                    <div className="ui-bg"><div className="ui-fill" data-w="30%" style={{ background: "linear-gradient(90deg,var(--green),#00aa55)", boxShadow: "0 0 8px rgba(0,255,136,.4)" }}></div></div>
                  </div>
                </div>
              </div>
              <div className="right">
                <div className="plan">
                  <div className="plan-hd">What this buys, over 18 months</div>
                  <div className="plan-rail"></div>
                  <div className="plan-step" style={{ transitionDelay: ".4s" }}>
                    <div className="plan-dot"></div>
                    <div className="plan-body">
                      <div className="plan-when">Months 0 to 6</div>
                      <span className="todo">TODO-FATHI</span>
                      <div className="todo-hint">The milestone, and the measurable test that says it was hit.</div>
                    </div>
                  </div>
                  <div className="plan-step" style={{ transitionDelay: ".6s" }}>
                    <div className="plan-dot"></div>
                    <div className="plan-body">
                      <div className="plan-when">Months 6 to 12</div>
                      <span className="todo">TODO-FATHI</span>
                      <div className="todo-hint">The milestone, and the measurable test that says it was hit.</div>
                    </div>
                  </div>
                  <div className="plan-step" style={{ transitionDelay: ".8s" }}>
                    <div className="plan-dot"></div>
                    <div className="plan-body">
                      <div className="plan-when">Months 12 to 18</div>
                      <span className="todo">TODO-FATHI</span>
                      <div className="todo-hint">The milestone that makes the next round raisable.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* S17 CLOSING */}
          <div className="slide" id="s17">
            <canvas className="bg-canvas" id="p17"></canvas>
            <div className="wrap">
              <div className="brand-lbl">BRAINPOWER AI</div>
              <div className="from">From Thinking</div>
              <div className="arrow-area">
                <img className="neon-head" src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/xzVsGKZWwvmZhdMs.png" alt="Neon AI" />
                <div className="arrow-txt">→</div>
              </div>
              <div className="to">To Seeing &amp; Exploring Futures</div>
              <div className="sub-line">Computed decisions. Not guesses. Decision Intelligence, redefined.</div>
              <div className="divider"></div>
              <div className="cta-text">Join the future of decisions · <a href="https://brainpowerinvestor.com" target="_blank" rel="noopener noreferrer">brainpowerinvestor.com</a></div>
              <div className="cta-text cta-contact">Contact us directly: <a href="mailto:fathi.alriyami@smarthinkerz.com">fathi.alriyami@smarthinkerz.com</a></div>
            </div>
          </div>

        </div>
      </div>

      {/* NAV */}
      <div id="nav-bar">
        <div id="nav-handle" title="Drag to move">⋮⋮</div>
        <button onClick={() => (window as any).navPrev()}>‹</button>
        <div id="dots"></div>
        <span id="counter">1 / 17</span>
        <button onClick={() => (window as any).navNext()}>›</button>
      </div>
      <button id="fullscreen-btn" onClick={() => (window as any).toggleFS()} title="Fullscreen">⛶</button>
    </div>
  );
}
