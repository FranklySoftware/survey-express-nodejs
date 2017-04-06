'use strict';

// Module dependencies
var express = require('express'),
    path = require('path'),
    errorhandler = require('errorhandler'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    js2xmlparser = require("js2xmlparser"),
    parseString = require('xml2js').parseString,
    swig = require('swig'),
    https = require('https'),
    async = require('async'),
    url = require('url'),
    crypto = require('crypto'),
    _ = require('underscore'),
    MongoDBStore = require('connect-mongodb-session')(session);

var util = require('util');

var exportApp = require('./data_export_subapp');


var Starts = mongoose.model('starts');
var Questions = mongoose.model('questions');
var QuestionAnswers = mongoose.model('questionAnswers');
var Users = mongoose.model('users');
var Result = mongoose.model('result');
var Tracking = mongoose.model("tracking");
var AssetTracking = mongoose.model("assetTracking");

var store = new MongoDBStore({
    uri: process.env.mongo_uri,
    collection: '_sessions'
});

// Catch errors
store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
});

var countries = [{ val: 0, label: 'Country or Region of residence' }, { val: 'US', label: 'UNITED STATES' }, { val: 'AF', label: 'AFGHANISTAN' }, { val: 'AX', label: 'ALAND ISLANDS' }, { val: 'AL', label: 'ALBANIA' }, { val: 'DZ', label: 'ALGERIA' }, { val: 'AS', label: 'AMERICAN SAMOA' }, { val: 'AD', label: 'ANDORRA' }, { val: 'AO', label: 'ANGOLA' }, { val: 'AI', label: 'ANGUILLA' }, { val: 'AQ', label: 'ANTARCTICA' }, { val: 'AG', label: 'ANTIGUA AND BARBUDA' }, { val: 'AR', label: 'ARGENTINA' }, { val: 'AM', label: 'ARMENIA' }, { val: 'AW', label: 'ARUBA' }, { val: 'AU', label: 'AUSTRALIA' }, { val: 'AT', label: 'AUSTRIA' }, { val: 'AZ', label: 'AZERBAIJAN' }, { val: 'BS', label: 'BAHAMAS' }, { val: 'BH', label: 'BAHRAIN' }, { val: 'BD', label: 'BANGLADESH' }, { val: 'BB', label: 'BARBADOS' }, { val: 'BY', label: 'BELARUS' }, { val: 'BE', label: 'BELGIUM' }, { val: 'BZ', label: 'BELIZE' }, { val: 'BJ', label: 'BENIN' }, { val: 'BM', label: 'BERMUDA' }, { val: 'BT', label: 'BHUTAN' }, { val: 'BO', label: 'BOLIVIA' }, { val: 'BQ', label: 'BONAIRE, SAINT EUSTATIUS AND SABA' }, { val: 'BA', label: 'BOSNIA AND HERZEGOVINA' }, { val: 'BW', label: 'BOTSWANA' }, { val: 'BV', label: 'BOUVET ISLAND' }, { val: 'BR', label: 'BRAZIL' }, { val: 'IO', label: 'BRITISH INDIAN OCEAN TERRITORY' }, { val: 'BN', label: 'BRUNEI DARUSSALAM' }, { val: 'BG', label: 'BULGARIA' }, { val: 'BF', label: 'BURKINA FASO' }, { val: 'BI', label: 'BURUNDI' }, { val: 'KH', label: 'CAMBODIA' }, { val: 'CM', label: 'CAMEROON' }, { val: 'CA', label: 'CANADA' }, { val: 'CV', label: 'CAPE VERDE' }, { val: 'KY', label: 'CAYMAN ISLANDS' }, { val: 'CF', label: 'CENTRAL AFRICAN REPUBLIC' }, { val: 'TD', label: 'CHAD' }, { val: 'CL', label: 'CHILE' }, { val: 'CN', label: 'CHINA' }, { val: 'CX', label: 'CHRISTMAS ISLAND' }, { val: 'CC', label: 'COCOS (KEELING) ISLANDS' }, { val: 'CO', label: 'COLOMBIA' }, { val: 'KM', label: 'COMOROS' }, { val: 'CG', label: 'CONGO' }, { val: 'CD', label: 'CONGO, THE DEMOCRATIC REPUBLIC OF THE' }, { val: 'CK', label: 'COOK ISLANDS' }, { val: 'CR', label: 'COSTA RICA' }, { val: 'CI', label: 'COTE D\'IVOIRE' }, { val: 'HR', label: 'CROATIA' }, { val: 'CW', label: 'CURAÇAO' }, { val: 'CY', label: 'CYPRUS' }, { val: 'CZ', label: 'CZECH REPUBLIC' }, { val: 'DK', label: 'DENMARK' }, { val: 'DJ', label: 'DIJIBOUTI' }, { val: 'DM', label: 'DOMINICA' }, { val: 'DO', label: 'DOMINICAN REPUBLIC' }, { val: 'EC', label: 'ECUADOR' }, { val: 'EG', label: 'EGYPT' }, { val: 'SV', label: 'EL SALVADOR' }, { val: 'GQ', label: 'EQUATORIAL GUINEA' }, { val: 'ER', label: 'ERITREA' }, { val: 'EE', label: 'ESTONIA' }, { val: 'ET', label: 'ETHIOPIA' }, { val: 'FK', label: 'FALKLAND ISLANDS (MALVINAS)' }, { val: 'FO', label: 'FAROE ISLANDS' }, { val: 'FJ', label: 'FIJI' }, { val: 'FI', label: 'FINLAND' }, { val: 'FR', label: 'FRANCE' }, { val: 'GF', label: 'FRENCH GUIANA' }, { val: 'PF', label: 'FRENCH POLYNESIA' }, { val: 'TF', label: 'FRENCH SOUTHERN TERRITORIES' }, { val: 'GA', label: 'GABON' }, { val: 'GM', label: 'GAMBIA' }, { val: 'GE', label: 'GEORGIA' }, { val: 'DE', label: 'GERMANY' }, { val: 'GH', label: 'GHANA' }, { val: 'GI', label: 'GIBRALTAR' }, { val: 'GR', label: 'GREECE' }, { val: 'GL', label: 'GREENLAND' }, { val: 'GD', label: 'GRENADA' }, { val: 'GP', label: 'GUADELOUPE' }, { val: 'GU', label: 'GUAM' }, { val: 'GT', label: 'GUATEMALA' }, { val: 'GG', label: 'GUERNSEY' }, { val: 'GN', label: 'GUINEA' }, { val: 'GW', label: 'GUINEA-BISSAU' }, { val: 'GY', label: 'GUYANA' }, { val: 'HT', label: 'HAITI' }, { val: 'HM', label: 'HEARD ISLAND AND MCDONALD ISLANDS' }, { val: 'VA', label: 'HOLY SEE (VATICAN CITY STATE)' }, { val: 'HN', label: 'HONDURAS' }, { val: 'HK', label: 'HONG KONG' }, { val: 'HU', label: 'HUNGARY' }, { val: 'IS', label: 'ICELAND' }, { val: 'IN', label: 'INDIA' }, { val: 'ID', label: 'INDONESIA' }, { val: 'IQ', label: 'IRAQ' }, { val: 'IE', label: 'IRELAND' }, { val: 'IM', label: 'ISLE OF MAN' }, { val: 'IL', label: 'ISRAEL' }, { val: 'IT', label: 'ITALY' }, { val: 'JM', label: 'JAMAICA' }, { val: 'JP', label: 'JAPAN' }, { val: 'JE', label: 'JERSEY' }, { val: 'JO', label: 'JORDAN' }, { val: 'KZ', label: 'KAZAKHSTAN' }, { val: 'KE', label: 'KENYA' }, { val: 'KI', label: 'KIRIBATI' }, { val: 'KR', label: 'KOREA, REPUBLIC OF' }, { val: 'KW', label: 'KUWAIT' }, { val: 'KG', label: 'KYRGYZSTAN' }, { val: 'LA', label: 'LAO PEOPLE\'S DEMOCRATIC REPUBLIC' }, { val: 'LV', label: 'LATVIA' }, { val: 'LB', label: 'LEBANON' }, { val: 'LS', label: 'LESOTHO' }, { val: 'LR', label: 'LIBERIA' }, { val: 'LY', label: 'LIBYAN ARAB JAMAHIRIYA' }, { val: 'LI', label: 'LIECHTENSTEIN' }, { val: 'LT', label: 'LITHUANIA' }, { val: 'LU', label: 'LUXEMBOURG' }, { val: 'MO', label: 'MACAO' }, { val: 'MK', label: 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF' }, { val: 'MG', label: 'MADAGASCAR' }, { val: 'MW', label: 'MALAWI' }, { val: 'MY', label: 'MALAYSIA' }, { val: 'MV', label: 'MALDIVES' }, { val: 'ML', label: 'MALI' }, { val: 'MT', label: 'MALTA' }, { val: 'MH', label: 'MARSHALL ISLANDS' }, { val: 'MQ', label: 'MARTINIQUE' }, { val: 'MR', label: 'MAURITANIA' }, { val: 'MU', label: 'MAURITIUS' }, { val: 'YT', label: 'MAYOTTE' }, { val: 'MX', label: 'MEXICO' }, { val: 'FM', label: 'MICRONESIA,FEDERATED STATES OF' }, { val: 'MD', label: 'MOLDOVA, REPUBLIC OF' }, { val: 'MC', label: 'MONACO' }, { val: 'MN', label: 'MONGOLIA' }, { val: 'ME', label: 'MONTENEGRO' }, { val: 'MS', label: 'MONTSERRAT' }, { val: 'MA', label: 'MOROCCO' }, { val: 'MZ', label: 'MOZAMBIQUE' }, { val: 'MM', label: 'MYANMAR' }, { val: 'NA', label: 'NAMIBIA' }, { val: 'NR', label: 'NAURU' }, { val: 'NP', label: 'NEPAL' }, { val: 'NL', label: 'NETHERLANDS' }, { val: 'AN', label: 'NETHERLANDS ANTILLES' }, { val: 'NC', label: 'NEW CALEDONIA' }, { val: 'NZ', label: 'NEW ZEALAND' }, { val: 'NI', label: 'NICARAGUA' }, { val: 'NE', label: 'NIGER' }, { val: 'NG', label: 'NIGERIA' }, { val: 'NU', label: 'NIUE' }, { val: 'NF', label: 'NORFOLK ISLAND' }, { val: 'MP', label: 'NORTHERN MARIANA ISLANDS' }, { val: 'NO', label: 'NORWAY' }, { val: 'OM', label: 'OMAN' }, { val: 'PK', label: 'PAKISTAN' }, { val: 'PW', label: 'PALAU' }, { val: 'PS', label: 'PALESTINIAN TERRITORY, OCCUPIED' }, { val: 'PA', label: 'PANAMA' }, { val: 'PG', label: 'PAPUA NEW GUINEA' }, { val: 'PY', label: 'PARAGUAY' }, { val: 'PE', label: 'PERU' }, { val: 'PH', label: 'PHILIPPINES' }, { val: 'PN', label: 'PITCAIRN' }, { val: 'PL', label: 'POLAND' }, { val: 'PT', label: 'PORTUGAL' }, { val: 'PR', label: 'PUERTO RICO' }, { val: 'QA', label: 'QATAR' }, { val: 'RE', label: 'RÉUNION' }, { val: 'RO', label: 'ROMANIA' }, { val: 'RU', label: 'RUSSIAN FEDERATION' }, { val: 'RW', label: 'RWANDA' }, { val: 'BL', label: 'SAINT BARTHÉLEMY' }, { val: 'SH', label: 'SAINT HELENA' }, { val: 'KN', label: 'SAINT KITTS AND NEVIS' }, { val: 'LC', label: 'SAINT LUCIA' }, { val: 'MF', label: 'SAINT MARTIN' }, { val: 'PM', label: 'SAINT PIERRE AND MIQUELON' }, { val: 'VC', label: 'SAINT VINCENT AND THE GRENADINES' }, { val: 'WS', label: 'SAMOA' }, { val: 'SM', label: 'SAN MARINO' }, { val: 'ST', label: 'SAO TOME AND PRINCIPE' }, { val: 'SA', label: 'SAUDI ARABIA' }, { val: 'SN', label: 'SENEGAL' }, { val: 'RS', label: 'SERBIA' }, { val: 'SC', label: 'SEYCHELLES' }, { val: 'SL', label: 'SIERRA LEONE' }, { val: 'SG', label: 'SINGAPORE' }, { val: 'SX', label: 'SINT MAARTEN (DUTCH PART)' }, { val: 'SK', label: 'SLOVAKIA' }, { val: 'SI', label: 'SLOVENIA' }, { val: 'SB', label: 'SOLOMON ISLANDS' }, { val: 'SO', label: 'SOMALIA' }, { val: 'ZA', label: 'SOUTH AFRICA' }, { val: 'GS', label: 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS' }, { val: 'SS', label: 'SOUTH SUDAN' }, { val: 'ES', label: 'SPAIN' }, { val: 'LK', label: 'SRI LANKA' }, { val: 'SR', label: 'SURINAME' }, { val: 'SJ', label: 'SVALBARD AND JAN MAYEN' }, { val: 'SZ', label: 'SWAZILAND' }, { val: 'SE', label: 'SWEDEN' }, { val: 'CH', label: 'SWITZERLAND' }, { val: 'TW', label: 'TAIWAN' }, { val: 'TJ', label: 'TAJIKISTAN' }, { val: 'TZ', label: 'TANZANIA, UNITED REPUBLIC OF' }, { val: 'TH', label: 'THAILAND' }, { val: 'TL', label: 'TIMOR-LESTE' }, { val: 'TG', label: 'TOGO' }, { val: 'TK', label: 'TOKELAU' }, { val: 'TO', label: 'TONGA' }, { val: 'TT', label: 'TRINIDAD AND TOBAGO' }, { val: 'TN', label: 'TUNISIA' }, { val: 'TR', label: 'TURKEY' }, { val: 'TM', label: 'TURKMENISTAN' }, { val: 'TC', label: 'TURKS AND CAICOS ISLANDS' }, { val: 'TV', label: 'TUVALU' }, { val: 'UG', label: 'UGANDA' }, { val: 'UA', label: 'UKRAINE' }, { val: 'AE', label: 'UNITED ARAB EMIRATES' }, { val: 'GB', label: 'UNITED KINGDOM' }, { val: 'UM', label: 'UNITED STATES MINOR OUTLYING ISLANDS' }, { val: 'UY', label: 'URUGUAY' }, { val: 'UZ', label: 'UZBEKISTAN' }, { val: 'VU', label: 'VANUATU' }, { val: 'VE', label: 'VENEZUELA, BOLIVARIAN REPUBLIC OF' }, { val: 'VN', label: 'VIETNAM' }, { val: 'VG', label: 'VIRGIN ISLANDS, BRITISH' }, { val: 'VI', label: 'VIRGIN ISLANDS, U.S.' }, { val: 'WF', label: 'WALLIS AND FUTUNA' }, { val: 'EH', label: 'WESTERN SAHARA' }, { val: 'YE', label: 'YEMEN' }, { val: 'ZR', label: 'ZAIRE' }, { val: 'ZM', label: 'ZAMBIA' }, { val: 'ZW', label: 'ZIMBABWE' }];
var countryStates = { AD: { '02': 'Canillo', '03': 'Encamp', '04': 'La Massana', '05': 'Ordino', '06': 'Sant Julià de Lòria', '07': 'Andorra la Vella', '08': 'Escaldes-Engordany' }, AE: { AJ: '`Ajman', AZ: 'Abu Zaby', DU: 'Dubayy', FU: 'Al Fujayrah', RK: 'Ra´s al Khaymah', SH: 'Ash Shariqah', UQ: 'Umm al Qaywayn' }, AF: { BAL: 'Balkh', BAM: 'Bamian', BDG: 'Badghis', BDS: 'Badakhshan', BGL: 'Baghlan', DAY: 'Daykondi', FRA: 'Farah', FYB: 'Faryab', GHA: 'Ghazni', GHO: 'Ghowr', HEL: 'Helmand', HER: 'Herat', JOW: 'Jowzjan', KAB: 'Kabul', KAN: 'Kandahar', KAP: 'Kapisa', KDZ: 'Kondoz', KHO: 'Khowst', KNR: 'Konar', LAG: 'Laghman', LOW: 'Lowgar', NAN: 'Nangrahar', NIM: 'Nimruz', NUR: 'Nurestan', ORU: 'Oruzgan', PAN: 'Panjshir', PAR: 'Parwan', PIA: 'Paktia', PKA: 'Paktika', SAM: 'Samangan', SAR: 'Sar-e Pol', TAK: 'Takhar', WAR: 'Wardak', ZAB: 'Zabol' }, AG: { '10': 'Barbuda', '03': 'Saint George', '04': 'Saint John', '05': 'Saint Mary', '06': 'Saint Paul', '07': 'Saint Peter', '08': 'Saint Philip' }, AL: { BR: 'Berat', BU: 'Bulqizë', DI: 'Dibër', DL: 'Delvinë', DR: 'Durrës', DV: 'Devoll', EL: 'Elbasan', ER: 'Kolonjë', FR: 'Fier', GJ: 'Gjirokastër', GR: 'Gramsh', HA: 'Has', KA: 'Kavajë', KB: 'Kurbin', KC: 'Kuçovë', KO: 'Korcë', KR: 'Krujë', KU: 'Kukës', LB: 'Librazhd', LE: 'Lezhë', LU: 'Lushnjë', MK: 'Mallakastër', MM: 'Malësi e Madhe', MR: 'Mirditë', MT: 'Mat', PG: 'Pogradec', PQ: 'Peqin', PR: 'Përmet', PU: 'Pukë', SH: 'Shkodër', SK: 'Skrapar', SR: 'Sarandë', TE: 'Tepelenë', TP: 'Tropojë', TR: 'Tiranë', VL: 'Vlorë' }, AM: { AG: 'Aragacotn', AR: 'Ararat', AV: 'Armavir', GR: 'Gegark´unik´', KT: 'Kotayk´', LO: 'Lory', SH: 'Sirak', SU: 'Syunik´', TV: 'Tavus', VD: 'Vayoc Jor' }, AO: { BGO: 'Bengo', BGU: 'Benguela', BIE: 'Bié', CAB: 'Cabinda', CCU: 'Cuando-Cubango', CNN: 'Cunene', CNO: 'Cuanza Norte', CUS: 'Cuanza Sul', HUA: 'Huambo', HUI: 'Huíla', LNO: 'Lunda Norte', LSU: 'Lunda Sul', LUA: 'Luanda', MAL: 'Malange', MOX: 'Moxico', NAM: 'Namibe', UIG: 'Uíge', ZAI: 'Zaire' }, AR: { A: 'Salta', B: 'Buenos Aires', C: 'Capital federal', D: 'San Luis', E: 'Entre Ríos', F: 'La Rioja', G: 'Santiago del Estero', H: 'Chaco', J: 'San Juan', K: 'Catamarca', L: 'La Pampa', M: 'Mendoza', N: 'Misiones', P: 'Formosa', Q: 'Neuquén', R: 'Río Negro', S: 'Santa Fe', T: 'Tucumán', U: 'Chubut', V: 'Tierra del Fuego', W: 'Corrientes', X: 'Córdoba', Y: 'Jujuy', Z: 'Santa Cruz' }, AT: { '1': 'Burgenland', '2': 'Kärnten', '3': 'Niederösterreich', '4': 'Oberösterreich', '5': 'Salzburg', '6': 'Steiermark', '7': 'Tirol', '8': 'Vorarlberg', '9': 'Wien' }, AU: { ACT: 'Australian Capital Territory', NSW: 'New South Wales', NT: 'Northern Territory', QLD: 'Queensland', SA: 'South Australia', TAS: 'Tasmania', VIC: 'Victoria', WA: 'Western Australia' }, AZ: { AB: 'Äli Bayramli', ABS: 'Abseron', AGA: 'Agstafa', AGC: 'Agcabädi', AGM: 'Agdam', AGS: 'Agdas', AGU: 'Agsu', AST: 'Astara', BA: 'Baki', BAB: 'Babäk', BAL: 'Balakän', BAR: 'Bärdä', BEY: 'Beyläqan', BIL: 'Biläsuvar', CAB: 'Cäbrayil', CAL: 'Cälilabad', CUL: 'Culfa', DAS: 'Daskäsän', DAV: 'Däväçi', FUZ: 'Füzuli', GA: 'Gäncä', GAD: 'Gädäbäy', GOR: 'Goranboy', GOY: 'Göyçay', HAC: 'Haciqabul', IMI: 'Imisli', ISM: 'Ismayilli', KAL: 'Kälbäcär', KUR: 'Kürdämir', LA: 'Länkäran', LAC: 'Laçin', LAN: 'Länkäran', LER: 'Lerik', MAS: 'Masalli', MI: 'Mingäçevir', NA: 'Naftalan', NEF: 'Neftçala', NX: 'Naxçivan', OGU: 'Oguz', ORD: 'Ordubad', QAB: 'Qäbälä', QAX: 'Qax', QAZ: 'Qazax', QBA: 'Quba', QBI: 'Qubadli', QOB: 'Qobustan', QUS: 'Qusar', SA: 'Säki', SAB: 'Sabirabad', SAD: 'Sädäräk', SAH: 'Sahbuz', SAK: 'Säki', SAL: 'Salyan', SAR: 'Särur', SAT: 'Saatli', SIY: 'Siyäzän', SKR: 'Sämkir', SM: 'Sumqayit', SMI: 'Samaxi', SMX: 'Samux', SS: 'Susa', SUS: 'Susa', TAR: 'Tärtär', TOV: 'Tovuz', UCA: 'Ucar', XA: 'Xankändi', XAC: 'Xacmaz', XAN: 'Xanlar', XCI: 'Xocali', XIZ: 'Xizi', XVD: 'Xocavänd', YAR: 'Yardimli', YE: 'Yevlax', YEV: 'Yevlax', ZAN: 'Zängilan', ZAQ: 'Zaqatala', ZAR: 'Zärdab' }, BA: { BIH: 'Federacija Bosna i Hercegovina', SRP: 'Republika Srpska' }, BB: { '10': 'Saint Philip', '11': 'Saint Thomas', '01': 'Christ Church', '02': 'Saint Andrew', '03': 'Saint George', '04': 'Saint James', '05': 'Saint John', '06': 'Saint Joseph', '07': 'Saint Lucy', '08': 'Saint Michael', '09': 'Saint Peter' }, BD: { '10': 'Chittagong zila', '11': 'Cox\'s Bazar zila', '12': 'Chuadanga zila', '13': 'Dhaka zila', '14': 'Dinajpur zila', '15': 'Faridpur zila', '16': 'Feni zila', '17': 'Gopalganj zila', '18': 'Gazipur zila', '19': 'Gaibandha zila', '20': 'Habiganj zila', '21': 'Jamalpur zila', '22': 'Jessore zila', '23': 'Jhenaidah zila', '24': 'Jaipurhat zila', '25': 'Jhalakati zila', '26': 'Kishoreganj zila', '27': 'Khulna zila', '28': 'Kurigram zila', '29': 'Khagrachari zila', '30': 'Kushtia zila', '31': 'Lakshmipur zila', '32': 'Lalmonirhat zila', '33': 'Manikganj zila', '34': 'Mymensingh zila', '35': 'Munshiganj zila', '36': 'Madaripur zila', '37': 'Magura zila', '38': 'Moulvibazar zila', '39': 'Meherpur zila', '40': 'Narayanganj zila', '41': 'Netrakona zila', '42': 'Narsingdi zila', '43': 'Narail zila', '44': 'Natore zila', '45': 'Nawabganj zila', '46': 'Nilphamari zila', '47': 'Noakhali zila', '48': 'Naogaon zila', '49': 'Pabna zila', '50': 'Pirojpur zila', '51': 'Patuakhali zila', '52': 'Panchagarh zila', '53': 'Rajbari zila', '54': 'Rajshahi zila', '55': 'Rangpur zila', '56': 'Rangamati zila', '57': 'Sherpur zila', '58': 'Satkhira zila', '59': 'Sirajganj zila', '60': 'Sylhet zila', '61': 'Sunamganj zila', '62': 'Shariatpur zila', '63': 'Tangail zila', '64': 'Thakurgaon zila', '01': 'Bandarban zila', '02': 'Barguna zila', '03': 'Bogra zila', '04': 'Brahmanbaria zila', '05': 'Bagerhat zila', '06': 'Barisal zila', '07': 'Bhola zila', '08': 'Comilla zila', '09': 'Chandpur zila' }, BE: { BRU: 'Bruxelles-Capitale, Region de', VAN: 'Antwerpen', VBR: 'Vlaams Brabant', VLI: 'Limburg', VOV: 'Oost-Vlaanderen', VWV: 'West-Vlaanderen', WBR: 'Brabant Wallon', WHT: 'Hainaut', WLG: 'Liège', WLX: 'Luxembourg', WNA: 'Namur' }, BF: { BAL: 'Balé', BAM: 'Bam', BAN: 'Banwa', BAZ: 'Bazèga', BGR: 'Bougouriba', BLG: 'Boulgou', BLK: 'Boulkiemdé', COM: 'Comoé', GAN: 'Ganzourgou', GNA: 'Gnagna', GOU: 'Gourma', HOU: 'Houet', IOB: 'Ioba', KAD: 'Kadiogo', KEN: 'Kénédougou', KMD: 'Komondjari', KMP: 'Kompienga', KOP: 'Koulpélogo', KOS: 'Kossi', KOT: 'Kouritenga', KOW: 'Kourwéogo', LER: 'Léraba', LOR: 'Loroum', MOU: 'Mouhoun', NAM: 'Namentenga', NAO: 'Nahouri', NAY: 'Nayala', NOU: 'Noumbiel', OUB: 'Oubritenga', OUD: 'Oudalan', PAS: 'Passoré', PON: 'Poni', SEN: 'Séno', SIS: 'Sissili', SMT: 'Sanmatenga', SNG: 'Sanguié', SOM: 'Soum', SOR: 'Sourou', TAP: 'Tapoa', TUI: 'Tui', YAG: 'Yagha', YAT: 'Yatenga', ZIR: 'Ziro', ZON: 'Zondoma', ZOU: 'Zoundwéogo' }, BG: { '10': 'Kyustendil', '11': 'Lovech', '12': 'Montana', '13': 'Pazardzhik', '14': 'Pernik', '15': 'Pleven', '16': 'Plovdiv', '17': 'Razgrad', '18': 'Ruse', '19': 'Silistra', '20': 'Sliven', '21': 'Smolyan', '22': 'Sofia-Grad', '23': 'Sofia', '24': 'Stara Zagora', '25': 'Targovishte', '26': 'Haskovo', '27': 'Shumen', '28': 'Yambol', '01': 'Blagoevgrad', '02': 'Burgas', '03': 'Varna', '04': 'Veliko Tarnovo', '05': 'Vidin', '06': 'Vratsa', '07': 'Gabrovo', '08': 'Dobrich', '09': 'Kardzhali' }, BH: { '13': 'Al Manāmah (Al ‘Āşimah)', '14': 'Al Janūbīyah', '15': 'Al Muharraq', '16': 'Al Wusţá', '17': 'Ash Shamālīyah' }, BI: { BB: 'Bubanza', BJ: 'Bujumbura', BR: 'Bururi', CA: 'Cankuzo', CI: 'Cibitoke', GI: 'Gitega', KI: 'Kirundo', KR: 'Karuzi', KY: 'Kayanza', MA: 'Makamba', MU: 'Muramvya', MW: 'Mwaro', MY: 'Muyinga', NG: 'Ngozi', RT: 'Rutana', RY: 'Ruyigi' }, BJ: { AK: 'Atakora', AL: 'Alibori', AQ: 'Atlantique', BO: 'Borgou', CO: 'Collines', DO: 'Donga', KO: 'Kouffo', LI: 'Littoral', MO: 'Mono', OU: 'Ouémé', PL: 'Plateau', ZO: 'Zou' }, BN: { BE: 'Belait', BM: 'Brunei-Muara', TE: 'Temburong', TU: 'Tutong' }, BO: { B: 'El Beni', C: 'Cochabamba', H: 'Chuquisaca', L: 'La Paz', N: 'Pando', O: 'Oruro', P: 'Potosí', S: 'Santa Cruz', T: 'Tarija' }, BR: { AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhao', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul', MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul', SC: 'Santa Catarina', SE: 'Sergipe', SP: 'Sao Paulo', TO: 'Tocantins' }, BS: { AC: 'Acklins and Crooked Islands', BI: 'Bimini', CI: 'Cat Island', EX: 'Exuma', FC: 'Fresh Creek', FP: 'Freeport', GH: 'Governor\'s Harbour', GT: 'Green Turtle Cay', HI: 'Harbour Island', HR: 'High Rock', IN: 'Inagua', KB: 'Kemps Bay', LI: 'Long Island', MG: 'Mayaguana', MH: 'Marsh Harbour', NB: 'Nicholls Town and Berry Islands', NP: 'New Providence', RI: 'Ragged Island', RS: 'Rock Sound', SP: 'Sandy Point', SR: 'San Salvador and Rum Cay' }, BT: { '11': 'Paro', '12': 'Chhukha', '13': 'Ha', '14': 'Samtse', '15': 'Thimphu', '21': 'Tsirang', '22': 'Dagana', '23': 'Punakha', '24': 'Wangdue Phodrang', '31': 'Sarpang', '32': 'Trongsa', '33': 'Bumthang', '34': 'Zhemgang', '41': 'Trashigang', '42': 'Monggar', '43': 'Pemagatshel', '44': 'Lhuentse', '45': 'Samdrup Jongkha', GA: 'Gasa', TY: 'Trashi Yangtse' }, BW: { CE: 'Central', GH: 'Ghanzi', KG: 'Kgalagadi', KL: 'Kgatleng', KW: 'Kweneng', NE: 'North-East', NW: 'North-West', SE: 'South-East', SO: 'Southern' }, BY: { BR: 'Brestskaya voblasts´', HO: 'Homyel´skaya voblasts´', HR: 'Hrodzenskaya voblasts´', MA: 'Mahilyowskaya voblasts´', MI: 'Minskaya voblasts´', VI: 'Vitsyebskaya voblasts´' }, BZ: { BZ: 'Belize', CY: 'Cayo', CZL: 'Corozal', OW: 'Orange Walk', SC: 'Stann Creek', TOL: 'Toledo' }, CA: { AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick', NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories', NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon Territory' }, CD: { BC: 'Bas-Congo', BN: 'Bandundu', EQ: 'Équateur', KA: 'Katanga', KE: 'Kasai-Oriental', KN: 'Kinshasa', KW: 'Kasai-Occidental', MA: 'Maniema', NK: 'Nord-Kivu', OR: 'Orientale', SK: 'Sud-Kivu' }, CF: { AC: 'Ouham', BB: 'Bamingui-Bangoran', BGF: 'Bangui', BK: 'Basse-Kotto', HK: 'Haute-Kotto', HM: 'Haut-Mbomou', HS: 'Mambéré-Kadéï', KB: 'Nana-Grébizi', KG: 'Kémo', LB: 'Lobaye', MB: 'Mbomou', MP: 'Ombella-Mpoko', NM: 'Nana-Mambéré', OP: 'Ouham-Pendé', SE: 'Sangha-Mbaéré', UK: 'Ouaka', VK: 'Vakaga' }, CG: { '2': 'Lékoumou', '5': 'Kouilou', '7': 'Likouala', '8': 'Cuvette', '9': 'Niari', '11': 'Bouenza', '12': 'Pool', '13': 'Sangha', '14': 'Plateaux', '15': 'Cuvette-Ouest', BZV: 'Brazzaville' }, CH: { AG: 'Aargau', AI: 'Appenzell Innerrhoden', AR: 'Appenzell Ausserrhoden', BE: 'Bern', BL: 'Basel-Landschaft', BS: 'Basel-Stadt', FR: 'Fribourg', GE: 'Genève', GL: 'Glarus', GR: 'Graubünden', JU: 'Jura', LU: 'Luzern', NE: 'Neuchâtel', NW: 'Nidwalden', OW: 'Obwalden', SG: 'Sankt Gallen', SH: 'Schaffhausen', SO: 'Solothurn', SZ: 'Schwyz', TG: 'Thurgau', TI: 'Ticino', UR: 'Uri', VD: 'Vaud', VS: 'Valais', ZG: 'Zug', ZH: 'Zürich' }, CI: { '10': 'Denguélé', '11': 'Nzi-Comoé', '12': 'Marahoué', '13': 'Sud-Comoé', '14': 'Worodougou', '15': 'Sud-Bandama', '16': 'Agnébi', '17': 'Bafing', '18': 'Fromager', '19': 'Moyen-Cavally', '01': 'Lagunes', '02': 'Haut-Sassandra', '03': 'Savanes', '04': 'Vallée du Bandama', '05': 'Moyen-Comoé', '06': '18 Montagnes', '07': 'Lacs', '08': 'Zanzan', '09': 'Bas-Sassandra' }, CL: { AI: 'Aisén del General Carlos Ibáñez del Campo', AN: 'Antofagasta', AP: 'Arica y Parinacota', AR: 'Araucanía', AT: 'Atacama', BI: 'Bío-Bío', CO: 'Coquimbo', LI: 'Libertador General Bernardo O\'Higgins', LL: 'Los Lagos', LR: 'Los Ríos', MA: 'Magallanes', ML: 'Maule', RM: 'Región Metropolitana de Santiago', TA: 'Tarapacá', VS: 'Valparaíso' }, CM: { AD: 'Adamaoua', CE: 'Centre', EN: 'Far North', ES: 'East', LT: 'Littoral', NO: 'North', NW: 'North-West', OU: 'West', SU: 'South', SW: 'South-West' }, CN: { '11': 'Beijing', '12': 'Tianjin', '13': 'Hebei', '14': 'Shanxi', '15': 'Nei Mongol', '21': 'Liaoning', '22': 'Jilin', '23': 'Heilongjiang', '31': 'Shanghai', '32': 'Jiangsu', '33': 'Zhejiang', '34': 'Anhui', '35': 'Fujian', '36': 'Jiangxi', '37': 'Shandong', '41': 'Henan', '42': 'Hubei', '43': 'Hunan', '44': 'Guangdong', '45': 'Guangxi', '46': 'Hainan', '50': 'Chongqing', '51': 'Sichuan', '52': 'Guizhou', '53': 'Yunnan', '54': 'Xizang', '61': 'Shaanxi', '62': 'Gansu', '63': 'Qinghai', '64': 'Ningxia', '65': 'Xinjiang', '71': 'Taiwan', '91': 'Hong Kong', '92': 'Macao' }, CO: { AMA: 'Amazonas', ANT: 'Antioquia', ARA: 'Arauca', ATL: 'Atlántico', BOL: 'Bolívar', BOY: 'Boyacá', CAL: 'Caldas', CAQ: 'Caquetá', CAS: 'Casanare', CAU: 'Cauca', CES: 'Cesar', CHO: 'Chocó', COR: 'Córdoba', CUN: 'Cundinamarca', DC: 'Distrito Capital de Bogotá', GUA: 'Guainía', GUV: 'Guaviare', HUI: 'Huila', LAG: 'La Guajira', MAG: 'Magdalena', MET: 'Meta', NAR: 'Nariño', NSA: 'Norte de Santander', PUT: 'Putumayo', QUI: 'Quindío', RIS: 'Risaralda', SAN: 'Santander', SAP: 'San Andrés, Providencia y Santa Catalina', SUC: 'Sucre', TOL: 'Tolima', VAC: 'Valle del Cauca', VAU: 'Vaupés', VID: 'Vichada' }, CR: { A: 'Alajuela', C: 'Cartago', G: 'Guanacaste', H: 'Heredia', L: 'Limón', P: 'Puntarenas', SJ: 'San José' }, CV: { BR: 'Brava', BV: 'Boa Vista', CA: 'Santa Catarina', CR: 'Santa Cruz', CS: 'Calheta de São Miguel', MA: 'Maio', MO: 'Mosteiros', PA: 'Paul', PN: 'Porto Novo', PR: 'Praia', RG: 'Ribeira Grande', SD: 'São Domingos', SF: 'São Filipe', SL: 'Sal', SN: 'São Nicolau', SV: 'São Vicente', TA: 'Tarrafal' }, CY: { '01': 'Lefkosia', '02': 'Lemesos', '03': 'Larnaka', '04': 'Ammochostos', '05': 'Pafos', '06': 'Keryneia' }, CZ: { '101': 'Praha 1', '102': 'Praha 2', '103': 'Praha 3', '104': 'Praha 4', '105': 'Praha 5', '106': 'Praha 6', '107': 'Praha 7', '108': 'Praha 8', '109': 'Praha 9', '201': 'Benešov', '202': 'Beroun', '203': 'Kladno', '204': 'Kolín', '205': 'Kutná Hora', '206': 'Mělník', '207': 'Mladá Boleslav', '208': 'Nymburk', '209': 'Praha-východ', '311': 'České Budějovice', '312': 'Český Krumlov', '313': 'Jindřichův Hradec', '314': 'Písek', '315': 'Prachatice', '316': 'Strakonice', '317': 'Tábor', '321': 'Domažlice', '322': 'Klatovy', '323': 'Plzeň-město', '324': 'Plzeň-jih', '325': 'Plzeň-sever', '326': 'Rokycany', '327': 'Tachov', '411': 'Cheb', '412': 'Karlovy Vary', '413': 'Sokolov', '421': 'Děčín', '422': 'Chomutov', '423': 'Litoměřice', '424': 'Louny', '425': 'Most', '426': 'Teplice', '427': 'Ústí nad Labem', '511': 'Česká Lípa', '512': 'Jablonec nad Nisou', '513': 'Liberec', '514': 'Semily', '521': 'Hradec Králové', '522': 'Jičín', '523': 'Náchod', '524': 'Rychnov nad Kněžnou', '525': 'Trutnov', '531': 'Chrudim', '532': 'Pardubice', '533': 'Svitavy', '534': 'Ústí nad Orlicí', '611': 'Havlíčkův Brod', '612': 'Jihlava', '613': 'Pelhřimov', '614': 'Třebíč', '615': 'Žd’ár nad Sázavou', '621': 'Blansko', '622': 'Brno-město', '623': 'Brno-venkov', '624': 'Břeclav', '625': 'Hodonín', '626': 'Vyškov', '627': 'Znojmo', '711': 'Jeseník', '712': 'Olomouc', '713': 'Prostĕjov', '714': 'Přerov', '715': 'Šumperk', '721': 'Kromĕříž', '722': 'Uherské Hradištĕ', '723': 'Vsetín', '724': 'Zlín', '801': 'Bruntál', '802': 'Frýdek - Místek', '803': 'Karviná', '804': 'Nový Jičín', '805': 'Opava', '806': 'Ostrava - město', '10A': 'Praha 10', '10B': 'Praha 11', '10C': 'Praha 12', '10D': 'Praha 13', '10E': 'Praha 14', '10F': 'Praha 15', '20A': 'Praha-západ', '20B': 'Příbram', '20C': 'Rakovník' }, DE: { BB: 'Brandenburg', BE: 'Berlin', BW: 'Baden-Württemberg', BY: 'Bayern', HB: 'Bremen', HE: 'Hessen', HH: 'Hamburg', MV: 'Mecklenburg-Vorpommern', NI: 'Niedersachsen', NW: 'Nordrhein-Westfalen', RP: 'Rheinland-Pfalz', SH: 'Schleswig-Holstein', SL: 'Saarland', SN: 'Sachsen', ST: 'Sachsen-Anhalt', TH: 'Thüringen' }, DJ: { AR: 'Arta', AS: 'Ali Sabieh', DI: 'Dikhil', DJ: 'Djibouti', OB: 'Obock', TA: 'Tadjoura' }, DK: { '81': 'Region Nordjylland', '82': 'Region Midtjylland', '83': 'Region Syddanmark', '84': 'Region Hovedstaden', '85': 'Region Sjælland' }, DM: { '10': 'Saint Paul', '11': 'Saint Peter', '02': 'Saint Andrew', '03': 'Saint David', '04': 'Saint George', '05': 'Saint John', '06': 'Saint Joseph', '07': 'Saint Luke', '08': 'Saint Mark', '09': 'Saint Patrick' }, DO: { '10': 'Independencia', '11': 'La Altagracia', '12': 'La Romana', '13': 'La Vega', '14': 'María Trinidad Sánchez', '15': 'Monte Cristi', '16': 'Pedernales', '17': 'Peravia', '18': 'Puerto Plata', '19': 'Salcedo', '20': 'Samaná', '21': 'San Cristóbal', '22': 'San Juan', '23': 'San Pedro de Macorís', '24': 'Sánchez Ramírez', '25': 'Santiago', '26': 'Santiago Rodríguez', '27': 'Valverde', '28': 'Monseñor Nouel', '29': 'Monte Plata', '30': 'Hato Mayor', '01': 'Distrito Nacional', '02': 'Azua', '03': 'Bahoruco', '04': 'Barahona', '05': 'Dajabón', '06': 'Duarte', '07': 'La Estrelleta', '08': 'El Seybo', '09': 'Espaillat' }, DZ: { '10': 'Bouira', '11': 'Tamanghasset', '12': 'Tébessa', '13': 'Tlemcen', '14': 'Tiaret', '15': 'Tizi Ouzou', '16': 'Alger', '17': 'Djelfa', '18': 'Jijel', '19': 'Sétif', '20': 'Saïda', '21': 'Skikda', '22': 'Sidi Bel Abbès', '23': 'Annaba', '24': 'Guelma', '25': 'Constantine', '26': 'Médéa', '27': 'Mostaganem', '28': 'Msila', '29': 'Mascara', '30': 'Ouargla', '31': 'Oran', '32': 'El Bayadh', '33': 'Illizi', '34': 'Bordj Bou Arréridj', '35': 'Boumerdès', '36': 'El Tarf', '37': 'Tindouf', '38': 'Tissemsilt', '39': 'El Oued', '40': 'Khenchela', '41': 'Souk Ahras', '42': 'Tipaza', '43': 'Mila', '44': 'Aïn Defla', '45': 'Naama', '46': 'Aïn Témouchent', '47': 'Ghardaïa', '48': 'Relizane', '01': 'Adrar', '02': 'Chlef', '03': 'Laghouat', '04': 'Oum el Bouaghi', '05': 'Batna', '06': 'Béjaïa', '07': 'Biskra', '08': 'Béchar', '09': 'Blida' }, EC: { A: 'Azuay', B: 'Bolívar', C: 'Carchi', D: 'Orellana', E: 'Esmeraldas', F: 'Cañar', G: 'Guayas', H: 'Chimborazo', I: 'Imbabura', L: 'Loja', M: 'Manabí', N: 'Napo', O: 'El Oro', P: 'Pichincha', R: 'Los Ríos', S: 'Morona-Santiago', T: 'Tungurahua', U: 'Sucumbíos', W: 'Galápagos', X: 'Cotopaxi', Y: 'Pastaza', Z: 'Zamora-Chinchipe' }, EE: { '37': 'Harjumaa', '39': 'Hiiumaa', '44': 'Ida-Virumaa', '49': 'Jogevamaa', '51': 'Järvamaa', '57': 'Läänemaa', '59': 'Lääne-Virumaa', '65': 'Polvamaa', '67': 'Pärnumaa', '70': 'Raplamaa', '74': 'Saaremaa', '78': 'Tartumaa', '82': 'Valgamaa', '84': 'Viljandimaa', '86': 'Vorumaa' }, EG: { ALX: 'Al Iskandariyah', ASN: 'Aswan', AST: 'Asyut', BA: 'Al Bahr al Ahmar', BH: 'Al Buhayrah', BNS: 'Bani Suwayf', C: 'Al Qahirah', DK: 'Ad Daqahliyah', DT: 'Dumyat', FYM: 'Al Fayyum', GH: 'Al Gharbiyah', GZ: 'Al Jizah', IS: 'Al Isma`iliyah', JS: 'Janub Sina´', KB: 'Al Qalyubiyah', KFS: 'Kafr ash Shaykh', KN: 'Qina', MN: 'Al Minya', MNF: 'Al Minufiyah', MT: 'Matruh', PTS: 'Bur Sa`id', SHG: 'Suhaj', SHR: 'Ash Sharqiyah', SIN: 'Shamal Sina´', SUZ: 'As Suways', WAD: 'Al Wadi al Jadid' }, ER: { AN: 'Anseba', DK: 'Debubawi Keyih Bahri', DU: 'Debub', GB: 'Gash Barka', MA: 'Maakel', SK: 'Semenawi Keyih Bahri' }, ES: { A: 'Alicante', AB: 'Albacete', AL: 'Almería', AN: 'Andalucía', AR: 'Aragón', AV: 'Ávila', B: 'Barcelona', BA: 'Badajoz', BI: 'Vizcaya', BU: 'Burgos', C: 'A Coruña', CA: 'Cádiz', CC: 'Cáceres', CE: 'Ceuta', CL: 'Castilla y León', CM: 'Castilla-La Mancha', CN: 'Canarias', CO: 'Córdoba', CR: 'Ciudad Real', CS: 'Castellón', CT: 'Cataluña', CU: 'Cuenca', EX: 'Extremadura', GA: 'Galicia', GC: 'Las Palmas', GI: 'Girona', GR: 'Granada', GU: 'Guadalajara', H: 'Huelva', HU: 'Huesca', IB: 'Illes Balears', J: 'Jaén', L: 'Lleida', LE: 'León', LO: 'La Rioja', LU: 'Lugo', M: 'Madrid', MA: 'Málaga', ML: 'Melilla', MU: 'Murcia', NA: 'Navarra', O: 'Asturias', OR: 'Ourense', P: 'Palencia', PM: 'Baleares', PO: 'Pontevedra', PV: 'País Vasco', S: 'Cantabria', SA: 'Salamanca', SE: 'Sevilla', SG: 'Segovia', SO: 'Soria', SS: 'Guipúzcoa', T: 'Tarragona', TE: 'Teruel', TF: 'Santa Cruz de Tenerife', TO: 'Toledo', V: 'Valencia', VA: 'Valladolid', VC: 'Valenciana, Comunidad', VI: 'Álava', Z: 'Zaragoza', ZA: 'Zamora' }, ET: { AA: 'Addis Ababa', AF: 'Afar', AM: 'Amara', BE: 'Benshangul-Gumaz', DD: 'Dire Dawa', GA: 'Gambela Peoples', HA: 'Harari People', OR: 'Oromia', SN: 'Southern Nations, Nationalities and Peoples', SO: 'Somali', TI: 'Tigrai' }, FI: { AL: 'Ahvenanmaan lääni', ES: 'Etelä-Suomen lääni', IS: 'Itä-Suomen lääni', LL: 'Lapin lääni', LS: 'Länsi-Suomen lääni', OL: 'Oulun lääni' }, FJ: { C: 'Central', E: 'Eastern', N: 'Northern', R: 'Rotuma', W: 'Western' }, FM: { KSA: 'Kosrae', PNI: 'Pohnpei', TRK: 'Chuuk', YAP: 'Yap' }, FR: { '10': 'Aube', '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente', '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor', '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura', '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire', '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord', '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme', '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales', '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône', '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie', '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines', '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne', '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort', '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne', '95': 'Val-d\'Oise', '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence', '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes', '09': 'Ariège', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse', BL: 'Saint Barthélemy', CP: 'Clipperton', GF: 'French Guiana', GP: 'Guadeloupe', MF: 'Saint Martin', MQ: 'Martinique', NC: 'New Caledonia', PF: 'French Polynesia', PM: 'Saint Pierre and Miquelon', RE: 'Réunion', TF: 'French Southern Territories', WF: 'Wallis and Futuna', YT: 'Mayotte' }, GA: { '1': 'Estuaire', '2': 'Haut-Ogooué', '3': 'Moyen-Ogooué', '4': 'Ngounié', '5': 'Nyanga', '6': 'Ogooué-Ivindo', '7': 'Ogooué-Lolo', '8': 'Ogooué-Maritime', '9': 'Woleu-Ntem' }, GB: { ABD: 'Aberdeenshire', ABE: 'Aberdeen City', AGB: 'Argyll and Bute', AGY: 'Isle of Anglesey', ANS: 'Angus', ANT: 'Antrim', ARD: 'Ards', ARM: 'Armagh', BAS: 'Bath and North East Somerset', BBD: 'Blackburn with Darwen', BDF: 'Bedfordshire', BDG: 'Barking and Dagenham', BEN: 'Brent', BEX: 'Bexley', BFS: 'Belfast', BGE: 'Bridgend', BGW: 'Blaenau Gwent', BIR: 'Birmingham', BKM: 'Buckinghamshire', BLA: 'Ballymena', BLY: 'Ballymoney', BMH: 'Bournemouth', BNB: 'Banbridge', BNE: 'Barnet', BNH: 'Brighton and Hove', BNS: 'Barnsley', BOL: 'Bolton', BPL: 'Blackpool', BRC: 'Bracknell Forest', BRD: 'Bradford', BRY: 'Bromley', BST: 'Bristol, City of', BUR: 'Bury', CAM: 'Cambridgeshire', CAY: 'Caerphilly', CGN: 'Ceredigion', CGV: 'Craigavon', CHS: 'Cheshire', CKF: 'Carrickfergus', CKT: 'Cookstown', CLD: 'Calderdale', CLK: 'Clackmannanshire', CLR: 'Coleraine', CMA: 'Cumbria', CMD: 'Camden', CMN: 'Carmarthenshire', CON: 'Cornwall', COV: 'Coventry', CRF: 'Cardiff', CRY: 'Croydon', CSR: 'Castlereagh', CWY: 'Conwy', DAL: 'Darlington', DBY: 'Derbyshire', DEN: 'Denbighshire', DER: 'Derby', DEV: 'Devon', DGN: 'Dungannon', DGY: 'Dumfries and Galloway', DNC: 'Doncaster', DND: 'Dundee City', DOR: 'Dorset', DOW: 'Down', DRY: 'Derry', DUD: 'Dudley', DUR: 'Durham', EAL: 'Ealing', EAY: 'East Ayrshire', EDH: 'Edinburgh, City of', EDU: 'East Dunbartonshire', ELN: 'East Lothian', ELS: 'Eilean Siar', ENF: 'Enfield', ERW: 'East Renfrewshire', ERY: 'East Riding of Yorkshire', ESS: 'Essex', ESX: 'East Sussex', FAL: 'Falkirk', FER: 'Fermanagh', FIF: 'Fife', FLN: 'Flintshire', GAT: 'Gateshead', GLG: 'Glasgow City', GLS: 'Gloucestershire', GRE: 'Greenwich', GWN: 'Gwynedd', HAL: 'Halton', HAM: 'Hampshire', HAV: 'Havering', HCK: 'Hackney', HEF: 'Herefordshire, County of', HIL: 'Hillingdon', HLD: 'Highland', HMF: 'Hammersmith and Fulham', HNS: 'Hounslow', HPL: 'Hartlepool', HRT: 'Hertfordshire', HRW: 'Harrow', HRY: 'Haringey', IOS: 'Isles of Scilly', IOW: 'Isle of Wight', ISL: 'Islington', IVC: 'Inverclyde', KEC: 'Kensington and Chelsea', KEN: 'Kent', KHL: 'Kingston upon Hull, City of', KIR: 'Kirklees', KTT: 'Kingston upon Thames', KWL: 'Knowsley', LAN: 'Lancashire', LBH: 'Lambeth', LCE: 'Leicester', LDS: 'Leeds', LEC: 'Leicestershire', LEW: 'Lewisham', LIN: 'Lincolnshire', LIV: 'Liverpool', LMV: 'Limavady', LND: 'London, City of', LRN: 'Larne', LSB: 'Lisburn', LUT: 'Luton', MAN: 'Manchester', MDB: 'Middlesbrough', MDW: 'Medway', MFT: 'Magherafelt', MIK: 'Milton Keynes', MLN: 'Midlothian', MON: 'Monmouthshire', MRT: 'Merton', MRY: 'Moray', MTY: 'Merthyr Tydfil', MYL: 'Moyle', NAY: 'North Ayrshire', NBL: 'Northumberland', NDN: 'North Down', NEL: 'North East Lincolnshire', NET: 'Newcastle upon Tyne', NFK: 'Norfolk', NGM: 'Nottingham', NLK: 'North Lanarkshire', NLN: 'North Lincolnshire', NSM: 'North Somerset', NTA: 'Newtownabbey', NTH: 'Northamptonshire', NTL: 'Neath Port Talbot', NTT: 'Nottinghamshire', NTY: 'North Tyneside', NWM: 'Newham', NWP: 'Newport', NYK: 'North Yorkshire', NYM: 'Newry and Mourne', OLD: 'Oldham', OMH: 'Omagh', ORK: 'Orkney Islands', OXF: 'Oxfordshire', PEM: 'Pembrokeshire', PKN: 'Perth and Kinross', PLY: 'Plymouth', POL: 'Poole', POR: 'Portsmouth', POW: 'Powys', PTE: 'Peterborough', RCC: 'Redcar and Cleveland', RCH: 'Rochdale', RCT: 'Rhondda, Cynon, Taff', RDB: 'Redbridge', RDG: 'Reading', RFW: 'Renfrewshire', RIC: 'Richmond upon Thames', ROT: 'Rotherham', RUT: 'Rutland', SAW: 'Sandwell', SAY: 'South Ayrshire', SCB: 'Scottish Borders, The', SFK: 'Suffolk', SFT: 'Sefton', SGC: 'South Gloucestershire', SHF: 'Sheffield', SHN: 'St. Helens', SHR: 'Shropshire', SKP: 'Stockport', SLF: 'Salford', SLG: 'Slough', SLK: 'South Lanarkshire', SND: 'Sunderland', SOL: 'Solihull', SOM: 'Somerset', SOS: 'Southend-on-Sea', SRY: 'Surrey', STB: 'Strabane', STE: 'Stoke-on-Trent', STG: 'Stirling', STH: 'Southampton', STN: 'Sutton', STS: 'Staffordshire', STT: 'Stockton-on-Tees', STY: 'South Tyneside', SWA: 'Swansea', SWD: 'Swindon', SWK: 'Southwark', TAM: 'Tameside', TFW: 'Telford and Wrekin', THR: 'Thurrock', TOB: 'Torbay', TOF: 'Torfaen', TRF: 'Trafford', TWH: 'Tower Hamlets', VGL: 'Vale of Glamorgan, The', WAR: 'Warwickshire', WBK: 'West Berkshire', WDU: 'West Dunbartonshire', WFT: 'Waltham Forest', WGN: 'Wigan', WIL: 'Wiltshire', WKF: 'Wakefield', WLL: 'Walsall', WLN: 'West Lothian', WLV: 'Wolverhampton', WND: 'Wandsworth', WNM: 'Windsor and Maidenhead', WOK: 'Wokingham', WOR: 'Worcestershire', WRL: 'Wirral', WRT: 'Warrington', WRX: 'Wrexham', WSM: 'Westminster', WSX: 'West Sussex', YOR: 'York', ZET: 'Shetland Islands' }, GD: { '10': 'Southern Grenadine Islands', '01': 'Saint Andrew', '02': 'Saint David', '03': 'Saint George', '04': 'Saint John', '05': 'Saint Mark', '06': 'Saint Patrick' }, GE: { AB: 'Abkhazia', AJ: 'Ajaria', GU: 'Guria', IM: 'Imeret’i', KA: 'Kakhet’i', KK: 'K’vemo K’art’li', MM: 'Mts’khet’a-Mt’ianet’i', RL: 'Racha-Lech’khumi-K’vemo Svanet’i', SJ: 'Samts’khe-Javakhet’i', SK: 'Shida K’art’li', SZ: 'Samegrelo-Zemo Svanet’i', TB: 'T’bilisi' }, GH: { AA: 'Greater Accra', AH: 'Ashanti', BA: 'Brong-Ahafo', CP: 'Central', EP: 'Eastern', NP: 'Northern', TV: 'Volta', UE: 'Upper East', UW: 'Upper West', WP: 'Western' }, GM: { B: 'Banjul', L: 'Lower River', M: 'MacCarthy Island', N: 'North Bank', U: 'Upper River', W: 'Western' }, GN: { BE: 'Beyla', BF: 'Boffa', BK: 'Boké', C: 'Conakry', CO: 'Coyah', DB: 'Dabola', DI: 'Dinguiraye', DL: 'Dalaba', DU: 'Dubréka', FA: 'Faranah', FO: 'Forécariah', FR: 'Fria', GA: 'Gaoual', GU: 'Guékédou', KA: 'Kankan', KB: 'Koubia', KD: 'Kindia', KE: 'Kérouané', KN: 'Koundara', KO: 'Kouroussa', KS: 'Kissidougou', LA: 'Labé', LE: 'Lélouma', LO: 'Lola', MC: 'Macenta', MD: 'Mandiana', ML: 'Mali', MM: 'Mamou', NZ: 'Nzérékoré', PI: 'Pita', SI: 'Siguiri', TE: 'Télimélé', TO: 'Tougué', YO: 'Yomou' }, GQ: { AN: 'Annobón', BN: 'Bioko Norte', BS: 'Bioko Sur', C: 'Región Continental', CS: 'Centro Sur', I: 'Región Insular', KN: 'Kie-Ntem', LI: 'Litoral', WN: 'Wele-Nzás' }, GR: { '11': 'Argolis', '12': 'Arkadia', '13': 'Achaïa', '14': 'Ileia', '15': 'Korinthia', '16': 'Lakonia', '17': 'Messinia', '21': 'Zakynthos', '22': 'Kerkyra', '23': 'Kefallinia', '24': 'Lefkas', '31': 'Arta', '32': 'Thesprotia', '33': 'Ioannina', '34': 'Preveza', '41': 'Karditsa', '42': 'Larisa', '43': 'Magnisia', '44': 'Trikala', '51': 'Grevena', '52': 'Drama', '53': 'Imathia', '54': 'Thessaloniki', '55': 'Kavalla', '56': 'Kastoria', '57': 'Kilkis', '58': 'Kozani', '59': 'Pella', '61': 'Pieria', '62': 'Serrai', '63': 'Florina', '64': 'Chalkidiki', '69': 'Agio Oros', '71': 'Evros', '72': 'Xanthi', '73': 'Rodopi', '81': 'Dodekanisos', '82': 'Kyklades', '83': 'Lesvos', '84': 'Samos', '85': 'Chios', '91': 'Irakleion', '92': 'Lasithion', '93': 'Rethymnon', '94': 'Chania', '01': 'Aitolia-Akarnania', '03': 'Voiotia', '04': 'Evvoia', '05': 'Evrytania', '06': 'Fthiotis', '07': 'Fokis', A1: 'Attiki' }, GT: { AV: 'Alta Verapaz', BV: 'Baja Verapaz', CM: 'Chimaltenango', CQ: 'Chiquimula', ES: 'Escuintla', GU: 'Guatemala', HU: 'Huehuetenango', IZ: 'Izabal', JA: 'Jalapa', JU: 'Jutiapa', PE: 'Petén', PR: 'El Progreso', QC: 'Quiché', QZ: 'Quetzaltenango', RE: 'Retalhuleu', SA: 'Sacatepéquez', SM: 'San Marcos', SO: 'Sololá', SR: 'Santa Rosa', SU: 'Suchitepéquez', TO: 'Totonicapán', ZA: 'Zacapa' }, GW: { BA: 'Bafatá', BL: 'Bolama', BM: 'Biombo', BS: 'Bissau', CA: 'Cacheu', GA: 'Gabú', OI: 'Oio', QU: 'Quinara', TO: 'Tombali' }, GY: { BA: 'Barima-Waini', CU: 'Cuyuni-Mazaruni', DE: 'Demerara-Mahaica', EB: 'East Berbice-Corentyne', ES: 'Essequibo Islands-West Demerara', MA: 'Mahaica-Berbice', PM: 'Pomeroon-Supenaam', PT: 'Potaro-Siparuni', UD: 'Upper Demerara-Berbice', UT: 'Upper Takutu-Upper Essequibo' }, HN: { AT: 'Atlántida', CH: 'Choluteca', CL: 'Colón', CM: 'Comayagua', CP: 'Copán', CR: 'Cortés', EP: 'El Paraíso', FM: 'Francisco Morazán', GD: 'Gracias a Dios', IB: 'Islas de la Bahía', IN: 'Intibucá', LE: 'Lempira', LP: 'La Paz', OC: 'Ocotepeque', OL: 'Olancho', SB: 'Santa Bárbara', VA: 'Valle', YO: 'Yoro' }, HR: { '10': 'Viroviticko-podravska zupanija', '11': 'Pozesko-slavonska zupanija', '12': 'Brodsko-posavska zupanija', '13': 'Zadarska zupanija', '14': 'Osjecko-baranjska zupanija', '15': 'Sibensko-kninska zupanija', '16': 'Vukovarsko-srijemska zupanija', '17': 'Splitsko-dalmatinska zupanija', '18': 'Istarska zupanija', '19': 'Dubrovacko-neretvanska zupanija', '20': 'Medimurska zupanija', '21': 'Grad Zagreb', '01': 'Zagrebacka zupanija', '02': 'Krapinsko-zagorska zupanija', '03': 'Sisacko-moslavacka zupanija', '04': 'Karlovacka zupanija', '05': 'Varazdinska zupanija', '06': 'Koprivnicko-krizevacka zupanija', '07': 'Bjelovarsko-bilogorska zupanija', '08': 'Primorsko-goranska zupanija', '09': 'Licko-senjska zupanija' }, HT: { AR: 'Artibonite', CE: 'Centre', GA: 'Grande-Anse', ND: 'Nord', NE: 'Nord-Est', NO: 'Nord-Ouest', OU: 'Ouest', SD: 'Sud', SE: 'Sud-Est' }, HU: { BA: 'Baranya', BE: 'Békés', BK: 'Bács-Kiskun', BU: 'Budapest', BZ: 'Borsod-Abaúj-Zemplén', CS: 'Csongrád', FE: 'Fejér', GS: 'Gyór-Moson-Sopron', HB: 'Hajdú-Bihar', HE: 'Heves', JN: 'Jász-Nagykun-Szolnok', KE: 'Komárom-Esztergom', NO: 'Nógrád', PE: 'Pest', SO: 'Somogy', SZ: 'Szabolcs-Szatmár-Bereg', TO: 'Tolna', VA: 'Vas', VE: 'Veszprém', ZA: 'Zala' }, ID: { AC: 'Aceh', BA: 'Bali', BB: 'Bangka Belitung', BE: 'Bengkulu', BT: 'Banten', GO: 'Gorontalo', JA: 'Jambi', JB: 'Jawa Barat', JI: 'Jawa Timur', JK: 'Jakarta Raya', JT: 'Jawa Tengah', KB: 'Kalimantan Barat', KI: 'Kalimantan Timur', KR: 'Kepulauan Riau', KS: 'Kalimantan Selatan', KT: 'Kalimantan Tengah', LA: 'Lampung', MA: 'Maluku', MU: 'Maluku Utara', NB: 'Nusa Tenggara Barat', NT: 'Nusa Tenggara Timur', PA: 'Papua', RI: 'Riau', SA: 'Sulawesi Utara', SB: 'Sumatera Barat', SG: 'Sulawesi Tenggara', SN: 'Sulawesi Selatan', SR: 'Sulawesi Barat', SS: 'Sumatera Selatan', ST: 'Sulawesi Tengah', SU: 'Sumatera Utara', YO: 'Yogyakarta' }, IE: { C: 'Cork', CE: 'Clare', CN: 'Cavan', CW: 'Carlow', D: 'Dublin', DL: 'Donegal', G: 'Galway', KE: 'Kildare', KK: 'Kilkenny', KY: 'Kerry', LD: 'Longford', LH: 'Louth', LK: 'Limerick', LM: 'Leitrim', LS: 'Laois', MH: 'Meath', MN: 'Monaghan', MO: 'Mayo', OY: 'Offaly', RN: 'Roscommon', SO: 'Sligo', TA: 'Tipperary', WD: 'Waterford', WH: 'Westmeath', WW: 'Wicklow', WX: 'Wexford' }, IL: { D: 'HaDarom', HA: 'Hefa', JM: 'Yerushalayim', M: 'HaMerkaz', TA: 'Tel-Aviv', Z: 'HaZafon' }, IN: { AN: 'Andaman and Nicobar Islands', AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar', CH: 'Chandigarh', CT: 'Chhattisgarh', DD: 'Daman and Diu', DL: 'Delhi', DN: 'Dadra and Nagar Haveli', GA: 'Goa', GJ: 'Gujarat', HP: 'Himachal Pradesh', HR: 'Haryana', JH: 'Jharkhand', JK: 'Jammu and Kashmir', KA: 'Karnataka', KL: 'Kerala', LD: 'Lakshadweep', MH: 'Maharashtra', ML: 'Meghalaya', MN: 'Manipur', MP: 'Madhya Pradesh', MZ: 'Mizoram', NL: 'Nagaland', OR: 'Orissa', PB: 'Punjab', PY: 'Pondicherry', RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TR: 'Tripura', UL: 'Uttarakhand', UP: 'Uttar Pradesh', WB: 'West Bengal' }, IQ: { AN: 'Al Anbar', AR: 'Arbil', BA: 'Al Basrah', BB: 'Babil', BG: 'Baghdad', DA: 'Dahuk', DI: 'Diyalá', DQ: 'Dhi Qar', KA: 'Karbala\'', MA: 'Maysan', MU: 'Al Muthanná', NA: 'An Najaf', NI: 'Ninawa', QA: 'Al Qadisiyah', SD: 'Salah ad Din', SU: 'As Sulaymaniyah', TS: 'At Ta\'mim', WA: 'Wasit' }, IS: { '0': 'Reykjavík', '1': 'Höfuoborgarsvæoi utan Reykjavíkur', '2': 'Suournes', '3': 'Vesturland', '4': 'Vestfiroir', '5': 'Norourland vestra', '6': 'Norourland eystra', '7': 'Austurland', '8': 'Suourland' }, IT: { AG: 'Agrigento', AL: 'Alessandria', AN: 'Ancona', AO: 'Aosta', AP: 'Ascoli Piceno', AQ: 'L\'Aquila', AR: 'Arezzo', AT: 'Asti', AV: 'Avellino', BA: 'Bari', BG: 'Bergamo', BI: 'Biella', BL: 'Belluno', BN: 'Benevento', BO: 'Bologna', BR: 'Brindisi', BS: 'Brescia', BT: 'Barletta-Andria-Trani', BZ: 'Bolzano', CA: 'Cagliari', CB: 'Campobasso', CE: 'Caserta', CH: 'Chieti', CI: 'Carbonia-Iglesias', CL: 'Caltanissetta', CN: 'Cuneo', CO: 'Como', CR: 'Cremona', CS: 'Cosenza', CT: 'Catania', CZ: 'Catanzaro', EN: 'Enna', FC: 'Forlì-Cesena', FE: 'Ferrara', FG: 'Foggia', FI: 'Firenze', FM: 'Fermo', FR: 'Frosinone', GE: 'Genova', GO: 'Gorizia', GR: 'Grosseto', IM: 'Imperia', IS: 'Isernia', KR: 'Crotone', LC: 'Lecco', LE: 'Lecce', LI: 'Livorno', LO: 'Lodi', LT: 'Latina', LU: 'Lucca', MB: 'Monza e Brianza', MC: 'Macerata', ME: 'Messina', MI: 'Milano', MN: 'Mantova', MO: 'Modena', MS: 'Massa-Carrara', MT: 'Matera', NA: 'Napoli', NO: 'Novara', NU: 'Nuoro', OG: 'Ogliastra', OR: 'Oristano', OT: 'Olbia-Tempio', PA: 'Palermo', PC: 'Piacenza', PD: 'Padova', PE: 'Pescara', PG: 'Perugia', PI: 'Pisa', PN: 'Pordenone', PO: 'Prato', PR: 'Parma', PT: 'Pistoia', PU: 'Pesaro e Urbino', PV: 'Pavia', PZ: 'Potenza', RA: 'Ravenna', RC: 'Reggio Calabria', RE: 'Reggio Emilia', RG: 'Ragusa', RI: 'Rieti', RM: 'Roma', RN: 'Rimini', RO: 'Rovigo', SA: 'Salerno', SI: 'Siena', SO: 'Sondrio', SP: 'La Spezia', SR: 'Siracusa', SS: 'Sassari', SV: 'Savona', TA: 'Taranto', TE: 'Teramo', TN: 'Trento', TO: 'Torino', TP: 'Trapani', TR: 'Terni', TS: 'Trieste', TV: 'Treviso', UD: 'Udine', VA: 'Varese', VB: 'Verbano-Cusio-Ossola', VC: 'Vercelli', VE: 'Venezia', VI: 'Vicenza', VR: 'Verona', VS: 'Medio Campidano', VT: 'Viterbo', VV: 'Vibo Valentia' }, JM: { '10': 'Westmoreland', '11': 'Saint Elizabeth', '12': 'Manchester', '13': 'Clarendon', '14': 'Saint Catherine', '01': 'Kingston', '02': 'Saint Andrew', '03': 'Saint Thomas', '04': 'Portland', '05': 'Saint Mary', '06': 'Saint Ann', '07': 'Trelawny', '08': 'Saint James', '09': 'Hanover' }, JO: { AJ: '`Ajlun', AM: '`Amman', AQ: 'Al\'Aqaba', AT: 'At Tafilah', AZ: 'Az Zarqa\'', BA: 'Al Balqa\'', IR: 'Irbid', JA: 'Jarash', KA: 'Al Karak', MA: 'Al Mafraq', MD: 'Madaba', MN: 'Ma\'an' }, JP: { '10': 'Gunma', '11': 'Saitama', '12': 'Chiba', '13': 'Tokyo', '14': 'Kanagawa', '15': 'Niigata', '16': 'Toyama', '17': 'Ishikawa', '18': 'Fukui', '19': 'Yamanashi', '20': 'Nagano', '21': 'Gifu', '22': 'Shizuoka', '23': 'Aichi', '24': 'Mie', '25': 'Shiga', '26': 'Kyoto', '27': 'Osaka', '28': 'Hyogo', '29': 'Nara', '30': 'Wakayama', '31': 'Tottori', '32': 'Shimane', '33': 'Okayama', '34': 'Hiroshima', '35': 'Yamaguchi', '36': 'Tokushima', '37': 'Kagawa', '38': 'Ehime', '39': 'Kochi', '40': 'Fukuoka', '41': 'Saga', '42': 'Nagasaki', '43': 'Kumamoto', '44': 'Oita', '45': 'Miyazaki', '46': 'Kagoshima', '47': 'Okinawa', '01': 'Hokkaido', '02': 'Aomori', '03': 'Iwate', '04': 'Miyagi', '05': 'Akita', '06': 'Yamagata', '07': 'Fukushima', '08': 'Ibaraki', '09': 'Tochigi' }, KE: { '110': 'Nairobi Municipality', '200': 'Central', '300': 'Coast', '400': 'Eastern', '500': 'North-Eastern', '600': 'Nyanza', '700': 'Rift Valley', '900': 'Western' }, KG: { B: 'Batken', C: 'Chu', GB: 'Bishkek', J: 'Jalal-Abad', N: 'Naryn', O: 'Osh', T: 'Talas', Y: 'Ysyk-Köl' }, KH: { '1': 'Banteay Mean Chey', '2': 'Baat Dambang', '3': 'Kampong Chaam', '4': 'Kampong Chhnang', '5': 'Kampong Spueu', '6': 'Kampong Thum', '7': 'Kampot', '8': 'Kandaal', '9': 'Kaoh Kong', '10': 'Kracheh', '11': 'Mondol Kiri', '12': 'Phnom Penh', '13': 'Preah Vihear', '14': 'Prey Veaeng', '15': 'Pousaat', '16': 'Rotanak Kiri', '17': 'Siem Reab', '18': 'Krong Preah Sihanouk', '19': 'Stueng Traeng', '20': 'Svaay Rieng', '21': 'Taakaev', '22': 'Otdar Mean Chey', '23': 'Krong Kaeb', '24': 'Krong Pailin' }, KI: { G: 'Gilbert Islands', L: 'Line Islands', P: 'Phoenix Islands' }, KM: { A: 'Anjouan', G: 'Grande Comore', M: 'Mohéli' }, KN: { '10': 'Saint Paul Charlestown', '11': 'Saint Peter Basseterre', '12': 'Saint Thomas Lowland', '13': 'Saint Thomas Middle Island', '15': 'Trinity Palmetto Point', '01': 'Christ Church Nichola Town', '02': 'Saint Anne Sandy Point', '03': 'Saint George Basseterre', '04': 'Saint George Gingerland', '05': 'Saint James Windward', '06': 'Saint James Capistere', '07': 'Saint John Figtree', '08': 'Saint Mary Cayon', '09': 'Saint Paul Capisterre' }, KR: { '11': 'Seoul Teugbyeolsi', '26': 'Busan Gwang\'yeogsi', '27': 'Daegu Gwang\'yeogsi', '28': 'Incheon Gwang\'yeogsi', '29': 'Gwangju Gwang\'yeogsi', '30': 'Daejeon Gwang\'yeogsi', '31': 'Ulsan Gwang\'yeogsi', '41': 'Gyeonggido', '42': 'Gang\'weondo', '43': 'Chungcheongbugdo', '44': 'Chungcheongnamdo', '45': 'Jeonrabugdo', '46': 'Jeonranamdo', '47': 'Gyeongsangbugdo', '48': 'Gyeongsangnamdo', '49': 'Jejudo' }, KW: { AH: 'Al Ahmadi', FA: 'Al Farwaniyah', HA: 'Hawalli', JA: 'Al Jahrah', KU: 'Al Kuwayt' }, KZ: { AKM: 'Aqmola oblysy', AKT: 'Aqtöbe oblysy', ALA: 'Almaty', ALM: 'Almaty oblysy', AST: 'Astana', ATY: 'Atyrau oblysy', KAR: 'Qaraghandy oblysy', KUS: 'Qostanay oblysy', KZY: 'Qyzylorda oblysy', MAN: 'Mangghystau oblysy', PAV: 'Pavlodar oblysy', SEV: 'Soltüstik Qazaqstan oblysy', VOS: 'Shyghys Qazaqstan oblysy', YUZ: 'Ongtüstik Qazaqstan oblysy', ZAP: 'Batys Qazaqstan oblysy', ZHA: 'Zhambyl oblysy' }, LA: { AT: 'Attapu', BK: 'Bokèo', BL: 'Bolikhamxai', CH: 'Champasak', HO: 'Houaphan', KH: 'Khammouan', LM: 'Louang Namtha', LP: 'Louangphabang', OU: 'Oudômxai', PH: 'Phôngsali', SL: 'Salavan', SV: 'Savannakhét', VI: 'Vientiane', VT: 'Vientiane', XA: 'Xaignabouli', XE: 'Xékong', XI: 'Xiangkhoang', XN: 'Xaisômboun' }, LB: { AK: 'Aakkâr', AS: 'Liban-Nord', BA: 'Beyrouth', BH: 'Baalbek-Hermel', BI: 'Béqaa', JA: 'Liban-Sud', JL: 'Mont-Liban', NA: 'Nabatîyé' }, LI: { '1': 'Balzers', '2': 'Eschen', '3': 'Gamprin', '4': 'Mauren', '5': 'Planken', '6': 'Ruggell', '7': 'Schaan', '8': 'Schellenberg', '9': 'Triesen', '10': 'Triesenberg', '11': 'Vaduz' }, LK: { '11': 'Colombo', '12': 'Gampaha', '13': 'Kalutara', '21': 'Kandy', '22': 'Matale', '23': 'Nuwara Eliya', '31': 'Galle', '32': 'Matara', '33': 'Hambantota', '41': 'Jaffna', '42': 'Kilinochchi', '43': 'Mannar', '44': 'Vavuniya', '45': 'Mullaittivu', '51': 'Batticaloa', '52': 'Ampara', '53': 'Trincomalee', '61': 'Kurunegala', '62': 'Puttalam', '71': 'Anuradhapura', '72': 'Polonnaruwa', '81': 'Badulla', '82': 'Monaragala', '91': 'Ratnapura', '92': 'Kegalla' }, LR: { BG: 'Bong', BM: 'Bomi', CM: 'Grand Cape Mount', GB: 'Grand Bassa', GG: 'Grand Gedeh', GK: 'Grand Kru', LO: 'Lofa', MG: 'Margibi', MO: 'Montserrado', MY: 'Maryland', NI: 'Nimba', RI: 'Rivercess', SI: 'Sinoe' }, LS: { A: 'Maseru', B: 'Butha-Buthe', C: 'Leribe', D: 'Berea', E: 'Mafeteng', F: 'Mohale\'s Hoek', G: 'Quthing', H: 'Qacha\'s Nek', J: 'Mokhotlong', K: 'Thaba-Tseka' }, LT: { AL: 'Alytaus Apskritis', KL: 'Klaipedos Apskritis', KU: 'Kauno Apskritis', MR: 'Marijampoles Apskritis', PN: 'Panevezio Apskritis', SA: 'Siauliu Apskritis', TA: 'Taurages Apskritis', TE: 'Telsiu Apskritis', UT: 'Utenos Apskritis', VL: 'Vilniaus Apskritis' }, LU: { D: 'Diekirch', G: 'Grevenmacher', L: 'Luxembourg' }, LV: { AI: 'Aizkraukles Aprinkis', AL: 'Aluksnes Aprinkis', BL: 'Balvu Aprinkis', BU: 'Bauskas Aprinkis', CE: 'Cesu Aprinkis', DA: 'Daugavpils Aprinkis', DGV: 'Daugavpils', DO: 'Dobeles Aprinkis', GU: 'Gulbenes Aprinkis', JEL: 'Jelgava', JK: 'Jekabpils Aprinkis', JL: 'Jelgavas Aprinkis', JUR: 'Jurmala', KR: 'Kraslavas Aprinkis', KU: 'Kuldigas Aprinkis', LE: 'Liepajas Aprinkis', LM: 'Limbazu Aprinkis', LPX: 'Liepaja', LU: 'Ludzas Aprinkis', MA: 'Madonas Aprinkis', OG: 'Ogres Aprinkis', PR: 'Preilu Aprinkis', RE: 'Rezeknes Aprinkis', REZ: 'Rezekne', RI: 'Rigas Aprinkis', RIX: 'Riga', SA: 'Saldus Aprinkis', TA: 'Talsu Aprinkis', TU: 'Tukuma Aprinkis', VE: 'Ventspils Aprinkis', VEN: 'Ventspils', VK: 'Valkas Aprinkis', VM: 'Valmieras Aprinkis' }, LY: { AJ: 'Ajdabiya', BA: 'Banghazi', BU: 'Al Butnan', BW: 'Bani Walid', DR: 'Damah', GD: 'Ghadamis', GR: 'Gharyan', GT: 'Ghat', HZ: 'Al Hizam al Akhdar', JA: 'Al Jabal al Akhdar', JB: 'Jaghbub', JI: 'Al Jifarah', JU: 'Al Jufrah', KF: 'Al Kufrah', MB: 'Al Marqab', MI: 'Misratah', MJ: 'Al Marj', MQ: 'Murzuq', MZ: 'Mizdah', NL: 'Nalut', NQ: 'An Nuqat al Kahms', QB: 'Al Qubbah', QT: 'Al Qatrun', SB: 'Sabha', SH: 'Ash Shati', SR: 'Surt', SS: 'Sabratah Surman', TB: 'Tarabulus', TM: 'Tarhunah-Masallatah', TN: 'Tajura wa an Nawahi al Arba', WA: 'Al Wahah', WD: 'Wadi al Hayat', YJ: 'Yafran-Jadu', ZA: 'Az Zawiyah' }, MA: { AGD: 'Agadir', ASZ: 'Assa-Zag', AZI: 'Azilal', BAH: 'Aït Baha', BEM: 'Beni Mellal', BER: 'Berkane', BES: 'Ben Slimane', BOD: 'Boujdour', BOM: 'Boulemane', CAS: 'Casablanca', CHE: 'Chefchaouene', CHI: 'Chichaoua', ERR: 'Errachidia', ESI: 'Essaouira', ESM: 'Es Smara', FES: 'Fès', FIG: 'Figuig', GUE: 'Guelmim', HAJ: 'El Hajeb', HAO: 'Al Haouz', HOC: 'Al Hoceïma', IFR: 'Ifrane', JDI: 'El Jadida', JRA: 'Jerada', KEN: 'Kénitra', KES: 'Kelaat Sraghna', KHE: 'Khemisset', KHN: 'Khenifra', KHO: 'Khouribga', LAA: 'Laayoune', LAR: 'Larache', MAR: 'Marrakech', MEK: 'Meknès', MEL: 'Aït Melloul', NAD: 'Nador', OUA: 'Ouarzazate', OUD: 'Oued ed Dahab', OUJ: 'Oujda', RBA: 'Rabat-Salé', SAF: 'Safi', SEF: 'Sefrou', SET: 'Settat', SIK: 'Sidi Kacem', TAO: 'Taounate', TAR: 'Taroudannt', TAT: 'Tata', TAZ: 'Taza', TET: 'Tétouan', TIZ: 'Tiznit', TNG: 'Tanger', TNT: 'Tan-Tan' }, MD: { BA: 'Balti', CA: 'Cahul', CH: 'Chisinau', CU: 'Chisinau', ED: 'Edinet', GA: 'Gagauzia, Unitate Teritoriala Autonoma (UTAG)', LA: 'Lapusna', OR: 'Orhei', SN: 'Stinga Nistrului, unitatea teritoriala din', SO: 'Soroca', TA: 'Taraclia', TI: 'Tighina', UN: 'Ungheni' }, ME: { '1': 'Andrijevica', '2': 'Bar', '3': 'Barane', '4': 'Bijelo Polje', '5': 'Budva', '6': 'Cetinje', '7': 'Danilovgrad', '8': 'Herceg-Novi', '9': 'Kolašin', '10': 'Kotor', '11': 'Mojkovac', '12': 'Nikšić', '13': 'Plav', '14': 'Pljevlja', '15': 'Plužine', '16': 'Podgorica', '17': 'Rožaje', '18': 'Šavnik', '19': 'Tivat', '20': 'Ulcinj', '21': 'Žabljak' }, MG: { A: 'Toamasina', D: 'Antsiranana', F: 'Fianarantsoa', M: 'Mahajanga', T: 'Antananarivo', U: 'Toliara' }, MH: { ALK: 'Ailuk', ALL: 'Ailinglapalap', ARN: 'Arno', AUR: 'Aur', EBO: 'Ebon', ENI: 'Eniwetok', JAL: 'Jaluit', KIL: 'Kili', KWA: 'Kwajalein', LAE: 'Lae', LIB: 'Lib', LIK: 'Likiep', MAJ: 'Majuro', MAL: 'Maloelap', MEJ: 'Mejit', MIL: 'Mili', NMK: 'Namorik', NMU: 'Namu', RON: 'Rongelap', UJA: 'Ujae', UJL: 'Ujelang', UTI: 'Utirik', WTH: 'Wotho', WTJ: 'Wotje' }, MK: { '1': 'Aerodrom', '2': 'Aračinovo', '3': 'Berovo', '4': 'Bitola', '5': 'Bogdanci', '6': 'Bogovinje', '7': 'Bosilovo', '8': 'Brvenica', '9': 'Butel', '10': 'Valandovo', '11': 'Vasilevo', '12': 'Vevčani', '13': 'Veles', '14': 'Vinica', '15': 'Vraneštica', '16': 'Vrapčište', '17': 'Gazi Baba', '18': 'Gevgelija', '19': 'Gostivar', '20': 'Gradsko', '21': 'Debar', '22': 'Debarca', '23': 'Delčevo', '24': 'Demir Kapija', '25': 'Demir Hisar', '26': 'Dojran', '27': 'Dolneni', '28': 'Drugovo', '29': 'Gjorče Petrov', '30': 'Želino', '31': 'Zajas', '32': 'Zelenikovo', '33': 'Zrnovci', '34': 'Ilinden', '35': 'Jegunovce', '36': 'Kavadarci', '37': 'Karbinci', '38': 'Karpoš', '39': 'Kisela Voda', '40': 'Kičevo', '41': 'Konče', '42': 'Kočani', '43': 'Kratovo', '44': 'Kriva Palanka', '45': 'Krivogaštani', '46': 'Kruševo', '47': 'Kumanovo', '48': 'Lipkovo', '49': 'Lozovo', '50': 'Mavrovo i Rostuša', '51': 'Makedonska Kamenica', '52': 'Makedonski Brod', '53': 'Mogila', '54': 'Negotino', '55': 'Novaci', '56': 'Novo Selo', '57': 'Oslomej', '58': 'Ohrid', '59': 'Petrovec', '60': 'Pehčevo', '61': 'Plasnica', '62': 'Prilep', '63': 'Probištip', '64': 'Radoviš', '65': 'Rankovce', '66': 'Resen', '67': 'Rosoman', '68': 'Saraj', '69': 'Sveti Nikole', '70': 'Sopište', '71': 'Staro Nagoričane', '72': 'Struga', '73': 'Strumica', '74': 'Studeničani', '75': 'Tearce', '76': 'Tetovo', '77': 'Centar', '78': 'Centar Župa', '79': 'Čair', '80': 'Čaška', '81': 'Češinovo-Obleševo', '82': 'Čučer Sandevo', '83': 'Štip', '84': 'Šuto Orizari' }, ML: { '1': 'Kayes', '2': 'Koulikoro', '3': 'Sikasso', '4': 'Ségou', '5': 'Mopti', '6': 'Tombouctou', '7': 'Gao', '8': 'Kidal', BKO: 'Bamako' }, MM: { '1': 'Sagaing', '2': 'Bago', '3': 'Magway', '4': 'Mandalay', '5': 'Tanintharyi', '6': 'Yangon', '7': 'Ayeyarwady', '11': 'Kachin', '12': 'Kayah', '13': 'Kayin', '14': 'Chin', '15': 'Mon', '16': 'Rakhine', '17': 'Shan' }, MN: { '1': 'Ulaanbaatar', '35': 'Orhon', '37': 'Darhan uul', '39': 'Hentiy', '41': 'Hövsgöl', '43': 'Hovd', '46': 'Uvs', '47': 'Töv', '49': 'Selenge', '51': 'Sühbaatar', '53': 'Ömnögovi', '55': 'Övörhangay', '57': 'Dzavhan', '59': 'Dundgovi', '61': 'Dornod', '63': 'Dornogovi', '64': 'Govi-Sümber', '65': 'Govi-Altay', '67': 'Bulgan', '69': 'Bayanhongor', '71': 'Bayan-Ölgiy', '73': 'Arhangay' }, MR: { '1': 'Hodh ech Chargui', '2': 'Hodh el Gharbi', '3': 'Assaba', '4': 'Gorgol', '5': 'Brakna', '6': 'Trarza', '7': 'Adrar', '8': 'Dakhlet Nouadhibou', '9': 'Tagant', '10': 'Guidimaka', '11': 'Tiris Zemmour', '12': 'Inchiri', NKC: 'Nouakchott' }, MT: { '1': 'Attard', '2': 'Balzan', '3': 'Birgu', '4': 'Birkirkara', '5': 'Birżebbuġa', '6': 'Bormla', '7': 'Dingli', '8': 'Fgura', '9': 'Floriana', '10': 'Fontana', '11': 'Gudja', '12': 'Gżira', '13': 'Għajnsielem', '14': 'Għarb', '15': 'Għargħur', '16': 'Għasri', '17': 'Għaxaq', '18': 'Ħamrun', '19': 'Iklin', '20': 'Isla', '21': 'Kalkara', '22': 'Kerċem', '23': 'Kirkop', '24': 'Lija', '25': 'Luqa', '26': 'Marsa', '27': 'Marsaskala', '28': 'Marsaxlokk', '29': 'Mdina', '30': 'Mellieħa', '31': 'Mġarr', '32': 'Mosta', '33': 'Mqabba', '34': 'Msida', '35': 'Mtarfa', '36': 'Munxar', '37': 'Nadur', '38': 'Naxxar', '39': 'Paola', '40': 'Pembroke', '41': 'Pietà', '42': 'Qala', '43': 'Qormi', '44': 'Qrendi', '45': 'Rabat Gozo', '46': 'Rabat Malta', '47': 'Safi', '48': 'Saint Julian’s', '49': 'Saint John', '50': 'Saint Lawrence', '51': 'Saint Paul’s Bay', '52': 'Sannat', '53': 'Saint Lucia’s', '54': 'Santa Venera', '55': 'Siġġiewi', '56': 'Sliema', '57': 'Swieqi', '58': 'Ta’ Xbiex', '59': 'Tarxien', '60': 'Valletta', '61': 'Xagħra', '62': 'Xewkija', '63': 'Xgħajra', '64': 'Żabbar', '65': 'Żebbuġ Gozo', '66': 'Żebbuġ Malta', '67': 'Żejtun', '68': 'Żurrieq' }, MU: { AG: 'Agalega Islands', BL: 'Black River', BR: 'Beau Bassin-Rose Hill', CC: 'Cargados Carajos Shoals', CU: 'Curepipe', FL: 'Flacq', GP: 'Grand Port', MO: 'Moka', PA: 'Pamplemousses', PL: 'Port Louis', PU: 'Port Louis', PW: 'Plaines Wilhems', QB: 'Quatre Bornes', RO: 'Rodrigues Island', RR: 'Rivière du Rempart', SA: 'Savanne', VP: 'Vacoas-Phoenix' }, MV: { '1': 'Seenu', '2': 'Alif', '3': 'Lhaviyani', '4': 'Vaavu', '5': 'Laamu', '7': 'Haa Alif', '8': 'Thaa', '12': 'Meemu', '13': 'Raa', '14': 'Faafu', '17': 'Dhaalu', '20': 'Baa', '23': 'Haa Dhaalu', '24': 'Shaviyani', '25': 'Noonu', '26': 'Kaafu', '27': 'Gaaf Alif', '28': 'Gaafu Dhaalu', '29': 'Gnaviyani', MLE: 'Male' }, MW: { BA: 'Balaka', BL: 'Blantyre', CK: 'Chikwawa', CR: 'Chiradzulu', CT: 'Chitipa', DE: 'Dedza', DO: 'Dowa', KR: 'Karonga', KS: 'Kasungu', LI: 'Lilongwe', LK: 'Likoma Island', MC: 'Mchinji', MG: 'Mangochi', MH: 'Machinga', MU: 'Mulanje', MW: 'Mwanza', MZ: 'Mzimba', NB: 'Nkhata Bay', NI: 'Ntchisi', NK: 'Nkhotakota', NS: 'Nsanje', NU: 'Ntcheu', PH: 'Phalombe', RU: 'Rumphi', SA: 'Salima', TH: 'Thyolo', ZO: 'Zomba' }, MX: { AGU: 'Aguascalientes', BCN: 'Baja California', BCS: 'Baja California Sur', CAM: 'Campeche', CHH: 'Chihuahua', CHP: 'Chiapas', COA: 'Coahuila', COL: 'Colima', DIF: 'Distrito Federal', DUR: 'Durango', GRO: 'Guerrero', GUA: 'Guanajuato', HID: 'Hidalgo', JAL: 'Jalisco', MEX: 'México', MIC: 'Michoacán', MOR: 'Morelos', NAY: 'Nayarit', NLE: 'Nuevo León', OAX: 'Oaxaca', PUE: 'Puebla', QUE: 'Querétaro', ROO: 'Quintana Roo', SIN: 'Sinaloa', SLP: 'San Luis Potosí', SON: 'Sonora', TAB: 'Tabasco', TAM: 'Tamaulipas', TLA: 'Tlaxcala', VER: 'Veracruz', YUC: 'Yucatán', ZAC: 'Zacatecas' }, MY: { '1': 'Johor', '2': 'Kedah', '3': 'Kelantan', '4': 'Melaka', '5': 'Negeri Sembilan', '6': 'Pahang', '7': 'Pulau Pinang', '8': 'Perak', '9': 'Perlis', '10': 'Selangor', '11': 'Terengganu', '12': 'Sabah', '13': 'Sarawak', '14': 'Wilayah Persekutuan Kuala Lumpur', '15': 'Wilayah Persekutuan Labuan', '16': 'Wilayah Persekutuan Putrajaya' }, MZ: { A: 'Niassa', B: 'Manica', G: 'Gaza', I: 'Inhambane', L: 'Maputo', MPM: 'Maputo', N: 'Nampula', P: 'Cabo Delgado', Q: 'Zambézia', S: 'Sofala', T: 'Tete' }, NA: { CA: 'Caprivi', ER: 'Erongo', HA: 'Hardap', KA: 'Karas', KH: 'Khomas', KU: 'Kunene', OD: 'Otjozondjupa', OH: 'Omaheke', OK: 'Okavango', ON: 'Oshana', OS: 'Omusati', OT: 'Oshikoto', OW: 'Ohangwena' }, NE: { '1': 'Agadez', '2': 'Diffa', '3': 'Dosso', '4': 'Maradi', '5': 'Tahoua', '6': 'Tillabéri', '7': 'Zinder', '8': 'Niamey' }, NG: { AB: 'Abia', AD: 'Adamawa', AK: 'Akwa Ibom', AN: 'Anambra', BA: 'Bauchi', BE: 'Benue', BO: 'Borno', BY: 'Bayelsa', CR: 'Cross River', DE: 'Delta', EB: 'Ebonyi', ED: 'Edo', EK: 'Ekiti', EN: 'Enugu', FC: 'Abuja Capital Territory', GO: 'Gombe', IM: 'Imo', JI: 'Jigawa', KD: 'Kaduna', KE: 'Kebbi', KN: 'Kano', KO: 'Kogi', KT: 'Katsina', KW: 'Kwara', LA: 'Lagos', NA: 'Nassarawa', NI: 'Niger', OG: 'Ogun', ON: 'Ondo', OS: 'Osun', OY: 'Oyo', PL: 'Plateau', RI: 'Rivers', SO: 'Sokoto', TA: 'Taraba', YO: 'Yobe', ZA: 'Zamfara' }, NI: { AN: 'Atlantico Norte', AS: 'Atlantico Sur', BO: 'Boaco', CA: 'Carazo', CI: 'Chinandega', CO: 'Chontales', ES: 'Estelí', GR: 'Granada', JI: 'Jinotega', LE: 'León', MD: 'Madriz', MN: 'Managua', MS: 'Masaya', MT: 'Matagalpa', NS: 'Nueva Segovia', RI: 'Rivas', SJ: 'Río San Juan' }, NL: { DR: 'Drenthe', FL: 'Flevoland', FR: 'Friesland', GE: 'Gelderland', GR: 'Groningen', LI: 'Limburg', NB: 'Noord-Brabant', NH: 'Noord-Holland', OV: 'Overijssel', UT: 'Utrecht', ZE: 'Zeeland', ZH: 'Zuid-Holland' }, NO: { '1': 'Østfold', '2': 'Akershus', '3': 'Oslo', '4': 'Hedmark', '5': 'Oppland', '6': 'Buskerud', '7': 'Vestfold', '8': 'Telemark', '9': 'Aust-Agder', '10': 'Vest-Agder', '11': 'Rogaland', '12': 'Hordaland', '14': 'Sogn og Fjordane', '15': 'Møre og Romsdal', '16': 'Sør-Trøndelag', '17': 'Nord-Trøndelag', '18': 'Nordland', '19': 'Troms', '20': 'Finnmark', '21': 'Svalbard', '22': 'Jan Mayen' }, NP: { BA: 'Bagmati', BH: 'Bheri', DH: 'Dhawalagiri', GA: 'Gandaki', JA: 'Janakpur', KA: 'Karnali', KO: 'Kosi', LU: 'Lumbini', MA: 'Mahakali', ME: 'Mechi', NA: 'Narayani', RA: 'Rapti', SA: 'Sagarmatha', SE: 'Seti' }, NR: { '1': 'Aiwo', '2': 'Anabar', '3': 'Anetan', '4': 'Anibare', '5': 'Baiti', '6': 'Boe', '7': 'Buada', '8': 'Denigomodu', '9': 'Ewa', '10': 'Ijuw', '11': 'Meneng', '12': 'Nibok', '13': 'Uaboe', '14': 'Yaren' }, NZ: { AUK: 'Auckland', BOP: 'Bay of Plenty', CAN: 'Canterbury', GIS: 'Gisborne', HKB: 'Hawkes\'s Bay', MBH: 'Marlborough', MWT: 'Manawatu-Wanganui', NSN: 'Nelson', NTL: 'Northland', OTA: 'Otago', STL: 'Southland', TAS: 'Tasman', TKI: 'Taranaki', WGN: 'Wellington', WKO: 'Waikato', WTC: 'West Coast' }, OM: { BA: 'Al Batinah', DA: 'Ad Dakhlilyah', JA: 'Al Janubiyah', MA: 'Masqat', MU: 'Musandam', SH: 'Ash Sharqiyah', WU: 'Al Wustá', ZA: 'Az Zahirah' }, PA: { '0': 'Comarca de San Blas', '1': 'Bocas del Toro', '2': 'Coclé', '3': 'Colón', '4': 'Chiriquí', '5': 'Darién', '6': 'Herrera', '7': 'Los Santos', '8': 'Panamá', '9': 'Veraguas' }, PE: { AMA: 'Amazonas', ANC: 'Ancash', APU: 'Apurímac', ARE: 'Arequipa', AYA: 'Ayacucho', CAJ: 'Cajamarca', CAL: 'El Callao', CUS: 'Cuzco', HUC: 'Huánuco', HUV: 'Huancavelica', ICA: 'Ica', JUN: 'Junín', LAL: 'La Libertad', LAM: 'Lambayeque', LIM: 'Lima', LOR: 'Loreto', MDD: 'Madre de Dios', MOQ: 'Moquegua', PAS: 'Pasco', PIU: 'Piura', PUN: 'Puno', SAM: 'San Martín', TAC: 'Tacna', TUM: 'Tumbes', UCA: 'Ucayali' }, PG: { CPK: 'Chimbu', CPM: 'Central', EBR: 'East New Britain', EHG: 'Eastern Highlands', EPW: 'Enga', ESW: 'East Sepik', GPK: 'Gulf', MBA: 'Milne Bay', MPL: 'Morobe', MPM: 'Madang', MRL: 'Manus', NCD: 'National Capital District', NIK: 'New Ireland', NPP: 'Northern', NSA: 'North Solomons', SAN: 'Sandaun', SHM: 'Southern Highlands', WBK: 'West New Britain', WHM: 'Western Highlands', WPD: 'Western' }, PH: { '0': 'National Capital Region (Manila)', ABR: 'Abra', AGN: 'Agusan del Norte', AGS: 'Agusan del Sur', AKL: 'Aklan', ALB: 'Albay', ANT: 'Antique', APA: 'Apayao', AUR: 'Aurora', BAN: 'Bataan', BAS: 'Basilan', BEN: 'Benguet', BIL: 'Biliran', BOH: 'Bohol', BTG: 'Batangas', BTN: 'Batanes', BUK: 'Bukidnon', BUL: 'Bulacan', CAG: 'Cagayan', CAM: 'Camiguin', CAN: 'Camarines Norte', CAP: 'Capiz', CAS: 'Camarines Sur', CAT: 'Catanduanes', CAV: 'Cavite', CEB: 'Cebu', COM: 'Compostela Valley', DAO: 'Davao Oriental', DAS: 'Davao del Sur', DAV: 'Davao', EAS: 'Eastern Samar', GUI: 'Guimaras', IFU: 'Ifugao', ILI: 'Iloilo', ILN: 'Ilocos Norte', ILS: 'Ilocos Sur', ISA: 'Isabela', KAL: 'Kalinga', LAG: 'Laguna', LAN: 'Lanao del Norte', LAS: 'Lanao del Sur', LEY: 'Leyte', LUN: 'La Union', MAD: 'Marinduque', MAG: 'Maguindanao', MAS: 'Masbate', MDC: 'Mindoro Occidental', MDR: 'Mindoro Oriental', MOU: 'Mountain Province', MSC: 'Misamis Occidental', MSR: 'Misamis Oriental', NCO: 'North Cotabato', NEC: 'Negros Occidental', NER: 'Negros Oriental', NSA: 'Northern Samar', NUE: 'Nueva Ecija', NUV: 'Nueva Vizcaya', PAM: 'Pampanga', PAN: 'Pangasinan', PLW: 'Palawan', QUE: 'Quezon', QUI: 'Quirino', RIZ: 'Rizal', ROM: 'Romblon', SAR: 'Sarangani', SCO: 'South Cotabato', SIG: 'Siquijor', SLE: 'Southern Leyte', SLU: 'Sulu', SOR: 'Sorsogon', SUK: 'Sultan Kudarat', SUN: 'Surigao del Norte', SUR: 'Surigao del Sur', TAR: 'Tarlac', TAW: 'Tawi-Tawi', WSA: 'Western Samar', ZAN: 'Zamboanga del Norte', ZAS: 'Zamboanga del Sur', ZMB: 'Zambales', ZSI: 'Zamboanga Sibuguey' }, PK: { BA: 'Baluchistan', IS: 'Islamabad', JK: 'Azad Kashmir', NA: 'Northern Areas', NW: 'North-West Frontier', PB: 'Punjab', SD: 'Sind', TA: 'Federally Administered Tribal Areas' }, PL: { DS: 'Dolnoslaskie', KP: 'Kujawsko-pomorskie', LB: 'Lubuskie', LD: 'Lódzkie', LU: 'Lubelskie', MA: 'Malopolskie', MZ: 'Mazowieckie', OP: 'Opolskie', PD: 'Podlaskie', PK: 'Podkarpackie', PM: 'Pomorskie', SK: 'Swietokrzyskie', SL: 'Slaskie', WN: 'Warminsko-mazurskie', WP: 'Wielkopolskie', ZP: 'Zachodniopomorskie' }, PT: { '1': 'Aveiro', '2': 'Beja', '3': 'Braga', '4': 'Bragança', '5': 'Castelo Branco', '6': 'Coimbra', '7': 'Évora', '8': 'Faro', '9': 'Guarda', '10': 'Leiria', '11': 'Lisboa', '12': 'Portalegre', '13': 'Porto', '14': 'Santarém', '15': 'Setúbal', '16': 'Viana do Castelo', '17': 'Vila Real', '18': 'Viseu', '20': 'Regiao Autónoma dos Açores', '30': 'Regiao Autónoma da Madeira' }, PW: { '2': 'Aimeliik', '4': 'Airai', '10': 'Angaur', '50': 'Hatobohei', '100': 'Kayangel', '150': 'Koror', '212': 'Melekeok', '214': 'Ngaraard', '218': 'Ngarchelong', '222': 'Ngardmau', '224': 'Ngatpang', '226': 'Ngchesar', '227': 'Ngeremlengui', '228': 'Ngiwal', '350': 'Peleliu', '370': 'Sonsorol' }, PY: { '1': 'Concepción', '2': 'San Pedro', '3': 'Cordillera', '4': 'Guairá', '5': 'Caaguazú', '6': 'Caazapá', '7': 'Itapúa', '8': 'Misiones', '9': 'Paraguarí', '10': 'Alto Paraná', '11': 'Central', '12': 'Neembucú', '13': 'Amambay', '14': 'Canindeyú', '15': 'Presidente Hayes', '16': 'Alto Paraguay', '19': 'Boquerón', ASU: 'Asunción' }, QA: { DA: 'Ad Dawhah', GH: 'Al Ghuwayriyah', JB: 'Jariyan al Batnah', JU: 'Al Jumayliyah', KH: 'Al Khawr', MS: 'Madinat ash Shamal', RA: 'Ar Rayyan', US: 'Umm Salal', WA: 'Al Wakrah' }, RO: { AB: 'Alba', AG: 'Arges', AR: 'Arad', B: 'Bucuresti', BC: 'Bacau', BH: 'Bihor', BN: 'Bistrita-Nasaud', BR: 'Braila', BT: 'Botosani', BV: 'Brasov', BZ: 'Buzau', CJ: 'Cluj', CL: 'Calarasi', CS: 'Caras-Severin', CT: 'Constanta', CV: 'Covasna', DB: 'Dâmbovita', DJ: 'Dolj', GJ: 'Gorj', GL: 'Galati', GR: 'Giurgiu', HD: 'Hunedoara', HR: 'Harghita', IF: 'Ilfov', IL: 'Ialomita', IS: 'Iasi', MH: 'Mehedinti', MM: 'Maramures', MS: 'Mures', NT: 'Neamt', OT: 'Olt', PH: 'Prahova', SB: 'Sibiu', SJ: 'Salaj', SM: 'Satu Mare', SV: 'Suceava', TL: 'Tulcea', TM: 'Timis', TR: 'Teleorman', VL: 'Valcea', VN: 'Vrancea', VS: 'Vaslui' }, RS: { '0': 'Beograd', '1': 'Severna Bačka', '2': 'Srednji Banat', '3': 'Severni Banat', '4': 'Južni Banat', '5': 'Zapadna Bačka', '6': 'Južna Bačka', '7': 'Srem', '8': 'Mačva', '9': 'Kolubara', '10': 'Podunavlje', '11': 'Braničevo', '12': 'Šumadija', '13': 'Pomoravlje', '14': 'Bor', '15': 'Zaječar', '16': 'Zlatibor', '17': 'Moravica', '18': 'Raška', '19': 'Rasina', '20': 'Nišava', '21': 'Toplica', '22': 'Pirot', '23': 'Jablanica', '24': 'Pčinja', '25': 'Kosovo', '26': 'Peć', '27': 'Prizren', '28': 'Kosovska Mitrovica', '29': 'Kosovo-Pomoravlje' }, RU: { AD: 'Adygeya, Respublika', AGB: 'Aginskiy Buryatskiy avtonomnyy okrug', AL: 'Altay, Respublika', ALT: 'Altayskiy kray', AMU: 'Amurskaya oblast\'', ARK: 'Arkhangel\'skaya oblast\'', AST: 'Astrakhanskaya oblast\'', BA: 'Bashkortostan, Respublika', BEL: 'Belgorodskaya oblast\'', BRY: 'Bryanskaya oblast\'', BU: 'Buryatiya, Respublika', CE: 'Chechenskaya Respublika', CHE: 'Chelyabinskaya oblast\'', CHI: 'Chitinskaya oblast\'', CHU: 'Chukotskiy avtonomnyy okrug', CU: 'Chuvashskaya Respublika', DA: 'Dagestan, Respublika', IN: 'Ingushetiya, Respublika', IRK: 'Irkutskaya oblast\'', IVA: 'Ivanovskaya oblast\'', KAM: 'Kamchatskiy kray', KB: 'Kabardino-Balkarskaya Respublika', KC: 'Karachayevo-Cherkesskaya Respublika', KDA: 'Krasnodarskiy kray', KEM: 'Kemerovskaya oblast\'', KGD: 'Kaliningradskaya oblast\'', KGN: 'Kurganskaya oblast\'', KHA: 'Khabarovskiy kray', KHM: 'Khanty-Mansiyskiy avtonomnyy okrug-Yugra', KIR: 'Kirovskaya oblast\'', KK: 'Khakasiya, Respublika', KL: 'Kalmykiya, Respublika', KLU: 'Kaluzhskaya oblast\'', KO: 'Komi, Respublika', KOS: 'Kostromskaya oblast\'', KR: 'Kareliya, Respublika', KRS: 'Kurskaya oblast\'', KYA: 'Krasnoyarskiy kray', LEN: 'Leningradskaya oblast\'', LIP: 'Lipetskaya oblast\'', MAG: 'Magadanskaya oblast\' Magadan', ME: 'Mariy El, Respublika', MO: 'Mordoviya, Respublika', MOS: 'Moskovskaya oblast\'', MOW: 'Moskva', MUR: 'Murmanskaya oblast\'', NEN: 'Nenetskiy avtonomnyy okrug', NGR: 'Novgorodskaya oblast\'', NIZ: 'Nizhegorodskaya oblast\'', NVS: 'Novosibirskaya oblast\'', OMS: 'Omskaya oblast\'', ORE: 'Orenburgskaya oblast\'', ORL: 'Orlovskaya oblast\'', PER: 'Permskiy kray', PNZ: 'Penzenskaya oblast\'', PRI: 'Primorskiy kray', PSK: 'Pskovskaya oblast\'', ROS: 'Rostovskaya oblast\'', RYA: 'Ryazanskaya oblast\'', SA: 'Sakha, Respublika (Yakutiya)', SAK: 'Sakhalinskaya oblast\'', SAM: 'Samarskaya oblast\'', SAR: 'Saratovskaya oblast\'', SE: 'Severnaya Osetiya- Alaniya, Respublika', SMO: 'Smolenskaya oblast\'', SPE: 'Sankt-Peterburg', STA: 'Stavropol\'skiy kray', SVE: 'Sverdlovskaya oblast\'', TA: 'Tatarstan, Respublika', TAM: 'Tambovskaya oblast\'', TOM: 'Tomskaya oblast\'', TUL: 'Tul\'skaya oblast\'', TVE: 'Tverskaya oblast\'', TY: 'Tyva, Respublika (Tuva)', TYU: 'Tyumenskaya oblast\'', UD: 'Udmurtskaya Respublika', ULY: 'Ul\'yanovskaya oblast\'', UOB: 'Ust\'-Ordynskiy Buryatskiy avtonomnyy okrug', VGG: 'Volgogradskaya oblast\'', VLA: 'Vladimirskaya oblast\'', VLG: 'Vologodskaya oblast\'', VOR: 'Voronezhskaya oblast\'', YAN: 'Yamalo-Nenetskiy avtonomnyy okrug', YAR: 'Yaroslavskaya oblast\'', YEV: 'Yevreyskaya avtonomnaya oblast\'' }, RW: { '1': 'Ville de Kigali', '2': 'Est', '3': 'Nord', '4': 'Ouest', '5': 'Sud' }, SA: { '1': 'Ar Riyad', '2': 'Makkah', '3': 'Al Madinah', '4': 'Ash Sharqiyah', '5': 'Al Qasim', '6': 'Ha\'il', '7': 'Tabuk', '8': 'Al Hudud ash Shamaliyah', '9': 'Jizan', '10': 'Najran', '11': 'Al Bahah', '12': 'Al Jawf', '14': 'Asir' }, SB: { CE: 'Central', CH: 'Choiseul', CT: 'Capital Territory', GU: 'Guadalcanal', IS: 'Isabel', MK: 'Makira', ML: 'Malaita', RB: 'Rennell and Bellona', TE: 'Temotu', WE: 'Western' }, SC: { '1': 'Anse aux Pins', '2': 'Anse Boileau', '3': 'Anse Étoile', '4': 'Anse Louis', '5': 'Anse Royale', '6': 'Baie Lazare', '7': 'Baie Sainte Anne', '8': 'Beau Vallon', '9': 'Bel Air', '10': 'Bel Ombre', '11': 'Cascade', '12': 'Glacis', '13': 'Grand\' Anse (Mahé)', '14': 'Grand\' Anse (Praslin)', '15': 'La Digue', '16': 'La Rivière Anglaise', '17': 'Mont Buxton', '18': 'Mont Fleuri', '19': 'Plaisance', '20': 'Pointe La Rue', '21': 'Port Glaud', '22': 'Saint Louis', '23': 'Takamaka' }, SE: { AB: 'Stockholms län', AC: 'Västerbottens län', BD: 'Norrbottens län', C: 'Uppsala län', D: 'Södermanlands län', E: 'Östergötlands län', F: 'Jönköpings län', G: 'Kronobergs län', H: 'Kalmar län', I: 'Gotlands län', K: 'Blekinge län', M: 'Skåne län', N: 'Hallands län', O: 'Västra Götalands län', S: 'Värmlands län', T: 'Örebro län', U: 'Västmanlands län', W: 'Dalarnas län', X: 'Gävleborgs län', Y: 'Västernorrlands län', Z: 'Jämtlands län' }, SG: { '1': 'Central Singapore', '2': 'North East', '3': 'North West', '4': 'South East', '5': 'South West' }, SH: { AC: 'Ascension', SH: 'Saint Helena', TA: 'Tristan da Cunha' }, SI: { '1': 'Ajdovscina', '2': 'Beltinci', '3': 'Bled', '4': 'Bohinj', '5': 'Borovnica', '6': 'Bovec', '7': 'Brda', '8': 'Brezovica', '9': 'Brezice', '10': 'Tisina', '11': 'Celje', '12': 'Cerklje na Gorenjskem', '13': 'Cerknica', '14': 'Cerkno', '15': 'Crensovci', '16': 'Crna na Koroskem', '17': 'Crnomelj', '18': 'Destrnik', '19': 'Divaca', '20': 'Dobrepolje', '21': 'Dobrova-Polhov Gradec', '22': 'Dol pri Ljubljani', '23': 'Domzale', '24': 'Dornava', '25': 'Dravograd', '26': 'Duplek', '27': 'Gorenja vas-Poljane', '28': 'Gorisnica', '29': 'Gornja Radgona', '30': 'Gornji Grad', '31': 'Gornji Petrovci', '32': 'Grosuplje', '33': 'Salovci', '34': 'Hrastnik', '35': 'Hrpelje-Kozina', '36': 'Idrija', '37': 'Ig', '38': 'Ilirska Bistrica', '39': 'Ivancna Gorica', '40': 'Izola/Isola', '41': 'Jesenice', '42': 'Jursinci', '43': 'Kamnik', '44': 'Kanal', '45': 'Kidricevo', '46': 'Kobarid', '47': 'Kobilje', '48': 'Kocevje', '49': 'Komen', '50': 'Koper/Capodistria', '51': 'Kozje', '52': 'Kranj', '53': 'Kranjska Gora', '54': 'Krsko', '55': 'Kungota', '56': 'Kuzma', '57': 'Lasko', '58': 'Lenart', '59': 'Lendava/Lendva', '60': 'Litija', '61': 'Ljubljana', '62': 'Ljubno', '63': 'Ljutomer', '64': 'Logatec', '65': 'Loska dolina', '66': 'Loski Potok', '67': 'Luce', '68': 'Lukovica', '69': 'Majsperk', '70': 'Maribor', '71': 'Medvode', '72': 'Menges', '73': 'Metlika', '74': 'Mezica', '75': 'Miren-Kostanjevica', '76': 'Mislinja', '77': 'Moravce', '78': 'Moravske Toplice', '79': 'Mozirje', '80': 'Murska Sobota', '81': 'Muta', '82': 'Naklo', '83': 'Nazarje', '84': 'Nova Gorica', '85': 'Novo mesto', '86': 'Odranci', '87': 'Ormoz', '88': 'Osilnica', '89': 'Pesnica', '90': 'Piran/Pirano', '91': 'Pivka', '92': 'Podcetrtek', '93': 'Podvelka', '94': 'Postojna', '95': 'Preddvor', '96': 'Ptuj', '97': 'Puconci', '98': 'Race-Fram', '99': 'Radece', '100': 'Radenci', '101': 'Radlje ob Dravi', '102': 'Radovljica', '103': 'Ravne na Koroskem', '104': 'Ribnica', '105': 'Rogasovci', '106': 'Rogaska Slatina', '107': 'Rogatec', '108': 'Ruse', '109': 'Semic', '110': 'Sevnica', '111': 'Sezana', '112': 'Slovenj Gradec', '113': 'Slovenska Bistrica', '114': 'Slovenske Konjice', '115': 'Starse', '116': 'Sveti Jurij', '117': 'Sencur', '118': 'Sentilj', '119': 'Sentjernej', '120': 'Sentjur pri Celju', '121': 'Skocjan', '122': 'Skofja Loka', '123': 'Skofljica', '124': 'Smarje pri Jelsah', '125': 'Smartno ob Paki', '126': 'Sostanj', '127': 'Store', '128': 'Tolmin', '129': 'Trbovlje', '130': 'Trebnje', '131': 'Trzic', '132': 'Turnisce', '133': 'Velenje', '134': 'Velike Lasce', '135': 'Videm', '136': 'Vipava', '137': 'Vitanje', '138': 'Vodice', '139': 'Vojnik', '140': 'Vrhnika', '141': 'Vuzenica', '142': 'Zagorje ob Savi', '143': 'Zavrc', '144': 'Zrece', '146': 'Zelezniki', '147': 'Ziri', '148': 'Benedikt', '149': 'Bistrica ob Sotli', '150': 'Bloke', '151': 'Braslovce', '152': 'Cankova', '153': 'Cerkvenjak', '154': 'Dobje', '155': 'Dobrna', '156': 'Dobrovnik/Dobronak', '157': 'Dolenjske Toplice', '158': 'Grad', '159': 'Hajdina', '160': 'Hoče-Slivnica', '161': 'Hodoš/Hodos', '162': 'Horjul', '163': 'Jezersko', '164': 'Komenda', '165': 'Kostel', '166': 'Krizevci', '167': 'Lovrenc na Pohorju', '168': 'Markovci', '169': 'Miklavz na Dravskem polju', '170': 'Mirna Pec', '171': 'Oplotnica', '172': 'Podlehnik', '173': 'Polzela', '174': 'Prebold', '175': 'Prevalje', '176': 'Razkrizje', '177': 'Ribnica na Pohorju', '178': 'Selnica ob Dravi', '179': 'Sodrazica', '180': 'Solcava', '181': 'Sveta Ana', '182': 'Sveti Andraz v Slovenskih goricah', '183': 'Sempeter-Vrtojba', '184': 'Tabor', '185': 'Trnovska vas', '186': 'Trzin', '187': 'Velika Polana', '188': 'Verzej', '189': 'Vransko', '190': 'Zalec', '191': 'Zetale', '192': 'Zirovnica', '193': 'Zuzemberk', '194': 'Smartno pri Litiji' }, SK: { BC: 'Banskobystrický kraj', BL: 'Bratislavský kraj', KI: 'Kosický kraj', NI: 'Nitriansky kraj', PV: 'Presovský kraj', TA: 'Trnavský kraj', TC: 'Trenciansky kraj', ZI: 'Zilinský kraj' }, SL: { E: 'Eastern', N: 'Northern', S: 'Southern', W: 'Western Area' }, SM: { '1': 'Acquaviva', '2': 'Chiesanuova', '3': 'Domagnano', '4': 'Faetano', '5': 'Fiorentino', '6': 'Borgo Maggiore', '7': 'San Marino', '8': 'Montegiardino', '9': 'Serravalle' }, SN: { DB: 'Diourbel', DK: 'Dakar', FK: 'Fatick', KD: 'Kolda', KL: 'Kaolack', LG: 'Louga', MT: 'Matam', SL: 'Saint-Louis', TC: 'Tambacounda', TH: 'Thiès', ZG: 'Ziguinchor' }, SO: { AW: 'Awdal', BK: 'Bakool', BN: 'Banaadir', BR: 'Bari', BY: 'Bay', GA: 'Galguduud', GE: 'Gedo', HI: 'Hiiraan', JD: 'Jubbada Dhexe', JH: 'Jubbada Hoose', MU: 'Mudug', NU: 'Nugaal', SA: 'Sanaag', SD: 'Shabeellaha Dhexe', SH: 'Shabeellaha Hoose', SO: 'Sool', TO: 'Togdheer', WO: 'Woqooyi Galbeed' }, SR: { BR: 'Brokopondo', CM: 'Commewijne', CR: 'Coronie', MA: 'Marowijne', NI: 'Nickerie', PM: 'Paramaribo', PR: 'Para', SA: 'Saramacca', SI: 'Sipaliwini', WA: 'Wanica' }, ST: { P: 'Príncipe', S: 'Sao Tomé' }, SV: { AH: 'Ahuachapán', CA: 'Cabañas', CH: 'Chalatenango', CU: 'Cuscatlán', LI: 'La Libertad', MO: 'Morazán', PA: 'La Paz', SA: 'Santa Ana', SM: 'San Miguel', SO: 'Sonsonate', SS: 'San Salvador', SV: 'San Vincente', UN: 'La Unión', US: 'Usulután' }, SZ: { HH: 'Hhohho', LU: 'Lubombo', MA: 'Manzini', SH: 'Shiselweni' }, TD: { BA: 'Batha', BET: 'Borkou-Ennedi-Tibesti', BI: 'Biltine', CB: 'Chari-Baguirmi', GR: 'Guéra', HL: 'Hadjer Lamis', KA: 'Kanem', LC: 'Lac', LO: 'Logone-Occidental', LR: 'Logone-Oriental', MA: 'Mandoul', MC: 'Moyen-Chari', ME: 'Mayo-Kébbi-Est', MO: 'Mayo-Kébbi-Ouest', ND: 'Ndjamena', OD: 'Ouaddaï', SA: 'Salamat', TA: 'Tandjilé', WF: 'Wadi Fira' }, TG: { C: 'Centre', K: 'Kara', M: 'Maritime', P: 'Plateaux', S: 'Savannes' }, TH: { '10': 'Krung Thep Maha Nakhon', '11': 'Samut Prakan', '12': 'Nonthaburi', '13': 'Pathum Thani', '14': 'Phra Nakhon Si Ayutthaya', '15': 'Ang Thong', '16': 'Lop Buri', '17': 'Sing Buri', '18': 'Chai Nat', '19': 'Saraburi', '20': 'Chon Buri', '21': 'Rayong', '22': 'Chanthaburi', '23': 'Trat', '24': 'Chachoengsao', '25': 'Prachin Buri', '26': 'Nakhon Nayok', '27': 'Sa Kaeo', '30': 'Nakhon Ratchasima', '31': 'Buri Ram', '32': 'Surin', '33': 'Si Sa Ket', '34': 'Ubon Ratchathani', '35': 'Yasothon', '36': 'Chaiyaphum', '37': 'Amnat Charoen', '39': 'Nong Bua Lam Phu', '40': 'Khon Kaen', '41': 'Udon Thani', '42': 'Loei', '43': 'Nong Khai', '44': 'Maha Sarakham', '45': 'Roi Et', '46': 'Kalasin', '47': 'Sakon Nakhon', '48': 'Nakhon Phanom', '49': 'Mukdahan', '50': 'Chiang Mai', '51': 'Lamphun', '52': 'Lampang', '53': 'Uttaradit', '54': 'Phrae', '55': 'Nan', '56': 'Phayao', '57': 'Chiang Rai', '58': 'Mae Hong Son', '60': 'Nakhon Sawan', '61': 'Uthai Thani', '62': 'Kamphaeng Phet', '63': 'Tak', '64': 'Sukhothai', '65': 'Phitsanulok', '66': 'Phichit', '67': 'Phetchabun', '70': 'Ratchaburi', '71': 'Kanchanaburi', '72': 'Suphan Buri', '73': 'Nakhon Pathom', '74': 'Samut Sakhon', '75': 'Samut Songkhram', '76': 'Phetchaburi', '77': 'Prachuap Khiri Khan', '80': 'Nakhon Si Thammarat', '81': 'Krabi', '82': 'Phangnga', '83': 'Phuket', '84': 'Surat Thani', '85': 'Ranong', '86': 'Chumphon', '90': 'Songkhla', '91': 'Satun', '92': 'Trang', '93': 'Phatthalung', '94': 'Pattani', '95': 'Yala', '96': 'Narathiwat', S: 'Phatthaya' }, TJ: { GB: 'Gorno-Badakhshan', KT: 'Khatlon', SU: 'Sughd' }, TL: { AL: 'Aileu', AN: 'Ainaro', BA: 'Baucau', BO: 'Bobonaro', CO: 'Cova Lima', DI: 'Dili', ER: 'Ermera', LA: 'Lautem', LI: 'Liquica', MF: 'Manufahi', MT: 'Manatuto', OE: 'Oecussi', VI: 'Viqueque' }, TM: { A: 'Ahal', B: 'Balkan', D: 'Dasoguz', L: 'Lebap', M: 'Mary' }, TN: { '11': 'Tunis', '12': 'L\'Ariana', '13': 'Ben Arous', '14': 'La Manouba', '21': 'Nabeul', '22': 'Zaghouan', '23': 'Bizerte', '31': 'Béja', '32': 'Jendouba', '33': 'Le Kef', '34': 'Siliana', '41': 'Kairouan', '42': 'Kasserine', '43': 'Sidi Bouzid', '51': 'Sousse', '52': 'Monastir', '53': 'Mahdia', '61': 'Sfax', '71': 'Gafsa', '72': 'Tozeur', '73': 'Kebili', '81': 'Gabès', '82': 'Medenine', '83': 'Tataouine' }, TO: { '1': 'Eua', '2': 'Ha\'apai', '3': 'Niuas', '4': 'Tongatapu', '5': 'Vava\'u' }, TR: { '1': 'Adana', '2': 'Adiyaman', '3': 'Afyon', '4': 'Agri', '5': 'Amasya', '6': 'Ankara', '7': 'Antalya', '8': 'Artvin', '9': 'Aydin', '10': 'Balikesir', '11': 'Bilecik', '12': 'Bingöl', '13': 'Bitlis', '14': 'Bolu', '15': 'Burdur', '16': 'Bursa', '17': 'Çanakkale', '18': 'Çankiri', '19': 'Çorum', '20': 'Denizli', '21': 'Diyarbakir', '22': 'Edirne', '23': 'Elazig', '24': 'Erzincan', '25': 'Erzurum', '26': 'Eskisehir', '27': 'Gaziantep', '28': 'Giresun', '29': 'Gümüshane', '30': 'Hakkâri', '31': 'Hatay', '32': 'Isparta', '33': 'Içel', '34': 'Istanbul', '35': 'Izmir', '36': 'Kars', '37': 'Kastamonu', '38': 'Kayseri', '39': 'Kirklareli', '40': 'Kirsehir', '41': 'Kocaeli', '42': 'Konya', '43': 'Kütahya', '44': 'Malatya', '45': 'Manisa', '46': 'Kahramanmaras', '47': 'Mardin', '48': 'Mugla', '49': 'Mus', '50': 'Nevsehir', '51': 'Nigde', '52': 'Ordu', '53': 'Rize', '54': 'Sakarya', '55': 'Samsun', '56': 'Siirt', '57': 'Sinop', '58': 'Sivas', '59': 'Tekirdag', '60': 'Tokat', '61': 'Trabzon', '62': 'Tunceli', '63': 'Sanliurfa', '64': 'Usak', '65': 'Van', '66': 'Yozgat', '67': 'Zonguldak', '68': 'Aksaray', '69': 'Bayburt', '70': 'Karaman', '71': 'Kirikkale', '72': 'Batman', '73': 'Sirnak', '74': 'Bartin', '75': 'Ardahan', '76': 'Igdir', '77': 'Yalova', '78': 'Karabük', '79': 'Kilis', '80': 'Osmaniye', '81': 'Düzce' }, TT: { ARI: 'Arima', CHA: 'Chaguanas', CTT: 'Couva-Tabaquite-Talparo', DMN: 'Diego Martin', ETO: 'Eastern Tobago', PED: 'Penal-Debe', POS: 'Port of Spain', PRT: 'Princes Town', PTF: 'Point Fortin', RCM: 'Rio Claro-Mayaro', SFO: 'San Fernando', SGE: 'Sangre Grande', SIP: 'Siparia', SJL: 'San Juan-Laventille', TUP: 'Tunapuna-Piarco', WTO: 'Western Tobago' }, TV: { FUN: 'Funafuti', NIT: 'Niutao', NIU: 'Nui', NKF: 'Nukufetau', NKL: 'Nukulaelae', NMA: 'Nanumea', NMG: 'Nanumanga', VAI: 'Vaitupu' }, TW: { CHA: 'Changhua', CYI: 'Chiayi', CYQ: 'Chiayi', HSQ: 'Hsinchu', HSZ: 'Hsinchu', HUA: 'Hualien', ILA: 'Ilan', KEE: 'Keelung', KHH: 'Kaohsiung', KHQ: 'Kaohsiung', MIA: 'Miaoli', NAN: 'Nantou', PEN: 'Penghu', PIF: 'Pingtung', TAO: 'Taoyuan', TNN: 'Tainan', TNQ: 'Tainan', TPE: 'Taipei', TPQ: 'Taipei', TTT: 'Taitung', TXG: 'Taichung', TXQ: 'Taichung', YUN: 'Yunlin' }, TZ: { '1': 'Arusha', '2': 'Dar es Salaam', '3': 'Dodoma', '4': 'Iringa', '5': 'Kagera', '6': 'Kaskazini Pemba', '7': 'Kaskazini Unguja', '8': 'Kigoma', '9': 'Kilimanjaro', '10': 'Kusini Pemba', '11': 'Kusini Unguja', '12': 'Lindi', '13': 'Mara', '14': 'Mbeya', '15': 'Mjini Magharibi', '16': 'Morogoro', '17': 'Mtwara', '18': 'Mwanza', '19': 'Pwani', '20': 'Rukwa', '21': 'Ruvuma', '22': 'Shinyanga', '23': 'Singida', '24': 'Tabora', '25': 'Tanga', '26': 'Manyara' }, UA: { '5': 'Vinnyts\'ka Oblast\'', '7': 'Volyns\'ka Oblast\'', '9': 'Luhans\'ka Oblast\'', '12': 'Dnipropetrovs\'ka Oblast\'', '14': 'Donets\'ka Oblast\'', '18': 'Zhytomyrs\'ka Oblast\'', '21': 'Zakarpats\'ka Oblast\'', '23': 'Zaporiz\'ka Oblast\'', '26': 'Ivano-Frankivs\'ka Oblast\'', '30': 'Kyiv', '32': 'Kyivs\'ka Oblast\'', '35': 'Kirovohrads\'ka Oblast\'', '40': 'Sevastopol\'', '43': 'Respublika Krym', '46': 'L\'vivs\'ka Oblast\'', '48': 'Mykolaivs\'ka Oblast\'', '51': 'Odes\'ka Oblast\'', '53': 'Poltavs\'ka Oblast\'', '56': 'Rivnens\'ka Oblast\'', '59': 'Sums\'ka Oblast\'', '61': 'Ternopil\'s\'ka Oblast\'', '63': 'Kharkivs\'ka Oblast\'', '65': 'Khersons\'ka Oblast\'', '68': 'Khmel\'nyts\'ka Oblast\'', '71': 'Cherkas\'ka Oblast\'', '74': 'Chernihivs\'ka Oblast\'', '77': 'Chernivets\'ka Oblast\'' }, UG: { '101': 'Kalangala', '102': 'Kampala', '103': 'Kiboga', '104': 'Luwero', '105': 'Masaka', '106': 'Mpigi', '107': 'Mubende', '108': 'Mukono', '109': 'Nakasongola', '110': 'Rakai', '111': 'Sembabule', '112': 'Kayunga', '113': 'Wakiso', '114': 'Mityana', '115': 'Nakaseke', '201': 'Bugiri', '202': 'Busia', '203': 'Iganga', '204': 'Jinja', '205': 'Kamuli', '206': 'Kapchorwa', '207': 'Katakwi', '208': 'Kumi', '209': 'Mbale', '210': 'Pallisa', '211': 'Soroti', '212': 'Tororo', '213': 'Kaberamaido', '214': 'Mayuge', '215': 'Sironko', '216': 'Amuria', '217': 'Budaka', '218': 'Bukwa', '219': 'Butaleja', '220': 'Kaliro', '221': 'Manafwa', '222': 'Namutumba', '301': 'Adjumani', '302': 'Apac', '303': 'Arua', '304': 'Gulu', '305': 'Kitgum', '306': 'Kotido', '307': 'Lira', '308': 'Moroto', '309': 'Moyo', '310': 'Nebbi', '311': 'Nakapiripirit', '312': 'Pader', '313': 'Yumbe', '314': 'Amolatar', '315': 'Kaabong', '316': 'Koboko', '317': 'Abim', '318': 'Dokolo', '319': 'Amuru', '320': 'Maracha', '321': 'Oyam', '401': 'Bundibugyo', '402': 'Bushenyi', '403': 'Hoima', '404': 'Kabale', '405': 'Kabarole', '406': 'Kasese', '407': 'Kibaale', '408': 'Kisoro', '409': 'Masindi', '410': 'Mbarara', '411': 'Ntungamo', '412': 'Rukungiri', '413': 'Kamwenge', '414': 'Kanungu', '415': 'Kyenjojo', '416': 'Ibanda', '417': 'Isingiro', '418': 'Kiruhura', '419': 'Bulisa' }, UM: { '67': 'Johnston Atoll', '71': 'Midway Islands', '76': 'Navassa Island', '79': 'Wake Island', '81': 'Baker Island', '84': 'Howland Island', '86': 'Jarvis Island', '89': 'Kingman Reef', '95': 'Palmyra Atoll' }, US: { AA: 'Armed Forces Americas', AE: 'Armed Forces Europe', AK: 'Alaska', AL: 'Alabama', AP: 'Armed Forces Pacific', AR: 'Arkansas', AS: 'American Samoa', AZ: 'Arizona', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DC: 'District of Columbia', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', GU: 'Guam', HI: 'Hawaii', IA: 'Iowa', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', MA: 'Massachusetts', MD: 'Maryland', ME: 'Maine', MI: 'Michigan', MN: 'Minnesota', MO: 'Missouri', MP: 'Northern Mariana Islands', MS: 'Mississippi', MT: 'Montana', NC: 'North Carolina', ND: 'North Dakota', NE: 'Nebraska', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NV: 'Nevada', NY: 'New York', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', PR: 'Puerto Rico', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UM: 'United States Minor Outlying Islands', UT: 'Utah', VA: 'Virginia', VI: 'Virgin Islands, U.S.', VT: 'Vermont', WA: 'Washington', WI: 'Wisconsin', WV: 'West Virginia', WY: 'Wyoming' }, UY: { AR: 'Artigas', CA: 'Canelones', CL: 'Cerro Largo', CO: 'Colonia', DU: 'Durazno', FD: 'Florida', FS: 'Flores', LA: 'Lavalleja', MA: 'Maldonado', MO: 'Montevideo', PA: 'Paysandu', RN: 'Rio Negro', RO: 'Rocha', RV: 'Rivera', SA: 'Salto', SJ: 'San José', SO: 'Soriano', TA: 'Tacuarembó', TT: 'Treinta y Tres' }, UZ: { AN: 'Andijon', BU: 'Buxoro', FA: 'Farg\'ona', JI: 'Jizzax', NG: 'Namangan', NW: 'Navoiy', QA: 'Qashqadaryo', QR: 'Qoraqalpog\'iston Respublikasi', SA: 'Samarqand', SI: 'Sirdaryo', SU: 'Surxondaryo', TK: 'Toshkent', TO: 'Toshkent', XO: 'Xorazm' }, VC: { '1': 'Charlotte', '2': 'Saint Andrew', '3': 'Saint David', '4': 'Saint George', '5': 'Saint Patrick', '6': 'Grenadines' }, VE: { A: 'Distrito Capital', B: 'Anzoátegui', C: 'Apure', D: 'Aragua', E: 'Barinas', F: 'Bolívar', G: 'Carabobo', H: 'Cojedes', I: 'Falcón', J: 'Guárico', K: 'Lara', L: 'Mérida', M: 'Miranda', N: 'Monagas', O: 'Nueva Esparta', P: 'Portuguesa', R: 'Sucre', S: 'Táchira', T: 'Trujillo', U: 'Yaracuy', V: 'Zulia', W: 'Dependencias Federales', X: 'Vargas', Y: 'Delta Amacuro', Z: 'Amazonas' }, VN: { '1': 'Lai Chau', '2': 'Lao Cai', '3': 'Ha Giang', '4': 'Cao Bang', '5': 'Son La', '6': 'Yen Bai', '7': 'Tuyen Quang', '9': 'Lang Son', '13': 'Quang Ninh', '14': 'Hoa Binh', '15': 'Ha Tay', '18': 'Ninh Binh', '20': 'Thai Binh', '21': 'Thanh Hoa', '22': 'Nghe An', '23': 'Ha Tinh', '24': 'Quang Binh', '25': 'Quang Tri', '26': 'Thua Thien-Hue', '27': 'Quang Nam', '28': 'Kon Tum', '29': 'Quang Ngai', '30': 'Gia Lai', '31': 'Binh Dinh', '32': 'Phu Yen', '33': 'Dac Lac', '34': 'Khanh Hoa', '35': 'lam Dong', '36': 'Ninh Thuan', '37': 'Tay Ninh', '39': 'Dong Nai', '40': 'Binh Thuan', '41': 'Long An', '43': 'Ba Ria - Vung Tau', '44': 'An Giang', '45': 'Dong Thap', '46': 'Tien Giang', '47': 'Kien Giang', '48': 'Can Tho', '49': 'Vinh Long', '50': 'Ben Tre', '51': 'Tra Vinh', '52': 'Soc Trang', '53': 'Bac Can', '54': 'Bac Giang', '55': 'Bac Lieu', '56': 'Bac Ninh', '57': 'Binh Duong', '58': 'Binh Phuoc', '59': 'Ca Mau', '60': 'Da Nang, thanh pho', '61': 'Hai Duong', '62': 'Hai Phong, thanh pho', '63': 'Ha Nam', '64': 'Ha Noi, thu do', '65': 'Ho Chi Minh, thanh pho', '66': 'Hung Yen', '67': 'Nam Dinh', '68': 'Phu Tho', '69': 'Thai Nguyen', '70': 'Vinh Phuc', '71': 'Dien Bien', '72': 'Dak Nong', '73': 'Hau Giang' }, VU: { MAP: 'Malampa', PAM: 'Pénama', SAM: 'Sanma', SEE: 'Shéfa', TAE: 'Taféa', TOB: 'Torba' }, WS: { AA: 'A\'ana', AL: 'Aiga-i-le-Tai', AT: 'Atua', FA: 'Fa\'asaleleaga', GE: 'Gaga\'emauga', GI: 'Gagaifomauga', PA: 'Palauli', SA: 'Satupa\' itea', TU: 'Tuamasaga', VF: 'Va\' a-o-Fonoti', VS: 'Vaisigano' }, YE: { AB: 'Abyan', AD: 'Adan', AM: 'Amran', BA: 'Al Bayda\'', DA: 'Ad Dali\'', DH: 'Dhamar', HD: 'Hadramawt', HJ: 'Hajjah', HU: 'Al Hudaydah', IB: 'Ibb', JA: 'Al Jawf', LA: 'Lahij', MA: 'Ma\'rib', MR: 'Al Mahrah', MW: 'Al Mahwit', SD: 'Sa\'dah', SH: 'Shabwah', SN: 'San\'a\'', TA: 'Ta\'izz' }, ZA: { EC: 'Eastern Cape', FS: 'Free State', GP: 'Gauteng', LP: 'Limpopo', MP: 'Mpumalanga', NC: 'Northern Cape', NW: 'North-West', WC: 'Western Cape', ZN: 'KwaZulu-Natal' }, ZM: { '1': 'Western', '2': 'Central', '3': 'Eastern', '4': 'Luapula', '5': 'Northern', '6': 'North-Western', '7': 'Southern', '8': 'Copperbelt', '9': 'Lusaka' }, ZW: { BU: 'Bulawayo', HA: 'Harare', MA: 'Manicaland', MC: 'Mashonaland Central', ME: 'Mashonaland East', MI: 'Midlands', MN: 'Matabeleland North', MS: 'Matabeleland South', MV: 'Masvingo', MW: 'Mashonaland West' } };


