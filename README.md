# Stocker

Real-time market tracking web app with live WebSocket updates and historical data visualization.

## Tech Stack

Django, Django REST Framework, Finnhub WebSocket API, PostgreSQL, Celery/Redis, React, TailwindCSS, Chart.js, Docker, nginx

## Live Demo

[https://nordinsprojects.site/stocker/](https://nordinsprojects.site/stocker/)

## Browsable API

[https://nordinsprojects.site/stocker-api/](https://nordinsprojects.site/stocker-api/)

to fetch the most recent entries for each symbol use: /stocker-api/intraday_stocks/?latest=true

to fetch all EOD entries for one specific symbol use: /stocker-api/eod_stocks/?symbol={symbol}

## Features

- Real-time stock price updates via WebSocket
- Historical data visualization (intraday & EOD)
- Top 50 US stocks by market cap
- Scheduled API requests with Celery/Redis
