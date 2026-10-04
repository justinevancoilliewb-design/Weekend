'use strict';

const HOUSE_META = {
  stark: { name: 'Stark', color: '#8FA9B0' },
  lannister: { name: 'Lannister', color: '#C6A15B' },
  targaryen: { name: 'Targaryen', color: '#B23A45' },
  baratheon: { name: 'Baratheon', color: '#D4A017' },
};
const HOUSE_ORDER = ['stark', 'lannister', 'targaryen', 'baratheon'];

const QUESTIONS = [
  { key: 'meeuwen', type: 'open', text: 'In een gevecht tot de dood, tegen hoeveel meeuwen zou jij het kunnen opnemen en winnen?' },
  { key: 'ladies', type: 'open', text: 'Welke twee ladies mogen uw trio vervolledigen?' },
  { key: 'onzichtbaar', type: 'open', text: 'Wat zou je doen mocht je voor 24 uur onzichtbaar kunnen zijn zonder dat iemand het weet?' },
  { key: 'pinten_vrijdag', type: 'open', text: 'Hoeveel pinten drink je gemiddeld op een vrijdag?' },
  { key: 'festival', type: 'open', text: 'Je mag één festival volledig gratis en voor niks beleven. Welk festival kies je?' },
  { key: 'schoenen', type: 'open', text: 'Hoeveel geld zou je maximaal uitgeven aan nieuwe schoenen?' },
  { key: 'koosnaampje', type: 'open', text: 'Wat is het koosnaampje van je huidige vriendin / laatste ex?' },
  { key: 'pdc_bijnaam', type: 'open', text: 'Wat zou uw liedje zijn bij de opkomst van de PDC World Darts Championship en welke vlammende bijnaam zou je jezelf geven?' },
  { key: 'coinflip', type: 'open', text: 'Coin flip: win 1000 euro of verlies 500 euro. Hoeveel coin flips doe je?' },
  { key: 'weekend_plek', type: 'open', text: 'Geef een reden waarom jij een plek verdiend hebt op het weekend.' },
];

const OPEN_KEYWORDS = {
  meeuwen: {
    stark: ['vrienden', 'bescherm', 'samen', 'team', 'genoeg om', 'dekking'],
    lannister: ['wapen', 'plan', 'list', 'mes', 'precies', 'strategie', 'reken', 'tactiek'],
    targaryen: ['oneindig', 'onendelijk', 'legende', 'altijd', 'god', 'onsterfelijk', 'meeuw word'],
    baratheon: ['allemaal', 'alles', 'zonder twijfel', 'makkelijk', 'moeiteloos', 'gemakkelijk'],
  },
  ladies: {
    stark: ['mijn vriendin', 'niemand', 'geen', 'trouw', 'ik hou het bij', 'enkel'],
    lannister: ['beroemd', 'rijk', 'voordeel', 'slim', 'strategisch', 'carrière'],
    targaryen: ['onmogelijk', 'droom', 'legende', 'fantasie', 'onbestaand', 'uniek'],
    baratheon: ['alle', 'iedereen', 'nog meer', 'zoveel mogelijk', 'feest', 'wild'],
  },
  onzichtbaar: {
    stark: ['helpen', 'bescherm', 'familie', 'checken', 'zorgen', 'vrienden'],
    lannister: ['geld', 'spioneren', 'voordeel', 'informatie', 'plan', 'profiteren'],
    targaryen: ['surreal', 'kunst', 'experimenteren', 'gek', 'avontuur', 'grenzen'],
    baratheon: ['grappen', 'pranken', 'chaos', 'stiekem', 'spannend', 'adrenaline'],
  },
  pinten_vrijdag: {
    stark: ['weinig', 'rustig', 'niet te veel', 'verantwoord', 'paar', 'mate'],
    lannister: ['bereken', 'budget', 'prijs', 'voordelig', 'tel mee'],
    targaryen: ['oneindig', 'onendelijk', 'altijd', 'geen limiet', 'zoveel als het leven toelaat'],
    baratheon: ['veel', 'tien', 'twaalf', 'alles', 'zoveel mogelijk', 'meer dan'],
  },
  festival: {
    stark: ['samen', 'gezellig', 'vrienden', 'traditie', 'dranouter', 'werchter'],
    lannister: ['vip', 'backstage', 'exclusief', 'tomorrowland', 'duur'],
    targaryen: ['uniek', 'anders', 'kunst', 'pukkelpop', 'alternatief', 'nieuw'],
    baratheon: ['wild', 'gek', 'feest', 'graspop', 'extrema', 'hard'],
  },
  schoenen: {
    stark: ['weinig', 'niet te veel', 'praktisch', 'nodig', 'spaarzaam', 'budget'],
    lannister: ['investering', 'kwaliteit', 'waard', 'merk', 'goed besteed'],
    targaryen: ['onbeperkt', 'geen limiet', 'alles', 'droom', 'uniek paar'],
    baratheon: ['veel', 'duur', 'zoveel mogelijk', 'niet aan denken', 'gewoon kopen'],
  },
  koosnaampje: {
    stark: ['schat', 'liefje', 'lief', 'thuis', 'maatje'],
    lannister: ['baas', 'koningin', 'koning', 'prinses', 'topper'],
    targaryen: ['uniek', 'gek', 'vreemd', 'bijzonder', 'mysterieus'],
    baratheon: ['grappig', 'plaag', 'bully', 'kampioen', 'beest'],
  },
  pdc_bijnaam: {
    stark: ['familie', 'team', 'samen', 'thuis', 'trouw'],
    lannister: ['koning', 'kampioen', 'winnaar', 'beste', 'klasse'],
    targaryen: ['vuur', 'legende', 'uniek', 'gek', 'anders'],
    baratheon: ['beest', 'wild', 'hard', 'knaller', 'bruut', 'vlammend'],
  },
  weekend_plek: {
    stark: ['zorg', 'altijd er', 'betrouwbaar', 'help', 'iedereen', 'er voor anderen'],
    lannister: ['regel', 'plan', 'logistiek', 'budget', 'korting', 'onderhandel', 'organiseer'],
    targaryen: ['origineel', 'gek idee', 'verras', 'nieuw', 'creatief', 'ideeën'],
    baratheon: ['feest', 'sfeer', 'energie', 'lawaai', 'plezier', 'stemming'],
  },
};

