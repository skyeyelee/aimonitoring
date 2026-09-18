export function geminiError(status:number,body:unknown,key:string){
 const error=(body as {error?:{message?:unknown;status?:unknown}})?.error;
 const message=typeof error?.message==='string'?error.message:'';
 const safe=message.split(key||'__unused__').join('[비공개]').replace(/AIza[\w-]+/g,'[비공개]').replace(/[\r\n]+/g,' ').slice(0,600);
 const hint=/no longer available to new users/i.test(message)?'이 모델은 현재 계정에서 신규 사용이 제한됩니다. 연결 관리에서 사용 가능한 모델로 변경하세요.':status===404?'모델 이름 또는 계정의 모델 사용 가능 여부를 확인하세요.':status===429?'API 사용량·결제 한도를 확인하세요.':status===401||status===403?'API 키와 계정 권한을 확인하세요.':'Google API 요청 설정을 확인하세요.';
 return `Gemini 요청 실패 (${status}). ${hint}${safe?' Google: '+safe:''}`;
}
