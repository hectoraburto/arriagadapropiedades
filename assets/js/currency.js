
// currency.js: simple UF<->CLP conversion helper (manual UF input)
(function(){
  const KEY="UF_VALOR";
  function getUF(){ return parseFloat(localStorage.getItem(KEY) || "37000"); } // valor por defecto
  function setUF(v){ localStorage.setItem(KEY, String(v)); }

  function mountWidget(){
    const host = document.querySelector("#uf-widget");
    if(!host) return;
    host.innerHTML = `
      <div class="card" style="padding:0.75rem">
        <strong>Conversor UF ⇄ CLP</strong>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.5rem">
          <label>UF Hoy <input id="uf-hoy" value="${getUF()}" style="width:100%;padding:.4rem;border:1px solid #e5e7eb;border-radius:12px"></label>
          <button class="btn btn-outline" id="uf-guardar">Guardar</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.5rem">
          <input id="uf-in" placeholder="UF" style="padding:.6rem;border:1px solid #e5e7eb;border-radius:12px">
          <input id="clp-out" placeholder="CLP" readonly style="padding:.6rem;border:1px solid #e5e7eb;border-radius:12px">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.5rem">
          <input id="clp-in" placeholder="CLP">
          <input id="uf-out" placeholder="UF" readonly>
        </div>
      </div>`;
    const $ = s=>host.querySelector(s);
    $("#uf-guardar").onclick = ()=> setUF(parseFloat($("#uf-hoy").value || "0")||0);
    $("#uf-in").oninput = ()=> { const uf=getUF(); const v=parseFloat($("#uf-in").value||"0"); $("#clp-out").value = isNaN(v)?"": Math.round(v*uf).toLocaleString('es-CL'); }
    $("#clp-in").oninput = ()=> { const uf=getUF(); const v=parseFloat($("#clp-in").value.replace(/\./g,'')||"0"); $("#uf-out").value = isNaN(v)?"": (v/uf).toFixed(2); }
  }
  document.addEventListener("DOMContentLoaded", mountWidget);
})();
