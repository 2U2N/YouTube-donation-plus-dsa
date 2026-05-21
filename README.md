# YouTube Donation + DSA Metadata Method

This repository is an instructional companion for a methods article on enriching donated YouTube watch histories with platform metadata.

It demonstrates a reproducible workflow using scrambled mock Google Takeout-style data. No real participant data are included, and the public video IDs, titles, channel names, search queries, tags, and metadata fixture values are synthetic.

## What The Workflow Shows

- how donated YouTube watch histories can be cleaned into event-level tables;
- how donated search histories and subscriptions can be standardized;
- how video-level metadata can be collected with `yt_dlp` when authorized;
- how watch events can be enriched with metadata, search-associated flags, subscribed-channel flags, Shorts/Longs labels, day/night labels, and problematic/unavailable-view indicators;
- how the enriched table can be summarized and visualized for article-facing demonstrations.

## Start Here

Open the rendered project site, or run the notebooks in order:

1. `scripts/01_clean_donated_watch_data.ipynb`
2. `scripts/02_clean_donated_search_data.ipynb`
3. `scripts/03_scrape_youtube_metadata.ipynb`
4. `scripts/04_link_watch_metadata.ipynb`
5. `scripts/05_demonstrate_enriched_exposure_measures.ipynb`

Notebook 05 is the quickest overview of what the enriched data makes visible.

## Important Notes

- The mock donor names are fictional.
- Notebook 03 requires authorization to scrape YouTube metadata and a registered identifying User-Agent token.
- For public, offline reproduction, notebook 04 can use the scrambled metadata fixture in `data/demo_metadata/meta_data_public.csv`.
- The public video IDs are intentionally fake and cannot be scraped from YouTube.
- The measures in this repository are indicators. They should be interpreted as aggregate exposure signals, not definitive explanations of why a specific video was watched.

## Local Reproduction

Install the requirements, then render the project:

```bash
pip install -r requirements.txt
quarto render
```
