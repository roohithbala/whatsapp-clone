const backendLandingPage = ({ frontendUrl }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#071a17">
  <title>Relay Backend</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; color: #e9f7f3; background: radial-gradient(circle at 12% 16%, rgba(0,168,132,.22), transparent 28rem), radial-gradient(circle at 88% 8%, rgba(83,189,235,.14), transparent 24rem), linear-gradient(145deg,#06110f,#0b1f1c 52%,#071411); font-family: Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif; }
    .shell { width: min(1080px,calc(100% - 36px)); margin: 0 auto; padding: 36px 0 52px; }
    nav { display:flex; align-items:center; justify-content:space-between; margin-bottom:72px; }
    .brand { display:flex; align-items:center; gap:12px; font-weight:800; letter-spacing:-.03em; }
    .mark { display:grid; place-items:center; width:42px; height:42px; border-radius:14px; color:#03120f; background:linear-gradient(135deg,#5ef0c2,#00a884); box-shadow:0 10px 34px rgba(0,168,132,.28); }
    .status { display:flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid rgba(94,240,194,.18); border-radius:999px; color:#9fedd4; background:rgba(8,39,32,.64); font-size:13px; }
    .dot { width:8px; height:8px; border-radius:50%; background:#5ef0c2; box-shadow:0 0 0 6px rgba(94,240,194,.1); }
    .hero { max-width:760px; margin-bottom:58px; }
    .eyebrow { color:#5ef0c2; font-size:12px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
    h1 { margin:16px 0; font-size:clamp(44px,8vw,82px); line-height:.98; letter-spacing:-.065em; }
    .hero p { max-width:650px; margin:0; color:#9eb8b1; font-size:clamp(16px,2vw,19px); line-height:1.7; }
    .actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:28px; }
    a { color:inherit; text-decoration:none; }
    .button { padding:12px 18px; border-radius:12px; border:1px solid rgba(255,255,255,.1); font-size:14px; font-weight:750; background:rgba(255,255,255,.045); transition:.2s ease; }
    .button:hover { transform:translateY(-2px); border-color:rgba(94,240,194,.35); }
    .button.primary { color:#04130f; border-color:transparent; background:linear-gradient(135deg,#5ef0c2,#00a884); }
    .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    .card { min-height:156px; padding:22px; border:1px solid rgba(255,255,255,.08); border-radius:20px; background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.025)); box-shadow:0 22px 60px rgba(0,0,0,.18); }
    .card span { display:inline-block; margin-bottom:34px; color:#5ef0c2; font:800 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.1em; text-transform:uppercase; }
    .card h2 { margin:0 0 7px; font-size:17px; letter-spacing:-.02em; }
    .card p { margin:0; color:#88a49d; font-size:13px; line-height:1.55; }
    footer { display:flex; justify-content:space-between; gap:20px; margin-top:36px; padding-top:22px; border-top:1px solid rgba(255,255,255,.07); color:#68827b; font-size:12px; }
    code { color:#9fedd4; }
    @media (max-width:760px) { nav{margin-bottom:50px}.grid{grid-template-columns:1fr}footer{flex-direction:column} }
  </style>
</head>
<body>
  <main class="shell">
    <nav><div class="brand"><div class="mark">R</div><span>Relay Backend</span></div><div class="status"><span class="dot"></span>API operational</div></nav>
    <section class="hero">
      <div class="eyebrow">Messaging infrastructure</div>
      <h1>Quietly powering every conversation.</h1>
      <p>The REST API, realtime socket layer, moderation tools, media delivery, and account services are online and ready.</p>
      <div class="actions"><a class="button primary" href="${frontendUrl}">Open application</a><a class="button" href="/api/health">View health response</a></div>
    </section>
    <section class="grid">
      <article class="card"><span>Realtime</span><h2>Socket messaging</h2><p>Presence, delivery receipts, typing activity, calls, and live conversations.</p></article>
      <article class="card"><span>Protected</span><h2>Account services</h2><p>Token-based authentication, sessions, profiles, security, and moderation.</p></article>
      <article class="card"><span>Connected</span><h2>Community features</h2><p>Groups, communities, channels, statuses, uploads, and Meta AI routes.</p></article>
    </section>
    <footer><span>Relay service console</span><span>Health endpoint: <code>GET /api/health</code></span></footer>
  </main>
</body>
</html>`;

module.exports = backendLandingPage;