// Vaste karaktereigenschap-zin per (vraag, huis) - nooit een verwijzing naar
// de vraag zelf of het letterlijke antwoord, enkel het onderliggende trekje.
// Wordt hergebruikt voor zowel trefwoord-signalen als (waar van toepassing)
// numerieke signalen op dezelfde vraag.
const TRAITS = {
  meeuwen: {
    stark: 'rekent op steun van vrienden in moeilijke momenten',
    lannister: 'denkt eerst na over tactiek voor die in actie komt',
    targaryen: 'denkt in oneindige, legendarische termen',
    baratheon: 'twijfelt geen seconde aan het eigen kunnen',
  },
  ladies: {
    stark: 'blijft trouw aan wie die al heeft',
    lannister: 'kiest strategisch voor het eigen voordeel',
    targaryen: 'droomt in onmogelijke, grootse scenario’s',
    baratheon: 'wil gewoon zoveel mogelijk tegelijk',
  },
  onzichtbaar: {
    stark: 'gebruikt macht het liefst om anderen te beschermen',
    lannister: 'ziet meteen de kansen voor zichzelf',
    targaryen: 'zoekt de grenzen van het surreal op',
    baratheon: 'kan de verleiding tot chaos niet weerstaan',
  },
  pinten_vrijdag: {
    stark: 'houdt zich liever op de vlakte',
    lannister: 'houdt alles onder controle en berekent vooraf',
    targaryen: 'kent geen grenzen',
    baratheon: 'gaat voluit zonder rem',
  },
  festival: {
    stark: 'geniet het meest in gezelschap van vrienden',
    lannister: 'wil de exclusieve, VIP-behandeling',
    targaryen: 'zoekt het unieke en alternatieve op',
    baratheon: 'houdt van wild en onstuimig',
  },
  schoenen: {
    stark: 'is spaarzaam en praktisch ingesteld',
    lannister: 'investeert bewust in kwaliteit',
    targaryen: 'denkt niet in beperkingen',
    baratheon: 'geeft zonder terughoudendheid uit',
  },
  koosnaampje: {
    stark: 'is warm en zorgzaam in de liefde',
    lannister: 'houdt van status, ook in de liefde',
    targaryen: 'kiest altijd het ongewone',
    baratheon: 'plaagt wie die graag ziet',
  },
  pdc_bijnaam: {
    stark: 'speelt het liefst voor het team',
    lannister: 'wil gewoon de beste zijn',
    targaryen: 'kiest voor het unieke en onverwachte',
    baratheon: 'brengt pure bravoure mee',
  },
  coinflip: {
    stark: 'neemt liever geen onnodig risico',
    lannister: 'rekent de kansen rustig uit',
    targaryen: 'kent geen grenzen',
    baratheon: 'gaat voluit zonder rem',
  },
  weekend_plek: {
    stark: 'is er altijd voor anderen',
    lannister: 'regelt en organiseert alles tot in de puntjes',
    targaryen: 'brengt originele, verrassende ideeën',
    baratheon: 'brengt de sfeer en energie mee',
  },
};

