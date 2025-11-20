# Materialguide - Climatiq-Kompatibla Namn

## 🎯 Snabbreferens för SME-Tillverkare

Använd dessa exakta namn för bästa resultat med Climatiq API.

---

## Metaller

| Material | Climatiq-namn | Typisk användning |
|----------|---------------|-------------------|
| Stålplåt | `steel sheet` | Ramar, fästen, stommar |
| Rostfritt stål | `stainless steel` | Ytor, beslag |
| Aluminium | `aluminium` | Lättviktskonstruktioner |
| Gjutjärn | `cast iron` | Tunga komponenter |
| Koppar | `copper` | Ledningar, rör |

---

## Plaster

| Material | Climatiq-namn | Typisk användning |
|----------|---------------|-------------------|
| Polypropylen | `polypropylene` | Skal, höljen |
| Polyeten | `polyethylene` | Förpackning, film |
| PU-skum | `polyurethane foam` | Stoppning, isolering |
| ABS-plast | `abs plastic` | Hårda skal |
| PVC | `pvc` | Rör, kablar |

---

## Textil & Tyg

| Material | Climatiq-namn | Typisk användning |
|----------|---------------|-------------------|
| Polyestertyg | `polyester fabric` | Klädsel, överdrag |
| Bomullstyg | `cotton fabric` | Naturliga textilier |
| Nylon | `nylon fabric` | Hållbara textilier |
| Ulltyg | `wool fabric` | Premium-klädsel |

---

## Trä & Träbaserat

| Material | Climatiq-namn | Typisk användning |
|----------|---------------|-------------------|
| Plywood | `plywood` | Skivor, paneler |
| Spånskiva | `particleboard` | Möbler, inredning |
| MDF | `mdf board` | Släta ytor |
| Massivt trä | `solid wood` | Högkvalitativa delar |

---

## Glas & Keramik

| Material | Climatiq-namn | Typisk användning |
|----------|---------------|-------------------|
| Fönsterglas | `float glass` | Glasskivor |
| Keramik | `ceramic` | Komponenter |

---

## Tips för Bästa Resultat

1. **Använd engelska namn** - Climatiq API föredrar engelska
2. **Var specifik** - "steel sheet" ger bättre data än bara "steel"
3. **Testa först** - Kör en testberäkning med små mängder
4. **Dokumentera** - Spara fungerande materialnamn för framtida projekt

---

## Exempel: Kontorsstol

```
Stålfot: steel sheet (4.5 kg)
Skumstoppning: polyurethane foam (0.8 kg)
Tyg: polyester fabric (1.4 kg)
Plasthölje: polypropylene (1.2 kg)
```

**Resultat:** ~50-60 kg CO₂e per stol

---

## Behöver Du Hjälp?

Om ett material inte finns i Climatiq:
1. Prova ett liknande material
2. Kontakta Climatiq support för att lägga till det
3. Använd lokal databas som fallback
