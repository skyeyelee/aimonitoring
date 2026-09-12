// Hash both values before comparison so differing password lengths do not short-circuit.
export async function validCredentials(authorization:string|null,email:string|undefined,password:string|undefined){
 if(!email||!password||password.length<16||!authorization?.startsWith('Basic ')||authorization.length>8192)return false;
 try{
  const decoded=atob(authorization.slice(6));const split=decoded.indexOf(':');if(split<0)return false;
  const supplied=decoded.slice(0,split)+':'+decoded.slice(split+1);
  const expected=email+':'+password;
  const digest=async(s:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
  const [a,b]=await Promise.all([digest(supplied),digest(expected)]);let difference=0;for(let i=0;i<a.length;i++)difference|=a[i]^b[i];return difference===0;
 }catch{return false;}
}
