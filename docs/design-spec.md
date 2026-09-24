# Design spec — extracted from `Zadanie rekrutacyjne - WorkConnect.fig`

Source: the `.fig` archive was decoded locally (kiwi binary → JSON). All values below are read
from the file, not eyeballed.

## Frames

| Frame                 | Viewport | Purpose                                                     |
| --------------------- | -------- | ----------------------------------------------------------- |
| Lista produktów       | 1440×810 | Product table, desktop                                      |
| Toast                 | 1440×810 | Same page after a successful add (8 products, Sonner toast) |
| Dialog / Krok nr. 1–3 | 1440×810 | The three wizard steps, desktop                             |
| Lista produktów       | 393×946  | Product list as stacked cards, mobile                       |
| Dialog / Krok nr. 1–3 | 393×852  | The three wizard steps, mobile                              |

## Tokens

Stock shadcn/ui `neutral` base theme with a blue primary.

| Token                     | Value                                   | Used by                                                             |
| ------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| `--background`            | `#fafafa`                               | page                                                                |
| `--card` / dialog surface | `#ffffff`                               | dialog, table body                                                  |
| `--foreground`            | `#0a0a0a`                               | body text, headings                                                 |
| `--muted-foreground`      | `#737373`                               | subtitles, labels, placeholders                                     |
| `--muted`                 | `#f5f5f5`                               | dialog footer, inactive step circle                                 |
| `--surface-subtle`        | `#f9fafb` (gray-50)                     | table header row, caption bar                                       |
| `--border`                | `#e5e5e5`                               | all borders, stepper connectors                                     |
| `--primary`               | `#2563eb` (blue-600)                    | primary buttons, active + completed step                            |
| `--success`               | `#16a34a` (green-600)                   | "Dostępny" badge text, @ 10% as its background; Sonner success icon |
| destructive bg            | `#dc2626` @ 10%                         | "Niedostępny" badge                                                 |
| `--radius`                | `0.625rem` (dialog `rounded-xl` = 14px) |                                                                     |

Where the file names a Tailwind colour (`colors/gray/50`), the code uses the semantic token
that holds it, so a colour is stated once and named for its role. Two tokens are added to
shadcn's set: `--success`, which it has no equivalent for, and `--surface-subtle`, because
shadcn's `--muted` is `#f5f5f5`, a step darker than the design's table head.

Font: **Geist** — Regular / Medium / SemiBold at 12 / 14 / 16 / 20 px.

## Product list

Header: `Produkty` (20px SemiBold) + `7 produktów w katalogu` (14px, muted).
Primary button `Dodaj produkt` with a leading Lucide `Plus`, 36px tall.

Table columns: **Nazwa · SKU · Kategoria · Cena Brutto · Status · Magazyn**

- Cells 14px Regular, line-height 1.5; the name and the gross price are Medium. SKU renders 12px.
- Status is a Badge, both drawn as coloured text on a 10% tint of the same colour: success
  `Dostępny`, destructive `Niedostępny`.
- Magazyn shows `—` when the product is not limited.
- Header row 40px, body rows 48px. Header labels 14px Medium, line-height 1.5, muted.

Caption bar, 64px whether or not the pager shows: `Strona 1 z 2 · 7 produktów` on the left, shadcn `Pagination` on the right
(Previous disabled on page 1, numbered links, Next). The current page is filled with the primary
colour and white text; the other pages are ghost buttons.

Seed data in the design (5 rows on page 1, 7 in the catalogue):

| Nazwa                  | SKU         | Kategoria | Cena brutto | Status      | Magazyn |
| ---------------------- | ----------- | --------- | ----------- | ----------- | ------- |
| MacBook Pro 14"        | MBP14M3PRO  | Komputery | 9999,00 PLN | Dostępny    | —       |
| Galaxy S24 Ultra       | SGS24U256   | Telefony  | 6299,00 PLN | Dostępny    | 45      |
| Sony WH-1000XM5        | SNWH1000XM5 | RTV       | 1599,00 PLN | Dostępny    | —       |
| Bosch Serie 6 WAU28P40 | BSWAU28P40  | AGD       | 3299,00 PLN | Niedostępny | 0       |
| Xiaomi Smart Band 8    | XMSB8BLK    | Akcesoria | 179,00 PLN  | Dostępny    | —       |

Mobile: each product is a card — name (16px) + SKU above a status badge, then a three-column
row of `Kategoria` / `Cena brutto` / `Magazyn` label-over-value pairs.

## Dialog

