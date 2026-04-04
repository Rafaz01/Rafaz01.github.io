---
layout:  /src/layouts/ProjectLayout.astro
title: 'Finance Manager'
pubDate: 2024-04-30
description: "A dynamic finance dashboard built with JavaScript, JSON, and AJAX. It fetches and displays financial data in real-time using public APIs."
languages: ["HTML", "css", "javascript"]
image:
  url: "/images/projects/financetacker01.png"
  alt: "Finance Dashboard Screenshot"
--- 

**Budget Tracker** is a personal finance dashboard built entirely with vanilla JavaScript — no frameworks, no libraries. It started as a college project and evolved into a fully redesigned app with a clean dark UI, live market data, and persistent storage.

## 🧩 Features

- **Expense & Income Tracking** — add transactions with name, amount, category, and date
- **Real-time Balance** — net balance, total income, and expenses update instantly
- **Category Breakdown** — visual progress bars showing spending by category
- **Filter Transactions** — view all, income only, or expense only
- **Persistent Data** — transactions saved to localStorage, survive page reloads
- **Live Stock Ticker** — real-time prices for BTC, ETH, MSFT, NVDA, AAPL, TSLA and more via TradingView
- **Market News Feed** — live financial news panel via TradingView
- **Light / Dark Mode** — theme toggle that updates the entire UI including widgets
- **Fully Responsive** — works on desktop, tablet, and mobile

## 💡 Technologies Used

- HTML5
- CSS3 (CSS Variables, Grid, Flexbox)
- JavaScript (ES6+)
- localStorage API
- TradingView Widgets API

## 🧠 What I Learned

Managing **state without a framework** — keeping the UI in sync with an array of transactions using pure JS. I also learned how to integrate and dynamically reload third-party widgets (TradingView) based on user preferences like theme changes.

## 🌐 Demo & Code

👉 [View Live Demo](https://rafaz01.github.io/Finance-Dashboard-1/)  
🐙 [View on GitHub](https://github.com/Rafaz01/Finance-Dashboard-1)