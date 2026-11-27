# Design guide for elkaermeisner.com

Read this before adding a page or changing a layout. The aim is one site that looks and behaves the same on every page, at every width and however the reader scrolls. When a rule here and the stylesheet disagree, fix one of them in the same change.

## 1 Building blocks

| Part | File | Used by |
| --- | --- | --- |
| Base styles, header, footer, buttons, cards, spacing helpers | `assets/site.css` | every page |
| Visual guide, sticky sub-navigation, signal colour | `assets/guide.css` | guide, tools, adaptation guide |
| Interactive tools and the one-page plan | `assets/tools.css` | tools, adaptation guide |

- Plain HTML and CSS. Scripts only where a page is interactive.
- Stylesheets and scripts are linked with a version, for example `site.css?v=20261127b`. Raise the version on every page when a stylesheet or script changes, so returning readers do not get new markup with old styles.
- No `style="..."` attributes. Use a class, or a spacing helper from the end of `site.css` (`mt-16`, `mw-760`, `pb-104` and so on). Add a helper there if one is missing.

## 2 Colour

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#0B1F33` | headings, dark buttons, dark panels |
| `--text` | `#3D4B5C` | body copy |
| `--muted` | `#5A6878` | small print |
| `--line` | `#E3E7ED` | borders and dividers |
| `--soft` | `#F4F6F9` | quiet panels, footer |
| `--accent` | `#1D4ED8` | links, eyebrows, numbers, the current item in any navigation |
| `--signal` | `#FF5B2E` | the agent, a warning or a state inside the guide and the tools, and the square on the cover |

Blue marks where the reader is and what can be clicked. Orange is never used for navigation.

## 3 Type

- Headings in Space Grotesk, weight 600, line height 1.2. Body in Inter, 17px, line height 1.6.
- Page title on pages with a hero: `clamp(38px, 6vw, 60px)`. This covers the front page, the book page, the notes list, the guide, the tools and the adaptation guide.
- Page title on text pages (articles, privacy, opt-out): `clamp(34px, 5vw, 48px)`.
- Section headings: `clamp(28px, 4vw, 36px)`.
- Lead 20px, small print 14px. Nothing below 13px. The only exception is the one-page plan in the adaptation guide, which is sized to print on a single sheet and must not be changed without testing the print.
- Headings in sentence case. Article titles keep the capitalisation they have on LinkedIn.

## 4 Space

- The first line of text starts 112px below the header on wide screens. On phones it is 64px on pages with a hero, 88px on text pages and 48px on tool pages, so the tool is reached sooner.
- Sections start with 96px of space. The last section on a page ends with 104px before the footer.
- The footer sits at the bottom of the window on short pages.

## 5 Actions

- One button size everywhere: `.btn`, 48px high, 16px text. `btn-dark` for the main action in a group, `btn-line` for the others, `btn-light` and `btn-ghost` on dark panels.
- Choices inside a tool (Yes and No, option pills, rule pickers) are controls, not buttons, and keep their own compact size.
- A next step is never a plain link in a sentence. Use a button, a card or a panel. Plain links are for references inside running text.
- Buttons in a row of boxes line up at the bottom of the boxes.

## 6 Cards

- Markup: `a.card` with `span.d` (small label), `span.t` (title) and `span.s` (one or two lines).
- The cue at the bottom comes from the stylesheet: `download` on the link gives "Download", the class `card-go` gives "Open" and a soft background, and a card inside `.note-list` gives "Read". Do not write the cue in the markup.
- Use `cards cards-3` when a group may hold fewer than three cards, so every card keeps the same width.
- The tools block (Try in the browser, Start, Measure, Run) is the same markup on the book page and at the end of the guide. A new or changed tool is updated in both places.

## 7 Navigation

- Header and footer are identical on every page, including the 404 page. Below 820px the menu folds into a Menu button.
- Pages under the book carry a breadcrumb line (`p.crumb`) above the eyebrow, in this order and without the page itself: The Agent Doctrine · Visual guide · Tools · Adaptation guide.
- Long pages may have a sticky sub-navigation (`nav.g-nav`). It marks the current section with `aria-current="true"`, shown as a blue underline. On phones it scrolls sideways and fades out on the right.
- Anchors scroll smoothly and stop with room above the heading. Pages with a sticky sub-navigation use a larger offset.
- "Contact" in the menu points to the contact section on the front page.

## 8 Width and touch

- No page scrolls sideways at any width. Check at 360, 768 and 1280.
- Breakpoints in use: 600 (phone spacing), 820 (menu and sub-navigation), 960 (three cards in a row), 1011 (the three book boxes stack below this, so they never split two and one).
- New buttons, links in menus and other tap targets are at least 44px high on a phone.

## 9 Content that updates itself

- The notes list releases each article at its set time. The front page reads the notes page and shows the three newest, so a new article needs no change to the front page.

## 10 Privacy

- Nothing a reader types or ticks is stored or sent. Say so on every page that takes input.
- Any new measurement is described on the privacy page and the opt-out page in the same change.

## 11 Before publishing

1. Compare before and after at phone and desktop width for every page type that the change touches.
2. Check all pages for sideways scroll at 360, 768 and 1280, and for broken internal links.
3. Open the menu on a phone width by touch and by keyboard.
4. Print the plan from the adaptation guide and confirm that it is still one page.
5. Raise the stylesheet version if a stylesheet or script changed.
6. Look at the result in Safari and on a phone. The automated checks run in Chrome's engine only.
