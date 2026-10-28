// Écran d'ouverture de la charte, inséré dans index.html au build (plugin « opening » de vite.config.ts).
// HTML + CSS + quelques lignes de script, sans React : il se joue PENDANT le téléchargement de l'app, donc sans
// la ralentir. Sur le ciel de nuit : l'arche se dessine, l'intérieur s'allume, le soleil se lève, l'étoile
// scintille, puis le nom et la salutation wolof (1,6 s), lisibles jusqu'à 2 s ; un toucher (ou une touche) le passe ;
// « réduire les animations » : état final pendant 0,6 s. Rien dans les tests automatisés (navigator.webdriver).

type Texts = { lock: { greet: string; greetName: string } }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const ARCH = 'M24 76V44A34 34 0 0 1 50.00 10.95A34 34 0 0 1 76 44V76'
const STAR = 'M50.00 24.75L51.34 28.61L55.20 29.95L51.34 31.30L50.00 35.15L48.66 31.30L44.80 29.95L48.66 28.61Z'

const STYLE = `#opening{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:linear-gradient(165deg,#10143a 0%,#22306e 100%);transition:opacity .3s ease}
#opening.out{opacity:0;pointer-events:none}
#opening svg{overflow:visible}
#opening .mark{width:132px;height:auto}
#opening .edge{fill:none;stroke:#efb25a;stroke-width:6;stroke-linejoin:round;stroke-dasharray:160;stroke-dashoffset:160;animation:op-draw .7s ease forwards}
#opening .sill{stroke:#efb25a;stroke-width:6;stroke-linecap:round;stroke-dasharray:80;stroke-dashoffset:80;animation:op-draw .5s .2s ease forwards}
#opening .win{fill:#2c3b8f;opacity:0;animation:op-fade .5s .45s ease forwards}
#opening .sun{fill:#ffd27f;transform:translateY(20px);animation:op-rise .8s .6s cubic-bezier(.2,.7,.2,1) forwards}
#opening .star{fill:#ffd27f;opacity:0;transform-origin:50px 30px;transform-box:view-box;animation:op-twinkle .6s 1.15s ease forwards}
#opening .name{width:210px;height:auto;opacity:0;transform:translateY(8px);animation:op-up .45s 1.25s ease forwards}
#opening .hello{margin:0;padding:0 16px;text-align:center;font:600 18px/1.4 "Reem Kufi","Manrope",system-ui,sans-serif;color:#ffd27f;opacity:0;animation:op-fade .4s 1.6s ease forwards}
#opening .hello:lang(ar){font-family:"IBM Plex Sans Arabic",system-ui,sans-serif;font-weight:700}
@keyframes op-draw{to{stroke-dashoffset:0}}@keyframes op-fade{to{opacity:1}}@keyframes op-rise{to{transform:none}}@keyframes op-up{to{opacity:1;transform:none}}
@keyframes op-twinkle{0%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.35)}100%{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion:reduce){#opening *{animation:none!important;opacity:1!important;transform:none!important;stroke-dashoffset:0!important}}`

/** L'écran d'ouverture : `nameSvg` est le nom « Sama Jàmm » de la charte, version nuit. */
export function openingMarkup(fr: Texts, ar: Texts, nameSvg: string): string {
  const mark = `<svg class="mark" viewBox="6 4 88 78" aria-hidden="true"><defs><clipPath id="op-win"><path d="${ARCH}Z"/></clipPath></defs><path class="win" d="${ARCH}Z"/><g clip-path="url(#op-win)"><path class="sun" d="M33 76A17 17 0 0 1 67 76Z"/></g><path class="star" d="${STAR}"/><path class="edge" d="${ARCH}"/><path class="sill" d="M12 76H88"/></svg>`
  const name = nameSvg.replace('<svg ', '<svg class="name" aria-hidden="true" ')
  // Textes des deux langues ; le script garde celle de l'app et y met le prénom (enregistré par LockGate).
  const texts = JSON.stringify({
    fr: [fr.lock.greet, fr.lock.greetName],
    ar: [ar.lock.greet, ar.lock.greetName],
  })
  const script = `(function(){var o=document.getElementById('opening');if(!o)return;if(navigator.webdriver){o.remove();return}
var T=${texts},l=document.documentElement.lang==='ar'?'ar':'fr',n='';try{var g=JSON.parse(localStorage.getItem('elhadj.greet')||'{}');n=g[l]||''}catch(e){}
var h=o.querySelector('.hello');h.lang=l;h.textContent=n?T[l][1].replace('{{name}}',n):T[l][0];
var done=0;function end(){if(done)return;done=1;o.classList.add('out');setTimeout(function(){o.remove()},300)}
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;setTimeout(end,reduce?600:2000);
o.addEventListener('pointerdown',end);addEventListener('keydown',end,{once:true})})()`
  return `<div id="opening" aria-hidden="true"><style>${STYLE}</style>${mark}${name}<p class="hello">${esc(fr.lock.greet)}</p></div><script>${script}</script>`
}