var rules = {
	"Q1" : { "displayLevel": 1, "*" : { "next": "Q2", "displayLevel": 1 } },
	"Q2" : { "displayLevel": 1, "*" : { "next":"Q3", "displayLevel": 1 } },
	"Q3" : { "displayLevel": 1, "*" : { "next":"Q4", "displayLevel": 1 } },
	"Q4": { "displayLevel": 1, "*" : { "next":"Q5", "displayLevel": 1 } },
	"Q5": { "displayLevel": 1, "Q5-A1" : { "next": "Q5A3", "displayLevel": 2 }, "Q5-A2" : { "next": "Q5A4", "displayLevel": 2 }, "*" : { "next":"Q6", "displayLevel": 1 } },
	"Q5A3": { "displayLevel": 2, "*": { "next": "Q6", "displayLevel": 1 } },
	"Q5A4": { "displayLevel": 2, "*": { "next":"Q5A1", "displayLevel": 3 } },
	"Q5A1": { "displayLevel": 3, "Q5A1-A1": { "next": "Q5A2", "displayLevel": 4 },"*": { "next": "Q6", "displayLevel": 1 } },
	"Q5A2": { "displayLevel": 4, "*": { "next": "RESULT", "displayLevel": 1, "reco": "ROLLOUT" } },
	"Q6": { "displayLevel": 1, "Q6-A1": { "next": "RESULT", "displayLevel": 1, "reco": "LEARN" }, "*": { "next": "Q6A", "displayLevel": 1 } },
	"Q6A": { "displayLevel": 1, "Q6A-A1": { "next": "Q6B1", "displayLevel": 1 },"Q6A-A2": { "next": "Q6B2", "displayLevel": 1 }, "Q6A-A3": { "next": "Q6B2", "displayLevel": 1 }, "Q6A-A4": { "next": "Q6B1", "displayLevel": 1 } },
	"Q6B1": { "displayLevel": 1, "*": { "next" :"RESULT", "displayLevel": 1, "reco": "LEARN" } },
	"Q6B2": { "displayLevel": 1, "Q6B2-A1": { "next": "Q7", "displayLevel": 1 }, "Q6B2-A2": { "next": "Q7", "displayLevel": 1 }, "Q6B2-A3": { "next": "Q7", "displayLevel": 1 }, "Q6B2-A4": { "next": "Q7", "displayLevel": 1 }, "Q6B2-A5": { "next": "Q7", "displayLevel": 1 }, "Q6B2-A6": { "next": "Q7", "displayLevel": 1 }, "Q6B2-A7": { "next" :"RESULT", "displayLevel": 1, "reco": "LEARN" } }, "Q7": { "displayLevel": 1, "*": { "next": "RESULT", "displayLevel": 1, "reco": "BUILD" } }
};

