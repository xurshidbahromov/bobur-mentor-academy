// src/data/universities.js
// Ma'lumotlar manbalari: mandat.uzbmb.uz, abt.uz, oliygoh.uz — 2024/2025 o'quv yili qabul natijalari
import { EXTRA_UNIVERSITIES } from './universities_extra.js'

export const DATA_YEAR = '2024/2025'
export const STUDY_TYPES = ['Kunduzgi', 'Kechki', 'Sirtqi', 'Masofaviy']
export const LANGUAGES = ["O'zbek", 'Rus', "Qoraqalpoq"]
export const UNIVERSITY_TYPES = ['Davlat', 'Nodavlat', 'Xorijiy']
export const SUBJECT_BLOCKS = {
  math_phys: 'Matematika, Fizika, Informatika',
  math_chem: 'Matematika, Kimyo, Biologiya',
  bio_chem:  'Kimyo, Biologiya, Geografiya',
  lang_hist: "O'zbek tili, Tarix, Geografiya",
  lang_lit:  "O'zbek tili, Adabiyot, Tarix",
  math_econ: "Matematika, Iqtisodiyot, Tarix",
  math_chem_phys: "Matematika, Fizika, Kimyo",
}
export const REGIONS = [
  'Toshkent','Samarqand','Buxoro',"Farg'ona",'Andijon','Namangan',
  'Qashqadaryo','Surxondaryo','Xorazm','Jizzax','Sirdaryo',"Qoraqalpog'iston",'Navoiy',
]
const sp = (id, name, block, grant, contract, price) =>
  ({ id, name, block, grant, contract, price, gSeats: 20, cSeats: 30 })

