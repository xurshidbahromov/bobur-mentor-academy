// src/data/universities.js
import { EXTRA_UNIVERSITIES } from './universities_extra.js'
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
    specialties:[sp('math','Matematika','math_phys',170,135,16_500_000),sp('cs','Kompyuter ilmlari','math_phys',175,142,19_000_000),sp('chem','Kimyo','math_chem',158,122,14_500_000),sp('bio','Biologiya','bio_chem',155,120,14_000_000),sp('hist','Tarix','lang_hist',148,112,13_000_000),sp('econ','Iqtisodiyot','math_econ',155,125,17_000_000)] },
  { id:'tatu', name:'Toshkent Axborot Texnologiyalari Universiteti', short:'TATU', region:'Toshkent', icon:'💻', color:'#7C3AED', website:'tuit.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Masofaviy'], languages:["O'zbek",'Rus'],
    specialties:[sp('se',"Dasturiy injiniring",'math_phys',178,148,21_000_000),sp('ai',"Sun'iy intellekt",'math_phys',180,150,22_000_000),sp('cs2','Kompyuter muhandisligi','math_phys',175,145,20_000_000),sp('ib','Axborot xavfsizligi','math_phys',172,140,19_500_000),sp('tele','Telekommunikatsiya','math_phys',165,132,18_000_000)] },
  { id:'tdtu', name:'Toshkent Davlat Texnika Universiteti', short:'TDTU', region:'Toshkent', icon:'⚙️', color:'#B45309', website:'tdtu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('mech','Mashinasozlik','math_phys',155,120,14_500_000),sp('civil','Qurilish muhandisligi','math_chem_phys',152,118,14_000_000),sp('elec','Elektrotexnika','math_phys',158,122,15_000_000),sp('oil','Neft-gaz muhandisligi','math_chem_phys',160,125,16_000_000),sp('auto','Avtomobilsozlik','math_phys',148,115,13_500_000)] },
  { id:'tta', name:'Toshkent Tibbiyot Akademiyasi', short:'TTA', region:'Toshkent', icon:'🏥', color:'#059669', website:'tma.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[sp('med','Davolash ishi','bio_chem',178,145,28_000_000),sp('ped','Pediatriya','bio_chem',172,140,26_000_000),sp('stom','Stomatologiya','bio_chem',175,148,30_000_000),sp('pharm','Farmatsiya','bio_chem',168,135,24_000_000)] },
  { id:'tdiu', name:'Toshkent Davlat Iqtisodiyot Universiteti', short:'TDIU', region:'Toshkent', icon:'📊', color:'#0891B2', website:'tdiu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi','Masofaviy'], languages:["O'zbek",'Rus'],
    specialties:[sp('fin','Moliya','math_econ',158,125,18_000_000),sp('acc','Buxgalteriya hisobi','math_econ',150,118,16_000_000),sp('mgmt','Menejment','math_econ',148,115,15_500_000),sp('bank','Bank ishi','math_econ',155,122,17_000_000),sp('mktg','Marketing','math_econ',145,112,15_000_000)] },
  { id:'taqi', name:'Toshkent Arxitektura-Qurilish Instituti', short:'TAQI', region:'Toshkent', icon:'🏛️', color:'#DC2626', website:'taqi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[sp('arch','Arxitektura','math_phys',158,122,16_000_000),sp('civil2','Binolar qurilishi','math_chem_phys',148,115,14_500_000),sp('env','Atrof-muhit muhandisligi','math_chem_phys',142,108,13_500_000)] },
  { id:'tsul', name:'Toshkent Davlat Yuridik Universiteti', short:'TSUL', region:'Toshkent', icon:'⚖️', color:'#1D4ED8', website:'tsul.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('law','Huquqshunoslik','lang_hist',165,130,17_500_000),sp('intlaw','Xalqaro huquq','lang_hist',170,138,19_000_000)] },
  { id:'tdpu', name:'Toshkent Davlat Pedagogika Universiteti', short:'TDPU', region:'Toshkent', icon:'📚', color:'#7C3AED', website:'tdpu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('math_t',"Matematika o'qituvchisi",'math_phys',138,102,11_000_000),sp('eng_t',"Ingliz tili o'qituvchisi",'lang_lit',148,112,12_000_000),sp('hist_t',"Tarix o'qituvchisi",'lang_hist',132,98,10_500_000),sp('bio_t',"Biologiya o'qituvchisi",'bio_chem',135,100,10_500_000)] },
  { id:'tdshu', name:'Toshkent Davlat Sharqshunoslik Universiteti', short:'TDSHU', region:'Toshkent', icon:'🌐', color:'#0F766E', website:'tashgiv.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[sp('orient','Sharqshunoslik','lang_lit',162,128,16_000_000),sp('intrel','Xalqaro munosabatlar','lang_hist',168,135,18_000_000)] },
  { id:'tiqxmi', name:"Toshkent Irrigatsiya va Qishloq Xo'jaligi Muhandisligi Instituti", short:'TIQXMI', region:'Toshkent', icon:'🌾', color:'#16A34A', website:'tiiame.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('irr','Irrigatsiya muhandisligi','math_phys',142,108,12_500_000),sp('agro','Agronomiya','bio_chem',135,102,11_000_000)] },
  { id:'tdtu2', name:"Toshkent Davlat Transport Universiteti", short:"ToshDTU", region:'Toshkent', icon:'🚂', color:'#1E40AF', website:'tstu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('rail',"Temir yo'l muhandisligi",'math_phys',148,115,13_000_000),sp('log','Logistika','math_econ',140,108,12_000_000)] },
  { id:'tmi', name:'Toshkent Muhandislik Instituti', short:'TMI', region:'Toshkent', icon:'🔧', color:'#EA580C', website:'tmi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[sp('ind','Sanoat muhandisligi','math_phys',148,115,13_500_000),sp('it','Axborot texnologiyalari','math_phys',155,120,15_000_000)] },

  // ── SAMARQAND ──────────────────────────────────────────────────────────────
  { id:'samdu', name:'Samarqand Davlat Universiteti', short:'SamDU', region:'Samarqand', icon:'🕌', color:'#059669', website:'samdu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('math','Matematika','math_phys',155,118,13_000_000),sp('cs','Kompyuter ilmlari','math_phys',162,125,15_000_000),sp('econ','Iqtisodiyot','math_econ',142,108,12_500_000),sp('law','Huquqshunoslik','lang_hist',150,115,13_500_000),sp('hist','Tarix','lang_hist',138,104,11_500_000)] },
  { id:'samdtu', name:'Samarqand Davlat Tibbiyot Universiteti', short:'SamDTU', region:'Samarqand', icon:'⚕️', color:'#DC2626', website:'samdmi.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[sp('med','Davolash ishi','bio_chem',165,132,24_000_000),sp('ped','Pediatriya','bio_chem',160,128,22_000_000),sp('stom','Stomatologiya','bio_chem',162,130,26_000_000)] },
  { id:'samqxi', name:"Samarqand Qishloq Xo'jaligi Instituti", short:'SamQXI', region:'Samarqand', icon:'🌿', color:'#15803D', website:'samqxi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('agro','Agronomiya','bio_chem',132,98,10_000_000),sp('vet','Veterinariya','bio_chem',138,105,11_000_000)] },

  // ── BUXORO ──────────────────────────────────────────────────────────────
  { id:'buxdu', name:'Buxoro Davlat Universiteti', short:'BuxDU', region:'Buxoro', icon:'🏰', color:'#B45309', website:'buxdu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('cs','Kompyuter ilmlari','math_phys',148,112,12_000_000),sp('econ','Iqtisodiyot','math_econ',138,104,11_000_000),sp('law','Huquqshunoslik','lang_hist',140,106,11_500_000),sp('hist','Tarix','lang_hist',125,94,10_000_000)] },
  { id:'buxmti', name:"Buxoro Muhandislik-Texnologiya Instituti", short:'BuxMTI', region:'Buxoro', icon:'⚗️', color:'#A16207', website:'buxmti.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[sp('chem_eng','Kimyo muhandisligi','math_chem',140,108,12_000_000),sp('textile',"To'qimachilik",'math_phys',132,100,10_500_000)] },

  // ── FARG'ONA ──────────────────────────────────────────────────────────────
  { id:'fardu', name:"Farg'ona Davlat Universiteti", short:'FarDU', region:"Farg'ona", icon:'🏫', color:'#0891B2', website:'fdu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('cs','Kompyuter ilmlari','math_phys',150,115,12_500_000),sp('math','Matematika','math_phys',142,108,11_500_000),sp('econ','Iqtisodiyot','math_econ',135,102,11_000_000),sp('pharm','Farmatsiya','bio_chem',152,118,18_000_000)] },
  { id:'farpi', name:"Farg'ona Politexnika Instituti", short:'FarPI', region:"Farg'ona", icon:'🏭', color:'#7C3AED', website:'ferpi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('ind','Sanoat muhandisligi','math_phys',138,105,11_000_000),sp('elec','Elektrotexnika','math_phys',142,110,12_000_000)] },

  // ── ANDIJON ──────────────────────────────────────────────────────────────
  { id:'anddu', name:'Andijon Davlat Universiteti', short:'AndDU', region:'Andijon', icon:'🌿', color:'#059669', website:'adu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('cs','Kompyuter ilmlari','math_phys',145,110,12_000_000),sp('econ','Iqtisodiyot','math_econ',132,98,10_500_000),sp('bio','Biologiya','bio_chem',130,96,10_000_000)] },
  { id:'andti', name:'Andijon Davlat Tibbiyot Instituti', short:'AnDTI', region:'Andijon', icon:'🏥', color:'#DC2626', website:'andmi.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[sp('med','Davolash ishi','bio_chem',158,125,22_000_000),sp('ped','Pediatriya','bio_chem',152,120,20_000_000)] },
  { id:'andmi', name:'Andijon Mashinasozlik Instituti', short:'AndMI', region:'Andijon', icon:'⚙️', color:'#EA580C', website:'ami.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[sp('mech','Mashinasozlik','math_phys',138,105,11_500_000),sp('auto','Avtomobilsozlik','math_phys',132,100,10_500_000)] },

  // ── NAMANGAN ──────────────────────────────────────────────────────────────
  { id:'namdu', name:'Namangan Davlat Universiteti', short:'NamDU', region:'Namangan', icon:'🌸', color:'#7C3AED', website:'namdu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('cs','Kompyuter ilmlari','math_phys',148,112,12_000_000),sp('econ','Iqtisodiyot','math_econ',132,98,10_500_000),sp('law','Huquqshunoslik','lang_hist',138,104,11_000_000)] },
  { id:'nammti', name:'Namangan Muhandislik-Texnologiya Instituti', short:'NamMTI', region:'Namangan', icon:'🏭', color:'#B45309', website:'nammti.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[sp('textile',"To'qimachilik",'math_phys',130,98,10_000_000),sp('food','Oziq-ovqat texnologiyasi','bio_chem',128,96,9_500_000)] },

  // ── QASHQADARYO ──────────────────────────────────────────────────────────────
  { id:'qardu', name:'Qarshi Davlat Universiteti', short:'QarDU', region:'Qashqadaryo', icon:'🌄', color:'#B45309', website:'qardu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('cs','Kompyuter ilmlari','math_phys',142,108,11_500_000),sp('econ','Iqtisodiyot','math_econ',128,96,10_000_000),sp('oil','Neft-gaz muhandisligi','math_phys',145,112,13_000_000)] },
  { id:'qarmei', name:"Qarshi Muhandislik-Iqtisodiyot Instituti", short:'QarMEI', region:'Qashqadaryo', icon:'🔩', color:'#92400E', website:'qmei.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[sp('econ2','Iqtisodiyot','math_econ',122,90,9_500_000),sp('ind','Sanoat muhandisligi','math_phys',128,96,10_000_000)] },

  // ── SURXONDARYO ──────────────────────────────────────────────────────────────
  { id:'terdu', name:'Termiz Davlat Universiteti', short:'TerDU', region:'Surxondaryo', icon:'☀️', color:'#DC2626', website:'termsu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('cs','Kompyuter ilmlari','math_phys',138,104,11_000_000),sp('econ','Iqtisodiyot','math_econ',125,94,9_500_000),sp('bio','Biologiya','bio_chem',122,92,9_000_000)] },

  // ── XORAZM ──────────────────────────────────────────────────────────────
  { id:'urdu', name:'Urganch Davlat Universiteti', short:'UrDU', region:'Xorazm', icon:'🦅', color:'#0891B2', website:'urdu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('cs','Kompyuter ilmlari','math_phys',140,105,11_000_000),sp('econ','Iqtisodiyot','math_econ',125,94,9_500_000),sp('law','Huquqshunoslik','lang_hist',130,98,10_000_000)] },
  { id:'xma', name:"Xorazm Ma'mun Akademiyasi", short:'XMA', region:'Xorazm', icon:'📜', color:'#0F766E', website:'marun.uz', type:'Davlat',
    studyTypes:['Kunduzgi'], languages:["O'zbek",'Rus'],
    specialties:[sp('math','Matematika','math_phys',158,122,12_000_000),sp('phys','Fizika','math_phys',152,118,11_500_000)] },

  // ── NAVOIY ──────────────────────────────────────────────────────────────
  { id:'navpi', name:'Navoiy Davlat Pedagogika Instituti', short:'NavPI', region:'Navoiy', icon:'📖', color:'#059669', website:'navpi.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('math_t',"Matematika o'qituvchisi",'math_phys',125,92,9_000_000),sp('eng_t',"Ingliz tili o'qituvchisi",'lang_lit',135,100,9_500_000)] },
  { id:'navdki', name:"Navoiy Davlat Konchilik Instituti", short:'NavDKI', region:'Navoiy', icon:'⛏️', color:'#78350F', website:'navdki.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki'], languages:["O'zbek",'Rus'],
    specialties:[sp('mining','Konchilik','math_phys',138,105,12_000_000),sp('geo','Geologiya','math_phys',132,100,11_000_000)] },

  // ── JIZZAX ──────────────────────────────────────────────────────────────
  { id:'jdpu', name:'Jizzax Davlat Pedagogika Universiteti', short:'JDPU', region:'Jizzax', icon:'📝', color:'#7C3AED', website:'jdpu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('math_t',"Matematika o'qituvchisi",'math_phys',128,95,9_000_000),sp('bio_t',"Biologiya o'qituvchisi",'bio_chem',122,90,8_500_000),sp('hist_t',"Tarix o'qituvchisi",'lang_hist',120,88,8_500_000)] },

  // ── SIRDARYO ──────────────────────────────────────────────────────────────
  { id:'guldu', name:'Guliston Davlat Universiteti', short:'GulDU', region:'Sirdaryo', icon:'🌱', color:'#059669', website:'guldu.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus'],
    specialties:[sp('econ','Iqtisodiyot','math_econ',122,92,9_000_000),sp('cs','Kompyuter ilmlari','math_phys',130,96,10_000_000)] },

  // ── QORAQALPOG'ISTON ──────────────────────────────────────────────────────────────
  { id:'qarqdu', name:"Berdax nomidagi Qoraqalpog'iston Davlat Universiteti", short:"QarQDU", region:"Qoraqalpog'iston", icon:'🌊', color:'#1D4ED8', website:'ndki.uz', type:'Davlat',
    studyTypes:['Kunduzgi','Kechki','Sirtqi'], languages:["O'zbek",'Rus',"Qoraqalpoq"],
    specialties:[sp('cs','Kompyuter ilmlari','math_phys',128,94,9_500_000),sp('econ','Iqtisodiyot','math_econ',118,88,8_500_000),sp('law','Huquqshunoslik','lang_hist',122,92,9_000_000)] },
]

export const ALL_UNIVERSITIES = [...UNIVERSITIES, ...EXTRA_UNIVERSITIES]