function getNext(question, answer) {
    console.log("question:", question);
    console.log("answer:", answer);
    var rule;

    return null;
    var answers = answer.split(",");
    for (var i = 0; i < answers; i++) {
        rule = rules[question][answer];
        console.info("rule:", rule);
        if (rule) {
            return rule;
        }
    }
    if (!rule) {
        rule = rules[question]["*"];
        console.info("rule:", rule);
        return rule;
    }
}

swig.setTag(
    'i18n',
    function parse (str, line, parser, types, options) {

        parser.on('start', function () {
        // called when a parse starts
        });

        parser.on("*", function (token) {
        // called on the match of any token at all ("*")
        });

        parser.on('end', function() {
        // called when a parse ends
        });

        return true; // parser is good to go
    },
    function compile (compiler, args, content, parents, options, blockName) {
        var tag = args.shift() || undefined;
        var key = content[0].toLowerCase().replace(/[^a-zA-Z0-9]+/g,'-').replace(/[-]+/g,'-').replace(/^-/,'').replace(/-$/,'');

        content = compiler(content, parents, options, blockName);

        var jsRet = 'if (_ctx.i18nTrans["'+key+'"]) _output += _ctx.i18nTrans["'+key+'"]; else '+content;
        if (tag)
    	    jsRet = 'if (_ctx.i18n["'+tag+'"]) _output += _ctx.i18n["'+tag+'"]; else ' + jsRet;

        //console.log('jsRet: ',jsRet);

  		return jsRet;
    },
    true
);

