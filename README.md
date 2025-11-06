# Apollo STEM Academy

Apollo STEM Academy is a private online school offering AI-powered and teacher-guided tutoring for students in grades 1–12 in Math, Science, and Language Arts. This repository contains a modern, cinematic, single-page HTML template for a zero-to-low-cost MVP launch.

## Features

- **AI Tutoring Embed**: HuggingChat iframe for real-time AI Q&A.
- **Subjects Overview**: Math, Science, and Language Arts with practice links.
- **Limited Free Enrollment**: Highlighted promotional spots for founding students.
- **Volunteer Signup**: Google Form or Formspree integration to recruit volunteers.
- **Private Student Dashboard**: Client-side password protection for early access.
- **Responsive Design**: Tailwind CSS for modern and cinematic appearance.
- **Easy Hosting**: Deploy via GitHub Pages or any static site host.

## Setup

1. Clone or download the repository.
2. Replace placeholder URLs in `index.html`:
   - `ENROLL_FORM_URL` → Google Form for student enrollment.
   - `VOLUNTEER_FORM_URL` → Google Form or Formspree URL for volunteers.
3. Set `BETA_PASS` in the script section to your private access password.
4. Push to GitHub in a repository named `your-username.github.io` to host via GitHub Pages.

## Usage

- Students can access the site using the private code.
- Volunteers can fill out the signup form to help with tutoring, mentoring, or curriculum review.
- Admins can update the spots counter manually or integrate with Google Sheets or Firebase for live updates.

## Notes

- For production AI tutoring with OpenAI or Gemini, use a secure serverless proxy to keep API keys private.
- This is designed for a zero-to-low-cost MVP launch; enhancements like Firebase Auth, analytics, or advanced dashboards can be added later.

## License

This project is free to use and modify for educational purposes.
