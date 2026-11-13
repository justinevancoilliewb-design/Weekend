'use strict';

const HOUSE_META = {
  stark: { name: 'Stark', color: '#8FA9B0' },
  lannister: { name: 'Lannister', color: '#C6A15B' },
  targaryen: { name: 'Targaryen', color: '#B23A45' },
  baratheon: { name: 'Baratheon', color: '#D4A017' },
};
const HOUSE_ORDER = ['stark', 'lannister', 'targaryen', 'baratheon'];

const QUESTIONS = [
  { key: 'meeuwen', type: 'open', text: 'Wanneer het tot een gevecht op leven en dood komt, tegen hoeveel meeuwen zoudt gij het opnemen en zegevieren?' },
  { key: 'ladies', type: 'open', text: 'Welke twee edele vrouwen mogen uw driemanschap voltooien?' },
  { key: 'onzichtbaar', type: 'open', text: 'Stel dat gij een dag en een nacht onzichtbaar waart, zonder dat een ziel het weet. Wat zoudt gij dan doen?' },
  { key: 'pinten_vrijdag', type: 'open', text: 'Hoeveel pinten mede zoudt gij op een gewone vrijdag in de herberg ledigen?' },
  { key: 'festival', type: 'open', text: 'De Koning schenkt u vrije toegang tot één volksfeest in het ganse rijk. Welk festival kiest gij?' },
  { key: 'schoenen', type: 'open', text: 'Hoeveel goudstukken zoudt gij maximaal besteden aan een nieuw paar laarzen?' },
  { key: 'koosnaampje', type: 'open', text: 'Met welke tedere naam spreekt gij uw huidige liefste of uw laatste verloofde aan?' },
  { key: 'pdc_bijnaam', type: 'open', text: 'Bij uw intocht in de hal van het Wereldkampioenschap Pijlschieten, welk lied galmt door de zaal, en welke vlammende bijnaam draagt gij?' },
  { key: 'studentenboek', type: 'open', text: 'Gij schrijft een kroniek over uw jaren als scholier aan de academie. Wat is de titel van dit boek?' },
  { key: 'ideale_vrijgezelle', type: 'open', text: 'Hoe ziet het afscheidsfeest van uw vrijgezellenleven er in uw ideale verbeelding uit?' },
  { key: 'levensles', type: 'open', text: 'Welke levensles geeft gij mee aan uw kleinzoon, wanneer gij als grijsaard bij het haardvuur zit?' },
  { key: 'weekend_plek', type: 'open', text: 'Geef een reden waarom gij een stoel aan de tafel van het Verbond hebt verdiend.' },
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
  studentenboek: {
    stark: ['vrienden', 'samen', 'thuis', 'kot', 'maatjes', 'herinneringen'],
    lannister: ['diploma', 'carrière', 'slim', 'plan', 'cum laude', 'geslaagd', 'strategie'],
    targaryen: ['legende', 'onmogelijk', 'vuur', 'unieke', 'epos', 'onwaarschijnlijk', 'mythe'],
    baratheon: ['feest', 'kater', 'chaos', 'wild', 'zatte', 'dronken', 'pintjes', 'cantus'],
  },
  ideale_vrijgezelle: {
    stark: ['gezellig', 'samen', 'vrienden', 'rustig', 'bbq', 'ontspannen', 'weekendje'],
    lannister: ['luxe', 'vip', 'stijl', 'georganiseerd', 'cocktail', 'chique', 'goed geregeld'],
    targaryen: ['uniek', 'gek', 'verrassing', 'avontuur', 'origineel', 'thema', 'onverwacht'],
    baratheon: ['feest', 'wild', 'veel drank', 'zuipen', 'chaos', 'alles', 'tot laat', 'uit de bol'],
  },
  levensles: {
    stark: ['familie', 'vrienden', 'eerlijk', 'trouw', 'respect', 'loyaal', 'zorg'],
    lannister: ['geld', 'investeer', 'slim', 'plan', 'denk na', 'spaar', 'netwerk'],
    targaryen: ['durf', 'droom', 'anders', 'jezelf', 'grenzen', 'volg je hart', 'uniek'],
    baratheon: ['geniet', 'leef', 'feest', 'plezier', 'nu', 'neem alles', 'geen spijt'],
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
  studentenboek: {
    stark: 'koestert de band met vrienden uit het verleden',
    lannister: 'ziet zelfs studeren als een stap in een groter plan',
    targaryen: 'maakt van het eigen verhaal een legende',
    baratheon: 'blikt terug op een leven vol feest en chaos',
  },
  ideale_vrijgezelle: {
    stark: 'zoekt gezelligheid en een hechte groep',
    lannister: 'kiest voor stijl, luxe en een goed georganiseerd feest',
    targaryen: 'bedenkt iets origineels en onverwachts',
    baratheon: 'wil een feest zonder rem',
  },
  levensles: {
    stark: 'zet familie, vrienden en loyaliteit op de eerste plaats',
    lannister: 'geeft slimme, berekende raad mee',
    targaryen: 'moedigt aan om eigen grenzen te verleggen',
    baratheon: 'leeft in het moment en geniet voluit',
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
    }
  }

  const allText = rawTexts.join(' ').toLowerCase();
  let hash = 0;
  for (let i = 0; i < allText.length; i++) {
    hash = (hash * 31 + allText.charCodeAt(i)) % 9973;
  }
  const hashHouse = HOUSE_ORDER[hash % 4];
  addSignal(hashHouse, 1, TRAIT_FALLBACK[hashHouse]);

  return { scores, signals };
}

