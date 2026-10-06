import type {Provider} from './model';

export function usesCountryScenario(provider:Provider,country:string){
 return provider==='gemini'||(provider==='claude'&&country==='MN');
}
export function countryMethod(provider:Provider,country:string){
 return usesCountryScenario(provider,country)?'질문 시나리오':'검색 위치 설정';
}
