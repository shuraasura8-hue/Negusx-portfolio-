# negusX Portfolio – Premium Web Designer

A single‑page portfolio website for **negusX**, built with vanilla HTML, CSS, JS, GSAP, and a Vercel serverless email function.

## 🚀 Quick Local Preview
1. Clone or download this repository.
2. Open `index.html` directly in your browser **or** use a live server (e.g., VS Code Live Server) to avoid CORS issues when testing the form.
3. All animations and routing work offline. The contact form will store messages in `localStorage`; the email sending requires the Vercel API to be deployed.

## 📦 Deploy on Vercel via GitHub
1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import the repo.
3. Set the **Environment Variables** in your Vercel project settings:
   - `EMAIL_USER` = `shuraasura8@gmail.com`
   - `EMAIL_PASS` = your Gmail **App Password** (generate one in Google Account settings).
4. Deploy. That’s it – your site is live with the contact form fully functional.

## 🔐 Admin Panel
- Visit `#admin` (e.g., `https://yoursite.vercel.app/#admin`).
- Password: `negusx2026`.
- All submitted messages are displayed and can be deleted individually.

## 📁 Project Structure