function loadQuestions(app,callback) {
    console.log("loading questions");
    //Questions.find().where('id').gt(3).sort('id').exec(function(err, questions) {
    Questions.find().sort('id').exec(function(err, langQuestions) {
    	app.locals.langQuestions = {'en':{}};
    	app.locals.langQaMap = {'en':{}};

        if (err) {
            console.info(err);
        } else {
            for(var l = 0; l < langQuestions.length; l++) {
            	var lq = langQuestions[l];
//            	console.log('lq=',lq);
            	var lang = lq._id;
//            	console.log('lang=',lang);
        		var questions = lq.questions_array;
//            	console.log('questions=',questions);
        		app.locals.langQuestions[lang] = questions;
	            var qaMap = {};

	            for(var i = 0; i < questions.length; i++) {
	                var q = questions[i];
	            	q.lang = lang;

	                qaMap[q._id] = {
                		lang: lang,
                		question: q.question
	                };

	                for(var j = 0; j < q.answers_array.length; j++) {
	                    var a = q.answers_array[j];
	                    qaMap[q._id][a._id] = {};
	                    qaMap[q._id][a._id].answer = a.answer;
	                    if (a.score) {
	                        qaMap[q._id][a._id].score = a.score;
	                    }
	                }
	            }
	            app.locals.langQaMap[lang] = qaMap;

//	            console.info("qaMap:", qaMap);
            }
        }

        if (callback)
        	callback(err);
    });

}

