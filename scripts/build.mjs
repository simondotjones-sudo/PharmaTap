import { mkdir,cp } from 'node:fs/promises';
import { build } from 'esbuild';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','auth-redirect.js','app.js','assurance.js','data.js','styles.css','assets','_headers','_redirects','product-map.html','prototype.html','workspace.html','workspace.css'])await cp(file,'dist/'+file,{recursive:true});
await build({entryPoints:['src/workspace.ts'],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'dist/workspace.js',minify:true});
