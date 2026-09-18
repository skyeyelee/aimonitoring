import {randomBytes,pbkdf2Sync} from 'node:crypto';
// Generate credentials locally; never write them into a tracked file or shell command.
const password=randomBytes(24).toString('base64url'),salt=randomBytes(16);
const hash=`pbkdf2:100000:${salt.toString('base64')}:${pbkdf2Sync(password,salt,100000,32,'sha256').toString('base64')}`;
console.log('관리자 비밀번호 (안전한 비밀번호 보관함에 저장):\n'+password+'\n\nCloudflare Secret DASHBOARD_PASSWORD_HASH:\n'+hash+'\n\n이 출력은 Git 또는 채팅에 올리지 마세요.');
