/**
 * Optional owner-authorized, read-only Meta Graph API importer.
 * Runs server-side via GitHub Actions. Never publish Page tokens to the client.
 */
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const destination=resolve(root,'site/updates.json');
const source='https://www.facebook.com/FindTheCashNz/';

export function verifiedFacebookUrl(input){
  if(typeof input!=='string')return null;
  try{const u=new URL(input);return u.protocol==='https:'&&['facebook.com','www.facebook.com','m.facebook.com'].includes(u.hostname)?u.href:null}catch{return null}
}
export function cleanPosts(response){
  if(!response||!Array.isArray(response.data))throw Error('Invalid Meta post data');
  return response.data.map(item=>{
    if(typeof item?.message!=='string'||!item.message.trim())return null;
    const url=verifiedFacebookUrl(item.permalink_url);
    const time=new Date(item.created_time);
    if(!url||!Number.isFinite(time.getTime()))return null;
    return {message:item.message.trim().slice(0,1200),url,created_at:time.toISOString()};
  }).filter(Boolean).slice(0,6);
}
export async function syncFacebook({pageId,token,fetchFn=fetch,outputFile=destination}={}){
  if(!/^\d{8,25}$/.test(pageId||''))throw Error('META_PAGE_ID must be a numeric Page ID');
  if(!token)throw Error('META_PAGE_ACCESS_TOKEN is missing');
  const endpoint=new URL('https://graph.facebook.com/v26.0/'+pageId+'/posts');
  endpoint.searchParams.set('fields','message,permalink_url,created_time');
  endpoint.searchParams.set('limit','12');
  const response=await fetchFn(endpoint.toString(),{
    headers:{Authorization:'Bearer '+token,Accept:'application/json'},
    signal:AbortSignal.timeout(15000)
  });
  if(!response.ok)throw Error('Meta API returned HTTP '+response.status);
  const payload=await response.json();
  if(payload.error)throw Error('Meta API rejected the request');
  const posts=cleanPosts(payload);
  const old=JSON.parse(await readFile(outputFile,'utf8'));
  if(old.connected===true&&JSON.stringify(old.posts)===JSON.stringify(posts))return {changed:false,count:posts.length};
  const data={connected:true,source,updated_at:new Date().toISOString(),posts};
  await writeFile(outputFile,JSON.stringify(data,null,2)+'\n','utf8');
  return {changed:true,count:posts.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  syncFacebook({pageId:process.env.META_PAGE_ID,token:process.env.META_PAGE_ACCESS_TOKEN})
  .then(result=>console.log('Official Page sync: '+result.count+' posts; changed='+result.changed))
  .catch(err=>{console.error('Meta import stopped safely: '+err.message);process.exitCode=1});
}