function ensureSecure(req, res, next){
    var forceSecure = (process.env.force_secure == "true");
    if (forceSecure) {
        if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === "http") {
            res.redirect('https://'+ req.hostname); // handle port numbers if you need non defaults
            return;
        }
    }

    return next();
};

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function processMRS(app, req, res) {
  var sessions = {};
  var questions = [];
  var lang = res.locals.lang;

  var localeHash = {'en': 'en_US', 'ko': 'ko_KR', 'fr': 'fr_FR', 'es': 'es_ES', 'de':'de_DE'};
  var locale = localeHash[lang] ? localeHash[lang] : 'en_US';

  var assets = req.body.assets;
  sessions[req.sessionID]={};
  var query = { sessionId: req.sessionID };

  console.info("processMRS with lang: " + lang);
  console.info("processMRS with sessionId: " + req.sessionID);
  console.info("processMRS with assets: " + assets);
  var level = req.body.level;

  async.parallel([
      function(callback) {
          Questions.findOne( {_id: lang} ).sort("id").exec(function(err, res) {
              if (err) {
                  console.info(err);
              } else {
                  questions = res.questions_array;
                  console.log("processMRS get Questions");
                  //console.info(util.inspect(questions, {showhidden: false, depth: null}));
              }
              callback(err);
          });
      },
      function(callback) {
          Starts.find(query).exec(function(err, res) {
              if (err) {
                  console.log("err:", err);
              } else {
                  for (var i = 0; i < res.length; i++) {
                      var cd = new Date(res[i].createdAt);
                      //cd.setTime(cd.getTime() - 240*60*1000);//hack for running within bluemix server context
                      var fd = (cd.getMonth() + 1) + "/" + cd.getDate() + "/" + (cd.getYear() + 1900) + " " + addZero(cd.getHours()) + ":" + addZero(cd.getMinutes()) + ":" + addZero(cd.getSeconds());
                      var thisSession = {};
                      thisSession["startAt"] = fd;
                      thisSession["clientIP"] = res[i].clientIP;
                      thisSession["refUrl"] = res[i].refUrl;
                      thisSession["assets"] = assets;
                      sessions[res[i].sessionId] = thisSession;
                      console.info(util.inspect(sessions[res[i].sessionId], {showhidden: false, depth: null}));
                  }
              }
              console.log("done with start");
              callback(err);
          });
      },

      function(callback) {
          //console.log("");
          //console.log("");
          console.log("QuestionAnswer query: ");
          console.log(query);

          QuestionAnswers.find(query).sort({sessionId:1, qId:1, aId:1}).exec(function(err, res) {
              if (err) {
                  console.info(err);
              } else {
                  for (var i = 0; i < res.length; i++) {
                      var aRes = res[i];
                      //console.log("aRes.sessionId:", aRes.sessionId);
                      if (!sessions[aRes.sessionId]) {
                          sessions[aRes.sessionId] = {};
                      }

                      var thisSession = sessions[aRes.sessionId];
                      //console.info("thisSession:", thisSession);
                      if (!thisSession[aRes.aId]) {
                          var cd = aRes.createdAt;
                          var fd = (cd.getMonth() + 1) + "/" + cd.getDate() + "/" + (cd.getYear() + 1900) + " " + addZero(cd.getHours()) + ":" + addZero(cd.getMinutes()) + ":" + addZero(cd.getSeconds());
                          thisSession[aRes.aId] = {'cd': fd, 'other':aRes.other};
                      }
                  }

                  console.log("processMRS done with QuestionAnswers");
                  //console.info("sessions:", sessions);
              }
              callback(err);
          });
      },
      function(callback) {
          Result.find(query).sort({sessionId:1}).exec(function(err, res) {
              if (err) {
                  console.info(err);
              } else {
                  //console.info("Results: ", res);
                  var noCnt = 0;
                  for (var i = 0; i < res.length; i++) {
                      var aRes = res[i];
                      if (!sessions[aRes.sessionId]) {
                          console.info("session id not found, skipping this result:", aRes.sessionId);
                          noCnt++;
                          continue;
                      }
                      //console.log("session id FOUND, adding result to session");
                      if (!sessions[aRes.sessionId].result) {
                          sessions[aRes.sessionId].result = aRes.level;
                          //console.info("thisSession:", sessions[aRes.sessionId]);
                      } else {
                          console.info("result already existed for this session:", aRes.sessionId);
                      }
                  }
                  console.info("noCnt:", noCnt);
              }

              callback(err);
          });
      },

      function(callback) {
        console.log("User query:");
        console.log(query);
          Users.findOne(query).exec(function(err, res) {
              if (err) {
                  console.info(err);
              } else {
                sessions[res.sessionId].profile = res.profile;
              }
              callback(err);
          });
      }],

      function(err) {
        if (err) {
		        console.log('PROCESS MRS ERROR: pulling starts/question/answer data:',err);
		        return;
		    }
        //Need to build payload and post to MRS in this callback function
        //Note This was taken from csv extract code, I left in building csv in contentOut as a debug guide

          var iwmEnv = process.env.iwmEnv;

          var iwmOptions = {};
          if (iwmEnv == "PROD") {
              iwmOptions = {
                  host: "connect.ibm.com",
                  path: "/IWMaaS/captureXML",
                  pkgCd: "ov47682"
              }
          } else {
              iwmOptions = {
                  host: "connect.ibm.com",
                  path: "/IWMaaS/preview/captureXML",
                  pkgCd: "ov47682"
              }
          }
          var iwm_answer_capture_request = {};
          iwm_answer_capture_request.answers = {};
          iwm_answer_capture_request.answers.answer = [];

          iwm_answer_capture_request.current_launch_context = {};
          iwm_answer_capture_request.current_launch_context.application_id = "MRSaaS";
          iwm_answer_capture_request.current_launch_context.locale = locale;

          iwm_answer_capture_request.campaign_data = {};
          iwm_answer_capture_request.campaign_data.source_code = "mrsaas-havas";
          iwm_answer_capture_request.campaign_data.package_code = iwmOptions.pkgCd;
          iwm_answer_capture_request.campaign_data.tactic_code_override = "000001CN";
          iwm_answer_capture_request.campaign_data.calling_offer_code = "10001181";

          iwm_answer_capture_request.user_identification = {};
          iwm_answer_capture_request.user_identification.profile_id = "0";
          iwm_answer_capture_request.user_identification.reference_transaction_id = "";

          iwm_answer_capture_request.privacy = {};
          iwm_answer_capture_request.privacy.preferences = {};
          //iwm_answer_capture_request.privacy.preferences.preference = {};
          iwm_answer_capture_request.privacy.preferences.preference = [];


          iwm_answer_capture_request.privacy.preferences_errors = {};
          iwm_answer_capture_request.privacy.preferences_errors.offers_not_found = {};
          iwm_answer_capture_request.privacy.preferences_errors.offers_not_found.offer_code = "";

          var cnt = 0;
          for (var sessionId in sessions) {//FYI only ONE session

              var thisSession = sessions[sessionId];

              _.each(JSON.parse(thisSession['profile']['NC_OFFER_CHOICE']), function(choice){
                _.each(_.keys(choice), function(key){//should be only one key anyway
                iwm_answer_capture_request.privacy.preferences.preference.push({related_offer_code:'mo51292',
                                                                                preference_code: key,
                                                                                specific_delivery_methods:{ all_media: choice[key] }});
                });
              });

              iwm_answer_capture_request.privacy.preferences.preference.push({related_offer_code:'mo51292',
                                                                              preference_code:'IBM',
                                                                              specific_delivery_methods:{all_media:thisSession['profile']['NC_ALL_IBM_CHOICE']}});

              //order matters to MRS!!!
              iwm_answer_capture_request.answers.answer.push({"question_name": 'email', "text": thisSession["profile"]['email']});
              iwm_answer_capture_request.answers.answer.push({"question_name": 'phone', "text": thisSession["profile"]['phone']});
              iwm_answer_capture_request.answers.answer.push({"question_name": 'company', "text": thisSession["profile"]['company']});
              iwm_answer_capture_request.answers.answer.push({"question_name": 'firstName', "text": thisSession["profile"]['firstName']});
              iwm_answer_capture_request.answers.answer.push({"question_name": 'lastName', "text": thisSession["profile"]['lastName']});
              iwm_answer_capture_request.answers.answer.push({ "question_name": 'country', "selection_list": { "option_id": thisSession["profile"]['country'] } });
              iwm_answer_capture_request.answers.answer.push({ "question_name": 'state', "selection_list": { "option_id": thisSession["profile"]['state'] } });


            if(1==1){//be able to turn off survey for debugging

                  if (thisSession["refUrl"] && thisSession["refUrl"] != null) {
                      iwm_answer_capture_request.current_launch_context.referrerURL = thisSession["refUrl"];
                  }

                  var mrsNames = new Array('Q_GEO',	'Q_INDUSTRY',	'Q_ROLE',	'Q_NUMEMP','Q_SOFTWARE', 'Q_SOFTWARE2','Q_SOFTWARE3','Q_CSOFTWARE','Q_CONJNT','Q_EXTENT',	'Q_CTFAMILY',	'Q_BELIEF',	'Q_BARRIER',	'Q_GOALS','Q_CASE'	);
                  var nameIdx = 0;
                  for (var q = 0; q < questions.length; q++) {

                      var aQ = questions[q];

                      //console.log("Question:",aQ._id,"Multiple:",aQ.multiple);
                      var answers = aQ.answers_array;
                      var ansText = "";
                      var cd = "";
                      var multi = false;
                      for (var a = 0; a < answers.length; a++) {//loop through possible answers of each question
                          var aId = answers[a]._id;
                          if (thisSession[aId]) {//Does this answer exist?
                              if (ansText.length > 0) {
                                  ansText += "| "; // multiple answer separator
                                  multi = true;
                              }
                              //if (answers[a].answer == 'Other' && thisSession[aId].other && thisSession[aId].other != null){
                              if (thisSession[aId].other && thisSession[aId].other != null && _.contains(['Q8-A6','Q9-A6','Q10-A1'], aId)){
                                ansText += answers[a].answer + ": " + thisSession[aId].other;
                              }else{
                                ansText += answers[a].answer;
                              }
                              cd = thisSession[aId].cd;
                            }
                          }
                          if (!multi && ansText.indexOf("|") > 0) {
                              multi = true;
                          }
                          ansText = ansText.substring(0, 500); //make sure nothing is over 500 - should NOT happen, really only possible with multiple answer fields
                          iwm_answer_capture_request.answers.answer.push({"question_name": mrsNames[nameIdx], "text": ansText ? ansText : 'N/A'});
                          nameIdx++;
                      }

                  if (thisSession["result"]) {
                      iwm_answer_capture_request.answers.answer.push({"question_name": "Q_RESULT", "text": thisSession["result"]});

                      if (thisSession["assets"]) {
                          var assets = JSON.parse(thisSession["assets"]);
                          for (var a = 0; a < 5; a++) {
                              var name = "Q_ASSET";
                              name +=  a ? (a+1) : '';
                              iwm_answer_capture_request.answers.answer.push({"question_name": name , "text": assets[a] ? assets[a] : "N/A"});
                          }
                      }
                  }
           }

          console.info("processMRS OUTPUT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
          //console.info("iwm object");
          //console.info(util.inspect(iwm_answer_capture_request, {showhidden: false, depth: null}));
          var xmlContent = js2xmlparser("iwm_answer_capture_request", JSON.stringify(iwm_answer_capture_request));
          console.log("xmlContent: ", xmlContent);


          // POST TO MRS here!!!!
          // dev host: 'connect-preprod.ibm.com'
          // dev path: '/IWMaaS/uat/captureXML'
          // prod host: connect.ibm.com
          // prod path: /IWMaaS/captureXML
          console.log("connection to : ", iwmOptions.host + iwmOptions.path);
          var putOpts = {
              host: iwmOptions.host,
              port: '443',
              path: iwmOptions.path,
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/xml',
                  'Authorization':'Basic ***'
              }
          };
          // Set up the request
          var respString = "";
          var putReq = https.request(putOpts, function(result) {
              //console.log(JSON.stringify(result.headers));
              console.log("Got response: " + result.statusCode);

              result.setEncoding('utf8');
              result.on('data', function(chunk) {
                  //console.log('Response: ' + chunk);
                  respString += chunk;
              });
              result.on('end', function() {
                  console.log(respString);
                  //should test for 200 vs other responses
                  parseString(respString, function(err, js) {
                      if (result.statusCode == 200 && js.iwm_answer_capture_response.return[0].code[0]) {
                          if (200 == js.iwm_answer_capture_response.return[0].code[0]) {
                              // successful
                              var txId = js.iwm_answer_capture_response.new_transaction_id[0];
                              Users.findOneAndUpdate(query, { iwmTxId: txId }, function (err, user) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.info("user saved: ", user);
                                }
                              });
                          }else{
                            Users.findOneAndUpdate(query, { iwmError: js }, function (err, user) {
                              if (err) {
                                  console.log(err);
                              } else {
                                  console.info("user saved: ", user);
                              }
                            });
                          }
                      }else{ //store non 200 status responses
                        console.info(util.inspect(js, {showhidden: false, depth: null}));
                        var msg = {};
                        msg['status'] = result.statusCode;
                        //was going to store the js encoded soap response but mongo has problem with $ field from soap conversion
                        Users.findOneAndUpdate(query, { iwmError: msg }, function (err, user) {
                          if (err) {
                              console.log(err);
                          } else {
                              console.info("user saved: ", user);
                          }
                        });
                      }
                  });
                  //res.send(req.sessionID);
              });
          });
          putReq.write(xmlContent);
          putReq.end();
          putReq.on('error', function(e) {
              console.error(e);
          });


      }
    });

}

