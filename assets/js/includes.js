
async function include(selector, file){
  const el = document.querySelector(selector);
  if(!el) return;
  const res = await fetch(file);
  el.innerHTML = await res.text();
}

document.addEventListener("DOMContentLoaded", async () => {
  await include("#header","./partials/header.html");
  await include("#footer","./partials/footer.html");
});