Width 720px, radius 14px, white, over a black scrim at 50% opacity. The scrim layer carries no
effect in the file, but the reference render blurs what is behind it. Measured off that render
— a 10-90% edge rise of 9.4px puts the Gaussian at sigma 3.7 — so the implementation uses
`blur(4px)`, CSS `blur()` taking sigma directly. Header 64px with title
`Dodaj nowy produkt` and a close icon. Footer 68px, filled `#f5f5f5` under white at 50% —
which resolves to `#fafafa`, exactly what shadcn's `bg-muted/50` already produces.

Height changes per step: 546 / 370 / 440 px — the dialog is sized by its content.

### Stepper

Three items, each a 32×32 circle + title (14px Medium) + subtitle (12px muted):

1. `Informacje` / `Dane podstawowe`
2. `Cena` / `Dane cenowe`
3. `Dostępność` / `Stany magazynowe`

Circle is `#2563eb` when active or completed, `#f5f5f5` when pending. A completed step shows a
check glyph instead of its number. 67×1px connectors between items turn `#2563eb` once the step
before them is done. On mobile the three items sit side by side with the circle above the text.

### Step 1 — Informacje

| Field        | Control            | Label          | Placeholder          |
| ------------ | ------------------ | -------------- | -------------------- |
| name         | Input              | Nazwa produktu | np. MacBook Pro 14   |
| sku          | Input              | SKU produktu   | np. MBP14M3PRO       |
| description  | Textarea (64px)    | Opis           | Krótki opis produktu |
| manufacturer | Select             | Producent      | Wybierz producenta   |
| category     | Select             | Kategoria      | Wybierz kategorię    |
| features     | Badge multi-select | Cechy produktu | —                    |

Feature options shown as toggleable badges — white, `#e5e5e5` border, pill radius, 14px
muted Regular text at line-height 1.5 — the same type as a select's placeholder. The kit's leading and trailing icon slots are both hidden layers:
Bluetooth, WiFi, USB-C, Wodoodporny, Bezprzewodowy, Ekologiczny, Premium.

Name + SKU sit side by side (2 columns) on desktop, stacked on mobile. Same for Producent +
Kategoria. Footer: `Dalej` only (pill, trailing arrow icon).

### Step 2 — Cena

| Field      | Control | Label       | Placeholder / value |
| ---------- | ------- | ----------- | ------------------- |
| netPrice   | Input   | Cena netto  | 0.00                |
| grossPrice | Input   | Cena brutto | 0.00                |
| vatRate    | Select  | Stawka VAT  | 23%                 |
| currency   | Select  | Waluta      | PLN                 |

Two rows of two columns. Footer: `Wstecz` (outline, 10px radius, leading arrow icon) + `Dalej`
(pill, trailing arrow icon).

### Step 3 — Dostępność

- Switch `Produkt jest dostępny`, control on the left, on by default.
- Separator.
- Checkbox `Produkt limitowany`, control on the left.
- Separator.
- Heading `Limity koszyka` (14px).
- Inputs `Minimalna ilość` (placeholder `1`) and `Maksymalna ilość` (value `10`), side by side.
  The asymmetry looks like a slip in the file; both ship with a value.

`Ilość na magazynie` is not in the design — per the brief it appears only once
`Produkt limitowany` is checked. Footer: `Wstecz` + `Zapisz produkt`.

## Toast

Sonner, success variant, 336×52, radius 8px, 16px padding, `#e5e5e5` border, shadow
`0 4px 12px -1px` black at 10%. A 20px icon — a filled green-600 (`--success`) disc of 16px
with the check cut out — then 8px, then the title `Produkt został dodany` in 14px Medium,
line-height 1.5.

## Notes / conflicts

- The brief requires at least one product feature ("Jedna lub więcej wartości z listy"); the
  design carries no required marker on `Cechy produktu`.
- The brief says **5** seed products; the design header says **7 produktów w katalogu** with
  `Strona 1 z 2`. The design is the only version where pagination is actually visible.
- The Figma labels the description Textarea `Nazwa produktu` — a copy/paste slip in the design.
  `Opis` is used instead.
- The two footer buttons do not share a radius: `Wstecz` sits at the theme's 10px while `Dalej`
  and `Zapisz produkt` are full pills. It reads like two different kit components rather than a
  decision, but it is what the file draws, so it is what ships.
- Several shadcn-kit placeholders (`This is an input description.`, `Forgot your password?`,
  `This is a dialog description.`, `KbdGroup` shortcut chips) are hidden layers in the file and
  are not part of the design.