const TRAIT_FALLBACK = {
  stark: 'heeft een rustige, verbindende present',
  lannister: 'straalt een berekende, strategische present uit',
  targaryen: 'heeft iets grensverleggends over zich',
  baratheon: 'brengt energie en lef mee',
};

function scoreAnswers(answersByKey) {
  const scores = { stark: 0, lannister: 0, targaryen: 0, baratheon: 0 };
  const rawTexts = [];
  const signals = []; // { house, weight, text }

  const addSignal = (house, weight, text) => {
    scores[house] += weight;
    signals.push({ house, weight, text });
  };

  for (const q of QUESTIONS) {
    const raw = (answersByKey[q.key] || '').toString();
    rawTexts.push(raw);
    const trait = TRAITS[q.key] || {};

    if (q.type === 'open') {
      const text = raw.toLowerCase();
      const bank = OPEN_KEYWORDS[q.key];
      if (bank) {
        for (const house of Object.keys(bank)) {
          for (const word of bank[house]) {
            const hits = text.split(word).length - 1;
            if (hits > 0 && trait[house]) {
              addSignal(house, hits * 4, trait[house]);
            }
          }
        }
      }

      if (q.key === 'meeuwen') {
        const hasEpicWord = /oneindig|onendelijk|altijd|god|onsterfelijk/.test(text);
        const numMatch = text.match(/\d+/);
        if (hasEpicWord) {
          addSignal('targaryen', 10, trait.targaryen);
        } else if (numMatch) {
          const n = parseInt(numMatch[0], 10);
          if (n >= 50) {
            addSignal('baratheon', 8, trait.baratheon);
            addSignal('targaryen', 3, trait.targaryen);
          } else if (n >= 10) {
            addSignal('lannister', 6, trait.lannister);
          } else {
            addSignal('stark', 6, trait.stark);
          }
        }
      }

      if (q.key === 'pinten_vrijdag') {
        const hasEpicWord = /oneindig|onendelijk|altijd|geen limiet/.test(text);
        const numMatch = text.match(/\d+/);
        if (hasEpicWord) {
          addSignal('targaryen', 10, trait.targaryen);
        } else if (numMatch) {
          const n = parseInt(numMatch[0], 10);
          if (n <= 3) {
            addSignal('stark', 6, trait.stark);
          } else if (n <= 6) {
            addSignal('lannister', 6, trait.lannister);
          } else {
            addSignal('baratheon', 8, trait.baratheon);
            addSignal('targaryen', 3, trait.targaryen);
          }
        }
      }

      if (q.key === 'schoenen') {
        const hasEpicWord = /onbeperkt|geen limiet|prijs maakt niet uit|alles/.test(text);
        const numMatch = text.match(/\d+/);
        if (hasEpicWord) {
          addSignal('targaryen', 10, trait.targaryen);
        } else if (numMatch) {
          const n = parseInt(numMatch[0], 10);
          if (n <= 100) {
            addSignal('stark', 6, trait.stark);
          } else if (n <= 300) {
            addSignal('lannister', 6, trait.lannister);
          } else {
            addSignal('baratheon', 8, trait.baratheon);
            addSignal('targaryen', 3, trait.targaryen);
          }
        }
      }

      if (q.key === 'coinflip') {
        const hasEpicWord = /oneindig|onendelijk|altijd|geen limiet|zoveel mogelijk/.test(text);
        const numMatch = text.match(/\d+/);
        if (hasEpicWord) {
          addSignal('targaryen', 10, trait.targaryen);
        } else if (numMatch) {
          const n = parseInt(numMatch[0], 10);
          if (n <= 1) {
            addSignal('stark', 6, trait.stark);
          } else if (n <= 5) {
            addSignal('lannister', 6, trait.lannister);
          } else {
            addSignal('baratheon', 8, trait.baratheon);
            addSignal('targaryen', 3, trait.targaryen);
          }
        }
      }
    }
  }

  const allText = rawTexts.join(' ').toLowerCase();
  let hash = 0;
  for (let i = 0; i < allText.length; i++) {
    hash = (hash * 31 + allText.charCodeAt(i)) % 9973;
  }
  const hashHouse = HOUSE_ORDER[hash % 4];
  addSignal(hashHouse, 1, TRAIT_FALLBACK[hashHouse]);

  const winner = HOUSE_ORDER.reduce((a, b) => (scores[a] >= scores[b] ? a : b));

  const seenText = new Set();
  const reasons = signals
    .filter((s) => s.house === winner)
    .sort((a, b) => b.weight - a.weight)
    .filter((s) => {
      if (seenText.has(s.text)) return false;
      seenText.add(s.text);
      return true;
    })
    .slice(0, 3)
    .map((s) => s.text);

  return { scores, winner, reasons };
}

module.exports = { QUESTIONS, HOUSE_META, HOUSE_ORDER, scoreAnswers };
