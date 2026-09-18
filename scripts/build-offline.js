import {readFile,mkdir,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
let html=await readFile(new URL('public/index.html',root),'utf8');
const css=await readFile(new URL('public/style.css',root),'utf8');
const scripts=[];
for(const file of ['lipsync.js','story.js','levels.js','optics.js','data.js','core.js','cinema.js','render.js','audio.js','network.js','client.js']){
 const source=await readFile(new URL('public/'+file,root),'utf8');
 scripts.push(source.replace(/^import .*?;\s*$/gm,'').replace(/^export /gm,''));
}
html=html.replace('<link rel="stylesheet" href="/style.css">','<style>'+css+'</style>');
html=html.replace('<script type="module" src="/client.js"></script>','<script>\nwindow.BLACKOUT_OFFLINE=true;\n'+scripts.join('\n').replace(/<\/script/gi,'<\\/script')+'\n</script>');
await mkdir(new URL('dist/',root),{recursive:true});await writeFile(new URL('dist/Blackout.html',root),html);
console.log('Built dist/Blackout.html — offline solo edition. Online co-op uses npm start.');
