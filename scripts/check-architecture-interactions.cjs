// 交互与结构回归：独立浏览器上下文，不改用户本机布局。
// 为检查编辑操作，将测试中的图展开到窗口；此脚本不用于性能计时。
// 性能使用 check-architecture-pan.cjs 与 check-architecture-switch.cjs，在原文章尺寸下测量。
const { chromium } = require('../apps/web/node_modules/@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
fs.mkdirSync('work', { recursive: true });
const url = 'http://localhost:3000/posts/' + encodeURIComponent('1-架构与缓存/1.1-CSA2与逐层数据流/1.1.1-矩阵视角的一层数据流') + '?garden=DeepSeekV41Flash';
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 try {
 const page = await browser.newPage({viewport:{width:1600,height:1100}});
 page.setDefaultTimeout(60000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error' && /React Flow|handle|ResizeObserver|KaTeX/i.test(m.text()))errors.push(m.text());});
 await page.goto(url);
 await page.locator('.react-flow__node[data-id="input"]').waitFor({state:'attached'});
 await page.evaluate(()=>Object.assign(document.querySelector('.react-flow').parentElement.parentElement.parentElement.style,{position:'fixed',inset:0,width:'100vw',height:'100vh',zIndex:9999}));
 const layer=async n=>{await page.locator(`button[title^="Layer ${n} "]`).click();await page.waitForTimeout(1500);};
 await layer(15);
 for(let i=0;i<8;i++)await page.locator('.react-flow__controls-zoomin').click({force:true});
 await page.waitForTimeout(1000);
 const node=id=>page.locator(`.react-flow__node[data-id="${id}"]`);
 const pan=async(dx,dy)=>{const anchor=await page.evaluate(()=>{document.activeElement?.blur?.();for(let y=innerHeight-50;y>270;y-=80)for(let x=innerWidth-50;x>60;x-=80)if(document.elementFromPoint(x,y)?.classList.contains('react-flow__pane'))return{x,y};});assert.ok(anchor,'从空白画布开始平移');const{x,y}=anchor;await page.keyboard.down('Space');await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:5});await page.mouse.up();await page.keyboard.up('Space');await page.waitForTimeout(500);};
 const focus=async(id,x=120,y=260)=>{const r=await node(id).boundingBox();await pan(x-r.x,y-r.y);assert.equal(await node(id).locator('[data-detail-suspended]').count(),0,`${id} restored`);};
 const geometry=()=>page.evaluate(()=>[...document.querySelectorAll('.react-flow__node')].map(n=>({id:n.dataset.id,width:n.offsetWidth,height:n.offsetHeight,ports:[...n.querySelectorAll('.react-flow__handle')].map(p=>({id:p.dataset.handleid,type:p.classList.contains('source')?'source':'target',x:p.getBoundingClientRect().x+p.getBoundingClientRect().width/2-n.getBoundingClientRect().x,y:p.getBoundingClientRect().y+p.getBoundingClientRect().height/2-n.getBoundingClientRect().y})).sort((a,b)=>(a.id+a.type).localeCompare(b.id+b.type))})));
 await focus('input');
 const initial=await geometry();
 await layer(29);await layer(15);for(let i=0;i<8;i++)await page.locator('.react-flow__controls-zoomin').click({force:true});await page.waitForTimeout(700);await focus('input');
 await page.screenshot({path:'work/architecture-qa-input.png'});
 await pan(-6000,-6000);
 assert.ok(await page.locator('[data-detail-suspended]').count()>20);
 await focus('input');
 const restored=await geometry();
 const drift=[];
 for(const a of initial){const b=restored.find(b=>b.id===a.id);if(a.width!==b.width||a.height!==b.height||a.ports.length!==b.ports.length||a.ports.some((p,i)=>p.id!==b.ports[i]?.id||p.type!==b.ports[i]?.type||Math.abs(p.x-b.ports[i].x)>.1||Math.abs(p.y-b.ports[i].y)>.1))drift.push({a,b});}
 fs.writeFileSync('work/architecture-geometry-drift.json',JSON.stringify(drift,null,2));
 assert.deepEqual(drift.map(d=>({id:d.a.id,before:d.a.height,after:d.b.height})),[],'尺寸与连接点往返无漂移');
 const before=await node('input').evaluate(e=>e.style.transform);
 const r=await node('input').boundingBox();
 await page.mouse.move(r.x+35,r.y+25);await page.mouse.down();await page.mouse.move(r.x+155,r.y+85,{steps:20});await page.mouse.up();
 const moved=await node('input').evaluate(e=>e.style.transform);assert.notEqual(moved,before);
 await page.locator('button[title="Ctrl+Z"]').click();assert.equal(await node('input').evaluate(e=>e.style.transform),before);
 await page.locator('button[title="Ctrl+Y"]').click();assert.equal(await node('input').evaluate(e=>e.style.transform),moved);
 const oldWidth=await node('input').evaluate(e=>e.offsetWidth);
 const resize=await node('input').boundingBox();
 await page.mouse.move(resize.x+resize.width-1,resize.y+resize.height*.33);await page.mouse.down();await page.mouse.move(resize.x+resize.width+80,resize.y+resize.height*.33,{steps:15});await page.mouse.up();await page.waitForTimeout(300);
 const newWidth=await node('input').evaluate(e=>e.offsetWidth);assert.ok(newWidth>oldWidth+40,'真实边缘缩放可用');
 await page.locator('button').filter({hasText:/^保存到本机$/}).click();
 const saved=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.includes('deepseek-v41-layer-layout'))));assert.ok(Object.keys(saved).length);
 await page.reload();await page.locator('.react-flow__node[data-id="input"]').waitFor({state:'attached'});
 await page.evaluate(()=>Object.assign(document.querySelector('.react-flow').parentElement.parentElement.parentElement.style,{position:'fixed',inset:0,width:'100vw',height:'100vh',zIndex:9999}));
 await layer(15);assert.equal(await node('input').evaluate(e=>e.style.transform),moved);assert.equal(await node('input').evaluate(e=>e.offsetWidth),newWidth);
 await page.locator('button').filter({hasText:/^恢复自动布局$/}).click();await page.waitForTimeout(1500);
 for(let i=0;i<8;i++)await page.locator('.react-flow__controls-zoomin').click({force:true});await page.waitForTimeout(700);
 await focus('hc-pre-a');await page.screenshot({path:'work/architecture-qa-mhc.png'});
 await focus('swa-window');await page.screenshot({path:'work/architecture-qa-swa.png'});
 const swaGap=await page.evaluate(()=>{const path=document.querySelector('[data-swa-selection-connector] > path'),target=document.querySelector('.react-flow__node[data-id="swa-result"]');const p=path.getPointAtLength(path.getTotalLength()).matrixTransform(path.getScreenCTM()),r=target.getBoundingClientRect();return Math.hypot(p.x-r.left-r.width/2,p.y-r.top);});assert.ok(swaGap<2,`滑窗选择箭头端点误差 ${swaGap}`);
 await focus('engram-inject');await page.screenshot({path:'work/architecture-qa-engram.png'});
 const visibleLabel=await page.locator('[data-edge-label]').evaluateAll(es=>es.find(e=>{const r=e.getBoundingClientRect();return r.left>50&&r.right<1500&&r.top>300&&r.bottom<900;})?.dataset.edgeLabel);
 assert.ok(visibleLabel,'屏幕中有可拖动标签');const label=page.locator(`[data-edge-label="${visibleLabel}"]`);
 const labelBefore=await label.evaluate(e=>e.style.transform),lr=await label.boundingBox();
 await page.mouse.move(lr.x+lr.width/2,lr.y+lr.height/2);await page.mouse.down();await page.mouse.move(lr.x+lr.width/2+70,lr.y+lr.height/2+70,{steps:15});await page.mouse.up();
 assert.notEqual(await label.evaluate(e=>e.style.transform),labelBefore);await page.locator('button[title="Ctrl+Z"]').click();assert.equal(await label.evaluate(e=>e.style.transform),labelBefore);
 const check=async()=>page.evaluate(()=>{
   const nodes=[...document.querySelectorAll('.react-flow__node')].map(n=>({id:n.dataset.id,r:n.getBoundingClientRect()}));
   const hits=[];
   for(const e of document.querySelectorAll('.react-flow__edge')){
     const p=e.querySelector('.react-flow__edge-path');if(!p)continue;
     const m=p.getScreenCTM(),len=p.getTotalLength();if(!len)continue;
     const at=d=>p.getPointAtLength(d).matrixTransform(m);const a=at(0),b=at(len);
     const inside=(v,r,margin)=>v.x>r.left+margin&&v.x<r.right-margin&&v.y>r.top+margin&&v.y<r.bottom-margin;
     const obstacles=nodes.filter(n=>!inside(a,n.r,-4)&&!inside(b,n.r,-4));
     for(let d=10;d<len-10;d+=10){const v=at(d);for(const n of obstacles)if(inside(v,n.r,3)){hits.push({edge:e.dataset.id,node:n.id});break;}if(hits.at(-1)?.edge===e.dataset.id)break;}
   }
   const portGaps=['mix-a-post','mix-a-comb','mix-a-pre-f'].map(id=>{const edge=document.querySelector(`.react-flow__edge[data-id="${id}"]`),p=edge.querySelector('.react-flow__edge-path'),s=p.getPointAtLength(0).matrixTransform(p.getScreenCTM()),handleId=id==='mix-a-post'?'post':id==='mix-a-comb'?'comb':'pre',r=document.querySelector(`.react-flow__node[data-id="hc-mix-a"] [data-handleid="${handleId}"]`).getBoundingClientRect();return {id,gap:Math.hypot(s.x-r.left-r.width/2,s.y-r.top-r.height/2)};});
   return {nodes:nodes.length,edges:document.querySelectorAll('.react-flow__edge').length,suspended:document.querySelectorAll('[data-detail-suspended]').length,katexErrors:document.querySelectorAll('.katex-error').length,hits,portGaps,terminalLabels:document.querySelectorAll('[data-edge-terminal-label]').length};
 });
 const reports=[{mode:'15-prefill',...await check()}];
 await page.setViewportSize({width:1100,height:850});
 await page.locator('button').filter({hasText:/^Decode · 单步一行$/}).click();await page.waitForTimeout(1500);
 for(const n of [2,4,29]){await layer(n);await focus('input',80,260);await page.screenshot({path:`work/architecture-qa-${n}-decode.png`});reports.push({mode:`${n}-decode`,...await check()});}
 console.log(JSON.stringify({errors,reports}));
 assert.equal(errors.length,0,errors.join('\n'));assert.ok(reports.every(r=>!r.katexErrors));assert.ok(reports.every(r=>!r.hits.length),'连线避开无关框体');assert.ok(reports.every(r=>r.portGaps.every(p=>p.gap<2)&&r.terminalLabels>0));
 console.log(JSON.stringify({errors,drift,reports,savedKeys:Object.keys(saved)},null,2));fs.writeFileSync('work/architecture-qa.json',JSON.stringify({errors,drift,reports},null,2));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
