// Sections follow the supplied KDC chart. Books use three decimal places.
export const KDC_SECTIONS=[
 [['010','도서학·서지학'],['020','문헌정보학'],['030','백과사전'],['040','강연집·수필집'],['050','일반 연속간행물'],['060','일반학회·협회·기관'],['070','신문·언론·저널리즘'],['080','일반 전집·총서'],['090','향토자료']],
 [['110','형이상학'],['120','인식론·인과론·인간학'],['130','철학의 체계'],['140','경학'],['150','동양철학·사상'],['160','서양철학'],['170','논리학'],['180','심리학'],['190','윤리학·도덕철학']],
 [['210','비교종교'],['220','불교'],['230','기독교'],['240','도교'],['250','천도교'],['260','신도'],['270','힌두교·브라만교'],['280','이슬람교'],['290','기타 제종교']],
 [['310','통계학'],['320','경제학'],['330','사회학·사회문제'],['340','정치학'],['350','행정학'],['360','법학'],['370','교육학'],['380','풍속·예절·민속학'],['390','국방·군사학']],
 [['410','수학'],['420','물리학'],['430','화학'],['440','천문학'],['450','지학'],['460','광물학'],['470','생명과학'],['480','식물학'],['490','동물학']],
 [['510','의학'],['520','농업·농학'],['530','공학·공업일반'],['540','건축공학'],['550','기계공학'],['560','전기공학·전자공학'],['570','화학공학'],['580','제조업'],['590','생활과학']],
 [['610','건축술'],['620','조각·조형예술'],['630','공예·장식미술'],['640','서예'],['650','회화·도화'],['660','사진예술'],['670','음악'],['680','연극·영화·대중예술'],['690','오락·스포츠']],
 [['710','한국어'],['720','중국어'],['730','일본어·기타 아시아 제어'],['740','영어'],['750','독일어'],['760','프랑스어'],['770','스페인어·포르투갈어'],['780','이탈리아어'],['790','기타 제어']],
 [['810','한국문학'],['820','중국문학'],['830','일본문학·기타 아시아 문학'],['840','영미문학'],['850','독일문학'],['860','프랑스문학'],['870','스페인·포르투갈문학'],['880','이탈리아문학'],['890','기타 제문학']],
 [['910','아시아'],['920','유럽'],['930','아프리카'],['940','북아메리카'],['950','남아메리카'],['960','오세아니아'],['970','양극지방'],['980','지리'],['990','전기']]
];
export const GUIDE_TOPICS=[
 {subject:'뜨개질',section:'590',title:'처음 뜨는 포근한 목도리',prefix:'592'},
 {subject:'요리와 집안 살림',section:'590',title:'작은 부엌의 생활 요리',prefix:'594'},
 {subject:'텃밭 가꾸기',section:'520',title:'베란다에서 키우는 채소',prefix:'525'},
 {subject:'집을 짓는 방법',section:'540',title:'집 한 채의 건축 이야기',prefix:'542'},
 {subject:'건강과 질병',section:'510',title:'몸을 돌보는 첫 의학',prefix:'511'},
 {subject:'그림 그리기',section:'650',title:'연필로 그리는 오후',prefix:'656'},
 {subject:'피아노와 음악',section:'670',title:'피아노가 들려주는 음악',prefix:'676'},
 {subject:'축구와 운동',section:'690',title:'처음 배우는 축구',prefix:'695'},
 {subject:'영어 공부',section:'740',title:'하루 한 문장 영어',prefix:'747'},
 {subject:'한국어 문법',section:'710',title:'우리말 문법 산책',prefix:'715'},
 {subject:'한국 소설',section:'810',title:'작은 숲의 한국 소설',prefix:'813'},
 {subject:'한국의 역사',section:'910',title:'한국사의 작은 순간들',prefix:'911'},
 {subject:'세계 여행과 지도',section:'980',title:'지도를 펼치는 여행자',prefix:'982'},
 {subject:'별과 우주',section:'440',title:'밤하늘의 별을 찾다',prefix:'443'},
 {subject:'식물과 꽃',section:'480',title:'작은 식물 도감',prefix:'481'},
 {subject:'동물',section:'490',title:'동물들의 하루',prefix:'491'},
 {subject:'경제와 돈',section:'320',title:'처음 만나는 생활 경제',prefix:'327'},
 {subject:'교육과 공부법',section:'370',title:'스스로 공부하는 연습',prefix:'373'},
 {subject:'마음과 심리',section:'180',title:'마음을 읽는 심리학',prefix:'181'},
 {subject:'불교',section:'220',title:'불교의 길을 걷다',prefix:'224'},
 {subject:'도서관과 사서',section:'020',title:'도서관에서 일하는 사람들',prefix:'023'},
 {subject:'사진 찍기',section:'660',title:'빛으로 쓰는 사진',prefix:'662'},
 {subject:'화학 실험',section:'430',title:'안전한 화학 실험실',prefix:'437'},
 {subject:'논리와 생각',section:'170',title:'생각의 논리를 세우다',prefix:'173'},
 {subject:'지역의 옛 이야기',section:'090',title:'우리 동네 향토 기록',prefix:'091'},
 {subject:'철학',section:'160',title:'서양철학의 질문들',prefix:'165'},
 {subject:'종교 비교',section:'210',title:'세계 종교를 읽다',prefix:'211'}
];
export function sectionName(code){return KDC_SECTIONS.flat().find(([c])=>c===code)?.[1]||'총류'}
export function topicForCategory(category,seed=0){let list=GUIDE_TOPICS.filter(t=>Math.floor(Number(t.section)/100)===category);return list[Math.abs(seed)%list.length]}
export function detailedBook(id,category){let digits=Number(id.replace(/\D/g,''))||0,t=topicForCategory(category,digits),decimal=String((digits*37+125)%1000).padStart(3,'0');return {id,category,title:t.title,section:t.section,code:`${t.prefix}.${decimal}`}}
export function sectionOptions(category,correct){let sections=KDC_SECTIONS[category].map(([c])=>c),others=sections.filter(c=>c!==correct);return [correct,...others.slice(0,2)]}
export const EVENTS=[
 {name:'뜨개질 초보의 목도리 구조대',date:'2026년 10월 10일(토) 14:00–16:00',registration:'홈페이지 프로그램 메뉴 접수',capacity:12,place:'1층 문화교실'},
 {name:'책 한 권으로 떠나는 세계 여행',date:'2026년 10월 14일(수) 16:00–17:00',registration:'전화 접수 또는 데스크 방문 접수',capacity:20,place:'1층 전시 공간'},
 {name:'사서와 함께하는 어린이 책 탐험',date:'2026년 10월 17일(토) 10:00–11:30',registration:'홈페이지 선착순 접수',capacity:15,place:'1층 어린이자료실'}
];