module.exports = function (app) {
//    app.use('/cbo-data-export', exportApp);
    app.use(function(req, res, next) {
       if(req.url.substr(-1) == '/' && req.url.length > 1)
           res.redirect(301, req.url.slice(0, -1));
       else
           next();
    });


    app.use(cookieParser());
    var expirationTS = new Date(Date.now() + (30 * 60 * 1000)); // 30 minutes
    //app.use(session({secret: 'faj8ufoadj239lknkjaj*^&KKJH', cookie:{expires: expirationTS }}));
    app.use(session({secret: 'faj8ufoadj239lknkjaj*^&KKJH',
        cookie: {
            maxAge: 1000 * 60 * 60 // 1 hour
        },
        store: store,
        resave: false,
        saveUinitialized: true
    }));


    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // Setup static public directory
    app.use(express.static(path.join(__dirname, '../public')));
    app.set('views', path.join(__dirname, '../views'));
    var Swig = new swig.Swig();
    swig.setDefaults({ cache: false });
    Swig.setFilter('translate',function(element){
    	console.log('translate element:',element);
    	return (element);
    });
    app.engine('html', Swig.renderFile);
    app.set('view engine', 'html');

    if (!process.env.VCAP_SERVICES) {
        app.use(errorhandler());
    }

    // Add error handling in dev
    if (!process.env.VCAP_SERVICES) {
        app.use(errorhandler());
    }

    var i18n = {};
    var i18nTrans = {};
    var supportedLangs = ':lang(en)';
    require('./i18n-translation')(function( _i18n, _i18nTrans ){
    	i18n = _i18n;
    	i18nTrans = _i18nTrans;

    	supportedLangs = ':lang('+(_.keys(i18n).join('|'))+')';
    	console.log('supportedLangs:',supportedLangs);

        loadQuestions(app, function (err) {

          app.all(['/'+supportedLangs, '/'+supportedLangs+'/*', '/*'], function (req, res, next) {
		        var lang = req.params.lang;
            var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            console.log(fullUrl);
            console.log('ALL path: param lang:',lang);

		        if (!i18n[lang]
                && !app.locals.langQuestions[lang]
            ){
		        	lang = 'en';
              console.log("Forcing lang to en !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            }

            console.log('ALL path: lang:',lang);

		        res.locals.lang = lang;
            res.locals.mrsLangs = process.env.mrsLangs||'99'; //if not set, 99 will make form NOT test enabled, that's all we need
            res.locals.formEnabled = res.locals.mrsLangs.indexOf(lang) !== -1 ? true : false;
            res.locals.ncStatus = res.locals.formEnabled ? 'nc' : 'no-nc';
            res.locals.formRenderStatus = res.locals.formEnabled ? '' : 'inactive';
            res.locals.introRenderStatus = res.locals.formEnabled ? ' future inactive ' : ' current ';

		    	  res.locals.questions = app.locals.langQuestions[lang]||{};
		        res.locals.qaMap = app.locals.langQaMap[lang]||{};
		        res.locals.i18n = i18n[lang]||{};
		        res.locals.i18nTrans = i18nTrans[lang]||{};


            next();
		    });

		    app.get(['/','/'+supportedLangs], function(req, res) {
		        console.log("before:", req.sessionID);
		        req.session.refUrl = req.get("Referer");
		        console.log("refUrl: ", req.session.refUrl);

			        res.render('index');

		    });

        app.use('/'+supportedLangs+'/cbo-data-export', exportApp);

		    app.post(['/start', '/'+supportedLangs+'/start'], function(req, res) {
		        var thisSession = req.sessionID;
            var lang = res.locals.lang;
            var formEnabled = res.locals.formEnabled;
		        req.session.started = "started";
		        console.log("/start thisSession:", thisSession);

		        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
		        //ip = ip.substring(0, ip.indexOf(","));

		        var query = { sessionId: thisSession };

		        Starts.remove(query, function(err) {
		            if (err) {
		                console.info("Error removing multiple start: ", err);
		            } else {
		                QuestionAnswers.remove(query, function(err) {
		                    if (err) {
		                        console.error(err);
		                    } else {
		                        Result.remove(query, function(err) {
		                            if (err) {
		                                console.error(err);
		                            } else {
		                                Tracking.remove(query, function(err) {
		                                    if (err) {
		                                        console.error(err);
		                                    } else {
		                                        AssetTracking.remove(query, function(err) {
		                                            if (err) {
		                                                console.error(err)
		                                            } else {
                                                  Users.remove(query, function(err) {
      		                                            if (err) {
      		                                                console.error(err)
      		                                            } else {
    		                                                new Starts({sessionId: thisSession, clientIP: ip, refUrl: req.session.refUrl, lang: lang}).save(function(err, start) {
    		                                                    if (err) {
    		                                                        console.log("err:", err);
    		                                                    } else {
    		                                                        console.log("successfully saved start");
    		                                                        console.info(start);
    		                                                        res.send("Success");
    		                                                    }
    		                                                });//Starts
                                                        if(formEnabled){//form may not be anabled for all langs
                                                            new Users({ sessionId: thisSession, profile: req.body.formData, lang: lang }).save(function(err, user) {
                                                              if (err) {
                                                                  console.log(err);
                                                              } else {
                                                                  console.info("user saved: ", user);
                                                              }
                                                          });
                                                        }
		                                                  }
                                                    });//Remove Users
                                              }
                                            });//AssetTracking
		                                    }
		                                });
		                            }
		                        });
		                    }
		                });
		            }
		        });
		    });

		    app.post(['/rule', '/'+supportedLangs+'/rule'], function(req, res) {
		        var rule = getNext(req.body.question, req.body.answer);
		        res.json(rule);
		    });

		    app.post(['/answer', '/'+supportedLangs+'/answer'], function(req, res) {
		        console.log("saving answer");

		        var lang = res.locals.lang;

		        if (!req.session.started) {
		            res.redirect("/");
		        } else {
		            var thisSession = req.sessionID;
		            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
		            //ip = ip.substring(0, ip.indexOf(","));

		            var resQAs = [];

		            if (req.body.question) {
		                resQAs[0] = {};
		                resQAs[0].question = req.body.question;
		                resQAs[0].answer = req.body.answer;
		                resQAs[0].otherText = (req.body.otherText) ? req.body.otherText : null;
		            } else {
		                resQAs = req.body.answers;
		            }


		            for (var n = 0; n < resQAs.length; n++) {
		                var currQA = resQAs[n];
		                var query = { sessionId: thisSession, qId : currQA.question };

		                QuestionAnswers.remove(query, function(err) {
		                    if(err) {
		                        console.info("Error removing duplicate answer for session: ",err);
		                    } else {
		                        console.log("Removed duplicate q/s")
		                        console.log(currQA);
		                        var answers = currQA.answer.split(",");


		                        async.eachSeries(answers, function(aId, callback) {
		                            var otherText = "";
                                //Found issue for multi answer questions with Other open text field
                                //Every answer selected gets the other text as well, so FIX: check for specific question answers
		                            if (currQA.otherText && _.contains(['Q8-A6','Q9-A6','Q10-A1'], aId)) {
		                                otherText = currQA.otherText;
		                            }
		                            new QuestionAnswers({sessionId: thisSession, qId : currQA.question, aId : aId, other : otherText, clientIP: ip, lang: lang}).save(function(err, answer) {
		                                console.log("adding answer to Mongo: ", aId);
		                                if (err) {
		                                    console.log("err:", err);
		                                } else {
		                                    console.log(answer);
		                                    callback();
		                                }
		                            });
		                        }, function done() {
		                            console.log("ALL DONE");
		                            var rule = getNext(req.body.question, req.body.answer);
		                            console.info("got back rule:", rule);
		                            res.json(rule);
		                        });
		                    }
		                });
		            }
		        }
		    });

		    app.get(['/lookup', '/'+supportedLangs+'/lookup'], function(req, res) {
		        console.log("looking up");

		        var lang = res.locals.lang;

		        if (req.query.reload || !app.locals.langQuestions['en']) {
		            console.log("No app.local.questions ... getting it");
		            loadQuestions(app,function(err) {
		                if (err)
		                    console.info('ERROR loading app.local.questions',err);
		                res.json( app.locals.langQuestions[lang] || app.locals.langQuestions['en'] );
		            });
		        } else {
		            res.json( app.locals.langQuestions[lang] || app.locals.langQuestions['en'] );
		        }
		    });

		    // TEST
		    app.post(['/result', '/'+supportedLangs+'/result'], function (req, res) {
		        console.log("result ......");

            var lang = res.locals.lang;
		        var thisSession = req.sessionID;

		        var level = req.body.level;
		        // TEST
		        //level = "rollout";

		        new Result({sessionId: thisSession, level: level, lang: lang}).save(function(err, res) {
		            if (err) {
		                console.info("error saving result:", err);
		            } else {
		                console.info("saved res:", res);
		            }
		        });

		        res.locals.gbs = false;
		        // TEST
		        //res.locals.gbs = true;

		        res.locals.mythbuster = false;

		        var query = { sessionId: thisSession };
		        //console.info("query:", query);

		        var score = 0;
		        QuestionAnswers.find(query).exec(function(err, qas) {
		            //console.info("qas:", qas);
		            if (err) {
		                console.info("error: ", err);
		            } else {
		                var seen = {};
		                for (var i = 0; i < qas.length; i++) {
		                    var key = qas[i]["qId"];
		                    seen[key] = 1;
		                    key = qas[i]["qId"] + "." + qas[i]["aId"];
		                    seen[key] = 1;

		                }

		                console.info("seen:", seen);

		                if (seen["Q8"]) {
		                    res.locals.mythbuster = true;
		                }


		                if (seen["Q4.Q4-A3"] || seen["Q4.Q4-A4"]) {
		                    res.locals.gbs = true;
		                }

		                if (level == "learn" && !seen["Q9"]) {
		                    res.locals.gbs = false;
		                }

		                //console.log("res.locals.gbs:", res.locals.gbs);

		                res.locals.dummy = "BPM";

		                if (seen["Q5.Q5-A1"] && !seen["Q5.Q5-A2"]) {
		                      res.locals.dummy = "ODM";
		                }

		                //new business logic - August 2016 - so if both seen, default to bpm
		                //Q5-A1 = bpm Q5-A2 = odm Q5-A3 = Cognitive

		                //logic
		                // Users would get:
		                // BPM for Dummies (If they select ODM but not BPM, or if they selected NONE OF THESE.)
		                // ODM for Dummies (If they selected BPM but not ODM)
		                // CBO website (If they selected BPM and ODM, or if they selected COGNITIVE at all/in combination with any others.)


		                if (level == "learn" || level == "build") {
		                    res.locals.resource3 = "bpm";
		                    if (seen["Q5.Q5-A3"] || (seen["Q5.Q5-A1"] && seen["Q5.Q5-A2"])) {
		                        res.locals.resource3 = "cbo";
		                    }else if (!seen["Q5.Q5-A1"]) {
		                        res.locals.resource3 = "bpm";
		                    }else if(!seen["Q5.Q5-A2"]){
		                        res.locals.resource3 = "odm";
		                    }
		                }

		                if (level == "rollout") {
		                    if (seen["Q5a2.Q5a2-A1"]) {
		                        res.locals.resource1 = "success";
		                    } else {
		                        res.locals.resource1 = "watsondemo";
		                    }
		                }

		                res.render(level);
		            }
		        });

		    });

		    app.post(['/track', '/'+supportedLangs+'/track'], function(req, res) {
          var lang = res.locals.lang;
		        var thisSession = req.sessionID;
		        Tracking.find({sessionId: thisSession, url: req.body.url}).exec(function(err, tracking) {
		            console.info("tracking:", tracking);
		            if (tracking.length > 0) {
		                console.log("found tracking for this session/url: ", tracking[0].url);
		            } else {
		                console.log("saving new tracking");
		                new Tracking({sessionId: thisSession, url: req.body.url, lang: lang}).save(function(err, tracking) {
		                    if (err) {
		                        console.log("err saving tracking:", err);
		                    } else {
		                        console.info("tracking:", tracking);
		                        res.send(tracking._id);
		                    }
		                });
		            }
		        });
		    });

		    app.post(['/assettrack', '/'+supportedLangs+'/assettrack'], function(req, res) {
          var lang = res.locals.lang;
          var formEnabled = res.locals.formEnabled;
		        var thisSession = req.sessionID;
		        var assets = req.body.assets;
		        //console.info("assets:", assets);
            if (res.locals.formEnabled){
              processMRS(app, req, res);
            }
		        if (assets) {
		            new AssetTracking({sessionId: thisSession, assets: assets, lang: lang}).save(function(err, tracking) {
		                if (err) {
		                    console.log("err saving tracking:", err);
		                } else {
		                    console.info("asset tracking:", tracking);
		                    res.send(tracking._id);
		                }
		            });
		        } else {
		            res.send();
		        }
		    });

        app.get(['/loadStates', '/'+supportedLangs+'/loadStates'], function(req, res) {
            var cc = req.query.countryCode || req.body.countryCode;
            if (cc) {
                if (countryStates[cc]) {
                    res.json(countryStates[cc]);
                    return;
                }
            }
            res.json({});
        });

        app.post(['/startWithProfile', '/'+supportedLangs+'/profile'], function(req, res) {
		        console.log('.... handle profile submit here ....');
            console.log(req.body.formData);
		        res.json({'status':'ok'});
		    });
        app.post(['/formSubmit', '/'+supportedLangs+'/formSubmit'], function(req, res) {
		        console.log('.... handle form submit here ....');
            console.log(req.body);
            console.info(util.inspect(req.body, {showhidden: false, depth: null}));
		        res.json({'status':'ok'});
		    });


        });

    });

}; // module export
