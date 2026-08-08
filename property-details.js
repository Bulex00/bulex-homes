/* ============================================
BULEX HOMES - PROPERTY DETAILS RENDERER
Runs BEFORE main.js so main.js hooks (gallery,
lightbox, mortgage, ROI, modal, favorites on
similar cards, recently-viewed) bind correctly.
============================================ */
(function () {
  const params = new URLSearchParams(window.location.search);
  const P = bulexById(params.get('id'));
  const A = BULEX_AGENTS[P.agent];

  document.addEventListener('DOMContentLoaded', render);

  function render() {
    document.title = `${P.title} | Bulex Homes`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `${P.title} in ${P.loc} — ${bulexFormat(P.price, P.rent)}. Full gallery, investment score and neighborhood intelligence from Bulex Homes.`;

    /* Badges + header */
    document.getElementById('detail-badges').innerHTML =
      `<span class="pill dark">${P.status}</span><span class="pill">${P.ribbon}</span><span class="pill">${P.type}</span>`;
    document.getElementById('detail-title').textContent = P.title;
    document.getElementById('detail-location').textContent = P.loc;
    document.getElementById('detail-price').textContent = bulexFormat(P.price, P.rent);

    /* Gallery */
    const main = document.getElementById('gallery-main-img');
    main.src = U(P.img, 1400); main.alt = P.title;
    document.getElementById('gallery-thumbs').innerHTML = bulexGallery(P)
      .map((g, i) => `<img class="gallery-image" src="${U(g, 1000)}" alt="${P.title} photo ${i + 1}" loading="lazy">`).join('');

    /* Meta row */
    document.getElementById('detail-meta').innerHTML = P.meta
      ? `<span><i class="fas fa-building"></i> ${P.meta}</span>`
      : `<span><i class="fas fa-bed"></i> ${P.beds} Beds</span>
         <span><i class="fas fa-bath"></i> ${P.baths} Baths</span>
         <span><i class="fas fa-car"></i> ${P.park} Parking</span>
         <span><i class="fas fa-ruler-combined"></i> ${P.size} sqm</span>`;

    /* Description */
    document.getElementById('detail-desc').textContent = P.desc;

    /* Amenities */
    const amenities = ['24/7 Security', 'Power Backup', 'Fiber Internet', 'Dedicated Parking', 'Treated Water', 'Smart Home Wiring']
      .concat(P.feat.map(f => FEATURE_LABELS[f]).filter(Boolean));
    document.getElementById('detail-amenities').innerHTML = amenities
      .map(a => `<div class="amenity-item"><i class="fas fa-check-circle"></i> ${a}</div>`).join('');

    /* Neighborhood intelligence */
    const hoodLabels = ['Overall Score', 'Safety', 'School Quality', 'Hospitals', 'Public Transport', 'Shopping & Dining'];
    document.getElementById('detail-hood').innerHTML = P.hood
      .map((v, i) => `<div class="score-card"><div class="label"><span><i class="fas fa-map-marker-alt" style="color:var(--accent)"></i> ${hoodLabels[i]}</span><strong>${v}/100</strong></div><div class="bar"><span data-w="${v}"></span></div></div>`).join('');

    /* Investment dashboard */
    const [score, yld, roi, appr, rent, demand, risk, occ] = P.inv;
    const payback = rent > 0 ? (P.price / (rent * 12)).toFixed(1) + ' yrs' : '—';
    document.getElementById('detail-invest').innerHTML = `
      <div class="score-card"><div class="label"><span>Investment Score</span><strong>${score}/100</strong></div><div class="bar"><span data-w="${score}"></span></div></div>
      <div class="score-card"><div class="label"><span>Occupancy Potential</span><strong>${occ}%</strong></div><div class="bar"><span data-w="${occ}"></span></div></div>
      <div class="score-card"><div class="label"><span>Rental Yield</span><strong>${yld ? yld + '%' : '—'}</strong></div></div>
      <div class="score-card"><div class="label"><span>ROI</span><strong>${roi}%/yr</strong></div></div>
      <div class="score-card"><div class="label"><span>Appreciation Forecast</span><strong>${appr}%/yr</strong></div></div>
      <div class="score-card"><div class="label"><span>Monthly Rental Income</span><strong>${rent ? '₦' + rent.toLocaleString() : '—'}</strong></div></div>
      <div class="score-card"><div class="label"><span>Payback Period</span><strong>${payback}</strong></div></div>
      <div class="score-card"><div class="label"><span>Market Demand / Risk</span><strong>${demand} · ${risk}</strong></div></div>`;

    /* Best suited for */
    const best = [];
    if (P.beds >= 4) best.push('Families');
    if (P.city === 'Yaba') best.push('Students');
    if (score >= 85) best.push('Investors');
    if (P.price >= 150000000) best.push('Luxury Buyers');
    if (P.type === 'Commercial') best.push('Commercial Use');
    if (P.type === 'Penthouse' || P.ribbon === 'Luxury') best.push('Vacation Rental');
    document.getElementById('detail-bestfor').innerHTML =
      '<span style="background:none;padding:0">Best for:</span>' + best.map(b => `<span>${b}</span>`).join('');

    /* Calculator defaults */
    document.getElementById('calc-price').value = P.price;
    document.getElementById('roi-purchase').value = P.price;
    document.getElementById('roi-rent').value = rent || Math.round(P.price * 0.006 / 12);

    /* Agent */
    const photo = document.getElementById('agent-photo');
    photo.src = A.photo; photo.alt = A.name;
    photo.onerror = function () { this.onerror = null; this.src = A.fallback; };
    document.getElementById('agent-name').textContent = A.name;
    document.getElementById('agent-role').textContent = A.role + ' · Bulex Homes';
    document.getElementById('agent-call').href = 'tel:' + A.tel;
    document.getElementById('agent-wa').href = 'https://wa.me/message/LBRFONB553XBF1';
    document.getElementById('agent-mail').href = 'mailto:' + A.email;
    document.getElementById('modal-agent-name').textContent = A.name;
    document.getElementById('modal-agent-text').textContent = `Interested in ${P.title}? ${A.name} will respond within minutes during business hours.`;
    document.getElementById('modal-call').href = 'tel:' + A.tel;
    document.getElementById('modal-wa').href = 'https://wa.me/message/LBRFONB553XBF1';

    /* Actions: favorite / share / print / book */
    const favKey = 'bulexFavorites';
    const favs = new Set(JSON.parse(localStorage.getItem(favKey) || '[]'));
    const favBtn = document.getElementById('fav-btn');
    const setFav = on => { favBtn.classList.toggle('active', on); favBtn.querySelector('i').className = on ? 'fas fa-heart' : 'far fa-heart'; };
    setFav(favs.has(P.id));
    favBtn.addEventListener('click', () => {
      const on = !favs.has(P.id);
      on ? favs.add(P.id) : favs.delete(P.id);
      localStorage.setItem(favKey, JSON.stringify([...favs]));
      setFav(on);
      if (window.showToast) showToast(on ? 'Property saved to favorites' : 'Property removed from favorites');
    });

    const url = location.href;
    const txt = encodeURIComponent(`${P.title} — ${bulexFormat(P.price, P.rent)} | Bulex Homes`);
    document.getElementById('share-wa').href = `https://api.whatsapp.com/send?text=${txt}%20${encodeURIComponent(url)}`;
    document.getElementById('share-fb').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    document.getElementById('share-x').href = `https://twitter.com/intent/tweet?text=${txt}&url=${encodeURIComponent(url)}`;
    document.getElementById('share-li').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    document.getElementById('copy-link').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(url); showToast('Property link copied'); }
      catch { showToast(url); }
    });
    document.getElementById('print-btn').addEventListener('click', () => window.print());
    document.getElementById('book-btn').href = `book-viewing.html?property=${P.id}`;

    /* Similar properties */
    const similar = BULEX_PROPERTIES
      .filter(x => x.id !== P.id && (x.city === P.city || x.type === P.type))
      .sort((a, b) => b.inv[0] - a.inv[0]).slice(0, 3);
    document.getElementById('similar-grid').innerHTML = similar.map(cardHTML).join('');

    /* Animate all bars */
    requestAnimationFrame(() => document.querySelectorAll('.bar > span')
      .forEach(s => s.style.width = (s.dataset.w || 0) + '%'));
  }

  function cardHTML(p) {
    return `<article class="property-card" data-id="${p.id}">
      <div class="property-image">
        <img src="${U(p.img, 700)}" alt="${p.title}" loading="lazy">
        <span class="badge badge-sale">${p.status}</span><span class="ribbon">${p.ribbon}</span>
        <button class="icon-btn favorite-btn" aria-label="Save to favorites"><i class="far fa-heart"></i></button>
      </div>
      <div class="property-info">
        <p class="price">${bulexFormat(p.price, p.rent)}</p>
        <h3>${p.title}</h3>
        <p class="location"><i class="fas fa-map-marker-alt"></i> ${p.loc}</p>
        <div class="property-meta">
          <span><i class="fas fa-bed"></i> ${p.beds} Beds</span>
          <span><i class="fas fa-bath"></i> ${p.baths} Baths</span>
          <span><i class="fas fa-ruler-combined"></i> ${p.size} sqm</span>
        </div>
        <div class="card-actions">
          <a class="btn btn-dark" href="property-details.html?id=${p.id}">View Details</a>
          <button class="share-btn" aria-label="Share property"><i class="fas fa-share-alt"></i></button>
        </div>
      </div>
    </article>`;
  }
})();