export default function Home() {
  const primary = "#10b981";
  const bgLight = "#ecfdf5";

  const metrics = [
    { value: "+40%", label: "taux de conversion" },
    { value: "<50ms", label: "latence P99" },
    { value: "100M+", label: "events/jour" },
    { value: "Auto", label: "retraining continu" },
  ];

  const features = [
    {
      icon: "🤝",
      title: "Filtrage collaboratif",
      desc: "Les comportements de millions d'utilisateurs similaires guident chaque recommandation. Plus vos données sont riches, plus le moteur est précis.",
    },
    {
      icon: "⚡",
      title: "Personnalisation temps réel",
      desc: "Chaque clic, scroll et achat enrichit le profil utilisateur instantanément. Les recommandations s'adaptent en cours de session.",
    },
    {
      icon: "🧪",
      title: "A/B testing intégré",
      desc: "Comparez plusieurs stratégies de recommandation simultanément. L'algorithme le plus performant prend automatiquement plus de trafic.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Intégration API en 1 jour",
      desc: "SDK JavaScript, Python ou API REST. 2 lignes de code suffisent pour démarrer à collecter les événements utilisateur.",
    },
    {
      num: "02",
      title: "Apprentissage comportemental",
      desc: "Le moteur apprend les patterns d'achat, de navigation et d'engagement. Premières recommandations pertinentes dès 1 000 événements.",
    },
    {
      num: "03",
      title: "Recommandations personnalisées",
      desc: "Widgets homepage, pages produit, emails post-achat, push notifications — un seul moteur, tous les canaux, zéro friction.",
    },
  ];

  return (
    <main style={{ fontFamily: "var(--font-body)" }}>
      {/* NAVBAR */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #a7f3d0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: primary }}>
            RecSys
          </span>
          <a
            href="https://calendly.com/wikolabs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: primary, color: "#fff", padding: "10px 22px", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}
          >
            Planifier une démo
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${bgLight} 0%, #fff 60%)`, padding: "80px 24px 60px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-block", background: "#a7f3d0", color: "#065f46", borderRadius: 999, padding: "6px 18px", fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            Moteur de recommandation IA
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15, color: "#111", marginBottom: 32 }}>
            Chaque visiteur voit<br />
            <span style={{ color: primary }}>ce qu'il cherche vraiment.</span>
          </h1>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
            <a
              href="https://calendly.com/wikolabs"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: primary, color: "#fff", padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none" }}
            >
              Planifier une démo
            </a>
            <a
              href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20RecSys%20avec%20Wikolabs."
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#25d366", color: "#fff", padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none" }}
            >
              WhatsApp
            </a>
          </div>

          {/* Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            {metrics.map((m) => (
              <div key={m.label} style={{ background: "#fff", border: "1px solid #a7f3d0", borderRadius: 12, padding: "20px 16px", boxShadow: "0 2px 8px rgba(16,185,129,0.06)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: primary }}>{m.value}</div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "#fff", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, textAlign: "center", color: "#111", marginBottom: 48 }}>
            Ce que RecSys fait pour vous
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {features.map((f) => (
              <div key={f.title} style={{ background: bgLight, border: "1px solid #a7f3d0", borderRadius: 16, padding: "32px 28px" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#111", marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: "#555", lineHeight: 1.7, fontSize: 15 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: bgLight, padding: "72px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, textAlign: "center", color: "#111", marginBottom: 48 }}>
            Comment ça fonctionne
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {steps.map((s) => (
              <div key={s.num} style={{ background: "#fff", border: "1px solid #a7f3d0", borderRadius: 16, padding: "28px 32px", display: "flex", gap: 24, alignItems: "flex-start" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, color: "#6ee7b7", minWidth: 56 }}>{s.num}</span>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#111", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ color: "#555", lineHeight: 1.7, fontSize: 15 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: primary, padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, color: "#fff", marginBottom: 16 }}>
            +40% de conversion dès le premier mois
          </h2>
          <p style={{ color: "#a7f3d0", fontSize: 17, marginBottom: 40 }}>
            Intégration en 1 jour. ROI mesurable en 2 semaines.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://calendly.com/wikolabs"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#fff", color: primary, padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none" }}
            >
              Planifier une démo
            </a>
            <a
              href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20RecSys%20avec%20Wikolabs."
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#25d366", color: "#fff", padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none" }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#111", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: primary }}>RecSys</span>
          <p style={{ color: "#999", marginTop: 12, fontSize: 14 }}>
            by{" "}
            <a href="https://wikolabs.com" target="_blank" rel="noopener noreferrer" style={{ color: "#ccc", textDecoration: "none" }}>
              Wikolabs
            </a>
            {" "}—{" "}
            <a href="mailto:team@wikolabs.com" style={{ color: "#ccc", textDecoration: "none" }}>
              team@wikolabs.com
            </a>
          </p>
          <p style={{ color: "#555", marginTop: 8, fontSize: 13 }}>© {new Date().getFullYear()} Wikolabs. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
}
