/**
 * DE AFREKENING — scoringsscript voor Google Forms + Sheets
 * ==========================================================
 * Plak dit volledige bestand in Extensions > Apps Script van de
 * Google Sheet die aan je Form gekoppeld is.
 *
 * HET FORM MOET DEZE 10 VRAGEN BEVATTEN, IN DEZE VOLGORDE
 * (allemaal "Kort antwoord", behalve vraag 8 die "Meerkeuze" is):
 *  1. Naam?
 *  2. In een gevecht tot de dood, tegen hoeveel meeuwen zou jij het
 *     kunnen opnemen en winnen?
 *  3. Je mag een jaar gratis bestellen bij je stamfrituur, maar je mag
 *     maar één bestelling plaatsen. Wat bestel je?
 *  4. Je moet een nieuwe feestdag uitvinden die nog nooit gevierd is.
 *     Waar draait die dag om?
 *  5. Hoeveel pinten drink je gemiddeld op een vrijdag?
 *  6. Je mag één festival volledig gratis en voor niks beleven. Welk
 *     festival kies je?
 *  7. Hoeveel geld zou je maximaal uitgeven aan nieuwe schoenen?
 *  8. Ben je een gever of een nemer? (meerkeuze — zie opties hieronder)
 *  9. Welke sport zou je willen verbannen uit de wereld?
 * 10. Geef een reden waarom jij een plek verdiend hebt op het weekend.
 *
 * Opties voor vraag 8 (voeg exact zo toe in het Form):
 *  A) Een gever, altijd — ook als het me zelf iets kost.
 *  B) Een nemer, maar ik zorg dat ik ooit iets terugdoe op mijn eigen voorwaarden.
 *  C) Geen van beide — ik doe gewoon wat op dat moment het meest logisch aanvoelt.
 *  D) Een nemer, zonder schuldgevoel.
 *
 * INSTALLATIE (eenmalig):
 * 1. Maak het Form aan met de 10 vragen hierboven.
 * 2. Koppel het Form aan een Google Sheet (Antwoorden > groen icoon).
 * 3. Open die Sheet > Extensions > Apps Script.
 * 4. Verwijder de lege functie die er standaard in staat, plak dit
 *    hele bestand erin, en sla op (Ctrl+S).
 * 5. Pas ORG_PIN hieronder aan naar jouw eigen code.
 * 6. Run eenmaal de functie "updateAllRows" (functie kiezen > Run) om
 *    bestaande antwoorden te verwerken. Geef toestemming als dat wordt
 *    gevraagd.
 * 7. Klok-icoon (Triggers) > + Add trigger:
 *      - Functie: onFormSubmit
 *      - Event source: From spreadsheet
 *      - Event type: On form submit
 * 8. Voor het organisator-dashboard: Deploy > New deployment >
 *    Type: Web app > Execute as: Me > Who has access: Anyone with
 *    the link > Deploy. Kopieer de URL — dat is je PIN-afgeschermde
 *    overzichtslink.
 */

/* ============ PIN — wijzig dit naar jouw eigen code ============ */
const ORG_PIN = "2846";
/* ================================================================= */

const HOUSE_META = {
  stark:     { name: "Stark",     color: "#8FA9B0" },
  lannister: { name: "Lannister", color: "#C6A15B" },
  targaryen: { name: "Targaryen", color: "#B23A45" },
  baratheon: { name: "Baratheon", color: "#D4A017" },
};
const HOUSE_ORDER = ['stark','lannister','targaryen','baratheon'];

