
function formatPrecio(p){
  if(p == null) return "";
  try{
    return p.toLocaleString('es-CL');
  }catch(e){return p}
}

function card(prop){
  const precio = prop.precioUF ? `UF ${formatPrecio(prop.precioUF)}` : `$${formatPrecio(prop.precioCLP)}`;
  const specs = [
    prop.dormitorios ? `${prop.dormitorios}D` : null,
    prop.banos ? `${prop.banos}B` : null,
    prop.superficie ? `${prop.superficie} m²` : null
  ].filter(Boolean).join(" · ");

  return `
  <article class="card">
    <img src="${prop.imagen}" alt="${prop.tipo} en ${prop.comuna}">
    <div class="body">
      <div class="badge">${prop.operacion}</div>
      <h3>${prop.tipo} en ${prop.comuna}</h3>
      <p>${specs} — ${precio}</p>
      <a class="btn btn-outline" href="propiedad.html?id=${encodeURIComponent(prop.id)}">Ver detalles</a>
    </div>
  </article>`;
}

function renderListado(containerSel, items){
  const el = document.querySelector(containerSel);
  if(!el) return;
  el.innerHTML = items.map(card).join("");
}

function params(){
  return Object.fromEntries(new URLSearchParams(location.search));
}

function aplicarFiltros(list){
  const op = document.getElementById("f-op")?.value || "";
  const tipo = document.getElementById("f-tipo")?.value || "";
  const ubic = document.getElementById("f-ubic")?.value?.toLowerCase() || "";
  const precioMax = document.getElementById("f-precio")?.value || "";

  return list.filter(p => {
    if(op && p.operacion !== op) return false;
    if(tipo && p.tipo !== tipo) return false;
    if(ubic && !(p.comuna.toLowerCase().includes(ubic) || p.ciudad.toLowerCase().includes(ubic))) return false;
    if(precioMax){
      const val = parseFloat(precioMax.replace(/\./g,''));
      const precio = p.precioUF || p.precioCLP || 0;
      if(precio > val) return false;
    }
    return true;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Home destacados
  if(document.querySelector("#destacadas")){
    const dest = (window.PROPIEDADES || []).filter(p => p.destacado).slice(0,3);
    renderListado("#destacadas", dest);
  }

  // Listado con filtros
  if(document.querySelector("#listado-propiedades")){
    const render = () => renderListado("#listado-propiedades", aplicarFiltros(window.PROPIEDADES || []));
    ["f-op","f-tipo","f-ubic","f-precio"].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener("input", render);
    });
    render();
  }

  // Detalle
  if(document.querySelector("#detalle-propiedad")){
    const { id } = params();
    const p = (window.PROPIEDADES || []).find(x => x.id === id) || (window.PROPIEDADES || [])[0];
    if(!p) return;
    const precio = p.precioUF ? `UF ${formatPrecio(p.precioUF)}` : `$${formatPrecio(p.precioCLP)}`;
    document.getElementById("d-title").textContent = `${p.tipo} en ${p.comuna}`;
    document.getElementById("d-precio").textContent = precio;
    document.getElementById("d-img").src = p.imagen;
    document.getElementById("d-desc").textContent = p.descripcion;
    document.getElementById("d-specs").textContent =
      [p.dormitorios?`${p.dormitorios} dorm.`:"", p.banos?`${p.banos} baños`:"", p.superficie?`${p.superficie} m²`:""].filter(Boolean).join(" · ");
    const iframe = document.getElementById("d-map");
    if(iframe && p.lat && p.lon){
      const bbox = `${p.lon-0.01}%2C${p.lat-0.01}%2C${p.lon+0.01}%2C${p.lat+0.01}`;
      iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat}%2C${p.lon}`;
    }
    const form = document.getElementById("lead-form");
    if(form){
      form.addEventListener("submit", (e)=>{
        e.preventDefault();
        alert("Gracias, te contactaremos a la brevedad.");
        form.reset();
      });
    }
  }
});


// Paginación simple
let PAGINA = 1;
const PAGE_SIZE = 9;

function paginar(arr, page=1, size=PAGE_SIZE){
  const start = (page-1)*size;
  return arr.slice(start, start+size);
}

function renderPaginacion(total){
  const host = document.querySelector("#paginacion");
  if(!host) return;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  let html = `<div style="display:flex;gap:.5rem;align-items:center;justify-content:center;margin:1rem 0">`;
  html += `<button class="btn btn-outline" ${PAGINA<=1?'disabled':''} id="pg-prev">Anterior</button>`;
  html += `<span>Página ${PAGINA} de ${pages}</span>`;
  html += `<button class="btn" ${PAGINA>=pages?'disabled':''} id="pg-next">Siguiente</button>`;
  html += `</div>`;
  host.innerHTML = html;
  const prev = document.getElementById("pg-prev");
  const next = document.getElementById("pg-next");
  if(prev) prev.onclick = ()=>{ if(PAGINA>1){ PAGINA--; actualizarListado(); } };
  if(next) next.onclick = ()=>{ if(PAGINA<pages){ PAGINA++; actualizarListado(); } };
}

function actualizarListado(){
  const filtradas = aplicarFiltros(window.PROPIEDADES || []);
  renderListado("#listado-propiedades", paginar(filtradas, PAGINA));
  renderPaginacion(filtradas.length);
}

document.addEventListener("DOMContentLoaded", () => {
  if(document.querySelector("#listado-propiedades")){
     // Reemplaza listeners para llamar a actualizarListado
     ["f-op","f-tipo","f-ubic","f-precio"].forEach(id => {
       const el = document.getElementById(id);
       if(el) el.addEventListener("input", ()=>{PAGINA=1; actualizarListado();});
     });
     actualizarListado();
  }
});
