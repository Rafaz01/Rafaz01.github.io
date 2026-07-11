---
layout: /src/layouts/ProjectLayout.astro
title: 'Delicias & Sabores'
pubDate: 2026-07-11
description: "Custom sales landing page built with HTML, CSS, and JavaScript for a pastry masterclass, with Stripe checkout and an automated MailerLite email sent to every buyer after purchase."
languages: ["HTML", "css", "javascript"]
image:
  url: "/images/projects/deliciasysabores.png"
  alt: "Delicias & Sabores Landing Page Screenshot"
---

**Delicias & Sabores** is a pastry-focused sales page built to sell a paid video masterclass to a creator's social media audience across Instagram, TikTok, and Facebook. The goal was a fast, single-page experience that guides visitors from the hook straight through to checkout.

## 🧩 What I Did

- **Conversion-focused layout** — structured the page as a single scrolling flow: hero, social proof, offer, curriculum, bonus, bio, email capture, and FAQ
- **Hero section** — built an image carousel showcasing the featured recipe with a clear, benefit-driven headline
- **Social proof block** — displayed follower counts broken down by platform to build trust immediately
- **Offer/pricing section** — laid out the masterclass details (price, inclusions, video specs) in an easy-to-scan recipe-card format
- **Curriculum breakdown** — numbered, step-by-step outline of what's covered in the class
- **Email capture** — lightweight signup form with clear value propositions for list building
- **FAQ accordion** — expandable Q&A section addressing common purchase objections
- **Responsive design** — fully optimized layout for mobile, where most of the audience arrives from social links
- **Stripe checkout integration** — connected Stripe so buyers can purchase the masterclass directly from the page
- **Automated post-purchase email** — set up a webhook flow so every successful Stripe payment automatically triggers a delivery email through MailerLite, with no manual follow-up needed

## 💡 Technologies Used

- HTML5
- CSS3
- JavaScript
- Stripe (checkout & payments)
- MailerLite (automated email delivery)

## 🧠 What I Learned

This project reinforced how much **page structure and copy hierarchy** matter for a sales landing page compared to a typical business site. I focused on keeping the path from hook to CTA as short as possible, and learned to build an accordion FAQ and image carousel from scratch without relying on a UI framework. Connecting **Stripe to MailerLite** taught me how to wire up a real payment-to-delivery pipeline handling the webhook trigger so paying customers get their course automatically, without any manual work on the client's end.

## 🌐 Live Site

👉 [Visit Delicias & Sabores](https://deliciasysabores.com)
