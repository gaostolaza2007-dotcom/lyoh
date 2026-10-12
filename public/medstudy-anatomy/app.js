const $=id=>document.getElementById(id);
let config,viewer, selected=null, variant='female',layer='surface', revision=0;
let sceneReady=false;
function cameraEnabled(enabled){for(const id of ['front','back','zoom-in','zoom-out'])document.getElementById(id).disabled=!enabled;}
cameraEnabled(false);
const embedded=new URLSearchParams(location.search).has('embed');
if(embedded)document.body.classList.add('embedded');
const announce=text=>{$('announcer').textContent=text;};
const showFailure=message=>{ $('load-state').hidden=false;$('load-state').textContent=message; };
const configPromise=fetch('./regions.json').then(r=>{if(!r.ok)throw Error('config');return r.json();});
const microbiotaPromise=fetch('./microbiota-data.json').then(r=>{if(!r.ok)return {entries:[],regions:{}};return r.json();}).catch(()=>({entries:[],regions:{}}));
let microbiotaData={entries:[],regions:{}};

function openFicha(entry){
  const dlg=$('ficha-dialog');
  if(!dlg)return;
  $('ficha-scientific').textContent=entry.scientificName;
  $('ficha-spanish').textContent=entry.spanishName;
  $('ficha-subzone').textContent=`${entry.regionId.toUpperCase()} · ${entry.subzone}`;
  
  let badgesHtml=`<span class="microbiota-badge type-${entry.type}">${entry.type==='por_verificar'?'Por verificar':entry.type}</span>`;
  if(entry.reviewStatus==='termino_por_confirmar'){
    badgesHtml+=`<span class="microbiota-warn-tag">⚠️ Término por confirmar</span>`;
  }else if(entry.reviewStatus==='por_verificar_fuente'){
    badgesHtml+=`<span class="microbiota-warn-tag">⚠️ Por verificar fuente</span>`;
  }
  
  let html=`
    <div class="ficha-badges-row">${badgesHtml}</div>
    <div class="ficha-card-block">
      <div class="ficha-section-title">Descripción y Taxonomía</div>
      <p>${entry.description}</p>
      ${entry.synonyms&&entry.synonyms.length?`<p style="margin-top:6px;font-size:10px;color:#a896ba"><strong>Sinónimos:</strong> ${entry.synonyms.join(', ')}</p>`:''}
    </div>
    <div class="ficha-card-block">
      <div class="ficha-section-title">Papel Ecológico</div>
      <p>${entry.ecologicalRole}</p>
    </div>
    <div class="ficha-card-block">
      <div class="ficha-section-title">Contexto Clínico y Colonización</div>
      <p>${entry.clinicalContext}</p>
    </div>
    <div class="ficha-card-block" style="border-color:#5c4774">
      <div class="ficha-section-title">Fuente y Bibliografía</div>
      <p><strong>${entry.source.title}</strong> — ${entry.source.citation}</p>
      ${entry.source.url?`<p style="margin-top:6px"><a href="${entry.source.url}" target="_blank" rel="noreferrer" class="ficha-source-link">Consultar referencia científica ↗</a></p>`:''}
    </div>
  `;
  $('ficha-body').innerHTML=html;
  dlg.showModal();
  if(embedded&&parent!==window){
    parent.postMessage({type:'medstudy:openentry',entryId:entry.id},location.origin);
  }
}

