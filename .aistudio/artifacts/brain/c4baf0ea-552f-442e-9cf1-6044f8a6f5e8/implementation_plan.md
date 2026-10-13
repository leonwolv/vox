# Uitbreiding van het Zwevende Dock: Gesplitste Taal- & Stemselectie, Snelheid en STT

Uitbreiding van het zwevende bureaublad-dock (`FloatingToolbar`) en de overlay in `DesktopGuiShowcase` met:
1. **Gesplitste Taal- en Stemselectie**:
   - **Dropdown 1: Taalfilter** (bijv. Nederlands `NL`, Engels `EN`, Duits `DE`, Frans `FR`, Spaans `ES`, Italiaans `IT`, etc.).
   - **Dropdown 2: Stemmenlijst** (toont uitsluitend de gefilterde stemmen van de gekozen taal, zodat de lijst overzichtelijk en compact blijft).
2. **Snelheidsregeling (WPM)**:
   - Directe plus- en min-stapknoppen (`-10 WPM` / `+10 WPM`).
   - Klikbare WPM badge die een popover-slider opent (50–500 WPM) met snelle presets (120, 170, 220 WPM).
3. **STT Microfoonknop (Whisper AI)**:
   - Toggle-knop met live opnamepuls.
   - Dicteert direct via lokale speech-to-text en voegt getranscribeerde tekst toe aan het actieve document in de leeswachtrij.

---

## User Review & Bevestigde Keuzes

> [!IMPORTANT]
> **Aangepast conform uw feedback:**
> - **2 Aparte Dropdowns**: De stemkeuze in het zwevende dock is opgesplitst in **1 dropdown voor taal** en **1 dropdown voor stem**. Hierdoor hoeft de gebruiker nooit door 50+ stemmen te scrollen en wisselt u razendsnel van taalgebied.
> - **STT Microfoonknop**: Toggle-knop die lokale Whisper AI dictatie start/stopt en gesproken zinnen direct toevoegt aan het document.
> - **Snelheidsregeling**: Snelheidsweergave met plus/min steppers en een slider popover voor fijnafstelling.

---

## 1. Overzicht & Visuele Indeling van het Dock

### Compacte Dock Layout

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [:: Drag] VoxA11y Dock                                       [Sliders: Dekking] [_ Mini] │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [⏮] [ ▶ / ⏸ ] [⏹] [⏭] │ [🎤 Mic / STT] │ [Taal: NL ▼] [Stem: Claire ▼] │ [-] 175 WPM [+]│
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Transportknoppen**: Vorige zin, Play/Pauze, Stop, Volgende zin.
2. **STT Microfoon Toggle**:
   - Inactief: Microfoon-icoon met tooltip *"Start Dicteren (Whisper AI)"*.
   - Actief: Pulserende rode indicatie met *"Dicteert..."*, die zinnen opvangt en direct toevoegt aan het actieve document.
3. **Gesplitste Dropdowns (Taal & Stem)**:
   - **Taal**: `NL`, `EN`, `DE`, `FR`, `ES`, `IT`, `SV`, `NO`, `DA`.
   - **Stem**: Dynamisch gevuld op basis van de gekozen taal (bijv. voor NL: *Claire*, *Frank*, *Fenna*, *Ruben*, *Piper*).
4. **Snelheidsbediening**:
   - `-` en `+` steppers in stappen van 10 WPM.
   - Klikken op de WPM badge opent een popover met slider (50–500 WPM) en presets.

---

## 2. Technische Wijzigingen & Componenten

1. **`src/components/FloatingToolbar.tsx`**:
   - Ondersteuning voor 2 dropdowns: `selectedLang` + `selectedVoice`.
   - Wanneer de gebruiker een andere taal selecteert, kiest de component automatisch de eerste beschikbare stem voor die taal.
   - Integratie van STT microfoon toggle knop met audio visualisatie.
   - Steppers en slider popover voor WPM.
2. **`src/components/DesktopGuiShowcase.tsx`**:
   - Het bureaublad-overlay widget in de GUI showcase krijgt exact dezelfde gesplitste taal/stem-selectors en besturing.
3. **`src/App.tsx`**:
   - Doorgeven van actuele stemmen, taalkeuze, WPM en STT-opname functies aan de floating toolbar.
4. **Verificatie**:
   - Uitvoeren van `lint_applet` en `compile_applet`.
