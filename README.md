# Cast Solutions – Casting Agency Application

Cast Solutions is a modern web application designed for casting agencies to manage auditions, submissions, and talent profiles efficiently. Built with React, Firebase, and Node.js, it provides a seamless experience for both agencies and talent.

---

## Features

- **User Authentication:**  
  Secure login and sign-up with Email/Password and Google (Gmail) using Firebase Authentication.

- **Audition List Management:**  
  Create, search, and manage multiple audition lists.

- **Talent Submissions:**  
  Submit detailed profiles with images and video uploads.

- **Favorites & Filtering:**  
  Mark favorite submissions and filter by gender or favorites.

- **Responsive UI:**  
  Modern, mobile-friendly design with dark mode and brand colors.

- **Admin Controls:**  
  Clear all submissions from a list, delete individual submissions, and manage user sessions.

---

## Tech Stack

- **Frontend:** React, React Router, CSS (custom, responsive)
- **Backend:** Node.js, Express (for file uploads)
- **Database & Auth:** Firebase Realtime Database, Firebase Authentication
- **Hosting:** Netlify (frontend), Render (backend)
- **Other:** Multer (file uploads), Slick Carousel (image slider)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cast-solutions-app.git
cd cast-solutions-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable **Authentication** (Email/Password and Google).
- Enable **Realtime Database**.
- Copy your Firebase config to `src/firebaseConfig.js`.

### 4. Environment Variables

Create a `.env.production` file in the root:

```
REACT_APP_API_URL=https://your-backend.onrender.com
```

Replace with your actual backend URL.

### 5. Start the Development Server

```bash
npm start
```

### 6. Start the Backend Server

```bash
node server.js
```

---

## Deployment

- **Frontend:** Deploy to Netlify. Set `REACT_APP_API_URL` in Netlify environment variables.
- **Backend:** Deploy to Render or another Node.js hosting provider.

---

## Folder Structure

```
src/
  components/
    CastHome.jsx
    CastForm.jsx
    Login.jsx
    ...
  firebaseConfig.js
  App.js
  ...
server.js
public/
uploads/
.env.production
```

---

## Customization

- Update branding in `public/index.html` and `src/components/assets/`.
- Adjust color scheme in `src/components/caststyle.css`.

---

## License

MIT License

---

## Support

For issues, please open an [issue on GitHub](https://github.com/yourusername/cast-solutions-app/issues) or contact the maintainer.

---
