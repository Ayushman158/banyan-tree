/* Scroll-driven narrative sections + final CTA + footer.
   Lives below the cinematic hero. */

import React, { useEffect as _useEffect, useRef as _useRef } from 'react';

function useReveal() {
  const ref = _useRef(null);
  _useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          el.querySelectorAll(".reveal").forEach((n, i) => {
            setTimeout(() => n.classList.add("is-in"), i * 80);
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.18 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Parallax({ speed = 0.05, className = "", children, ...props }) {
  const ref = _useRef(null);

  _useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isVisible = false;
    let elementTop = 0;
    let elementHeight = 0;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      elementTop = rect.top + window.scrollY;
      elementHeight = rect.height;
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        isVisible = e.isIntersecting;
        if (isVisible) {
          measure();
        }
      });
    }, { threshold: 0 });

    observer.observe(el);

    const onScroll = () => {
      if (!isVisible) return;
      const scrolled = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      const relativeY = (elementTop - scrolled) + elementHeight / 2 - viewportHeight / 2;
      const translateVal = relativeY * speed;
      el.style.setProperty('--parallax-y', `${translateVal}px`);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    const t = setTimeout(measure, 100);

    return () => {
      observer.disconnect();
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`parallax-item ${className}`} {...props}>
      {children}
    </div>
  );
}

function Philosophy() {
  const ref = useReveal();
  return (
    <section className="spread" id="philosophy" ref={ref}>
      <div className="section-tag reveal">
        <span>I — Philosophy</span>
      </div>
      <div className="philosophy">
        <div className="col-left">
          <h2 className="section-h reveal">
            Symptoms are signals.<br/>
            <em>They are not the story.</em>
          </h2>
        </div>
        <Parallax speed={0.05} className="col-right">
          <blockquote className="reveal delay-1">
            Modern medicine often arrives at the leaf.
            We are interested in the root, the soil, the weather, the season —
            in the conditions that allow the leaf to wilt or to bloom.
          </blockquote>
          <p className="reveal delay-2">
            The way you sleep, breathe, eat, attune, and rest forms an interior
            climate. Symptoms are how that climate speaks when it is no longer
            in balance. Listening — slowly, without urgency — is the first
            practice.
          </p>
          <p className="reveal delay-3">
            Healing here is not a protocol. It is the patient re-establishment
            of conditions in which the body remembers how to be well.
          </p>
        </Parallax>
      </div>
    </section>
  );
}

function Methodology() {
  const ref = useReveal();
  const steps = [
    { num: "01", title: "Listen", body: "An unhurried intake. We map what is showing on the surface — sleep, energy, mood, digestion, attention — and where it lives in the body.", speed: -0.02 },
    { num: "02", title: "Trace", body: "Together we follow each thread inward, past the symptom, toward the underlying patterns that have been keeping it in place.", speed: 0.04 },
    { num: "03", title: "Restore", body: "A gentle, layered protocol: breath, nervous-system work, nourishment, rhythm. Designed to be sustainable, not heroic.", speed: 0.01 },
    { num: "04", title: "Integrate", body: "We rebuild rituals so the new equilibrium becomes the default — not something you must remember to maintain.", speed: 0.06 },
  ];
  return (
    <section className="spread" id="method" ref={ref}>
      <div className="section-tag reveal">
        <span>II — Methodology</span>
      </div>
      <h2 className="section-h reveal">
        A method that <em>follows the body</em><br/>
        rather than overriding it.
      </h2>
      <div className="method">
        {steps.map((s, i) => (
          <Parallax speed={s.speed} key={s.num}>
            <div className={`method-step reveal delay-${(i % 3) + 1}`}>
              <span className="num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          </Parallax>
        ))}
      </div>
    </section>
  );
}

function Voices() {
  const ref = useReveal();
  const voices = [
    {
      quote: "For the first time I felt understood not as a list of symptoms, but as a body trying to tell a coherent story.",
      name: "Amara K.",
      detail: "Living with anxiety · 9 months in",
      speed: 0.02,
    },
    {
      quote: "The work was quieter than I expected. Less protocol, more attention. My sleep returned before I noticed it had.",
      name: "Jonas R.",
      detail: "Burnout recovery · 14 months in",
      speed: 0.06,
    },
    {
      quote: "I came in chasing a thyroid number. I left understanding the decade of stress underneath it.",
      name: "Priya N.",
      detail: "Hormonal rebalancing · 6 months in",
      speed: 0.04,
    },
  ];
  return (
    <section className="spread" id="voices" ref={ref}>
      <div className="section-tag reveal">
        <span>III — Voices</span>
      </div>
      <h2 className="section-h reveal">
        Quiet shifts,<br/>
        <em>not transformations.</em>
      </h2>
      <div className="voices">
        {voices.map((v, i) => (
          <Parallax speed={v.speed} key={v.name}>
            <article className={`voice reveal delay-${(i % 3) + 1}`}>
              <p className="quote">"{v.quote}"</p>
              <div className="who">
                <span className="name">{v.name}</span>
                <span className="detail">{v.detail}</span>
              </div>
            </article>
          </Parallax>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  const ref = useReveal();
  return (
    <section className="spread final" id="begin" ref={ref}>
      <Parallax speed={0.03} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, width: "100%" }}>
        <div className="section-tag reveal" style={{ marginBottom: 24 }}>
          <span>IV — Begin</span>
        </div>
        <h2 className="reveal delay-1">
          <span className="line">Begin at the</span>
          <em className="line">root.</em>
        </h2>
        <p className="reveal delay-2">
          A 90-minute first consultation, in person or remote. No prescriptions,
          no urgency — only attention. We will map the surface, and we will
          listen for what is underneath.
        </p>
        <div className="reveal delay-3" style={{ display: "flex", gap: 14, marginTop: 12 }}>
          <button className="btn btn--primary" data-hoverable="true">
            Reserve a consultation
          </button>
          <button className="btn btn--ghost" data-hoverable="true">
            Read the philosophy
          </button>
        </div>
      </Parallax>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer>
      <div className="left">
        <span className="mark">Banyan</span>
        <span>Est. 2021 · Lisbon &amp; Kyoto</span>
      </div>
      <div className="right">
        <a href="#" data-hoverable="true">Journal</a>
        <a href="#" data-hoverable="true">Practitioners</a>
        <a href="#" data-hoverable="true">Contact</a>
      </div>
    </footer>
  );
}

export { Philosophy, Methodology, Voices, FinalCTA, SiteFooter };
