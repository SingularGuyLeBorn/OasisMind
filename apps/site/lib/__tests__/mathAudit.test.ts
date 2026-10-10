import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {afterEach, describe, expect, it} from 'vitest';

const roots: string[]=[];
const script=path.resolve('scripts/audit-math-errors.mjs');
afterEach(()=>{ for(const root of roots.splice(0))fs.rmSync(root,{recursive:true,force:true}); });
function fixture(html: string) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'site-math-audit-')); roots.push(root);
 fs.mkdirSync(path.join(root,'public/api/v1'),{recursive:true});
 fs.writeFileSync(path.join(root,'public/api/v1/index.json'),JSON.stringify({posts:[{garden:'test',slug:'article'}],gardens:[]}));
 fs.mkdirSync(path.join(root,'.reading/posts/test'),{recursive:true});
 fs.mkdirSync(path.join(root,'.reading/pages'),{recursive:true});
 fs.writeFileSync(path.join(root,'.reading/posts/test/article.json'),JSON.stringify({html}));
 fs.writeFileSync(path.join(root,'.reading/pages/about.json'),JSON.stringify({html:''}));
 return root;
}
describe('发布公式验收',()=>{
 it('可见公式源码阻止发布，代码示例不误报',()=>{
  const root=fixture('<p>宽度 \\frac{8}{3}</p>');
  const result=spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8'});
  expect(result.status).toBe(1);expect(JSON.parse(result.stdout).rawFormulas).toHaveLength(1);
  fs.writeFileSync(path.join(root,'.reading/posts/test/article.json'),JSON.stringify({html:'<pre><code>\\frac{8}{3}</code></pre>'}));
  expect(spawnSync(process.execPath,[script],{cwd:root}).status).toBe(0);
 });
 it('只检查当前清单，不把旧缓存当作发布文章',()=>{
  const root=fixture('<p>正常正文</p>');
  fs.writeFileSync(path.join(root,'.reading/posts/test/stale.json'),JSON.stringify({html:'<span class="katex-error" title="旧错误">坏公式</span>'}));
  const result=spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8'});
  expect(result.status).toBe(0); expect(JSON.parse(result.stdout).files).toBe(2);
 });
 it('摘要中的公式错误也阻止发布',()=>{
  const root=fixture('<p>正文正常</p>');
  fs.writeFileSync(path.join(root,'.reading/posts/test/article.json'),JSON.stringify({html:'',excerptHtml:'<span class="katex-error" title="摘要错误">Q^_</span>'}));
  const result=spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8'});
  expect(result.status).toBe(1); expect(JSON.parse(result.stdout).errors[0].formula).toBe('Q^_');
 });
 it('清单中的正文缺失时直接失败',()=>{
  const root=fixture(''); fs.unlinkSync(path.join(root,'.reading/posts/test/article.json'));
  expect(spawnSync(process.execPath,[script],{cwd:root}).status).not.toBe(0);
 });
});