// Geeft de top-3 (gededupliceerde) eigenschap-zinnen terug voor één specifiek
// huis, op basis van de signalen die scoreAnswers() verzamelde. Losgekoppeld
// van scoreAnswers() zelf omdat het uiteindelijk toegewezen huis (na
// balanceAssignments) kan afwijken van het huis met de hoogste ruwe score.
function reasonsForHouse(signals, house) {
  const seenText = new Set();
  const reasons = signals
    .filter((s) => s.house === house)
    .sort((a, b) => b.weight - a.weight)
    .filter((s) => {
      if (seenText.has(s.text)) return false;
      seenText.add(s.text);
      return true;
    })
    .slice(0, 3)
    .map((s) => s.text);

  // Kan leeg uitkomen als iemand voor deze balans in een huis terechtkomt
  // waar die van zichzelf geen signalen voor had - altijd minstens één
  // generieke eigenschap-zin teruggeven zodat er nooit "geen uitleg" is.
  return reasons.length > 0 ? reasons : [TRAIT_FALLBACK[house]];
}

// Wijst elke persoon in `scoresByUserId` (Map<userId, scores>) toe aan een huis,
// rekening houdend met `existingCounts` (huidige aantallen per huis van reeds
// geanalyseerde personen die niet in deze batch zitten), zodat de totale
// verdeling over de 4 huizen zo gelijk mogelijk blijft. Iedereen krijgt zoveel
// mogelijk zijn/haar hoogst scorende huis, maar zodra een huis zijn eerlijke
// aandeel bereikt, gaat de volgende persoon met de hoogste score voor dat huis
// naar hun eerstvolgende beste huis dat nog ruimte heeft.
function balanceAssignments(scoresByUserId, existingCounts) {
  const counts = {};
  for (const house of HOUSE_ORDER) counts[house] = existingCounts[house] || 0;

  const totalAfter = HOUSE_ORDER.reduce((sum, h) => sum + counts[h], 0) + scoresByUserId.size;
  const minShare = Math.floor(totalAfter / HOUSE_ORDER.length);
  const maxShare = Math.ceil(totalAfter / HOUSE_ORDER.length);

  const candidates = [];
  for (const [userId, scores] of scoresByUserId) {
    for (const house of HOUSE_ORDER) {
      candidates.push({ userId, house, score: scores[house] });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  const assignments = new Map();
  const remaining = new Set(scoresByUserId.keys());

  const assignUpTo = (cap) => {
    for (const c of candidates) {
      if (!remaining.has(c.userId)) continue;
      if (counts[c.house] >= cap) continue;
      assignments.set(c.userId, c.house);
      counts[c.house]++;
      remaining.delete(c.userId);
    }
  };

  // Eerste ronde: vul elk huis tot zijn minimale aandeel (het "vloer"-niveau),
  // zodat geen enkel huis leeg/bijna-leeg kan blijven terwijl een ander huis
  // al wel zijn deel heeft. Tweede ronde: verdeel de rest (het verschil
  // tussen min- en maxShare) over de huizen met de hoogste resterende scores.
  assignUpTo(minShare);
  assignUpTo(maxShare);

  // Vangnet: zou enkel nog overblijven bij gelijktijdige grenzen - plaats in
  // het op dat moment minst volle huis.
  for (const userId of remaining) {
    const house = HOUSE_ORDER.reduce((a, b) => (counts[a] <= counts[b] ? a : b));
    assignments.set(userId, house);
    counts[house]++;
  }

  return assignments;
}

module.exports = { QUESTIONS, HOUSE_META, HOUSE_ORDER, scoreAnswers, reasonsForHouse, balanceAssignments };
