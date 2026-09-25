'use strict';

const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const { restoreDbIfMissing, backupDb } = require('./github-backup');

const PORT = process.env.PORT || 3000;
const ACCESS_CODE = process.env.ACCESS_CODE || 'meeuwen2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2846';
const SESSION_SECRET = process.env.SESSION_SECRET || 'de-afrekening-geheim';

function backgroundBackup() {
  backupDb().catch((err) => console.error('Achtergrond-backup mislukt:', err.message));
}

async function main() {
  await restoreDbIfMissing();

  const { db, getSetting, setSetting } = require('./db');
  const { QUESTIONS, HOUSE_META, scoreAnswers } = require('./scoring');

  const app = express();
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
  })
);
app.use(express.static(path.join(__dirname, 'public')));

function requireUser(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Niet ingelogd.' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) return res.status(401).json({ error: 'Geen toegang.' });
  next();
}

// ---------- Auth ----------

app.post('/api/register', (req, res) => {
  const { name, password, accessCode } = req.body || {};
  if (!name || !password || !accessCode) {
    return res.status(400).json({ error: 'Naam, wachtwoord en toegangscode zijn verplicht.' });
  }
  if (accessCode !== ACCESS_CODE) {
    return res.status(403).json({ error: 'Onjuiste toegangscode.' });
  }
  const cleanName = name.toString().trim();
  if (cleanName.length < 2) {
    return res.status(400).json({ error: 'Naam is te kort.' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE name = ?').get(cleanName);
  if (existing) {
    return res.status(409).json({ error: 'Deze naam bestaat al. Kies een andere of log in.' });
  }
  const hash = bcrypt.hashSync(password.toString(), 10);
  const info = db.prepare('INSERT INTO users (name, password_hash) VALUES (?, ?)').run(cleanName, hash);
  req.session.userId = Number(info.lastInsertRowid);
  res.json({ ok: true });
});

app.post('/api/login', (req, res) => {
  const { name, password } = req.body || {};
  if (!name || !password) return res.status(400).json({ error: 'Naam en wachtwoord zijn verplicht.' });
  const user = db.prepare('SELECT * FROM users WHERE name = ?').get(name.toString().trim());
  if (!user || !bcrypt.compareSync(password.toString(), user.password_hash)) {
    return res.status(401).json({ error: 'Onjuiste naam of wachtwoord.' });
  }
  req.session.userId = user.id;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', requireUser, (req, res) => {
  const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Niet ingelogd.' });
  const submission = db.prepare('SELECT house, reasons_json, submitted_at FROM submissions WHERE user_id = ?').get(user.id);
  const revealed = getSetting('revealed', 'false') === 'true';
  res.json({
    name: user.name,
    hasSubmitted: !!submission,
    revealed,
    house: revealed && submission && submission.house ? { key: submission.house, ...HOUSE_META[submission.house] } : null,
    reasons: revealed && submission && submission.reasons_json ? JSON.parse(submission.reasons_json) : null,
  });
});

// ---------- Questionnaire ----------

app.get('/api/questions', requireUser, (req, res) => {
  res.json({
    questions: QUESTIONS.map((q) => ({
      key: q.key,
      type: q.type,
      text: q.text,
      opts: q.opts ? q.opts.map((o) => o.t) : undefined,
    })),
  });
});

app.post('/api/submit', requireUser, (req, res) => {
  const existing = db.prepare('SELECT id FROM submissions WHERE user_id = ?').get(req.session.userId);
  if (existing) return res.status(409).json({ error: 'Je hebt al geantwoord.' });

  const { answers } = req.body || {};
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Ongeldige antwoorden.' });
  }
  for (const q of QUESTIONS) {
    const val = (answers[q.key] || '').toString().trim();
    if (!val) return res.status(400).json({ error: `Vraag "${q.text}" is niet beantwoord.` });
  }

  const answersByKey = {};
  for (const q of QUESTIONS) answersByKey[q.key] = answers[q.key].toString().trim();

  db.prepare('INSERT INTO submissions (user_id, answers_json) VALUES (?, ?)').run(
    req.session.userId,
    JSON.stringify(answersByKey)
  );

  res.json({ ok: true });
  backgroundBackup();
});

app.get('/api/reveal', requireUser, (req, res) => {
  const revealed = getSetting('revealed', 'false') === 'true';
  if (!revealed) return res.status(403).json({ error: 'Nog niet onthuld.' });

  const rows = db.prepare('SELECT u.name, s.house FROM users u JOIN submissions s ON s.user_id = u.id WHERE s.house IS NOT NULL ORDER BY u.name COLLATE NOCASE ASC').all();

  const houses = { stark: [], lannister: [], targaryen: [], baratheon: [] };
  for (const r of rows) {
    if (houses[r.house]) houses[r.house].push(r.name);
  }

  res.json({ houses });
});

// ---------- Admin ----------

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Onjuist wachtwoord.' });
  req.session.isAdmin = true;
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ ok: true });
});

