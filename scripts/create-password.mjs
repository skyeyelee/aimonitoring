import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {emitKeypressEvents} from 'node:readline';
async function hiddenInput(label){
 if(!process.stdin.isTTY)throw new Error('직접 열린 PowerShell 창에서 실행해 주세요.');
 process.stdout.write(label);
 emitKeypressEvents(process.stdin);
 process.stdin.setRawMode(true);process.stdin.resume();
 return new Promise((resolve,reject)=>{
  let value='';
  const finish=()=>{process.stdin.off('keypress',onKey);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');};
  const onKey=(text,key={})=>{
   if(key.ctrl&&key.name==='c'){finish();reject(new Error('취소했습니다.'));return;}
   if(key.name==='return'){finish();resolve(value);return;}
   if(key.name==='backspace'){value=Array.from(value).slice(0,-1).join('');return;}
   if(text&&!key.ctrl&&!key.meta&&!/[\x00-\x1f\x7f]/.test(text))value+=text;
  };
  process.stdin.on('keypress',onKey);
 });
}
// Generate credentials locally; never write them into a tracked file or shell command.
const custom=process.argv.includes('--custom');
let password;
try{
 password=custom?await hiddenInput('새 비밀번호 (입력 내용은 표시되지 않습니다): '):randomBytes(24).toString('base64url');
 if(custom){
  if(password.length<12||password.length>128)throw new Error('비밀번호는 12~128자로 정해 주세요. 기억하기 쉬운 단어 여러 개를 조합해도 됩니다.');
  if(password!==await hiddenInput('동일한 비밀번호를 다시 입력하세요: '))throw new Error('두 비밀번호가 다릅니다. 다시 실행해 주세요.');
 }
}catch(error){console.error(error.message);process.exit(1);}
const salt=randomBytes(16);
const hash=`pbkdf2:100000:${salt.toString('base64')}:${pbkdf2Sync(password,salt,100000,32,'sha256').toString('base64')}`;
console.log((custom?'입력한 비밀번호로 설정값을 만들었습니다.':'관리자 비밀번호 (안전한 비밀번호 보관함에 저장):\n'+password)+'\n\nCloudflare Secret DASHBOARD_PASSWORD_HASH:\n'+hash+'\n\n이 출력은 Git 또는 채팅에 올리지 마세요.');
