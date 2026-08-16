/* ============================================================================
   FLOATING VISUAL EDITOR — MVP (Phase 1 per spec)
   ============================================================================
   ARCHITECTURE NOTES (read before extending):

   • Persistence: localStorage only (key: lfl_ve_config_v1). This is an MVP
     placeholder, NOT the real database the full spec calls for — there is no
     backend in this project yet. Use the "ייצוא תצורה" (Export config) button
     to download the JSON; that same shape is what a future Supabase table
     (e.g. `page_content(editable_id text primary key, config jsonb)`) should
     store, so migrating is a straight import, not a rewrite.

   • Auth: the "🔒 עריכת עמוד" unlock is a client-side passcode gate
     (PASSCODE below) stored in sessionStorage. This is NOT secure server-side
     admin auth — anyone reading this file's source can see the code. Real
     admin gating requires a backend that checks the user's role on every
     save request, which needs the auth system from the DB decision above.

   • Data model — one config entry per editable element:
       config[editableId] = {
         content: { text: "..." },                 // only for kind:"text"
         styles: {
           desktop: { fontSize, color, backgroundColor, width, maxWidth,
                       paddingTop, paddingRight, paddingBottom, paddingLeft,
                       marginTop, marginBottom, gap, objectFit },
           laptop: { ...only the overridden keys... },
           tablet: { ...only the overridden keys... },
           mobile: { ...only the overridden keys... }
         },
         visibility: { desktop: true, laptop: true, tablet: true, mobile: true }
       }
     Only *overridden* properties are stored per breakpoint — anything absent
     falls through to the next wider breakpoint (desktop → laptop → tablet → mobile).
     desktop = large monitor (~17–32"), laptop = laptop screen (~14–16"), both approximated
     by a 1440px viewport-width threshold since CSS can't see physical screen size.
     exactly the cascade the spec asked for. This is enforced by generating
     real CSS with `[data-editable-id="…"]` selectors inside min/max-width
     media queries (see buildStyleSheet), never inline styles — so the page
     never turns into unmanaged inline-CSS soup.

   • Editable-element registry (ELEMENT_REGISTRY below): every editable
     element is looked up by a *stable* CSS selector (existing classes/ids
     already in the markup), never `:nth-child()` or DOM-position. Each
     element is stamped with `data-editable-id` + `data-editable-kind` at
     runtime. To make something else editable, add one line to the registry —
     no HTML surgery required.

   • This MVP intentionally does NOT implement: drag-and-drop reordering,
     duplicate, true delete (the toolbar's "הסתר" hides per-breakpoint via
     the same visibility system instead — safer and reversible), or a
     fully isolated iframe device preview (device switch resizes a wrapping
     frame instead). Those are exactly the Phase 2 items the spec itself
     deferred.
   ============================================================================ */
