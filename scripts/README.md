# Notebook Pipeline

These notebooks are ordered. Each one is a native Jupyter notebook that can also be rendered by Quarto.

1. `01_clean_donated_watch_data.ipynb` cleans mock YouTube watch-history donations.
2. `02_clean_donated_search_data.ipynb` cleans mock YouTube search-history donations.
3. `03_scrape_youtube_metadata.ipynb` documents the metadata scrape with `yt_dlp`. It is not executed when the public site is rendered.
4. `04_link_watch_metadata.ipynb` joins watch events to metadata and adds event-level indicators.
5. `05_estimate_watchtime.ipynb` estimates watch time from metadata duration and the next observed watch event.
6. `06_demonstrate_enriched_exposure_measures.ipynb` showcases the enriched table and creates demonstration figures.

The public repository includes a scrambled metadata fixture so notebooks 04, 05, and 06 can run without scraping YouTube. The public fake video IDs are intentionally not scrapeable.
