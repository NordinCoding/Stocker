# STOCKER
A real-time stock market tracking and graphing web application using a RESTful backend API, a websocket connection for real-time market data and a custom frontend

[LIVE DEMO HERE](https://nordinsprojects.site/stocker/)

### TECH STACK
- Django(REST Framework)  
- Django Channels  
- PostgreSQL  
- Celery/Redis  
- React/Vite  
- tailwindCSS  
- Docker  
- nginx  

### Browsable API
**INDEX**  
https://nordinsprojects.site/stocker-api/

**EOD STOCKS**  
https://nordinsprojects.site/stocker-api/eod_stocks/ (loads slow because its alot of entries)

**EOD SPECIFIC SYMBOL**  
https://nordinsprojects.site/stocker-api/eod_stocks/?symbol=AAPL

**INTRADAY STOCKS**  
https://nordinsprojects.site/stocker-api/intraday_stocks/

**INTRADAY LATEST STOCKS**  
https://nordinsprojects.site/stocker-api/intraday_stocks/?latest=true

**NEWS ARTICLES**  
https://nordinsprojects.site/stocker-api/news_articles/ (loads slow because its alot of entries)

**LATEST NEWS ARTICLES**  
https://nordinsprojects.site/stocker-api/news_articles/?latest=true
