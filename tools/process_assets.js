const zlib=require('zlib'),fs=require('fs');
function decode(buf){let p=8,W=0,H=0,idat=[];while(p<buf.length){const len=buf.readUInt32BE(p);const type=buf.toString('ascii',p+4,p+8);const data=buf.slice(p+8,p+8+len);if(type==='IHDR'){W=data.readUInt32BE(0);H=data.readUInt32BE(4);}else if(type==='IDAT')idat.push(data);else if(type==='IEND')break;p+=12+len;}const raw=zlib.inflateSync(Buffer.concat(idat));const bpp=4,stride=W*bpp;const out=Buffer.alloc(H*stride);let o=0,ro=0;const pa=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};for(let y=0;y<H;y++){const f=raw[ro++];for(let x=0;x<stride;x++){const rv=raw[ro++];const a=x>=bpp?out[o+x-bpp]:0;const b=y>0?out[o-stride+x]:0;const c=(x>=bpp&&y>0)?out[o-stride+x-bpp]:0;let v;if(f===0)v=rv;else if(f===1)v=rv+a;else if(f===2)v=rv+b;else if(f===3)v=rv+((a+b)>>1);else v=rv+pa(a,b,c);out[o+x]=v&255;}o+=stride;}return {W,H,data:out};}
function encode(W,H,data){function crc32(buf){let t=crc32.t;if(!t){t=crc32.t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c;}}let crc=0xffffffff;for(let i=0;i<buf.length;i++)crc=t[(crc^buf[i])&255]^(crc>>>8);return(crc^0xffffffff)>>>0;}function chunk(type,d){const len=Buffer.alloc(4);len.writeUInt32BE(d.length);const t=Buffer.from(type);const c=Buffer.alloc(4);c.writeUInt32BE(crc32(Buffer.concat([t,d])));return Buffer.concat([len,t,d,c]);}const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;data.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);}return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
// barrier = clearly character: saturated OR dark (outline). bg/noise = floodable.
function isBarrier(d,o){const r=d[o],g=d[o+1],b=d[o+2];const sat=Math.max(r,g,b)-Math.min(r,g,b);const lum=(r+g+b)/3;return sat>30 || lum<130;}
function keyOut(img){const {W,H,data}=img; const vis=new Uint8Array(W*H); const st=[];
  for(let x=0;x<W;x++){st.push(x);st.push((H-1)*W+x);} for(let y=0;y<H;y++){st.push(y*W);st.push(y*W+W-1);}
  while(st.length){const i=st.pop(); if(vis[i])continue; if(isBarrier(data,i*4))continue; vis[i]=1; const x=i%W,y=(i/W)|0;
    if(x>0)st.push(i-1); if(x<W-1)st.push(i+1); if(y>0)st.push(i-W); if(y<H-1)st.push(i+W);}
  for(let i=0;i<W*H;i++) if(vis[i]) data[i*4+3]=0;
  // speck cleanup: kept pixel with >=6 transparent 8-neighbours & grayish -> remove
  const rm=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(data[i*4+3]===0)continue;let tr=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(dx||dy){if(data[((y+dy)*W+(x+dx))*4+3]===0)tr++;}}const o=i*4;const sat=Math.max(data[o],data[o+1],data[o+2])-Math.min(data[o],data[o+1],data[o+2]);if(tr>=6 && sat<=40)rm.push(i);}
  rm.forEach(i=>data[i*4+3]=0);

  // connected-component cleanup: keep big/tall blobs (characters), drop text/dashes/specks
  const seen=new Uint8Array(W*H);
  for(let i0=0;i0<W*H;i0++){ if(data[i0*4+3]===0||seen[i0])continue; const q=[i0];seen[i0]=1;const comp=[i0];let minx=W,maxx=0,miny=H,maxy=0;
    while(q.length){const i=q.pop();const x=i%W,y=(i/W)|0;if(x<minx)minx=x;if(x>maxx)maxx=x;if(y<miny)miny=y;if(y>maxy)maxy=y;
      const nb=[i-1,i+1,i-W,i+W];for(const n of nb){if(n<0||n>=W*H)continue;if((n%W===0&&i%W===W-1)||(i%W===0&&n%W===W-1))continue;if(data[n*4+3]!==0&&!seen[n]){seen[n]=1;q.push(n);comp.push(n);}}}
    const area=comp.length,bh=maxy-miny;
    if(area<700||bh<48){ for(const i of comp) data[i*4+3]=0; }
  }
  return vis;
}

function downscale2x(img){const {W,H,data}=img;const W2=W>>1,H2=H>>1;const out=Buffer.alloc(W2*H2*4);
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){let R=0,G=0,B=0,A=0;
    for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const o=((y*2+dy)*W+(x*2+dx))*4;const a=data[o+3];A+=a;R+=data[o]*a;G+=data[o+1]*a;B+=data[o+2]*a;}
    const oo=(y*W2+x)*4;if(A>0){out[oo]=Math.round(R/A);out[oo+1]=Math.round(G/A);out[oo+2]=Math.round(B/A);}out[oo+3]=Math.round(A/4);}
  return {W:W2,H:H2,data:out};}

const img0=decode(fs.readFileSync(process.argv[2]));
keyOut(img0);
const img=downscale2x(img0);
fs.writeFileSync(process.argv[3], encode(img.W,img.H,img.data));
console.log('keyed ->',process.argv[3]);