/* Trefwoorden per open vraag, per huis. */
const OPEN_KEYWORDS = {
  meeuwen: {
    stark:     ["vrienden","bescherm","samen","team","genoeg om","dekking"],
    lannister: ["wapen","plan","list","mes","precies","strategie","reken","tactiek"],
    targaryen: ["oneindig","onendelijk","legende","altijd","god","onsterfelijk","meeuw word"],
    baratheon: ["allemaal","alles","zonder twijfel","makkelijk","moeiteloos","gemakkelijk"],
  },
  friet: {
    stark:     ["hetzelfde","vaste","zoals altijd","gewoontegetrouw","standaard"],
    lannister: ["duur","duurste","beste","exclusief","waard"],
    targaryen: ["nooit besteld","nieuw","vreemd","origineel","gek","verzin"],
    baratheon: ["mega","extra groot","alles erop","reuze","dubbel","overheerlijk veel"],
  },
  feestdag: {
    stark:     ["samen","familie","waarder","traditie","dankbaar","thuis"],
    lannister: ["prestige","competitie","winnen","verdienen","beste","succes"],
    targaryen: ["kunst","surreal","verbeelding","nooit gedaan","droom","fantasie"],
    baratheon: ["feest","actie","adrenaline","plezier","drank","dansen"],
  },
  pinten_vrijdag: {
    stark:     ["weinig","rustig","niet te veel","verantwoord","paar","mate"],
    lannister: ["bereken","budget","prijs","voordelig","tel mee"],
    targaryen: ["oneindig","onendelijk","altijd","geen limiet","zoveel als het leven toelaat"],
    baratheon: ["veel","tien","twaalf","alles","zoveel mogelijk","meer dan"],
  },
  festival: {
    stark:     ["samen","gezellig","vrienden","traditie","dranouter","werchter"],
    lannister: ["vip","backstage","exclusief","tomorrowland","duur"],
    targaryen: ["uniek","anders","kunst","pukkelpop","alternatief","nieuw"],
    baratheon: ["wild","gek","feest","graspop","extrema","hard"],
  },
  schoenen: {
    stark:     ["weinig","niet te veel","praktisch","nodig","spaarzaam","budget"],
    lannister: ["investering","kwaliteit","waard","merk","goed besteed"],
    targaryen: ["onbeperkt","geen limiet","alles","droom","uniek paar"],
    baratheon: ["veel","duur","zoveel mogelijk","niet aan denken","gewoon kopen"],
  },
  sport_verbannen: {
    stark:     ["gevaarlijk","onveilig","onrechtvaardig","oneerlijk","pijn","kwetsuur"],
    lannister: ["cheat","vals","corrupt","geld","doping","oneerlijk voordeel","gekocht"],
    targaryen: ["voorspelbaar","clich\u00e9","geen verbeelding","standaard","kunstloos"],
    baratheon: ["traag","langzaam","niets gebeurt","slaapverwekkend","te rustig"],
  },
  weekend_plek: {
    stark:     ["zorg","altijd er","betrouwbaar","help","iedereen","er voor anderen"],
    lannister: ["regel","plan","logistiek","budget","korting","onderhandel","organiseer"],
    targaryen: ["origineel","gek idee","verras","nieuw","creatief","idee\u00ebn"],
    baratheon: ["feest","sfeer","energie","lawaai","plezier","stemming"],
  },
};

/* Meerkeuze: welk (deel van het) antwoord wijst naar welk huis. */
const MC_OPTION_MAP = {
  gever_nemer: [
    { match: "gever, altijd", house: "stark" },
    { match: "eigen voorwaarden", house: "lannister" },
    { match: "logisch aanvoelt", house: "targaryen" },
    { match: "schuldgevoel", house: "baratheon" },
  ],
};

/* Herkenning van kolommen: elke header uit het Form moet minstens één van
   deze zoekwoorden bevatten. Pas gerust aan als je vraagtekst afwijkt. */
const COLUMN_HINTS = {
  naam:            ["naam"],
  meeuwen:         ["meeuwen"],
  friet:           ["stamfrituur"],
  feestdag:        ["feestdag"],
  pinten_vrijdag:  ["vrijdag"],
  festival:        ["festival"],
  schoenen:        ["schoenen"],
  gever_nemer:     ["gever"],
  sport_verbannen: ["sport"],
  weekend_plek:    ["weekend"],
};

const OPEN_QUESTION_KEYS = ["meeuwen","friet","feestdag","pinten_vrijdag","festival","schoenen","sport_verbannen","weekend_plek"];
const MC_QUESTION_KEYS = ["gever_nemer"];

function findColumnIndexes_(headers){
  const lower = headers.map(h => (h || '').toString().toLowerCase());
  const idx = {};
  Object.keys(COLUMN_HINTS).forEach(key => {
    const hints = COLUMN_HINTS[key];
    idx[key] = lower.findIndex(h => hints.some(hint => h.indexOf(hint) !== -1));
  });
  return idx;
}

function ensureOutputColumns_(sheet, headers){
  const wanted = ["Huis", "Score Stark", "Score Lannister", "Score Targaryen", "Score Baratheon"];
  let lastCol = headers.length;
  wanted.forEach(name => {
    if(headers.indexOf(name) === -1){
      lastCol++;
      sheet.getRange(1, lastCol).setValue(name);
      headers.push(name);
    }
  });
  return headers;
}

