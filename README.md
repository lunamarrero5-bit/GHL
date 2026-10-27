# FitCheck

FitCheck is designed for people who own plenty of clothes but repeatedly find themselves wearing the same few outfits. The project aims to help people make better use of their existing wardrobe and get dressed for different occasions with less time and effort.

## The Problem

Having a full closet does not always make choosing an outfit easy. Remembering what you own, deciding what goes together, and finding something suitable for an occasion can make getting dressed feel overwhelming. As a result, people may return to familiar outfits while feeling like they have nothing to wear.

## Our Primary User: Khushi

Khushi is a young working professional who wants to get dressed for different occasions without spending too much time:

- Remembering which clothes she owns.
- Deciding which pieces go together.
- Searching for an outfit while feeling like she has nothing to wear.

She wants a simpler way to use her wardrobe and feel confident in her outfit choices.

## Project Goals

- Help users keep track of the clothes they already own.
- Make it easier to put together outfits for different occasions.
- Reduce the time and effort spent deciding what to wear.
- Encourage users to explore more combinations within their existing wardrobe.

## Project Status

FitCheck is a working front-end coding class project built with HTML, CSS, and JavaScript.

## Run the App

Open `index.html` in a modern browser. No installation, build step, or account is required. An internet connection is only needed for the optional Google Fonts; the app uses fallback fonts offline.

For a consistent local development address, use VS Code's Live Server extension or run `python3 -m http.server 8000` from the project folder and open `http://localhost:8000`.

## Using FitCheck

1. Explore the eight illustrated sample clothing items in **My closet**.
2. Choose **Add a piece** to enter a name, category, color, and occasion. Optionally upload a JPG, PNG, or WebP photo (up to 15 MB); photos are resized before saving.
3. Filter the closet by clothing category and occasion.
4. Open **Outfit builder**, select pieces, enter an outfit name and occasion, and save.
5. Open **Saved outfits** to see combinations, use one as the starting point for another outfit, or delete it.

Removing a clothing item also removes it from saved outfits. An outfit with no remaining pieces is deleted. The app asks before removing clothes or outfits.

## Files

- `index.html`: page structure, forms, and navigation.
- `style.css`: responsive layout, colors, and typography.
- `script.js`: sample wardrobe, filters, photo resizing, outfit creation, and browser storage.

## Storage and Limitations

Clothes and outfits are saved in this browser's `localStorage`. They do not sync across devices or browsers. Clearing site data removes them. Private browsing, blocked storage, or exceeding the browser's storage limit can prevent saving; the app displays an error when saving fails. Direct file URLs may handle storage differently across browsers, so a local server is recommended for regular use.

The sample wardrobe uses original SVG illustrations. Uploaded photos stay in the browser. The app currently supports adding and removing pieces; editing existing pieces and automatic outfit recommendations are possible future additions.
