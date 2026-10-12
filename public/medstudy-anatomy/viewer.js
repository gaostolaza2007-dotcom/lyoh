import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export async function createViewer({config,onSelect,onOrientation}){
  const stage=document.getElementById('stage'),canvas=document.getElementById('canvas'),markers=document.getElementById('markers'),lines=document.getElementById('leader-lines'),loading=document.getElementById('load-state');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.90;
  const scene=new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xe6e1ff,0x484354,1.7));
  const key=new THREE.DirectionalLight(0xfff0e5,2.5);key.position.set(-2,3,4);scene.add(key);
  const rim=new THREE.DirectionalLight(0xaf91f3,2.0);rim.position.set(2,2,-2);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xc9d7e8,1.1);fill.position.set(2,1,3);scene.add(fill);
  const camera=new THREE.PerspectiveCamera(config.camera.fov,1,.01,25);camera.position.set(0,.85,3.08);
  const controls=new OrbitControls(camera,canvas);controls.target.set(0,.85,0);controls.enablePan=false;controls.enableDamping=false;controls.rotateSpeed=.65;controls.zoomSpeed=.7;controls.minPolarAngle=Math.PI*.30;controls.maxPolarAngle=Math.PI*.70;controls.minDistance=.65;controls.maxDistance=5;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const loader=new GLTFLoader(),cache=new Map();let state={variant:'female',layer:'surface',region:null},token=0,animation=null,frame=0,disposed=false,lastTime=0,webglLost=false;
  const patch={center:{value:new THREE.Vector3()},radius:{value:new THREE.Vector3(1,1,1)},active:{value:0},whole:{value:0}};
  function resolved(value){return Array.isArray(value)?value:value[state.variant];}
  function createSkinMaterial(old){
    const m=old.clone();m.roughness=.68;
    m.onBeforeCompile=s=>{
      s.uniforms.regionCenter=patch.center;s.uniforms.regionRadius=patch.radius;s.uniforms.regionActive=patch.active;s.uniforms.regionWhole=patch.whole;
      s.vertexShader='varying vec3 anatomyPosition;\n'+s.vertexShader;
      s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nanatomyPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      s.fragmentShader='varying vec3 anatomyPosition; uniform vec3 regionCenter; uniform vec3 regionRadius; uniform float regionActive; uniform float regionWhole;\n'+s.fragmentShader;
      s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat regionWeight = regionActive * (1.0-smoothstep(0.70,1.0,length((anatomyPosition-regionCenter)/regionRadius)));\nregionWeight=max(regionWeight,regionWhole*0.36);\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.47,0.22,0.80),regionWeight*0.85);');
    };return m;
  }
  async function load(file){
    if(cache.has(file))return cache.get(file);
    const promise=loader.loadAsync(file).then(g=>{
      const root=g.scene;root.visible=false;root.userData.assetRoot=true;scene.add(root);
      root.traverse(o=>{if(o.isMesh){o.material=o.name==='body_surface'?createSkinMaterial(o.material):o.material.clone();o.material.userData.originalColor=o.material.color.clone();o.material.userData.originalEmissive=o.material.emissive.clone();o.frustumCulled=true;}});
      return root;
    }).catch(e=>{cache.delete(file);throw e;});cache.set(file,promise);return promise;
  }
  function modeLabels(){
    const layer=state.layer;
    document.getElementById('scene-label').textContent=layer==='detail'?'DETALLE AISLADO':layer==='internal'?'ESTRUCTURAS INTERNAS':'VISTA ANTERIOR';
    document.getElementById('scene-sublabel').textContent=layer==='detail'?'Glande · estructura del atlas':layer==='internal'?'Encaje orientativo · colores de identificación':'Base parcial · '+config.variants[state.variant].label.toLowerCase();
    document.getElementById('model-status').textContent=layer==='detail'?'SIN UNIÓN A LA BASE CORPORAL':layer==='internal'?'POSICIÓN ORIENTATIVA':'BASE ANATÓMICA PARCIAL';
  }
  function fly(target,distance,direction=new THREE.Vector3(0,0,1)){
    const endTarget=new THREE.Vector3(...target),endPos=endTarget.clone().addScaledVector(direction.normalize(),distance);
    const fromS=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    const toS=new THREE.Spherical().setFromVector3(endPos.clone().sub(endTarget));
    while(toS.theta-fromS.theta>Math.PI)toS.theta-=Math.PI*2;
    while(toS.theta-fromS.theta< -Math.PI)toS.theta+=Math.PI*2;
    animation={start:performance.now(),fromS,toS,fromTarget:controls.target.clone(),toPos:endPos,toTarget:endTarget};
    if(reduced.matches){camera.position.copy(endPos);controls.target.copy(endTarget);controls.update();animation=null;}
    onOrientation(direction.z>0.999?'front':direction.z<-.999?'back':'custom');invalidate();
  }
  function markersForMode(){
    return config.regions.filter(r=>r.status==='available'&&r.variants.includes(state.variant)&&r.layer===state.layer&&r.marker&&(state.layer!=='detail'||r.id===state.region?.id));
  }
  function buildMarkers(){
    markers.replaceChildren();lines.replaceChildren();
    for(const r of markersForMode()){
      const b=document.createElement('button');b.className='marker';b.dataset.marker=r.id;b.setAttribute('aria-label',`Explorar ${r.label}`);b.setAttribute('aria-pressed',String(state.region?.id===r.id));b.innerHTML=`<span class="pin">${r.number}</span><span>${r.label}</span>`;b.onclick=()=>onSelect(r.id);markers.append(b);
      for(const tag of ['line','circle']){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);e.dataset.marker=r.id;if(tag==='circle'){e.setAttribute('r','3');e.classList.add('anchor-dot');}lines.append(e);}
    }
  }
  function placeMarkers(){
    const w=stage.clientWidth,h=stage.clientHeight;const occupied=[];
    for(const r of markersForMode()){
      const b=markers.querySelector(`[data-marker="${r.id}"]`);if(!b)continue;
      const anchor=new THREE.Vector3(...resolved(r.marker)),projected=anchor.clone().project(camera),visible=projected.z>-1&&projected.z<1&&Math.abs(projected.x)<1&&Math.abs(projected.y)<1&&(state.layer!=='surface'||camera.position.z>-.01);
      b.hidden=!visible;
      const related=lines.querySelectorAll(`[data-marker="${r.id}"]`);related.forEach(e=>e.style.display=visible?'':'none');if(!visible)continue;
      const ax=(projected.x+1)*w/2,ay=(1-projected.y)*h/2;
      const bw=b.offsetWidth,bh=b.offsetHeight,dx=r.labelOffset[0]*(w<440?.70:1);let x=THREE.MathUtils.clamp(ax+dx,bw/2+8,w-bw/2-8),y=THREE.MathUtils.clamp(ay+r.labelOffset[1],65,h-65);
      for(const p of occupied){if(Math.abs(x-p.x)<(bw+p.w)/2+8&&Math.abs(y-p.y)<(bh+p.h)/2+7)y=THREE.MathUtils.clamp(p.y+(bh+p.h)/2+9,65,h-60);}
      occupied.push({x,y,w:bw,h:bh});b.style.left=x+'px';b.style.top=y+'px';
      const line=related[0],dot=related[1];line.setAttribute('x1',ax);line.setAttribute('y1',ay);line.setAttribute('x2',x);line.setAttribute('y2',y);dot.setAttribute('cx',ax);dot.setAttribute('cy',ay);
    }
  }
  function invalidate(){if(!frame&&!disposed)frame=requestAnimationFrame(render);}
  function render(time){frame=0;if(disposed||webglLost)return;
    if(animation){const t=reduced.matches?1:Math.min(1,(time-animation.start)/650);const eased=t*t*(3-2*t);const a=animation;const s=new THREE.Spherical(THREE.MathUtils.lerp(a.fromS.radius,a.toS.radius,eased),THREE.MathUtils.lerp(a.fromS.phi,a.toS.phi,eased),THREE.MathUtils.lerp(a.fromS.theta,a.toS.theta,eased));controls.target.lerpVectors(a.fromTarget,a.toTarget,eased);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();if(t>=1)animation=null;}
    renderer.render(scene,camera);placeMarkers();lastTime=time;if(animation)invalidate();
  }
  controls.addEventListener('start',()=>{animation=null;onOrientation('custom');});controls.addEventListener('change',invalidate);
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();}
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();
  function zoom(factor){animation=null;const v=camera.position.clone().sub(controls.target),distance=THREE.MathUtils.clamp(v.length()*factor,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(v.normalize().multiplyScalar(distance));controls.update();invalidate();}
  function orient(side){const dir=new THREE.Vector3(0,0,side==='back'?-1:1),target=animation?animation.toTarget.toArray():controls.target.toArray(),distance=animation?animation.toS.radius:camera.position.distanceTo(controls.target);fly(target,distance,dir);document.getElementById('scene-label').textContent=state.layer==='detail'?'DETALLE AISLADO':side==='back'?'VISTA POSTERIOR':'VISTA ANTERIOR';}
  const keyboard=e=>{
    if(e.target!==stage&&e.target!==canvas)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','_','r','R'].includes(e.key))e.preventDefault();
    if(['+','='].includes(e.key))return zoom(.85);if(['-','_'].includes(e.key))return zoom(1.18);if(e.key.toLowerCase()==='r')return document.getElementById('reset').click();
    if(e.key.startsWith('Arrow')){animation=null;const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));s.theta+=(e.key==='ArrowLeft'?.14:e.key==='ArrowRight'?-.14:0);s.phi=THREE.MathUtils.clamp(s.phi+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0),controls.minPolarAngle,controls.maxPolarAngle);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();onOrientation('custom');invalidate();}
  };stage.addEventListener('keydown',keyboard);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();webglLost=true;loading.hidden=false;loading.textContent='Se perdió el contexto 3D. La lista de regiones sigue disponible. Recarga para reintentar.';});
  async function setState(next){
    const own=++token;loading.hidden=false;loading.textContent='Cargando '+(next.layer==='internal'?'estructuras internas…':next.layer==='detail'?'detalle anatómico…':'superficie corporal…');
    const bodyPromise=load(config.variants[next.variant].file);
    const needed=[bodyPromise];
    if(next.layer==='internal')needed.push(load(config.assets.small_intestine.file),load(config.assets.colon.file));
    if(next.layer==='detail')needed.push(load(config.assets.glans.file));
    const roots=await Promise.all(needed);if(own!==token)return;
    for(const root of scene.children)if(root.userData.assetRoot)root.visible=roots.includes(root);
    state={...next};const body=roots[0];body.visible=next.layer!=='detail';
    patch.active.value=0;patch.whole.value=0;
    body.traverse(o=>{if(o.isMesh){o.material.transparent=next.layer==='internal';o.material.opacity=next.layer==='internal'?.065:1;o.material.depthWrite=next.layer!=='internal';o.material.needsUpdate=true;o.renderOrder=next.layer==='internal'?2:0;}});
    // Detached genital detail never appears fused onto an incomplete base.
    if(next.layer==='detail')body.visible=false;
    for(const root of roots.slice(1)){root.visible=true;root.traverse(o=>{if(o.isMesh){const selected=!next.region||next.region.objects.includes(o.name);o.material.color.copy(o.material.userData.originalColor);o.material.emissive.set(0x000000);if(next.region?.objects.includes(o.name))o.material.emissive.set(0x422354);o.material.emissiveIntensity=.25;o.material.transparent=next.layer==='internal'&&!selected;o.material.opacity=selected?1:.25;o.material.depthWrite=selected;o.material.needsUpdate=true;}});}
    if(next.region?.highlight?.type==='surfacePatch'){patch.center.value.fromArray(resolved(next.region.marker));patch.radius.value.fromArray(next.region.highlight.radius);patch.active.value=1;}
    if(next.region?.highlight?.type==='whole')patch.whole.value=1;
    modeLabels();buildMarkers();loading.hidden=true;
    controls.minDistance=next.layer==='detail'?.07:next.region?.id==='mouth'||next.region?.id==='nose'?.36:next.layer==='internal'?.46:.65;
    controls.maxDistance=next.layer==='detail'?.8:5;
    if(next.focus){const preset=next.region?.camera||(next.layer==='internal'?config.camera.internal:config.camera.whole);fly(resolved(preset.target),preset.distance);}
    invalidate();
  }
  function inspect(){return {camera:camera.position.toArray(),target:controls.target.toArray(),distance:camera.position.distanceTo(controls.target),minDistance:controls.minDistance,loaded:[...cache.keys()],visibleMeshes:(()=>{const names=[];scene.traverseVisible(o=>{if(o.isMesh)names.push(o.name);});return names;})(),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,reducedMotion:reduced.matches,animating:!!animation,lastRenderedAt:lastTime};}
  function dispose(){disposed=true;token++;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();stage.removeEventListener('keydown',keyboard);cache.forEach(p=>p.then(root=>root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}})));renderer.dispose();}
  window.addEventListener('pagehide',dispose,{once:true});
  return {setState,zoom,orient,inspect,dispose};
}