function scoreFromAnswers_(idx, rowValues){
  const scores = { stark: 0, lannister: 0, targaryen: 0, baratheon: 0 };
  const rawTexts = [];

  // Open vragen: trefwoorden.
  OPEN_QUESTION_KEYS.forEach(key => {
    const col = idx[key];
    if(col === -1) return;
    const raw = (rowValues[col] || '').toString();
    rawTexts.push(raw);
    const text = raw.toLowerCase();
    const bank = OPEN_KEYWORDS[key];
    Object.keys(bank).forEach(house => {
      bank[house].forEach(word => {
        const hits = text.split(word).length - 1;
        scores[house] += hits * 4;
      });
    });

    if(key === 'meeuwen'){
      const hasEpicWord = /oneindig|onendelijk|altijd|god|onsterfelijk/.test(text);
      const numMatch = text.match(/\d+/);
      if(hasEpicWord){
        scores.targaryen += 10;
      } else if(numMatch){
        const n = parseInt(numMatch[0], 10);
        if(n >= 50){ scores.baratheon += 8; scores.targaryen += 3; }
        else if(n >= 10){ scores.lannister += 6; }
        else { scores.stark += 6; }
      }
    }

    if(key === 'pinten_vrijdag'){
      const hasEpicWord = /oneindig|onendelijk|altijd|geen limiet/.test(text);
      const numMatch = text.match(/\d+/);
      if(hasEpicWord){
        scores.targaryen += 10;
      } else if(numMatch){
        const n = parseInt(numMatch[0], 10);
        if(n <= 3){ scores.stark += 6; }
        else if(n <= 6){ scores.lannister += 6; }
        else { scores.baratheon += 8; scores.targaryen += 3; }
      }
    }

    if(key === 'schoenen'){
      const hasEpicWord = /onbeperkt|geen limiet|prijs maakt niet uit|alles/.test(text);
      const numMatch = text.match(/\d+/);
      if(hasEpicWord){
        scores.targaryen += 10;
      } else if(numMatch){
        const n = parseInt(numMatch[0], 10);
        if(n <= 100){ scores.stark += 6; }
        else if(n <= 300){ scores.lannister += 6; }
        else { scores.baratheon += 8; scores.targaryen += 3; }
      }
    }
  });

  // Meerkeuzevragen: directe mapping.
  MC_QUESTION_KEYS.forEach(key => {
    const col = idx[key];
    if(col === -1) return;
    const raw = (rowValues[col] || '').toString();
    rawTexts.push(raw);
    const text = raw.toLowerCase();
    const options = MC_OPTION_MAP[key];
    const found = options.find(o => text.indexOf(o.match) !== -1);
    if(found){
      scores[found.house] += 12;
    }
  });

  // Deterministische tiebreaker op basis van alle tekst samen.
  const allText = rawTexts.join(' ').toLowerCase();
  let hash = 0;
  for(let i = 0; i < allText.length; i++){
    hash = (hash * 31 + allText.charCodeAt(i)) % 9973;
  }
  scores[HOUSE_ORDER[hash % 4]] += 1;

  const winner = HOUSE_ORDER.reduce((a,b) => scores[a] >= scores[b] ? a : b);
  return { scores: scores, winner: winner };
}

/**
 * Verwerkt alle bestaande rijen in het blad (eenmalig handmatig runnen).
 */
function updateAllRows(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = sheet.getDataRange().getValues();
  if(data.length < 2) return;

  let headers = data[0];
  headers = ensureOutputColumns_(sheet, headers);
  const idx = findColumnIndexes_(headers);

  const huisCol = headers.indexOf("Huis") + 1;

  for(let r = 1; r < data.length; r++){
    const row = data[r];
    if(row[huisCol - 1]){ continue; } // al gescoord
    const result = scoreFromAnswers_(idx, row);
    writeResult_(sheet, r + 1, headers, result);
  }
}

/**
 * Trigger: wordt automatisch aangeroepen bij elke nieuwe form-inzending
 * (vereist een installable trigger, zie instructies bovenaan).
 */
function onFormSubmit(e){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const headers = ensureOutputColumns_(sheet, sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0]);
  const idx = findColumnIndexes_(headers);
  const lastRow = sheet.getLastRow();
  const row = sheet.getRange(lastRow, 1, 1, headers.length).getValues()[0];
  const result = scoreFromAnswers_(idx, row);
  writeResult_(sheet, lastRow, headers, result);
}

function writeResult_(sheet, rowNum, headers, result){
  const huisCol = headers.indexOf("Huis") + 1;
  sheet.getRange(rowNum, huisCol).setValue(HOUSE_META[result.winner].name);
  sheet.getRange(rowNum, huisCol + 1).setValue(result.scores.stark);
  sheet.getRange(rowNum, huisCol + 2).setValue(result.scores.lannister);
  sheet.getRange(rowNum, huisCol + 3).setValue(result.scores.targaryen);
  sheet.getRange(rowNum, huisCol + 4).setValue(result.scores.baratheon);
}