export const UNIVERSITIES = [
  // ── TOSHKENT ──────────────────────────────────────────────────────────────
  { id:'nuuz', name:"O'zbekiston Milliy Universiteti", short:'NUUz', region:'Toshkent', icon:'🎓', color:'#1D4ED8', website:'nuu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('cs','Kompyuter ilmlari va dasturlash','math_phys',158.2,96.5,8_150_000),
      sp('ai','Axborot xavfsizligi','math_phys',151.5,70.3,8_150_000),
      sp('math','Amaliy matematika','math_phys',145.7,82.2,7_400_000),
      sp('econ','Iqtisodiyot','math_econ',173.1,141.0,10_500_000),
      sp('law','Yurisprudensiya','lang_hist',168.5,142.8,11_250_000),
      sp('chem','Kimyo','math_chem',142.3,78.6,7_400_000),
      sp('bio','Biologiya','bio_chem',138.6,75.4,7_400_000),
      sp('phys','Fizika','math_phys',140.1,72.8,7_400_000),
      sp('hist','Tarix','lang_hist',148.3,112.5,7_400_000),
    ] },

  { id:'tatu', name:'Muhammad al-Xorazmiy nomidagi TATU', short:'TATU', region:'Toshkent', icon:'💻', color:'#7C3AED', website:'tuit.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi','Masofaviy'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('se',"Dasturiy injiniring",'math_phys',162.5,118.8,14_000_000),
      sp('ai',"Sun'iy intellekt",'math_phys',159.4,105.1,14_000_000),
      sp('cs2','Kompyuter muhandisligi','math_phys',155.8,98.3,14_000_000),
      sp('ib','Axborot xavfsizligi','math_phys',152.6,92.7,14_000_000),
      sp('tele','Telekommunikatsiya','math_phys',148.2,88.4,12_000_000),
      sp('is','Axborot tizimlari','math_phys',145.3,85.6,14_000_000),
      sp('econ','Iqtisodiyot','math_econ',155.2,115.4,18_000_000),
    ] },

  { id:'tdtu', name:"Islom Karimov nomidagi Toshkent Davlat Texnika Universiteti", short:'TDTU', region:'Toshkent', icon:'⚙️', color:'#B45309', website:'tdtu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('mech','Mexanika muhandisligi','math_phys',78.8,58.2,12_075_000),
      sp('oil','Neft va gaz ishi','math_chem_phys',75.5,58.0,12_075_000),
      sp('oiltech','Neft-gaz qayta ishlash texnologiyasi','math_chem_phys',68.1,58.9,12_075_000),
      sp('tech','Texnologik mashinalar va jihozlar','math_phys',100.7,57.7,12_075_000),
      sp('auto','Transport vositalari muhandisligi','math_phys',90.6,57.1,12_075_000),
      sp('elec','Elektr muhandisligi','math_phys',82.4,58.5,12_075_000),
      sp('civil','Qurilish muhandisligi','math_chem_phys',85.3,57.8,12_075_000),
      sp('energo','Energetika muhandisligi','math_phys',75.6,57.5,12_075_000),
    ] },

  { id:'tta', name:'Toshkent Tibbiyot Akademiyasi', short:'TTA', region:'Toshkent', icon:'🏥', color:'#059669', website:'tma.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('med','Davolash ishi','bio_chem',180.5,161.3,19_000_000),
      sp('ped','Pediatriya','bio_chem',174.2,155.8,17_500_000),
      sp('pharm','Farmatsiya','bio_chem',168.5,148.2,16_000_000),
      sp('sog','Jamoat salomatligi','bio_chem',162.8,138.5,15_000_000),
    ] },

  { id:'tdsi', name:"Toshkent Davlat Stomatologiya Instituti", short:'TDSI', region:'Toshkent', icon:'🦷', color:'#0D9488', website:'tdsi.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('stom','Stomatologiya','bio_chem',172.1,154.1,22_000_000),
    ] },

  { id:'tdiu', name:'Toshkent Davlat Iqtisodiyot Universiteti', short:'TDIU', region:'Toshkent', icon:'📊', color:'#0891B2', website:'tsue.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi','Masofaviy'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('jecon','Jahon iqtisodiyoti','math_econ',180.4,157.2,15_000_000),
      sp('econ','Iqtisodiyot','math_econ',178.6,154.1,12_000_000),
      sp('bank','Bank ishi','math_econ',174.7,141.7,12_000_000),
      sp('acc','Buxgalteriya hisobi','math_econ',169.1,137.7,10_000_000),
      sp('mgmt','Menejment','math_econ',169.1,134.8,10_000_000),
      sp('fin','Moliya','math_econ',172.3,142.5,12_000_000),
      sp('mktg','Marketing','math_econ',165.8,128.5,10_000_000),
    ] },

  { id:'tsul', name:'Toshkent Davlat Yuridik Universiteti', short:'TDYU', region:'Toshkent', icon:'⚖️', color:'#1D4ED8', website:'tsul.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('gov',"Davlat va jamiyat boshqaruvi",'lang_hist',187.9,183.5,18_000_000),
      sp('law',"Yurisprudensiya (davlat-huquqiy)",'lang_hist',181.3,170.7,15_000_000),
      sp('intlaw','Xalqaro huquq','lang_hist',183.5,175.3,16_000_000),
      sp('criminal','Jinoyat huquqi','lang_hist',178.8,165.2,15_000_000),
    ] },

  { id:'taqi', name:'Toshkent Arxitektura-Qurilish Universiteti', short:'TAQU', region:'Toshkent', icon:'🏛️', color:'#DC2626', website:'taqu.edu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('arch','Arxitektura','math_phys',128.5,72.4,12_869_000),
      sp('civil2','Binolar qurilishi','math_chem_phys',98.3,62.8,8_950_000),
      sp('dizayn','Dizayn','math_phys',135.2,85.6,12_869_000),
      sp('env','Atrof-muhit muhandisligi','math_chem_phys',88.5,60.2,8_950_000),
    ] },

  { id:'tdpu', name:'Toshkent Davlat Pedagogika Universiteti', short:'TDPU', region:'Toshkent', icon:'📚', color:'#7C3AED', website:'tdpu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('math_t',"Matematika o'qituvchisi",'math_phys',132.5,78.4,7_400_000),
      sp('eng_t',"Ingliz tili o'qituvchisi",'lang_lit',168.2,135.8,7_400_000),
      sp('hist_t',"Tarix o'qituvchisi",'lang_hist',128.4,72.5,7_400_000),
      sp('bio_t',"Biologiya o'qituvchisi",'bio_chem',125.8,68.9,7_400_000),
      sp('fizika_t',"Fizika o'qituvchisi",'math_phys',118.6,65.3,7_400_000),
      sp('kimyo_t',"Kimyo o'qituvchisi",'math_chem',122.4,67.2,7_400_000),
    ] },

  { id:'tdshu', name:'Toshkent Davlat Sharqshunoslik Universiteti', short:'TDSHU', region:'Toshkent', icon:'🌐', color:'#0F766E', website:'tsuos.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('orient','Sharqshunoslik','lang_lit',162.5,128.4,12_000_000),
      sp('intrel','Xalqaro munosabatlar','lang_hist',175.8,152.6,14_000_000),
      sp('turk','Turkiy filologiya','lang_lit',148.3,108.5,10_000_000),
    ] },

  { id:'uwed', name:"Jahon iqtisodiyoti va diplomatiya universiteti", short:'UWED', region:'Toshkent', icon:'🌍', color:'#1D4ED8', website:'uwed.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('intrel2','Xalqaro munosabatlar','lang_hist',185.2,172.8,16_000_000),
      sp('intlaw2','Xalqaro huquq','lang_hist',182.5,168.4,15_000_000),
      sp('jecon2','Jahon iqtisodiyoti','math_econ',178.8,162.5,14_000_000),
      sp('dipl','Diplomatiya','lang_hist',186.5,175.2,16_000_000),
    ] },

  { id:'tiqxmi', name:"Toshkent Irrigatsiya va Qishloq Xo'jaligi Muhandisligi Instituti", short:'TIQXMI', region:'Toshkent', icon:'🌾', color:'#16A34A', website:'tiiame.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('irr','Irrigatsiya muhandisligi','math_phys',85.2,58.4,8_500_000),
      sp('agro','Agronomiya','bio_chem',92.5,62.8,8_500_000),
      sp('melior',"Melioratsiya va suv xo'jaligi",'math_phys',78.6,57.5,8_500_000),
    ] },

  { id:'tdtu2', name:"Toshkent Davlat Transport Universiteti", short:"ToshDTU", region:'Toshkent', icon:'🚂', color:'#1E40AF', website:'tstu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('rail',"Temir yo'l muhandisligi",'math_phys',95.8,62.4,10_000_000),
      sp('log','Logistika','math_econ',115.6,82.5,10_000_000),
      sp('avtoyol',"Avtomobil yo'llari va aerodrumlar",'math_phys',82.4,58.8,10_000_000),
    ] },

  { id:'tkti', name:"Toshkent Kimyo-Texnologiya Instituti", short:'TKTI', region:'Toshkent', icon:'⚗️', color:'#B45309', website:'tkti.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('chem_eng','Kimyoviy texnologiya','math_chem',108.5,68.4,10_000_000),
      sp('food','Oziq-ovqat texnologiyasi','bio_chem',115.2,75.8,10_000_000),
      sp('polymer','Polimer materiallari texnologiyasi','math_chem',95.6,62.5,10_000_000),
    ] },

  { id:'tmi', name:'Toshkent Muhandislik Instituti', short:'TMI', region:'Toshkent', icon:'🔧', color:'#EA580C', website:'tmi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('ind','Sanoat muhandisligi','math_phys',105.4,68.5,12_000_000),
      sp('it','Axborot texnologiyalari','math_phys',125.8,82.6,14_000_000),
    ] },

  { id:'uzjtu', name:"O'zbekiston Davlat Jahon Tillari Universiteti", short:'UzDJTU', region:'Toshkent', icon:'🌐', color:'#1D4ED8', website:'uzswlu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('eng',"Ingliz tili va adabiyoti",'lang_lit',182.5,165.8,12_000_000),
      sp('fr',"Fransuz tili",'lang_lit',168.2,138.5,10_000_000),
      sp('de',"Nemis tili",'lang_lit',165.4,132.8,10_000_000),
      sp('tarjima',"Tarjima nazariyasi va amaliyoti",'lang_lit',175.8,155.2,12_000_000),
    ] },

  { id:'tdau', name:"Toshkent Davlat Agrar Universiteti", short:'TDAU', region:'Toshkent', icon:'🌿', color:'#16A34A', website:'tdau.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('agro2','Agronomiya','bio_chem',105.8,68.4,8_500_000),
      sp('vet','Veterinariya','bio_chem',112.5,72.8,9_000_000),
      sp('yersoz',"Yer tuzish va yer kadastri",'math_phys',98.6,62.5,8_500_000),
    ] },

  { id:'cspi', name:"Chirchiq Davlat Pedagogika Universiteti", short:'CSPI', region:'Toshkent', icon:'📚', color:'#7C3AED', website:'cspi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('math_t2',"Matematika o'qituvchisi",'math_phys',118.5,68.2,7_400_000),
      sp('eng_t2',"Ingliz tili o'qituvchisi",'lang_lit',148.6,108.5,7_400_000),
      sp('boshlangich',"Boshlang'ich ta'lim",'lang_lit',135.2,92.8,7_400_000),
    ] },

  { id:'jtsu', name:"O'zbekiston Jismoniy Tarbiya va Sport Universiteti", short:'JTSU', region:'Toshkent', icon:'🏋️', color:'#059669', website:'jtsu.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('sport',"Jismoniy tarbiya",'bio_chem',115.8,72.5,8_000_000),
      sp('sportmgmt',"Sport menejment",'math_econ',125.4,85.6,9_000_000),
    ] },

  // ── Xorijiy universitetlar Toshkentda ──
  { id:'westminster', name:"Toshkent Xalqaro Vestminster Universiteti", short:'WIUT', region:'Toshkent', icon:'🇬🇧', color:'#1D4ED8', website:'westminster.uz', type:'Xorijiy',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('bba','Biznes boshqaruvi','math_econ',178.5,162.8,48_000_000),
      sp('itle','IT va kompyuter fanlari','math_phys',175.2,158.4,48_000_000),
      sp('econ_w','Iqtisodiyot','math_econ',172.8,155.6,48_000_000),
    ] },

  { id:'inha', name:"Toshkent shahridagi Inha Universiteti", short:'INHA', region:'Toshkent', icon:'🇰🇷', color:'#0F766E', website:'inha.uz', type:'Xorijiy',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('cse','Kompyuter fanlari','math_phys',168.5,145.2,35_000_000),
      sp('ds','Ma\'lumotlar fanlari','math_phys',165.2,138.8,35_000_000),
      sp('mgmt_i','Menejment','math_econ',158.6,128.5,32_000_000),
    ] },

  { id:'polito', name:"Turin Politexnika Universiteti Toshkent filiali", short:'POLITO', region:'Toshkent', icon:'🇮🇹', color:'#0F766E', website:'polito.uz', type:'Xorijiy',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('mech_p','Mexanika muhandisligi','math_phys',155.8,128.4,28_000_000),
      sp('ener_p','Energetika muhandisligi','math_phys',148.5,118.6,28_000_000),
    ] },

  // ── SAMARQAND ──────────────────────────────────────────────────────────────
  { id:'samdu', name:'Samarqand Davlat Universiteti', short:'SamDU', region:'Samarqand', icon:'🕌', color:'#059669', website:'samdu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('cs','Kompyuter ilmlari','math_phys',142.5,88.6,10_500_000),
      sp('se','Dasturiy injiniring','math_phys',138.2,65.2,10_500_000),
      sp('math','Amaliy matematika','math_phys',128.5,72.4,8_500_000),
      sp('econ','Iqtisodiyot','math_econ',148.6,112.8,10_000_000),
      sp('law','Huquqshunoslik','lang_hist',152.8,118.5,10_500_000),
      sp('hist','Tarix','lang_hist',132.5,92.4,8_000_000),
      sp('bio','Biotexnologiya','bio_chem',118.4,78.5,9_000_000),
      sp('eng','Ingliz tili','lang_lit',165.8,138.2,9_000_000),
    ] },

  { id:'samdtu', name:'Samarqand Davlat Tibbiyot Universiteti', short:'SamDTU', region:'Samarqand', icon:'⚕️', color:'#DC2626', website:'samdmu.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('med','Davolash ishi','bio_chem',172.5,148.6,18_000_000),
      sp('ped','Pediatriya','bio_chem',168.2,142.5,16_500_000),
      sp('stom','Stomatologiya','bio_chem',170.8,152.4,20_000_000),
      sp('pharm','Farmatsiya','bio_chem',158.4,128.5,14_000_000),
    ] },

  { id:'samqxi', name:"Samarqand Qishloq Xo'jaligi Instituti", short:'SamQXI', region:'Samarqand', icon:'🌿', color:'#15803D', website:'samqxi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('agro','Agronomiya','bio_chem',106.9,68.5,8_000_000),
      sp('vet','Veterinariya','bio_chem',112.4,75.8,8_500_000),
      sp('qx',"Qishloq xo'jaligi mahsulotlari texnologiyasi",'bio_chem',98.5,62.4,8_000_000),
    ] },

  { id:'silkroad', name:"Ipak yo'li turizm va madaniy meros xalqaro universiteti", short:'ITMMU', region:'Samarqand', icon:'🏛️', color:'#B45309', website:'univ-silkroad.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('turizm','Turizm','lang_hist',145.8,108.5,12_000_000),
      sp('madaniy',"Madaniy meros",'lang_hist',132.5,88.4,10_000_000),
    ] },

  // ── BUXORO ──────────────────────────────────────────────────────────────
  { id:'buxdu', name:'Buxoro Davlat Universiteti', short:'BuxDU', region:'Buxoro', icon:'🏰', color:'#B45309', website:'buxdu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('eng','Ingliz tili','lang_lit',177.2,148.5,9_000_000),
      sp('cs','Kompyuter ilmlari','math_phys',138.6,82.4,10_000_000),
      sp('econ','Iqtisodiyot','math_econ',134.6,98.5,9_500_000),
      sp('law','Huquqshunoslik','lang_hist',142.8,108.2,10_000_000),
      sp('hist','Tarix','lang_hist',119.1,78.5,8_000_000),
      sp('math','Matematika','math_phys',122.4,72.5,8_000_000),
    ] },

  { id:'buxmti', name:"Buxoro Muhandislik-Texnologiya Instituti", short:'BuxMTI', region:'Buxoro', icon:'⚗️', color:'#A16207', website:'buxmti.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('chem_eng','Kimyo muhandisligi','math_chem',98.5,62.4,9_000_000),
      sp('textile',"To'qimachilik",'math_phys',85.6,58.2,8_500_000),
      sp('oziq','Oziq-ovqat texnologiyasi','bio_chem',92.4,60.8,8_500_000),
    ] },

  { id:'bsmi', name:"Buxoro Davlat Tibbiyot Instituti", short:'BuxDTI', region:'Buxoro', icon:'🏥', color:'#DC2626', website:'bsmi.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('med','Davolash ishi','bio_chem',165.8,138.5,16_000_000),
      sp('ped','Pediatriya','bio_chem',158.4,128.6,14_500_000),
      sp('pharm','Farmatsiya','bio_chem',148.5,112.4,12_000_000),
    ] },

  // ── FARG'ONA ──────────────────────────────────────────────────────────────
  { id:'fardu', name:"Farg'ona Davlat Universiteti", short:'FarDU', region:"Farg'ona", icon:'🏫', color:'#0891B2', website:'fdu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('math','Amaliy matematika','math_phys',141.8,117.6,9_000_000),
      sp('cs','Kompyuter ilmlari','math_phys',135.8,88.5,10_000_000),
      sp('econ','Iqtisodiyot','math_econ',128.5,92.4,9_500_000),
      sp('eng','Ingliz tili','lang_lit',162.8,135.4,9_000_000),
      sp('agro','Agrokimyo va tuproqshunoslik','bio_chem',106.9,68.5,8_000_000),
      sp('pharm','Farmatsiya','bio_chem',145.2,112.8,14_000_000),
    ] },

  { id:'farpi', name:"Farg'ona Politexnika Instituti", short:'FarPI', region:"Farg'ona", icon:'🏭', color:'#7C3AED', website:'ferpi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('ind','Sanoat muhandisligi','math_phys',92.5,60.4,9_000_000),
      sp('elec','Elektrotexnika','math_phys',88.4,58.6,9_000_000),
      sp('it','Axborot texnologiyalari','math_phys',118.5,78.4,10_000_000),
    ] },

  { id:'fjsti', name:"Farg'ona Jamoat Salomatligi Tibbiyot Instituti", short:'FJSTI', region:"Farg'ona", icon:'🏥', color:'#DC2626', website:'fjsti.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('med','Davolash ishi','bio_chem',162.4,135.8,15_000_000),
      sp('ped','Pediatriya','bio_chem',155.8,125.4,14_000_000),
      sp('stom','Stomatologiya','bio_chem',158.6,132.5,16_000_000),
    ] },

  // ── ANDIJON ──────────────────────────────────────────────────────────────
  { id:'anddu', name:'Andijon Davlat Universiteti', short:'AndDU', region:'Andijon', icon:'🌿', color:'#059669', website:'adu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('eng','Ingliz tili','lang_lit',185.9,168.8,9_000_000),
      sp('cs','Kompyuter ilmlari','math_phys',132.5,82.4,10_000_000),
      sp('econ','Iqtisodiyot','math_econ',125.8,88.5,9_500_000),
      sp('math','Amaliy matematika','math_phys',99.8,65.4,8_000_000),
      sp('bio','Biologiya','bio_chem',108.5,72.8,8_000_000),
    ] },

  { id:'andti', name:'Andijon Davlat Tibbiyot Instituti', short:'AnDTI', region:'Andijon', icon:'🏥', color:'#DC2626', website:'andmi.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('med','Davolash ishi','bio_chem',168.5,142.8,16_000_000),
      sp('ped','Pediatriya','bio_chem',162.4,135.6,14_500_000),
      sp('pharm','Farmatsiya','bio_chem',152.5,118.4,12_000_000),
    ] },

  { id:'andmi', name:'Andijon Mashinasozlik Instituti', short:'AndMI', region:'Andijon', icon:'⚙️', color:'#EA580C', website:'ami.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('mech','Mashinasozlik','math_phys',85.6,58.4,9_000_000),
      sp('auto','Avtomobilsozlik','math_phys',92.8,62.5,9_500_000),
      sp('elec','Elektrotexnika','math_phys',82.4,57.8,9_000_000),
    ] },

  // ── NAMANGAN ──────────────────────────────────────────────────────────────
  { id:'namdu', name:'Namangan Davlat Universiteti', short:'NamDU', region:'Namangan', icon:'🌸', color:'#7C3AED', website:'namdu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('cs','Kompyuter ilmlari','math_phys',128.5,82.4,9_500_000),
      sp('math','Amaliy matematika','math_phys',106.0,68.5,8_000_000),
      sp('econ','Iqtisodiyot','math_econ',118.5,85.6,9_000_000),
      sp('law','Huquqshunoslik','lang_hist',132.8,98.4,9_500_000),
      sp('eng','Ingliz tili','lang_lit',155.8,125.4,8_500_000),
    ] },

  { id:'nammti', name:'Namangan Muhandislik-Texnologiya Instituti', short:'NamMTI', region:'Namangan', icon:'🏭', color:'#B45309', website:'nammti.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('textile',"To'qimachilik",'math_phys',82.4,58.2,8_000_000),
      sp('food','Oziq-ovqat texnologiyasi','bio_chem',88.5,62.4,8_000_000),
      sp('mech','Mexanika muhandisligi','math_phys',78.6,57.5,8_000_000),
    ] },

  { id:'namdtu', name:"Namangan Davlat Texnika Universiteti", short:'NamDTU', region:'Namangan', icon:'⚙️', color:'#B45309', website:'namdtu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('elec','Elektrotexnika','math_phys',88.5,58.8,8_500_000),
      sp('it','Axborot texnologiyalari','math_phys',115.8,78.4,9_500_000),
      sp('energo','Energetika','math_phys',82.4,57.6,8_500_000),
    ] },

  // ── QASHQADARYO ──────────────────────────────────────────────────────────────
  { id:'qardu', name:'Qarshi Davlat Universiteti', short:'QarDU', region:'Qashqadaryo', icon:'🌄', color:'#B45309', website:'qardu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('cs','Kompyuter ilmlari','math_phys',122.5,78.4,9_000_000),
      sp('econ','Iqtisodiyot','math_econ',112.8,82.5,8_500_000),
      sp('eng','Ingliz tili','lang_lit',152.4,118.5,8_500_000),
      sp('law','Huquqshunoslik','lang_hist',128.5,92.4,9_000_000),
      sp('math','Matematika','math_phys',98.5,65.4,8_000_000),
    ] },

  { id:'qarmei', name:"Qarshi Muhandislik-Iqtisodiyot Instituti", short:'QarMEI', region:'Qashqadaryo', icon:'🔩', color:'#92400E', website:'qmei.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('econ2','Iqtisodiyot','math_econ',98.5,68.4,8_000_000),
      sp('ind','Sanoat muhandisligi','math_phys',85.6,58.2,8_000_000),
      sp('oil','Neft-gaz muhandisligi','math_phys',92.4,62.5,9_000_000),
    ] },

  { id:'kstu', name:"Qarshi Davlat Texnika Universiteti", short:'QDTU', region:'Qashqadaryo', icon:'⚙️', color:'#B45309', website:'kstu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('mech','Mashinasozlik','math_phys',82.4,57.8,8_500_000),
      sp('elec','Elektrotexnika','math_phys',78.5,57.2,8_500_000),
      sp('it','Axborot texnologiyalari','math_phys',108.5,72.4,9_500_000),
    ] },

  // ── SURXONDARYO ──────────────────────────────────────────────────────────────
  { id:'terdu', name:'Termiz Davlat Universiteti', short:'TerDU', region:'Surxondaryo', icon:'☀️', color:'#DC2626', website:'termsu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('cs','Kompyuter ilmlari','math_phys',118.5,75.4,9_000_000),
      sp('econ','Iqtisodiyot','math_econ',108.5,78.4,8_500_000),
      sp('bio','Biologiya','bio_chem',98.5,65.4,8_000_000),
      sp('eng','Ingliz tili','lang_lit',148.5,112.8,8_500_000),
    ] },

  { id:'dtpi', name:"Denov Tadbirkorlik va Pedagogika Instituti", short:'DTPI', region:'Surxondaryo', icon:'📖', color:'#059669', website:'dtpi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('math_t',"Matematika o'qituvchisi",'math_phys',102.4,62.5,7_400_000),
      sp('eng_t',"Ingliz tili o'qituvchisi",'lang_lit',135.8,95.4,7_400_000),
      sp('boshlangich',"Boshlang'ich ta'lim",'lang_lit',118.5,78.4,7_400_000),
    ] },

  // ── XORAZM ──────────────────────────────────────────────────────────────
  { id:'urdu', name:'Urganch Davlat Universiteti', short:'UrDU', region:'Xorazm', icon:'🦅', color:'#0891B2', website:'urdu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('cs','Kompyuter ilmlari','math_phys',125.8,78.5,9_000_000),
      sp('econ','Iqtisodiyot','math_econ',115.4,82.5,8_500_000),
      sp('law','Huquqshunoslik','lang_hist',122.5,88.4,9_000_000),
      sp('eng','Ingliz tili','lang_lit',155.2,122.4,8_500_000),
      sp('math','Matematika','math_phys',105.8,68.4,8_000_000),
    ] },

  { id:'xma', name:"Xorazm Ma'mun Akademiyasi", short:'XMA', region:'Xorazm', icon:'📜', color:'#0F766E', website:'marun.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('math','Matematika','math_phys',135.8,85.6,9_000_000),
      sp('phys','Fizika','math_phys',128.5,78.4,9_000_000),
      sp('cs','Kompyuter ilmlari','math_phys',138.5,92.4,9_500_000),
    ] },

  // ── NAVOIY ──────────────────────────────────────────────────────────────
  { id:'navdu', name:'Navoiy Davlat Universiteti', short:'NavDU', region:'Navoiy', icon:'📖', color:'#059669', website:'nspi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('math_t',"Matematika o'qituvchisi",'math_phys',108.5,65.4,7_400_000),
      sp('eng_t',"Ingliz tili o'qituvchisi",'lang_lit',138.5,98.4,7_400_000),
      sp('cs','Kompyuter ilmlari','math_phys',115.8,72.5,9_000_000),
    ] },

  { id:'navdki', name:"Navoiy Davlat Konchilik va Texnologiyalar Universiteti", short:'NavDKI', region:'Navoiy', icon:'⛏️', color:'#78350F', website:'ndki.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('mining','Konchilik','math_phys',105.8,68.4,10_000_000),
      sp('geo','Geologiya','math_phys',98.5,62.5,9_500_000),
      sp('metallurgiya','Metallurgiya','math_phys',92.4,60.8,9_500_000),
    ] },

  // ── JIZZAX ──────────────────────────────────────────────────────────────
  { id:'jdpu', name:'Jizzax Davlat Pedagogika Universiteti', short:'JDPU', region:'Jizzax', icon:'📝', color:'#7C3AED', website:'jdpu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('math_t',"Matematika o'qituvchisi",'math_phys',105.8,62.4,7_400_000),
      sp('bio_t',"Biologiya o'qituvchisi",'bio_chem',98.5,60.2,7_400_000),
      sp('hist_t',"Tarix o'qituvchisi",'lang_hist',95.4,58.8,7_400_000),
      sp('eng_t',"Ingliz tili o'qituvchisi",'lang_lit',132.5,92.8,7_400_000),
    ] },

  { id:'jizpi', name:"Jizzax Politexnika Instituti", short:'JizzPI', region:'Jizzax', icon:'⚙️', color:'#B45309', website:'jizpi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('mech','Mashinasozlik','math_phys',82.5,57.8,8_000_000),
      sp('elec','Elektrotexnika','math_phys',78.4,57.2,8_000_000),
      sp('it','Axborot texnologiyalari','math_phys',105.4,68.5,9_000_000),
    ] },

  // ── SIRDARYO ──────────────────────────────────────────────────────────────
  { id:'guldu', name:'Guliston Davlat Universiteti', short:'GulDU', region:'Sirdaryo', icon:'🌱', color:'#059669', website:'guldu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[
      sp('cs','Kompyuter ilmlari','math_phys',108.5,68.4,8_500_000),
      sp('econ','Iqtisodiyot','math_econ',98.5,65.8,8_000_000),
      sp('eng','Ingliz tili','lang_lit',142.5,105.8,8_000_000),
      sp('agro','Agronomiya','bio_chem',88.4,60.2,7_500_000),
    ] },

  // ── QORAQALPOG'ISTON ──────────────────────────────────────────────────────
  { id:'qarqdu', name:"Berdax nomidagi Qoraqalpog'iston Davlat Universiteti", short:"QarQDU", region:"Qoraqalpog'iston", icon:'🌊', color:'#1D4ED8', website:'karsu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus',"Qoraqalpoq"],
    specialties:[
      sp('cs','Kompyuter ilmlari','math_phys',112.5,72.4,8_500_000),
      sp('econ','Iqtisodiyot','math_econ',102.5,68.5,8_000_000),
      sp('law','Huquqshunoslik','lang_hist',108.5,78.4,8_500_000),
      sp('eng','Ingliz tili','lang_lit',145.8,108.5,8_000_000),
      sp('med','Tibbiyot','bio_chem',148.5,115.4,12_000_000),
    ] },

  { id:'nukusstu', name:"Nukus Davlat Texnika Universiteti", short:'NukSTU', region:"Qoraqalpog'iston", icon:'⚙️', color:'#B45309', website:'nukusstu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus',"Qoraqalpoq"],
    specialties:[
      sp('mech','Mashinasozlik','math_phys',78.5,57.4,8_000_000),
      sp('elec','Elektrotexnika','math_phys',75.8,57.2,8_000_000),
      sp('it','Axborot texnologiyalari','math_phys',98.5,65.4,8_500_000),
    ] },

  { id:'kkmi', name:"Qoraqalpog'iston Tibbiyot Instituti", short:'KkMI', region:"Qoraqalpog'iston", icon:'🏥', color:'#DC2626', website:'kkmeduniver.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus',"Qoraqalpoq"],
    specialties:[
      sp('med','Davolash ishi','bio_chem',155.8,125.4,14_000_000),
      sp('ped','Pediatriya','bio_chem',148.5,118.6,12_500_000),
    ] },
]

export const ALL_UNIVERSITIES = [...UNIVERSITIES, ...EXTRA_UNIVERSITIES]
