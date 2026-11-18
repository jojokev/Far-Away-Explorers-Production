// ─────────────────────────────────────────────────────────────────────────────
// Anti-spam de formularios: honeypot + trampa de tiempo + Cloudflare Turnstile.
// El servidor (functions.php del tema de WordPress) valida las tres cosas.
//
// Uso en el <script> de una página:
//   const antispam = setupAntiSpam(form);
//   await antispam.prepare(payload);   // antes del fetch (agrega fa_ts y cf-turnstile-response)
//   antispam.reset();                  // al terminar (los tokens de Turnstile son de un solo uso)
//   antispam.render();                 // si el formulario estaba oculto (p. ej. en un <dialog>) al abrirlo
//
// El HTML necesario lo pone el componente <AntiSpamFields /> dentro del <form>.
// ─────────────────────────────────────────────────────────────────────────────

const API = import.meta.env.PUBLIC_WP_API_URL;

// La site key es pública (va en el HTML). Se puede sobrescribir con PUBLIC_TURNSTILE_SITEKEY.
const SITEKEY: string = import.meta.env.PUBLIC_TURNSTILE_SITEKEY || "0x4AAAAAAGGCTV7SMN6AiE6V";

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TURNSTILE_WAIT_MS = 8000;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string | undefined;
      getResponse: (id: string) => string | undefined;
      reset: (id: string) => void;
    };
  }
}

// ── Token de tiempo firmado por el servidor (uno por página) ────────────────
let tokenPromise: Promise<string> | null = null;

function getFormToken(): Promise<string> {
  if (!tokenPromise) {
    tokenPromise = fetch(`${API}/faraway/v1/form-token`, { cache: "no-store", credentials: "omit" })
      .then((r) => r.json())
      .then((j) => (j && typeof j.token === "string" ? j.token : ""))
      .catch(() => "");
  }
  return tokenPromise;
}

// ── Carga del script de Turnstile (una sola vez) ────────────────────────────
let turnstilePromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!turnstilePromise) {
    turnstilePromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = TURNSTILE_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => {
        turnstilePromise = null; // permitir reintento
        reject(new Error("No se pudo cargar Turnstile"));
      };
      document.head.appendChild(s);
    });
  }
  return turnstilePromise;
}

function isVisible(el: HTMLElement) {
  return el.getClientRects().length > 0;
}

// ── API pública ─────────────────────────────────────────────────────────────
export function setupAntiSpam(form: HTMLFormElement, action = "form") {
  const container = form.querySelector<HTMLElement>("[data-fa-turnstile]");
  let widgetId: string | undefined;

  // Pedir el token apenas carga la página: el tiempo empieza a contar desde aquí.
  getFormToken();

  async function render() {
    if (!SITEKEY || !container || widgetId !== undefined || !isVisible(container)) return;
    try {
      await loadTurnstile();
      if (widgetId !== undefined || !window.turnstile) return;
      const id = window.turnstile.render(container, {
        sitekey: SITEKEY,
        action,
        appearance: "interaction-only", // solo se ve si Cloudflare necesita que la persona haga clic
        "response-field": false,
        language: "es",
      });
      if (id !== undefined && id !== null) widgetId = id;
    } catch (err) {
      console.warn("[antispam] Turnstile no se pudo crear", err);
    }
  }

  function waitTurnstile(): Promise<string> {
    return new Promise((resolve) => {
      const start = Date.now();
      const poll = () => {
        if (widgetId === undefined) render();
        const t = widgetId !== undefined && window.turnstile ? window.turnstile.getResponse(widgetId) : "";
        if (t || Date.now() - start > TURNSTILE_WAIT_MS) return resolve(t || "");
        setTimeout(poll, 250);
      };
      poll();
    });
  }

  /** Agrega a `data` los campos anti-spam. Lanza Error con mensaje para el usuario si falla. */
  async function prepare(data: Record<string, string>) {
    data.fa_ts = await getFormToken();
    if (SITEKEY) {
      const t = await waitTurnstile();
      if (!t) throw new Error("Estamos verificando que no eres un robot. Espera unos segundos e intenta nuevamente.");
      data["cf-turnstile-response"] = t;
    }
    return data;
  }

  function reset() {
    if (widgetId !== undefined && window.turnstile) window.turnstile.reset(widgetId);
  }

  // Formularios visibles: crear el widget ya.
  render();

  return { prepare, reset, render };
}