app.get('/api/admin/state', requireAdmin, (req, res) => {
  res.json({ revealed: getSetting('revealed', 'false') === 'true' });
});

app.post('/api/admin/reveal', requireAdmin, (req, res) => {
  const { revealed } = req.body || {};
  setSetting('revealed', revealed ? 'true' : 'false');
  res.json({ ok: true });
  backgroundBackup();
});

app.get('/api/admin/backup', requireAdmin, (req, res) => {
  res.download(path.join(__dirname, 'afrekening.db'), `afrekening-backup-${Date.now()}.db`);
});

app.get('/api/admin/roster', requireAdmin, (req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.name, s.answers_json, s.scores_json, s.house, s.reasons_json, s.submitted_at
       FROM users u
       LEFT JOIN submissions s ON s.user_id = u.id
       ORDER BY u.name COLLATE NOCASE ASC`
    )
    .all();

  const counts = { stark: 0, lannister: 0, targaryen: 0, baratheon: 0 };
  const roster = rows.map((r) => {
    if (r.house) counts[r.house] = (counts[r.house] || 0) + 1;
    return {
      userId: r.id,
      name: r.name,
      hasSubmitted: !!r.answers_json,
      isAnalyzed: !!r.house,
      house: r.house ? { key: r.house, ...HOUSE_META[r.house] } : null,
      scores: r.scores_json ? JSON.parse(r.scores_json) : null,
      reasons: r.reasons_json ? JSON.parse(r.reasons_json) : null,
      answers: r.answers_json ? JSON.parse(r.answers_json) : null,
      submittedAt: r.submitted_at || null,
    };
  });

  res.json({
    roster,
    counts,
    totalUsers: rows.length,
    totalSubmitted: rows.filter((r) => r.answers_json).length,
    questions: QUESTIONS,
  });
});

app.post('/api/admin/analyze', requireAdmin, (req, res) => {
  const { userIds } = req.body || {};
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'Geen personen geselecteerd.' });
  }

  const analyzed = [];
  for (const rawId of userIds) {
    const userId = Number(rawId);
    const submission = db.prepare('SELECT answers_json FROM submissions WHERE user_id = ?').get(userId);
    if (!submission) continue;

    const answersByKey = JSON.parse(submission.answers_json);
    const { scores, winner, reasons } = scoreAnswers(answersByKey);

    db.prepare('UPDATE submissions SET scores_json = ?, house = ?, reasons_json = ? WHERE user_id = ?').run(
      JSON.stringify(scores),
      winner,
      JSON.stringify(reasons),
      userId
    );
    analyzed.push(userId);
  }

  res.json({ ok: true, analyzed });
  backgroundBackup();
});

app.use((err, req, res, next) => {
  console.error('Onverwachte fout:', err);
  res.status(500).json({ error: 'Er ging iets mis. Probeer opnieuw.' });
});

  app.listen(PORT, () => {
    console.log(`De Afrekening draait op http://localhost:${PORT}`);
    console.log(`Toegangscode voor registratie: ${ACCESS_CODE}`);
    console.log(`Admin-wachtwoord: ${ADMIN_PASSWORD}`);
  });
}

main();