function renderRegions(){
  const regions=config.regions.filter(r=>r.variants.includes(variant));
  $('region-count').textContent=regions.length.toString().padStart(2,'0');
  $('regions').replaceChildren();let previous='';
  for(const r of regions){
    if(r.group!==previous){const title=document.createElement('div');title.className='group-label';title.textContent=r.group;$('regions').append(title);previous=r.group;}
    const button=document.createElement('button');button.className='region-button'+(r.status==='pending'?' pending':'');button.dataset.region=r.id;
    button.setAttribute('aria-pressed',String(r.id===selected));button.setAttribute('aria-label',r.label+(r.status==='pending'?' — modelo pendiente':''));
    button.innerHTML=`<span class="region-num">${r.number}</span><span class="region-label">${r.label}</span><span class="region-dot" aria-hidden="true"></span>`;
    button.addEventListener('click',()=>selectRegion(r.id));$('regions').append(button);
  }
}
function syncButtons(){
  for(const id of ['female','male'])$(id).setAttribute('aria-pressed',String(id===variant));
  for(const [id,value] of [['surface','surface'],['internal','internal']])$(id).setAttribute('aria-pressed',String(layer===value));
  document.querySelectorAll('[data-region]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.region===selected)));
}
function showPanel(r){
  $('empty-panel').hidden=!!r;$('selected-panel').hidden=!r;$('close-panel').hidden=!r;
  $('detail-panel').classList.toggle('has-selection',!!r);
  document.body.classList.toggle('has-region',!!r);
  $('detail-panel').setAttribute('aria-labelledby',r?'selected-title':'detail-title');
  $('detail-kicker').textContent=r?'REGIÓN SELECCIONADA':'TU EXPLORACIÓN';
  if(!r)return;
  $('detail-number').textContent=r.number;$('selected-title').textContent=r.label;$('detail-badge').textContent=r.badge;
  $('detail-badge').classList.toggle('pending',r.status==='pending');$('detail-description').textContent=r.description;
  $('focus-region').disabled=r.status==='pending'||!sceneReady;

  const entries=microbiotaData.entries?microbiotaData.entries.filter(e=>e.regionId===r.id):[];
  const listContainer=$('microbiota-list');
  const countBadge=$('microbiota-count');
  const section=$('microbiota-section');
  const placeholder=$('content-placeholder');

  if(entries.length>0){
    if(placeholder)placeholder.hidden=true;
    if(section)section.hidden=false;
    if(countBadge)countBadge.textContent=`${entries.length} ${entries.length===1?'entrada':'entradas'}`;
    if(listContainer){
      listContainer.replaceChildren();
      entries.forEach((entry,idx)=>{
        const item=document.createElement('div');
        item.className='microbiota-item';
        item.tabIndex=0;
        item.setAttribute('role','listitem');
        item.setAttribute('aria-label',`${entry.scientificName}, ${entry.spanishName}. Pulsa para ver ficha.`);

        let warnHtml='';
        if(entry.reviewStatus==='termino_por_confirmar'){
          warnHtml=`<span class="microbiota-warn-tag">⚠️ Término por confirmar</span>`;
        }else if(entry.reviewStatus==='por_verificar_fuente'){
          warnHtml=`<span class="microbiota-warn-tag">⚠️ Verificar fuente</span>`;
        }

        const numStr=(entry.catalogNumber?entry.catalogNumber:(idx+1)).toString().padStart(2,'0');
        const typeLabel=entry.type==='por_verificar'?'Por verificar':entry.type;

        item.innerHTML=`
          <div class="microbiota-item-top">
            <span class="microbiota-num">${numStr}</span>
            <span class="microbiota-name"><em>${entry.scientificName}</em></span>
            <span class="microbiota-badge type-${entry.type}">${typeLabel}</span>
          </div>
          <div class="microbiota-item-bottom">
            <span class="microbiota-spanish" title="${entry.spanishName}">${entry.spanishName}</span>
            ${warnHtml}
            <span class="microbiota-open-hint">Ficha ↗</span>
          </div>
        `;

        const trigger=()=>openFicha(entry);
        item.addEventListener('click',trigger);
        item.addEventListener('keydown',e=>{
          if(e.key==='Enter'||e.key===' '){
            e.preventDefault();
            trigger();
          }
        });
        listContainer.appendChild(item);
      });
    }
    announce(`${r.label}. ${r.badge}. ${entries.length} especies de microbiota disponibles.`);
  }else{
    if(section)section.hidden=true;
    if(placeholder)placeholder.hidden=false;
    announce(`${r.label}. ${r.badge}. Contenido de microbiota en preparación.`);
  }
}
async function updateScene(focus=true){
  if(!viewer)return;
  const rev=++revision;
  const r=config.regions.find(r=>r.id===selected);
  try{await viewer.setState({variant,layer,region:r?.status==='available'?r:null,focus});if(rev===revision){sceneReady=true;cameraEnabled(true);syncButtons();if(r)showPanel(r);}}
  catch(e){if(rev===revision){sceneReady=false;cameraEnabled(false);if(r)showPanel(r);showFailure('No se pudo cargar este modelo. La lista sigue disponible. Recarga la página para reintentar.');announce('Error de carga del modelo.');}console.error('Model loading failed',e);}
}
async function selectRegion(id){
  const r=config.regions.find(r=>r.id===id&&r.variants.includes(variant));if(!r)return;
  selected=id;
  if(r.status==='available')layer=r.layer;
  showPanel(r);syncButtons();
  if(matchMedia('(max-width:560px)').matches){
    document.documentElement.style.setProperty('--panel-height',$('detail-panel').getBoundingClientRect().height+'px');
    document.querySelector('.viewer').scrollIntoView({block:'start',behavior:'instant'});
  }
  window.dispatchEvent(new CustomEvent('medstudy:regionchange',{detail:{regionId:id,variant,status:r.status}}));
  if(embedded&&parent!==window)parent.postMessage({type:'medstudy:regionchange',regionId:id,variant,status:r.status},location.origin);
  await updateScene(r.status==='available');
}
async function whole(){selected=null;layer='surface';showPanel(null);syncButtons();await updateScene();}
async function changeVariant(id){if(variant===id)return;variant=id;selected=null;layer='surface';showPanel(null);renderRegions();syncButtons();await updateScene();announce(`Variante ${config.variants[id].label}. Base anatómica parcial.`);}
function credits(){
  $('credits').showModal();
}
$('about').onclick=credits;$('credits-footer').onclick=credits;$('close-credits').onclick=()=>$('credits').close();
$('credits').addEventListener('click',e=>{if(e.target===$('credits')){const b=$('credits').getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)$('credits').close();}});
try{
  [config, microbiotaData] = await Promise.all([configPromise, microbiotaPromise]);
  renderRegions();
  const initialRegion = new URLSearchParams(location.search).get('region');
  if(initialRegion && config.regions.some(r => r.id === initialRegion)){
    selectRegion(initialRegion);
  }
  if($('close-ficha'))$('close-ficha').onclick=()=>$('ficha-dialog').close();
  if($('ficha-dialog'))$('ficha-dialog').addEventListener('click',e=>{if(e.target===$('ficha-dialog'))$('ficha-dialog').close();});
  new ResizeObserver(()=>{if(selected)document.documentElement.style.setProperty('--panel-height',$('detail-panel').getBoundingClientRect().height+'px');}).observe($('detail-panel'));
  $('credits-content').innerHTML=`<h3>Alcance de los modelos</h3><p>Dos bases corporales parciales. Piel, boca y nariz externas; intestino delgado y colon; detalle aislado del glande. Vulva, vagina y superficie del pene pendientes. Las estructuras internas conservan sus formas de origen, con un encaje corporal orientativo común a ambas variantes. No existe validación médica.</p><h3>Superficies · CC0</h3><p>Dan Ulrich, Blender Studio / comunidad. <a href="https://www.blender.org/download/demo-files/" target="_blank" rel="noreferrer">Human Base Meshes 1.4.1</a>. Subdivisión nivel 1, centrado y material neutro.</p><h3>Intestino delgado · CC BY 4.0</h3><p>BodyParts3D, © The Database Center for Life Science. <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer">Licencia oficial actualizada el 27-02-2025</a>. Conversión de unidades, agrupación y traslado. Los OBJ originales conservan avisos históricos CC BY-SA 2.1 Japón.</p><h3>Colon y glande · CC BY-SA 4.0</h3><p>Z-Anatomy, Gauthier Kervyn, a partir de BodyParts3D / DBCLS (aviso original CC BY-SA 2.1 Japón). <a href="https://github.com/Z-Anatomy/Models-of-human-anatomy" target="_blank" rel="noreferrer">Fuente y créditos de terceros</a>. Selección de mallas, conversión y nuevos materiales. Estos derivados se comparten bajo <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>. No se incluyen oído interno, riñones, cerebro ni nervios craneales de terceros.</p><h3>Software y documentación</h3><p>Three.js 0.180.0 · MIT. Sin servicios externos ni descargas durante el uso. Consulta <a href="docs/FUENTES-Y-LICENCIAS.md" target="_blank">el registro completo</a> y <a href="docs/ESTADO-Y-PRUEBAS.md" target="_blank">las pruebas y limitaciones</a>.</p>`;
  for(const id of ['female','male'])$(id).onclick=()=>changeVariant(id);
  for(const id of ['surface','internal'])$(id).onclick=async()=>{selected=null;layer=id;showPanel(null);syncButtons();await updateScene();};
  $('close-panel').onclick=()=>{const id=selected;whole().then(()=>document.querySelector(`[data-region="${id}"]`)?.focus());};
  $('return-body').onclick=whole;$('full-body').onclick=whole;$('reset').onclick=whole;$('focus-region').onclick=()=>updateScene();
  for(const id of ['front','back'])$(id).onclick=()=>{viewer?.orient(id);$('front').setAttribute('aria-pressed',String(id==='front'));$('back').setAttribute('aria-pressed',String(id==='back'));};
  $('zoom-in').onclick=()=>viewer?.zoom(.82);$('zoom-out').onclick=()=>viewer?.zoom(1.22);
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&$('ficha-dialog')?.open){$('ficha-dialog').close();return;}
    if(e.key==='Escape'&&selected&&!$('credits').open){const id=selected;whole().then(()=>document.querySelector(`[data-region="${id}"]`)?.focus());}
  });
  try{
    const {createViewer}=await import('./viewer.js');
    viewer=await createViewer({config,onSelect:selectRegion,onOrientation:name=>{$('front').setAttribute('aria-pressed',String(name==='front'));$('back').setAttribute('aria-pressed',String(name==='back'));}});
    await updateScene();
  }catch(e){document.body.classList.add('no-webgl');showFailure('El visor 3D no está disponible. Puedes explorar todas las regiones desde la lista.');console.warn('3D viewer unavailable',e);}
  // A shared, stable event contract for a later card view. No content is invented.
  window.medstudy={selectRegion,changeVariant,reset:whole,getState:()=>({variant,layer,selected,webgl:!!viewer,viewer:viewer?.inspect()})};
  if(embedded){
    window.addEventListener('message',async event=>{
      if(event.origin!==location.origin||event.source!==parent)return;
      const data=event.data;if(!data||data.type!=='medstudy:command')return;
      if(data.action==='select'&&typeof data.regionId==='string'){
        if(data.variant==='female'||data.variant==='male')await changeVariant(data.variant);
        await selectRegion(data.regionId);
      }else if(data.action==='variant'&&(data.variant==='female'||data.variant==='male'))await changeVariant(data.variant);
      else if(data.action==='reset')await whole();
    });
    parent.postMessage({type:'medstudy:ready'},location.origin);
  }
}catch(e){showFailure('No se pudo cargar la configuración. Inicia la demo con un servidor local; consulta INICIAR.md.');console.error(e);}
