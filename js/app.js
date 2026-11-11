/*
  CONFIGURACIÓN
  Cambia el número de WhatsApp por el tuyo:
  Colombia = 57 + número de 10 dígitos, solo números.
*/
const WHATSAPP = "573000000000"; // REEMPLAZAR

const lista=document.getElementById("listaProductos");
const buscar=document.getElementById("buscarProducto");
const filtro=document.getElementById("filtroCategoria");
const botonesCategorias=document.getElementById("botonesCategorias");
const panel=document.getElementById("panelCarrito");
const overlay=document.getElementById("overlay");
const itemsCarrito=document.getElementById("itemsCarrito");
const carritoVacio=document.getElementById("carritoVacio");
const contador=document.getElementById("contadorCarrito");
let categoriaActiva="todos",carrito=[];

function normalizar(t){return String(t||"").toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function escapar(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function categorias(){return [...new Set(productos.map(p=>p.categoria))]}
function crearFiltros(){
  categorias().forEach(cat=>{
    const op=document.createElement("option");op.value=cat;op.textContent=cat;filtro.appendChild(op);
    const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=cat;
    b.addEventListener("click",()=>{categoriaActiva=categoriaActiva===cat?"todos":cat;filtro.value=categoriaActiva;actualizarChips();renderProductos()});
    botonesCategorias.appendChild(b);
  });
}
function actualizarChips(){document.querySelectorAll(".chip").forEach(b=>b.classList.toggle("activo",b.textContent===categoriaActiva))}
function renderProductos(){
  const q=normalizar(buscar.value);
  const encontrados=productos.filter(p=>(categoriaActiva==="todos"||p.categoria===categoriaActiva)&&normalizar([p.nombre,p.categoria,p.referencia,p.calibre,p.descripcion].join(" ")).includes(q));
  lista.innerHTML="";
  document.getElementById("cantidadResultados").textContent=`${encontrados.length} producto(s) encontrados`;
  document.getElementById("sinResultados").hidden=encontrados.length>0;
  encontrados.forEach(p=>{
    const card=document.createElement("article");card.className="producto";
    const foto=p.imagen?`<img src="${escapar(p.imagen)}" alt="${escapar(p.nombre)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.hidden=false">`:"";
    card.innerHTML=`<div class="producto-foto">${foto}<div class="foto-placeholder" ${p.imagen?'hidden':''}>⚡</div><span class="producto-categoria">${escapar(p.categoria)}</span></div>
      <div class="producto-cuerpo"><h3>${escapar(p.nombre)}</h3><p class="producto-desc">${escapar(p.descripcion)}</p>
      <div class="producto-detalles"><span>Calibre<b>${escapar(p.calibre)}</b></span><span>Presentación<b>${escapar(p.unidad)}</b></span></div>
      <div class="producto-detalles"><span>Precio</span><b class="producto-precio">${p.precio&&Number(p.precio)>0?formatoPrecio(p.precio):"Consultar precio"}</b></div>
      <button class="btn btn-amarillo" type="button" data-agregar="${p.id}">Agregar a cotización <b>＋</b></button></div>`;
    lista.appendChild(card);
  });
  lista.querySelectorAll("[data-agregar]").forEach(b=>b.addEventListener("click",()=>agregar(Number(b.dataset.agregar))));
}
function formatoPrecio(v){return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(v)}
function agregar(id){const p=productos.find(x=>x.id===id);if(!p)return;const i=carrito.find(x=>x.id===id);if(i)i.cantidad++;else carrito.push({id,cantidad:1});renderCarrito();abrirCarrito()}
function cambiarCantidad(id,n){const i=carrito.find(x=>x.id===id);if(!i)return;i.cantidad+=n;if(i.cantidad<=0)carrito=carrito.filter(x=>x.id!==id);renderCarrito()}
function renderCarrito(){
  contador.textContent=carrito.reduce((s,i)=>s+i.cantidad,0);carritoVacio.hidden=carrito.length>0;itemsCarrito.innerHTML="";
  carrito.forEach(i=>{const p=productos.find(x=>x.id===i.id);if(!p)return;const d=document.createElement("div");d.className="item-carrito";
    d.innerHTML=`<div><strong>${escapar(p.nombre)}</strong><small>${escapar(p.categoria)} · ${escapar(p.calibre)} · ${escapar(p.unidad)}</small></div><div class="cantidad-controles"><button type="button" aria-label="Restar">−</button><span>${i.cantidad}</span><button type="button" aria-label="Sumar">+</button></div>`;
    const bs=d.querySelectorAll("button");bs[0].addEventListener("click",()=>cambiarCantidad(i.id,-1));bs[1].addEventListener("click",()=>cambiarCantidad(i.id,1));itemsCarrito.appendChild(d);
  });
}
function abrirCarrito(){panel.classList.add("abierto");overlay.classList.add("visible");panel.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function cerrarCarrito(){panel.classList.remove("abierto");overlay.classList.remove("visible");panel.setAttribute("aria-hidden","true");document.body.style.overflow=""}
function numeroValido(){return /^\d{10,15}$/.test(WHATSAPP)}
function abrirWhatsApp(mensaje){if(!numeroValido()){alert("Configura tu número de WhatsApp en js/app.js. Usa indicativo de país y solo números.");return}window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`,"_blank","noopener")}
function enviarCotizacion(){
  if(!carrito.length){alert("Agrega al menos un producto a tu cotización.");return}
  const nombre=document.getElementById("nombreCliente").value.trim(),nota=document.getElementById("notaCliente").value.trim();
  let msg="Hola, deseo cotizar los siguientes productos:\n\n";
  carrito.forEach((i,n)=>{const p=productos.find(x=>x.id===i.id);msg+=`${n+1}. ${p.nombre}\nCategoría: ${p.categoria}\nReferencia: ${p.referencia}\nCalibre: ${p.calibre}\nCantidad: ${i.cantidad} (${p.unidad})\n\n`});
  if(nombre)msg+=`Nombre: ${nombre}\n`;if(nota)msg+=`Detalles: ${nota}\n`;msg+="Agradezco información de precio y disponibilidad.";
  abrirWhatsApp(msg);
}
buscar.addEventListener("input",renderProductos);
filtro.addEventListener("change",()=>{categoriaActiva=filtro.value;actualizarChips();renderProductos()});
document.getElementById("abrirCarrito").addEventListener("click",abrirCarrito);
document.getElementById("cerrarCarrito").addEventListener("click",cerrarCarrito);
overlay.addEventListener("click",cerrarCarrito);
document.getElementById("enviarCotizacion").addEventListener("click",enviarCotizacion);
document.getElementById("whatsappFlotante").addEventListener("click",e=>{e.preventDefault();abrirWhatsApp("Hola, deseo información sobre los cables eléctricos disponibles.")});
document.getElementById("whatsappContacto").addEventListener("click",e=>{e.preventDefault();abrirWhatsApp("Hola, deseo solicitar una cotización de cables eléctricos.")});
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("menuPrincipal").classList.toggle("abierto"));
document.querySelectorAll("#menuPrincipal a").forEach(a=>a.addEventListener("click",()=>document.getElementById("menuPrincipal").classList.remove("abierto")));
document.getElementById("anio").textContent=new Date().getFullYear();
crearFiltros();actualizarChips();renderProductos();renderCarrito();
