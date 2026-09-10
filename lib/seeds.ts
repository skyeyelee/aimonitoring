import type {Question} from './model';
const groups=[
 {language:'한국어',countries:['KR'],texts:['스마일라식으로 유명한 병원이 어디 있나?','부산에서 스마일라식 상담을 받을 수 있는 안과는?','서울에서 ICL 수술을 상담받을 수 있는 안과는?','한국에서 라식 수술 비용을 비교하려면 무엇을 확인해야 하나?','한국에서 시력교정수술 후 해외로 돌아가면 사후 관리는 어떻게 하나?']},
 {language:'영어',countries:['US','CA','AU'],texts:['Which clinics in Korea are known for SMILE laser eye surgery?','Which eye clinics in Busan offer SMILE surgery consultations?','Which clinics in Seoul offer ICL surgery consultations?','What should I check when comparing LASIK surgery costs in Korea?','How can international patients arrange follow-up care after vision correction surgery in Korea?']},
 {language:'중국어 간체',countries:['CN'],texts:['韩国有哪些以SMILE全飞秒激光近视手术闻名的眼科医院？','釜山有哪些眼科医院提供SMILE手术咨询？','首尔哪些眼科医院可以咨询ICL晶体植入手术？','比较韩国LASIK手术费用时应该确认哪些事项？','在韩国接受视力矫正手术后回国，应该如何安排术后复查？']},
 {language:'중국어 번체',countries:['TW'],texts:['韓國有哪些以SMILE全飛秒雷射近視手術聞名的眼科醫院？','釜山有哪些眼科醫院提供SMILE手術諮詢？','首爾哪些眼科醫院可以諮詢ICL植入手術？','比較韓國LASIK手術費用時應該確認哪些事項？','在韓國接受視力矯正手術後回國，應該如何安排術後追蹤？']},
 {language:'일본어',countries:['JP'],texts:['韓国でSMILEレーシックで知られている眼科はどこですか？','釜山でSMILE手術の相談ができる眼科はどこですか？','ソウルでICL手術の相談ができる眼科はどこですか？','韓国のレーシック手術費用を比較するときに確認すべきことは何ですか？','韓国で視力矯正手術を受けて帰国した後のフォローアップはどうすればよいですか？']},
 {language:'몽골어',countries:['MN'],texts:['Солонгост SMILE хараа засах мэс заслаар алдартай ямар нүдний эмнэлгүүд байдаг вэ?','Бусанд SMILE мэс заслын зөвлөгөө өгдөг ямар нүдний эмнэлгүүд байдаг вэ?','Сөүлд ICL мэс заслын зөвлөгөө авах боломжтой ямар нүдний эмнэлгүүд байдаг вэ?','Солонгос дахь LASIK мэс заслын үнийг харьцуулахдаа юуг анхаарах хэрэгтэй вэ?','Солонгост хараа засах мэс засал хийлгээд эх орондоо буцсаны дараа хяналтын үзлэгийг хэрхэн зохицуулах вэ?']},
];
export const seedQuestions:Question[]=groups.flatMap((g,gi)=>g.texts.map((text,i)=>({id:`Q${gi+1}-${i+1}`,text,language:g.language,keyword:['스마일라식','부산 안과','ICL','라식 비용','해외 사후관리'][i],countries:g.countries,active:1,version:1,branded:0})));
