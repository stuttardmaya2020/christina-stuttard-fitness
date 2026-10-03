# Christina Stuttard Fitness

The website for Christina Stuttard, personal trainer. One page, plain HTML, CSS and JavaScript, with no build step.

## Run it locally

Open the folder in VS Code and use the **Live Server** extension (right-click `index.html` > Open with Live Server), or run:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Files

- `index.html`: the page content
- `styles.css`: all styling; colours and type sizes are tokens at the top in `:root`
- `main.js`: class times by time zone, the video player, the quotes slider and the email copy button
- `images/`: photos (Moira Lynch Photography) and the CSF logo
- `docs/`: moodboard and screenshots for the case study

## Things to change most often

- **Class times**: `startsET` at the top of `main.js` (US Eastern times). The UK and Spain times, and the EST/GMT/CET labels, update automatically, including when the clocks change.
- **Prices**: the `.price` block in `index.html`.