(function () {
  "use strict";

  const CONFIG_KEY = "lfl_ve_config_v1";
  const ADMIN_KEY = "lfl_ve_admin_session";
  const PASSCODE = "2525"; // MVP-only client gate — see header note. Change freely.
  // desktop = large monitor (~17–32"), laptop = laptop screen (~14–16"). CSS can only ever
  // key off viewport width (px), not physical screen size, so 1440px is an approximation —
  // a common laptop/desktop dividing line in practice, not a hard physical measurement.
  const BREAKPOINTS = ["desktop", "laptop", "tablet", "mobile"];
  const BP_LABEL = { desktop: "מחשב נייח", laptop: "מחשב נייד", tablet: "טאבלט", mobile: "מובייל" };
  const BP_ICON = { desktop: "🖥️", laptop: "💻", tablet: "📱", mobile: "📱" };

  // ---- stable, non-fragile registry: editableId -> {selector, kind, deletable} ----
  // Selectors are existing classes/ids already in the markup — never nth-child.
  // A selector matching N elements auto-expands to id.1 … id.N (see stampRegistry).
  const ELEMENT_REGISTRY = [
    // ---- hero ----
    { id: "hero.section", selector: ".hero", kind: "hero-section" },
    { id: "hero.title", selector: ".hero-title", kind: "text" },
    { id: "hero.bubble", selector: ".hero-bubble", kind: "container" },
    { id: "hero.cta", selector: ".hero-cta", kind: "button" },
    { id: "hero.photo", selector: ".hero-photo img", kind: "image" },
    { id: "hero.navlink", selector: ".nav-links a, .mobile-menu a", kind: "text" },
    { id: "hero.navcta", selector: ".nav-cta", kind: "button" },
    // ---- stats ----
    { id: "stats.card", selector: ".stats-card", kind: "container" },
    { id: "stats.label", selector: ".stat span", kind: "text" },
    // ---- next-gen ----
    { id: "nextgen.section", selector: "#next-gen", kind: "section" },
    { id: "nextgen.heading", selector: ".next-gen-copy h2", kind: "text" },
    { id: "nextgen.paragraph", selector: ".next-gen-copy p", kind: "text" },
    { id: "nextgen.photo", selector: ".next-gen-photo img", kind: "image" },
    // ---- who fits ----
    { id: "whofits.section", selector: "#who-fits", kind: "section" },
    { id: "whofits.heading", selector: "#who-fits h2", kind: "text" },
    { id: "whofits.pill", selector: ".pill", kind: "text" },
    { id: "whofits.cardtitle", selector: ".serv-card h3", kind: "text" },
    { id: "whofits.cardtext", selector: ".serv-card p", kind: "text" },
    // ---- crisis ----
    { id: "crisis.section", selector: "#crisis", kind: "section" },
    { id: "crisis.pill", selector: ".crisis-pill", kind: "text" },
    { id: "crisis.badgeNumber", selector: ".crisis-badge b", kind: "text" },
    { id: "crisis.badgeText", selector: ".crisis-badge span", kind: "text" },
    { id: "crisis.heading", selector: ".crisis-panel h2", kind: "text" },
    { id: "crisis.paragraph", selector: ".crisis-panel p", kind: "text" },
    { id: "crisis.photo", selector: ".crisis-photo img", kind: "image" },
    // ---- breakpoint ----
    { id: "breakpoint.section", selector: "#breakpoint", kind: "section" },
    { id: "breakpoint.heading", selector: ".breakpoint h2", kind: "text" },
    { id: "breakpoint.paragraph", selector: ".breakpoint p", kind: "text" },
    { id: "breakpoint.photo", selector: ".bp-photo img", kind: "image" },
    // ---- impact two-column ----
    { id: "impact.section", selector: "#impact", kind: "section" },
    { id: "impact.eyebrow", selector: ".impact .eyebrow-pill", kind: "text" },
    { id: "impact.heading", selector: ".impact h2", kind: "text" },
    { id: "impact.coltitle", selector: ".impact-col h3", kind: "text" },
    { id: "impact.itemtitle", selector: ".impact-item b", kind: "text" },
    { id: "impact.itemtext", selector: ".impact-item span", kind: "text" },
    // ---- faq ----
    { id: "faq.section", selector: "#faq", kind: "section" },
    { id: "faq.eyebrow", selector: ".faq .eyebrow-pill", kind: "text" },
    { id: "faq.heading", selector: ".faq h2", kind: "text" },
    { id: "faq.question", selector: ".faq-item h3", kind: "text" },
    { id: "faq.answer", selector: ".faq-item p", kind: "text" },
    // ---- register form ----
    { id: "register.section", selector: "#register", kind: "section" },
    { id: "register.eyebrow", selector: ".register-card .eyebrow", kind: "text" },
    { id: "register.heading", selector: ".register-card h2", kind: "text" },
    { id: "register.paragraph", selector: ".register-card > p", kind: "text" },
    { id: "register.photo", selector: ".register-photo img", kind: "image" },
    { id: "register.button", selector: ".reg-form button", kind: "button" },
    // ---- founder ----
    { id: "founder.section", selector: "#founder", kind: "section" },
    { id: "founder.label", selector: ".founder-copy .label", kind: "text" },
    { id: "founder.heading", selector: ".founder-copy h2", kind: "text" },
    { id: "founder.paragraph", selector: ".founder-copy p", kind: "text" },
    { id: "founder.photo", selector: ".founder-photo img", kind: "image" },
    // ---- footer ----
    { id: "footer.text", selector: ".footer p", kind: "text" },
    { id: "footer.logo", selector: ".footer .flogo", kind: "image" },
  ];

  const STYLABLE_PROPS = {
    text: ["fontSize", "color"],
    button: ["fontSize", "color", "backgroundColor", "paddingBlock", "paddingInline"],
    image: ["width", "objectFit"],
    container: ["backgroundColor", "padding", "maxWidth"],
    section: ["backgroundColor", "paddingTop", "paddingBottom"],
  };

  let config = loadConfig();
  let currentBreakpoint = "desktop";
  let selectedId = null;
  let editModeOn = false;
  let undoStack = [];
  let redoStack = [];
  let saveTimer = null;
  let elMap = {}; // id -> HTMLElement

  // ---------------------------------------------------------------- storage
  function loadConfig() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}");
    } catch (e) {
      console.warn("[visual-editor] corrupt local config, starting fresh", e);
      return {};
    }
  }
  function scheduleSave() {
    setStatus("dirty");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        setStatus("saved");
      } catch (e) {
        setStatus("error");
        alert("השמירה נכשלה — נראה שאחסון הדפדפן מלא (בדרך כלל בגלל תמונות שהוחלפו). ייצאו את התצורה (⬇ ייצוא תצורה) לפני שממשיכים לערוך, ושקלו להחליף תמונות בקבצים קטנים יותר.");
      }
    }, 700);
  }
  function setStatus(state) {
    const el = document.getElementById("ve-status");
    if (!el) return;
    el.classList.remove("ve-dirty", "ve-saved");
    if (state === "dirty") { el.textContent = "שינויים לא נשמרו…"; el.classList.add("ve-dirty"); }
    else if (state === "saved") { el.textContent = "נשמר בהצלחה ✓"; el.classList.add("ve-saved"); }
    else if (state === "error") { el.textContent = "שגיאת שמירה ⚠"; el.classList.add("ve-dirty"); }
    else { el.textContent = ""; }
  }
  function pushUndo() {
    undoStack.push(JSON.stringify(config));
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
  }
  function undo() {
    if (!undoStack.length) return;
    redoStack.push(JSON.stringify(config));
    config = JSON.parse(undoStack.pop());
    buildStyleSheet(); applyTextContent(); scheduleSave(); refreshPanel();
  }
  function redo() {
    if (!redoStack.length) return;
    undoStack.push(JSON.stringify(config));
    config = JSON.parse(redoStack.pop());
    buildStyleSheet(); applyTextContent(); scheduleSave(); refreshPanel();
  }

  function entry(id) {
    if (!config[id]) config[id] = { content: {}, styles: { desktop: {}, laptop: {}, tablet: {}, mobile: {} }, visibility: { desktop: true, laptop: true, tablet: true, mobile: true } };
    if (!config[id].styles) config[id].styles = { desktop: {}, laptop: {}, tablet: {}, mobile: {} };
    if (!config[id].styles.laptop) config[id].styles.laptop = {}; // upgrade configs saved before the laptop tier existed
    if (!config[id].visibility) config[id].visibility = { desktop: true, laptop: true, tablet: true, mobile: true };
    if (config[id].visibility.laptop === undefined) config[id].visibility.laptop = true;
    return config[id];
  }

  // ---------------------------------------------------------- css generation
  // simple 1-property-1-declaration mappings
  const PROP_CSS = {
    fontSize: (v) => `font-size:${v}px`,
    color: (v) => `color:${v}`,
    backgroundColor: (v) => `background-color:${v}`,
    width: (v) => `width:${v}%`,
    maxWidth: (v) => `max-width:${v}px`,
    padding: (v) => `padding:${v}px`,
    paddingTop: (v) => `padding-top:${v}px`,
    paddingBottom: (v) => `padding-bottom:${v}px`,
    paddingBlock: (v) => `padding-block:${v}px`,
    paddingInline: (v) => `padding-inline:${v}px`,
    objectFit: (v) => `object-fit:${v}`,
    gap: (v) => `gap:${v}px`,
    textAlign: (v) => `text-align:${v}`,
    lineHeight: (v) => `line-height:${v}`,
    zIndex: (v) => `z-index:${v}`,
    position: (v) => `position:${v}`,
    heroTrimTop: (v) => `--hero-trim-top:${v}px`,
    heroTrimBottom: (v) => `--hero-trim-bottom:${v}px`,
  };
  // composite properties: several style keys combine into one CSS declaration
  // (e.g. translateX + translateY + scale all feed the single `transform` property —
  // CSS only allows one `transform` declaration per rule, so these can't be simple
  // 1-key-1-declaration entries in PROP_CSS above).
  const HALIGN_MARGIN = {
    right: "margin-left:auto;margin-right:0",
    center: "margin-left:auto;margin-right:auto",
    left: "margin-right:auto;margin-left:0",
  };
  function composite(styles) {
    const out = [];
    const tx = styles.translateX, ty = styles.translateY, sc = styles.scale;
    if (tx || ty || sc) {
      const parts = [`translate(${tx || 0}px,${ty || 0}px)`];
      if (sc) parts.push(`scale(${sc / 100})`);
      out.push(`transform:${parts.join(" ")}`);
    }
    if (styles.hAlign && HALIGN_MARGIN[styles.hAlign]) out.push(HALIGN_MARGIN[styles.hAlign]);
    return out;
  }
  const BP_QUERY = { laptop: "(max-width:1440px)", tablet: "(max-width:1024px)", mobile: "(max-width:640px)" };

  function ruleFor(id, styles) {
    const decls = Object.keys(styles).filter((k) => styles[k] !== undefined && styles[k] !== "" && PROP_CSS[k])
      .map((k) => PROP_CSS[k](styles[k]));
    decls.push(...composite(styles));
    if (!decls.length) return "";
    // !important: editor overrides must always win, regardless of how specific the
    // page's own base selector is (e.g. ".hero-photo img" beats a bare attribute
    // selector on specificity alone — without this, some overrides silently no-op).
    const important = decls.map((d) => `${d} !important`);
    return `[data-editable-id="${id}"]{${important.join(";")};}`;
  }

  function buildStyleSheet() {
    let base = "", laptop = "", tablet = "", mobile = "";
    Object.keys(config).forEach((id) => {
      const c = entry(id);
      base += ruleFor(id, c.styles.desktop || {});
      laptop += ruleFor(id, c.styles.laptop || {});
      tablet += ruleFor(id, c.styles.tablet || {});
      mobile += ruleFor(id, c.styles.mobile || {});
      // visibility
      if (c.visibility.desktop === false) base += `[data-editable-id="${id}"]{display:none!important;}`;
      if (c.visibility.laptop === false) laptop += `[data-editable-id="${id}"]{display:none!important;}`;
      if (c.visibility.tablet === false) tablet += `[data-editable-id="${id}"]{display:none!important;}`;
      if (c.visibility.mobile === false) mobile += `[data-editable-id="${id}"]{display:none!important;}`;
    });
    // order matters: narrower media queries are declared LATER so they win over wider ones
    // at widths where both conditions are simultaneously true (e.g. a 900px viewport
    // matches both max-width:1440px and max-width:1024px).
    let css = base;
    if (laptop) css += `@media ${BP_QUERY.laptop}{${laptop}}`;
    if (tablet) css += `@media ${BP_QUERY.tablet}{${tablet}}`;
    if (mobile) css += `@media ${BP_QUERY.mobile}{${mobile}}`; // declared last → wins at narrow widths
    let tag = document.getElementById("ve-dynamic-styles");
    if (!tag) { tag = document.createElement("style"); tag.id = "ve-dynamic-styles"; document.head.appendChild(tag); }
    tag.textContent = css;
  }

  function applyTextContent() {
    Object.keys(config).forEach((id) => {
      if (!elMap[id]) return;
      const content = config[id].content || {};
      if (content.text != null) elMap[id].innerHTML = content.text;
      if (content.imageSrc && elMap[id].tagName === "IMG") elMap[id].src = content.imageSrc;
    });
  }

  // -------------------------------------------------------------- bootstrap
  function stampRegistry() {
    ELEMENT_REGISTRY.forEach((r) => {
      const els = document.querySelectorAll(r.selector);
      els.forEach((el, i) => {
        const id = els.length > 1 ? `${r.id}.${i + 1}` : r.id;
        el.setAttribute("data-editable-id", id);
        el.setAttribute("data-editable-kind", r.kind);
        elMap[id] = el;
      });
    });
  }

  function init() {
    stampRegistry();
    buildStyleSheet();
    applyTextContent();
    buildChrome();
    if (sessionStorage.getItem(ADMIN_KEY) === "1") {
      // returning admin this session — leave edit mode off until they click, but skip the passcode
    }
  }

  // ------------------------------------------------------------------ chrome
  function buildChrome() {
    const unlockBtn = document.createElement("button");
    unlockBtn.id = "ve-unlock-btn";
    unlockBtn.title = "עריכת עמוד";
    unlockBtn.textContent = "🔒";
    unlockBtn.addEventListener("click", onUnlockClick);
    document.body.appendChild(unlockBtn);

    const topbar = document.createElement("div");
    topbar.id = "ve-topbar";
    topbar.className = "ve-hidden";
    topbar.innerHTML = `
      <div class="ve-group" id="ve-bp-switch">
        ${BREAKPOINTS.map((bp) => `<button data-bp="${bp}" class="${bp === "desktop" ? "ve-active" : ""}">${BP_ICON[bp]} ${BP_LABEL[bp]}</button>`).join("")}
      </div>
      <div class="ve-group">
        <span id="ve-status"></span>
        <button id="ve-undo" title="בטל (Ctrl+Z)">↶ בטל</button>
        <button id="ve-redo" title="חזור (Ctrl+Shift+Z)">↷ חזור</button>
        <button id="ve-export">⬇ ייצוא תצורה</button>
        <button id="ve-exit">✕ יציאה מעריכה</button>
      </div>`;
    document.body.appendChild(topbar);

    const panel = document.createElement("div");
    panel.id = "ve-panel";
    panel.innerHTML = `<div class="ve-empty-panel">בחרו אלמנט בעמוד כדי לערוך אותו.<br><br>מרחפים = מסגרת ירוקה מקווקוות.<br>לוחצים = פאנל העריכה נפתח כאן.</div>`;
    document.body.appendChild(panel);

    const hoverBox = document.createElement("div");
    hoverBox.className = "ve-hover-outline ve-hidden";
    hoverBox.id = "ve-hover-outline";
    document.body.appendChild(hoverBox);

    const selectBox = document.createElement("div");
    selectBox.className = "ve-select-outline ve-hidden";
    selectBox.id = "ve-select-outline";
    document.body.appendChild(selectBox);

    const miniToolbar = document.createElement("div");
    miniToolbar.className = "ve-mini-toolbar ve-hidden";
    miniToolbar.id = "ve-mini-toolbar";
    miniToolbar.innerHTML = `
      <button data-act="edit-text" title="ערוך טקסט">✏️</button>
      <button data-act="hide" title="הסתר במסך הנוכחי">🙈</button>
      <button data-act="reset" title="איפוס אלמנט">↺</button>`;
    document.body.appendChild(miniToolbar);

    topbar.querySelectorAll("#ve-bp-switch button").forEach((b) => b.addEventListener("click", () => switchBreakpoint(b.dataset.bp)));
    document.getElementById("ve-undo").addEventListener("click", undo);
    document.getElementById("ve-redo").addEventListener("click", redo);
    document.getElementById("ve-export").addEventListener("click", exportConfig);
    document.getElementById("ve-exit").addEventListener("click", () => setEditMode(false));
    miniToolbar.addEventListener("click", onMiniToolbarClick);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("dblclick", (e) => {
      if (!editModeOn) return;
      const el = editableAncestor(e.target);
      if (el && el.getAttribute("data-editable-kind") === "text") { e.preventDefault(); select(el); startTextEdit(el.getAttribute("data-editable-id")); }
    });
    document.addEventListener("keydown", (e) => {
      if (!editModeOn) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    });
  }

  // ------------------------------------------------------------------- auth
  function onUnlockClick() {
    if (sessionStorage.getItem(ADMIN_KEY) === "1") { setEditMode(!editModeOn); return; }
    showPasscodeModal();
  }
  function showPasscodeModal() {
    const backdrop = document.createElement("div");
    backdrop.id = "ve-modal-backdrop";
    backdrop.innerHTML = `
      <div id="ve-modal">
        <h3>עריכת עמוד</h3>
        <p>אזור זה מיועד למנהל האתר בלבד. הזינו קוד גישה כדי להיכנס למצב עריכה.</p>
        <div id="ve-modal-error">קוד שגוי, נסו שוב.</div>
        <input type="password" id="ve-modal-input" placeholder="קוד גישה" autofocus>
        <div class="ve-modal-actions">
          <button class="ve-btn-secondary" id="ve-modal-cancel">ביטול</button>
          <button class="ve-btn-primary" id="ve-modal-ok">כניסה</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const input = document.getElementById("ve-modal-input");
    const tryEnter = () => {
      if (input.value === PASSCODE) {
        sessionStorage.setItem(ADMIN_KEY, "1");
        backdrop.remove();
        setEditMode(true);
      } else {
        document.getElementById("ve-modal-error").style.display = "block";
      }
    };
    document.getElementById("ve-modal-ok").addEventListener("click", tryEnter);
    document.getElementById("ve-modal-cancel").addEventListener("click", () => backdrop.remove());
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") tryEnter(); });
  }

  function setEditMode(on) {
    editModeOn = on;
    document.body.classList.toggle("ve-mode-on", on);
    document.getElementById("ve-topbar").classList.toggle("ve-hidden", !on);
    document.getElementById("ve-unlock-btn").textContent = on ? "🔓" : "🔒";
    if (!on) { closePanel(); hideHover(); hideSelect(); hideMiniToolbar(); }
  }

  // -------------------------------------------------------------- selection
  function editableAncestor(node) {
    while (node && node !== document.body) {
      if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute("data-editable-id")) return node;
      node = node.parentNode;
    }
    return null;
  }
  function onMouseMove(e) {
    if (!editModeOn) return;
    if (e.target.closest("#ve-topbar, #ve-panel, #ve-unlock-btn, .ve-mini-toolbar, #ve-modal-backdrop")) { hideHover(); return; }
    const el = editableAncestor(e.target);
    if (!el || el.getAttribute("data-editable-id") === selectedId) { hideHover(); return; }
    const r = el.getBoundingClientRect();
    const box = document.getElementById("ve-hover-outline");
    box.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
    box.classList.remove("ve-hidden");
  }
  function hideHover() { const b = document.getElementById("ve-hover-outline"); if (b) b.classList.add("ve-hidden"); }

  function onDocClick(e) {
    if (!editModeOn) return;
    if (e.target.closest("#ve-topbar, #ve-panel, #ve-unlock-btn, .ve-mini-toolbar, #ve-modal-backdrop")) return;
    const el = editableAncestor(e.target);
    if (!el) { deselect(); return; }
    e.preventDefault(); e.stopPropagation();
    select(el);
  }
  function select(el) {
    selectedId = el.getAttribute("data-editable-id");
    hideHover();
    positionSelect(el);
    openPanel(selectedId);
  }
  function deselect() { selectedId = null; hideSelect(); hideMiniToolbar(); closePanel(); }
  function positionSelect(el) {
    const r = el.getBoundingClientRect();
    const box = document.getElementById("ve-select-outline");
    box.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
    box.classList.remove("ve-hidden");
    const tb = document.getElementById("ve-mini-toolbar");
    tb.style.cssText = `left:${Math.max(8, r.left)}px;top:${Math.max(58, r.top - 34)}px;`;
    tb.classList.remove("ve-hidden");
  }
  function hideSelect() { const b = document.getElementById("ve-select-outline"); if (b) b.classList.add("ve-hidden"); }
  function hideMiniToolbar() { const b = document.getElementById("ve-mini-toolbar"); if (b) b.classList.add("ve-hidden"); }

  window.addEventListener("scroll", () => { if (selectedId && elMap[selectedId]) positionSelect(elMap[selectedId]); }, true);
  window.addEventListener("resize", () => { if (selectedId && elMap[selectedId]) positionSelect(elMap[selectedId]); });

  function onMiniToolbarClick(e) {
    const btn = e.target.closest("button"); if (!btn || !selectedId) return;
    const act = btn.dataset.act;
    if (act === "edit-text") startTextEdit(selectedId);
    if (act === "hide") { pushUndo(); entry(selectedId).visibility[currentBreakpoint] = false; buildStyleSheet(); scheduleSave(); deselect(); }
    if (act === "reset") { pushUndo(); delete config[selectedId]; buildStyleSheet(); applyTextContent(); scheduleSave(); refreshPanel(); }
  }

  function startTextEdit(id) {
    const el = elMap[id]; if (!el) return;
    el.setAttribute("contenteditable", "true");
    el.setAttribute("data-ve-editing", "true");
    el.focus();
    const onBlur = () => {
      el.removeAttribute("contenteditable");
      el.removeAttribute("data-ve-editing");
      pushUndo();
      entry(id).content.text = el.innerHTML;
      scheduleSave();
      el.removeEventListener("blur", onBlur);
    };
    el.addEventListener("blur", onBlur);
  }

  // ---------------------------------------------------------------- panel
  function closePanel() { document.getElementById("ve-panel").classList.remove("ve-open"); }
  function refreshPanel() { if (selectedId) openPanel(selectedId); }

  function openPanel(id) {
    const el = elMap[id]; if (!el) return;
    const kind = el.getAttribute("data-editable-kind");
    const c = entry(id);
    const bpStyles = c.styles[currentBreakpoint];
    const panel = document.getElementById("ve-panel");
    let html = `<h4>עריכת אלמנט</h4><div class="ve-elid">${id} · ${kind}</div>`;

    if (kind === "text") {
      html += field_action("עריכת טקסט", "לוחצים, עורכים ישירות בעמוד, ולוחצים מחוץ לאלמנט כדי לשמור.");
      html += slider("fontSize", "גודל טקסט", bpStyles.fontSize, 12, 120, "px", id);
      html += slider("lineHeight", "רווח בין שורות (צמצום/ריווח)", bpStyles.lineHeight, 0.8, 2.5, "", id, 0.05);
      html += colorField("color", "צבע טקסט", bpStyles.color, id);
      html += alignField("textAlign", bpStyles.textAlign, ["right", "center", "left"]);
    } else if (kind === "button") {
      html += field_action("עריכת טקסט הכפתור", "לוחצים, עורכים ישירות בעמוד, ולוחצים מחוץ לאלמנט כדי לשמור.");
      html += slider("fontSize", "גודל טקסט", bpStyles.fontSize, 10, 48, "px", id);
      html += colorField("color", "צבע טקסט", bpStyles.color, id);
      html += colorField("backgroundColor", "צבע רקע", bpStyles.backgroundColor, id);
      html += slider("paddingBlock", "ריפוד אנכי", bpStyles.paddingBlock, 4, 40, "px", id);
      html += slider("paddingInline", "ריפוד אופקי", bpStyles.paddingInline, 8, 80, "px", id);
      html += alignField("hAlign", bpStyles.hAlign, ["right", "center", "left"]);
    } else if (kind === "image") {
      html += imageReplaceField(id);
      html += slider("width", "רוחב", bpStyles.width, 20, 100, "%", id);
      html += selectField("objectFit", "התאמת תמונה", bpStyles.objectFit, ["cover", "contain", "fill"], id);
      html += alignField("hAlign", bpStyles.hAlign, ["right", "center", "left"]);
    } else if (kind === "container") {
      html += colorField("backgroundColor", "צבע רקע", bpStyles.backgroundColor, id);
      html += slider("padding", "ריפוד (כל הצדדים)", bpStyles.padding, 0, 100, "px", id);
      html += slider("maxWidth", "רוחב מקסימלי", bpStyles.maxWidth, 200, 1600, "px", id);
      html += alignField("hAlign", bpStyles.hAlign, ["right", "center", "left"]);
    } else if (kind === "section") {
      html += colorField("backgroundColor", "צבע רקע", bpStyles.backgroundColor, id);
      html += slider("paddingTop", "רווח עליון (צמצום/הגדלה)", bpStyles.paddingTop, 0, 220, "px", id);
      html += slider("paddingBottom", "רווח תחתון", bpStyles.paddingBottom, 0, 220, "px", id);
    } else if (kind === "hero-section") {
      // hero uses min-height:100dvh (not padding-block like every other section), so
      // shrinking it means trimming that height directly, not adding padding on top of it.
      html += slider("heroTrimTop", "צמצום גובה מלמעלה", bpStyles.heroTrimTop, 0, 400, "px", id);
      html += slider("heroTrimBottom", "צמצום גובה מלמטה", bpStyles.heroTrimBottom, 0, 400, "px", id);
      html += `<div class="ve-hint">מקטין את גובה סקשן ההירו (שברירת המחדל שלו הוא תמיד גובה המסך המלא) מלמעלה ומלמטה בנפרד, בלי לגעת במיקום התמונה/הבועה בתוכו.</div>`;
    }

    html += `<hr class="ve-section-divider">`;
    html += `<h4>גודל אלמנט</h4>`;
    html += slider("scale", "הגדלה / הקטנה", bpStyles.scale, 40, 200, "%", id, 1, 100);
    html += `<div class="ve-hint">מגדיל/מקטין את כל האלמנט (transform) — לטקסט, עדיף בדרך כלל "גודל טקסט" למעלה; זה שימושי בעיקר לתמונות, כפתורים וקונטיינרים.</div>`;

    html += `<hr class="ve-section-divider">`;
    html += `<h4>הזזת אלמנט (X / Y)</h4>`;
    html += slider("translateX", "הזזה אופקית", bpStyles.translateX, -200, 200, "px", id);
    html += slider("translateY", "הזזה אנכית", bpStyles.translateY, -200, 200, "px", id);
    html += `<div class="ve-hint">הזזה חזותית בלבד (transform) — לא משנה את זרימת הדף, בטוח לביטול בכל רגע.</div>`;

    html += `<hr class="ve-section-divider">`;
    html += `<h4>שכבה (עומק)</h4>`;
    html += `<div class="ve-visibility-row"><label><input type="checkbox" id="ve-bring-front" ${bpStyles.zIndex ? "checked" : ""}> 🔝 הבא לקדמה (מעל שאר האלמנטים)</label></div>`;
    html += `<div class="ve-hint">שימושי כשאלמנט מוסתר חלקית מאחורי אלמנט אחר (למשל אחרי הזזה או הגדלה).</div>`;

    html += `<hr class="ve-section-divider">`;
    html += `<h4>נראות לפי מסך</h4>`;
    html += `<div class="ve-visibility-row">` + BREAKPOINTS.map((bp) => `
        <label><input type="checkbox" data-vis="${bp}" ${c.visibility[bp] !== false ? "checked" : ""}> ${BP_ICON[bp]} ${BP_LABEL[bp]}</label>`).join("") + `</div>`;

    html += `<hr class="ve-section-divider">`;
    html += `<button class="ve-link-btn ve-danger" id="ve-reset-el" style="width:100%;justify-content:center;">↺ איפוס אלמנט לחלוטין (מסך זה + כל הדריסות)</button>`;
    html += `<div class="ve-hint">עורכים כרגע עבור: <b>${BP_LABEL[currentBreakpoint]}</b>. שינוי שלא הוגדר במפורש כאן יורש את הערך מהמסך הרחב יותר.</div>`;

    panel.innerHTML = html;
    panel.classList.add("ve-open");

    const editBtn = document.getElementById("ve-textedit-trigger");
    if (editBtn) editBtn.addEventListener("click", () => startTextEdit(id));
    panel.querySelectorAll("input[type=range]").forEach((r) => r.addEventListener("input", () => onStyleInput(id, r)));
    panel.querySelectorAll("input[type=number].ve-num").forEach((n) => n.addEventListener("change", () => onStyleInput(id, n)));
    panel.querySelectorAll("input[type=color]").forEach((c2) => c2.addEventListener("input", () => onColorInput(id, c2)));
    panel.querySelectorAll("input[type=text].ve-hex").forEach((t) => t.addEventListener("change", () => onHexInput(id, t)));
    panel.querySelectorAll("select.ve-select").forEach((s) => s.addEventListener("change", () => onStyleInput(id, s)));
    panel.querySelectorAll(".ve-reset").forEach((r) => r.addEventListener("click", () => onFieldReset(id, r.dataset.prop)));
    panel.querySelectorAll('[data-vis]').forEach((cb) => cb.addEventListener("change", () => onVisibilityChange(id, cb)));
    const bringFrontCb = document.getElementById("ve-bring-front");
    if (bringFrontCb) bringFrontCb.addEventListener("change", () => onBringFrontChange(id, bringFrontCb));
    panel.querySelectorAll(".ve-align-toggle").forEach((group) => {
      group.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", () => onAlignClick(id, group.dataset.alignProp, btn.dataset.alignValue)));
    });
    const imgBtn = document.getElementById("ve-image-replace-trigger");
    const imgInput = document.getElementById("ve-image-replace-input");
    if (imgBtn && imgInput) {
      imgBtn.addEventListener("click", () => imgInput.click());
      imgInput.addEventListener("change", () => onImageReplace(id, imgInput));
    }
    const resetElBtn = document.getElementById("ve-reset-el");
    if (resetElBtn) resetElBtn.addEventListener("click", () => { pushUndo(); delete config[id]; buildStyleSheet(); applyTextContent(); scheduleSave(); refreshPanel(); });
  }

  function field_action(label, hint) {
    return `<div class="ve-field"><label>${label}</label><button class="ve-link-btn" id="ve-textedit-trigger" style="width:100%;justify-content:center;">✏️ ערוך טקסט בעמוד</button><div class="ve-hint">${hint}</div></div>`;
  }
  function slider(prop, label, val, min, max, unit, id, step, neutralOverride) {
    const st = step || 1;
    const hasVal = val !== undefined;
    const neutral = neutralOverride !== undefined ? neutralOverride : (min < 0 && max > 0 ? 0 : min); // sensible default when nothing's been set yet
    const shown = hasVal ? val : neutral;
    return `<div class="ve-field"><label>${label} ${hasVal ? `<span class="ve-reset" data-prop="${prop}">איפוס</span>` : ""}</label>
      <div class="ve-row">
        <input type="range" min="${min}" max="${max}" step="${st}" value="${shown}" data-prop="${prop}" data-unit="${unit}">
        <input type="number" class="ve-num" min="${min}" max="${max}" step="${st}" value="${shown}" data-prop="${prop}" data-unit="${unit}">
      </div></div>`;
  }
  function colorField(prop, label, val, id) {
    const v = val || "#122c49";
    return `<div class="ve-field"><label>${label} ${val ? `<span class="ve-reset" data-prop="${prop}">איפוס</span>` : ""}</label>
      <div class="ve-color-row">
        <input type="color" value="${v}" data-prop="${prop}">
        <input type="text" class="ve-hex" value="${v}" data-prop="${prop}">
      </div></div>`;
  }
  function selectField(prop, label, val, options, id) {
    return `<div class="ve-field"><label>${label}</label><div class="ve-row">
      <select class="ve-select" data-prop="${prop}">${options.map((o) => `<option value="${o}" ${val === o ? "selected" : ""}>${o}</option>`).join("")}</select>
      </div></div>`;
  }
  const ALIGN_ICON = { right: "⇥ ימין", center: "↔ מרכז", left: "⇤ שמאל" };
  function alignField(prop, val, options) {
    return `<div class="ve-field"><label>יישור ${val ? `<span class="ve-reset" data-prop="${prop}">איפוס</span>` : ""}</label>
      <div class="ve-row ve-align-toggle" data-align-prop="${prop}">
        ${options.map((o) => `<button type="button" class="ve-unit-toggle-btn ${val === o ? "ve-active" : ""}" data-align-value="${o}" style="flex:1;padding:7px 4px;border:1px solid #dde3ea;background:${val === o ? "#122c49" : "#f7f9fb"};color:${val === o ? "#fff" : "#3a4658"};border-radius:6px;cursor:pointer;font-size:12px;">${ALIGN_ICON[o]}</button>`).join("")}
      </div></div>`;
  }
  function imageReplaceField(id) {
    return `<div class="ve-field"><label>החלפת תמונה</label>
      <button class="ve-link-btn" id="ve-image-replace-trigger" style="width:100%;justify-content:center;">🖼️ בחר קובץ מהמחשב</button>
      <input type="file" id="ve-image-replace-input" accept="image/*" style="display:none;">
      <div class="ve-hint">התמונה נשמרת מקומית בדפדפן (base64). לתמונות גדולות מ-2MB מומלץ לכווץ קודם.</div></div>`;
  }

  function onStyleInput(id, input) {
    pushUndo();
    const prop = input.dataset.prop;
    const value = input.value;
    entry(id).styles[currentBreakpoint][prop] = isNaN(+value) ? value : +value;
    // keep the paired range/number in sync
    document.querySelectorAll(`[data-prop="${prop}"]`).forEach((other) => { if (other !== input) other.value = value; });
    buildStyleSheet(); scheduleSave();
    if (selectedId) positionSelect(elMap[selectedId]);
  }
  function onColorInput(id, input) {
    pushUndo();
    const prop = input.dataset.prop;
    entry(id).styles[currentBreakpoint][prop] = input.value;
    document.querySelectorAll(`.ve-hex[data-prop="${prop}"]`).forEach((t) => (t.value = input.value));
    buildStyleSheet(); scheduleSave();
  }
  function onHexInput(id, input) {
    pushUndo();
    const prop = input.dataset.prop;
    entry(id).styles[currentBreakpoint][prop] = input.value;
    document.querySelectorAll(`input[type=color][data-prop="${prop}"]`).forEach((c) => (c.value = input.value));
    buildStyleSheet(); scheduleSave();
  }
  function onFieldReset(id, prop) {
    pushUndo();
    delete entry(id).styles[currentBreakpoint][prop];
    buildStyleSheet(); scheduleSave(); refreshPanel();
  }
  function onVisibilityChange(id, cb) {
    pushUndo();
    entry(id).visibility[cb.dataset.vis] = cb.checked;
    buildStyleSheet(); scheduleSave();
  }
  function onBringFrontChange(id, cb) {
    // z-index only affects positioned elements (relative/absolute/fixed/sticky) or
    // flex/grid items — most registered elements (headings, buttons, cards) are plain
    // position:static by default, where z-index is silently ignored. Detect that at
    // click-time and add position:relative ONLY when needed (it doesn't move a static
    // element at all, since no top/left/etc. offset is set) — never touch elements that
    // are already absolute/fixed, since forcing relative would destroy their layout
    // (e.g. the hero photo, which is positioned against its section).
    pushUndo();
    const el = elMap[id];
    const styles = entry(id).styles[currentBreakpoint];
    if (cb.checked) {
      styles.zIndex = 999;
      const computedPos = el ? getComputedStyle(el).position : "static";
      if (computedPos === "static") styles.position = "relative";
    } else {
      delete styles.zIndex;
      delete styles.position;
    }
    buildStyleSheet(); scheduleSave();
  }
  function onAlignClick(id, prop, value) {
    pushUndo();
    entry(id).styles[currentBreakpoint][prop] = value;
    buildStyleSheet(); scheduleSave(); refreshPanel();
    if (selectedId) positionSelect(elMap[selectedId]);
  }
  function onImageReplace(id, input) {
    const file = input.files && input.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert("הקובץ גדול מדי (מעל 8MB). בחרו תמונה קטנה יותר."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      pushUndo();
      entry(id).content = entry(id).content || {};
      entry(id).content.imageSrc = reader.result;
      applyTextContent(); scheduleSave();
    };
    reader.readAsDataURL(file);
  }

  // -------------------------------------------------------------- device sim
  function switchBreakpoint(bp) {
    currentBreakpoint = bp;
    document.querySelectorAll("#ve-bp-switch button").forEach((b) => b.classList.toggle("ve-active", b.dataset.bp === bp));
    document.body.classList.remove("ve-device-laptop", "ve-device-tablet", "ve-device-mobile");
    if (bp === "laptop") document.body.classList.add("ve-device-laptop");
    if (bp === "tablet") document.body.classList.add("ve-device-tablet");
    if (bp === "mobile") document.body.classList.add("ve-device-mobile");
    if (selectedId) refreshPanel();
  }

  function exportConfig() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lesson-from-life-content-config.json";
    a.click();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
