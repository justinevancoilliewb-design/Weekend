# De Afrekening — webapp

Multi-user versie van de vragenlijst: elke deelnemer registreert/logt in, vult de 10 vragen **eenmalig** in, en ziet daarna een neutrale wachtpagina. Niemand ziet zijn/haar huis (Stark / Lannister / Targaryen / Baratheon) totdat de organisator op "Onthullen" klikt in het admin-dashboard.

## Starten

```bash
npm install
npm start
```

- Deelnemers: `http://localhost:3000`
- Organisator: `http://localhost:3000/admin.html`

### Tijdens het echte event: gebruik `start.bat`

Sessies (wie is ingelogd) leven alleen in het geheugen van het lopende proces. Als de server crasht of herstart, worden alle 18 deelnemers automatisch uitgelogd en moeten ze opnieuw inloggen (al ingevulde antwoorden blijven wel bewaard). Dubbelklik daarom op `start.bat` in plaats van `npm start` handmatig te draaien: dat script herstart de server automatisch binnen enkele seconden als die onverwacht stopt, zodat er geen lange onderbreking is.

Laat het venster van `start.bat` gewoon openstaan voor de duur van het event. Sluit het venster (of Ctrl+C) om echt te stoppen.

Data wordt lokaal opgeslagen in `afrekening.db` (SQLite, via Node's ingebouwde `node:sqlite`, geen extra installatie nodig).

## Codes (aanpasbaar)

Standaard staan deze hard genoeg voor een eenmalig event, maar zet ze voor het echte gebruik op iets van jezelf via environment variables:

```bash
set ACCESS_CODE=jouwcode
set ADMIN_PASSWORD=jouwwachtwoord
npm start
```

- `ACCESS_CODE` (standaard `meeuwen2026`) — code die deelnemers nodig hebben om te registreren. Geef die code door aan de 18 mensen.
- `ADMIN_PASSWORD` (standaard `2846`) — wachtwoord voor het admin-dashboard.

## Gebruik tijdens het event

1. Stuur iedereen de link + de toegangscode. Ze registreren met hun naam + zelfgekozen wachtwoord, en vullen de vragenlijst in (kan maar één keer per account).
2. Jij logt in op `/admin.html` met het admin-wachtwoord. Je ziet daar een live overzicht: wie heeft al ingevuld, de score per huis, en (uitklapbaar) de ruwe antwoorden per persoon.
3. Wanneer iedereen klaar is, klik je op **ONTHULLEN**. Vanaf dat moment ziet elke deelnemer, zodra die de pagina herlaadt, zijn/haar toegewezen huis. Klik nogmaals om weer te verbergen.

## Bereikbaarheid tijdens het event

Dit draait nu alleen lokaal (`localhost`). Als de 18 deelnemers er allemaal via hun eigen telefoon/laptop bij moeten kunnen (niet allemaal op hetzelfde apparaat als de organisator), moet dit gedeployed worden naar een echte server (bv. Render, Railway, Fly.io) zodat er een publieke URL is — zeg het als je dat wil, dan zet ik dat op.

## Bestanden

- `server.js` — Express-server, routes voor login/registratie/vragenlijst/admin.
- `scoring.js` — het scoringsmodel (trefwoorden + numerieke logica per vraag), overgenomen uit de eerdere versie.
- `db.js` — SQLite-opslag (users, submissions, settings).
- `public/index.html` — deelnemerspagina (login/registratie → vragenlijst → wachten → onthulling).
- `public/admin.html` — organisator-dashboard.