/* ---------------- Organisator-dashboard (Web App) ---------------- */

function doGet(e){
  const pin = e.parameter.pin || '';
  if(pin !== ORG_PIN){
    return HtmlService.createHtmlOutput(pinGateHtml_(pin !== ''));
  }
  return HtmlService.createHtmlOutput(dashboardHtml_());
}

function pinGateHtml_(showError){
  return `
    <html><head><base target="_top"><style>
      body{ background:#12100D; color:#E9E2D0; font-family:sans-serif; display:flex;
            align-items:center; justify-content:center; min-height:100vh; margin:0; }
      .box{ text-align:center; max-width:320px; }
      h2{ font-weight:500; }
      input{ font-size:20px; letter-spacing:6px; text-align:center; width:160px;
             background:none; border:none; border-bottom:1px solid #33302A; color:#E9E2D0;
             padding:8px; outline:none; margin-bottom:14px; }
      button{ background:none; border:1px solid #6E5A34; color:#B08D4F; padding:10px 26px;
              letter-spacing:1px; font-size:13px; cursor:pointer; }
      .err{ color:#C7645F; font-size:12px; min-height:16px; }
    </style></head><body>
      <div class="box">
        <h2>Toegang organisator</h2>
        <form method="get">
          <input type="password" name="pin" maxlength="8" placeholder="&bull;&bull;&bull;&bull;" autofocus>
          <div class="err">${showError ? 'Onjuiste PIN. Probeer opnieuw.' : ''}</div>
          <button type="submit">ONTGRENDEL</button>
        </form>
      </div>
    </body></html>
  `;
}

function dashboardHtml_(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idx = findColumnIndexes_(headers);
  const huisCol = headers.indexOf("Huis");

  const counts = { stark: 0, lannister: 0, targaryen: 0, baratheon: 0 };
  let rows = '';

  for(let r = 1; r < data.length; r++){
    const row = data[r];
    const naam = idx.naam !== -1 ? row[idx.naam] : '(naamloos)';
    const huisNaam = huisCol !== -1 ? row[huisCol] : '';
    const houseKey = Object.keys(HOUSE_META).find(k => HOUSE_META[k].name === huisNaam) || '';
    if(houseKey) counts[houseKey]++;
    const color = houseKey ? HOUSE_META[houseKey].color : '#A79D87';

    const answerCells = OPEN_QUESTION_KEYS.concat(MC_QUESTION_KEYS)
      .filter(k => idx[k] !== -1)
      .map(k => `<div><span class="qlabel">${headers[idx[k]]}</span><br>${row[idx[k]]}</div>`)
      .join('');

    rows += `
      <div class="entry">
        <div class="row">
          <div class="name">${naam}</div>
          <div class="house" style="color:${color}">${huisNaam || '\u2014'}</div>
        </div>
        <div class="answers">${answerCells}</div>
      </div>
    `;
  }

  let tally = '';
  HOUSE_ORDER.forEach(h => {
    tally += `<div class="tally-item"><div class="n" style="color:${HOUSE_META[h].color}">${counts[h]}</div><div class="h">${HOUSE_META[h].name.toUpperCase()}</div></div>`;
  });

  return `
    <html><head><base target="_top"><style>
      body{ background:#12100D; color:#E9E2D0; font-family:sans-serif; padding:32px; }
      h2{ font-weight:500; border-bottom:1px solid #33302A; padding-bottom:14px; }
      .tally{ display:flex; gap:16px; margin:24px 0; flex-wrap:wrap; }
      .tally-item{ border:1px solid #33302A; padding:12px 16px; flex:1 1 100px; }
      .tally-item .n{ font-size:26px; }
      .tally-item .h{ font-size:11px; color:#A79D87; letter-spacing:1px; }
      .entry{ border-bottom:1px solid #33302A; padding:14px 0; }
      .row{ display:flex; justify-content:space-between; font-size:14px; margin-bottom:8px; }
      .house{ font-weight:600; }
      .answers div{ font-size:12px; color:#A79D87; margin-bottom:4px; line-height:1.5; }
      .qlabel{ color:#B08D4F; font-style:italic; }
    </style></head><body>
      <h2>Inzendingen &mdash; De Afrekening</h2>
      <div class="tally">${tally}</div>
      ${rows || '<p>Nog geen inzendingen.</p>'}
    </body></html>
  `;
}
