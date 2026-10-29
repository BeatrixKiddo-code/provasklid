# Pro Váš Klid — péče o hroby

Úprava zachovává stávající značku (redesign · preserve). Cíl: usnadnit nezávaznou poptávku rodinám, které nemohou pečovat o hrob osobně.

- Logo: `images/bezpozadi.webp`.
- Fotografie: `images/22149125626.webp`, `images/zaneta-foto.webp`; výsledky práce: `images/IMG_0541.webp`, `images/hroby_melnik_foto2.webp`.
- Barvy: krémová #FAF8F5, světlá #F5F3EF, zelená #526455 a tmavší #3E5142 (odvozené ze stávající šalvějové), text #2D2D2D.
- Písmo: původní lokální Rawengulksans (`MujFont`) pro nadpisy a navigaci, Inter pro běžný text. Nadpisy bez umělé kurzívy a syntetického tučného řezu; žádné načítání Cormorantu.
- Rozestupy: stávající proměnné `--spacing-*`; fotografie s jednoduchým rádiusem 4 px, služby členěné prostorem a linkou. Bez sloganu přes fotografii, opakovaných drobných popisků a dekorativních animací.
- Kalibrace: variabilita 4/10 (dělený úvod), pohyb 2/10 (odezva prvků), hustota 5/10, závislost na fotografiích 6/10, věrnost značce 9/10.
- Zachováno: hlavní URL, kotvy sekcí, skutečné ceny, balíčky, Formspree endpoint i původní názvy polí, kontakty, galerie, reference.
- Zlepšeno: úvod a cena od, vysvětlení balíčků, telefon, potvrzení ceny předem, viditelné FAQ odpovídající existujícím strukturovaným datům, osobní kontakt, chyby formuláře.
- Odstraněno: sezónní kampaň a bannery. `/dusicky/` slouží pouze jako přesměrování na celoroční péči; článek zůstává s aktualizovaným odkazem.
- Riziko: skutečné doručení formuláře musí potvrdit provozovatel při kontrole služby Formspree; ověřování nesmí odesílat zkušební poptávky.
- Návrat: změny lze vrátit v Gitu; styly úpravy jsou oddělené v `pece-o-hroby-melnik/modernizace.css`.
