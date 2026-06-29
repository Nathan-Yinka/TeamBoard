# TeamBoard Deployment Guide

Follow these exact steps to push your local codebase onto the public internet for free!

---

## 1. Setup Free MongoDB (Database)
Unlike PostgreSQL, MongoDB is a "Schema-less" NoSQL database. **You do NOT need to run any migrations.** Mongoose handles this automatically—the very first time your backend tries to save a user or project, MongoDB will automatically create the collections for you on the fly!

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Click **Build a Database** and select the **FREE M0** shared cluster.
3. When it asks how you want to authenticate your connection, create a Database User (give it a username and password you will remember).
4. For Network Access, allow access from anywhere (`0.0.0.0/0`) so Render can connect to it.
5. Click **Connect** -> **Drivers** -> **Node.js** and copy your Connection String. It will look like this:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/teamboard?retryWrites=true&w=majority`

---

## 2. Deploy Backend to Render

You already have a `render.yaml` file properly configured in your repository, which makes this incredibly easy!

1. Push your entire codebase to a repository on **GitHub**.
2. Go to [Render](https://dashboard.render.com/) and create a free account.
3. Click **New** -> **Blueprint**.
4. Connect your GitHub account and select your `heunets` repository.
5. Render will automatically read your `render.yaml` file and set up a Web Service named `teamboard-api`.
6. During setup (or in the Environment tab after), Render will ask you to fill in the missing environment variables:
   - `MONGODB_URI`: Paste the string you got from MongoDB Atlas (replace `<password>` with your real password).
   - `JWT_SECRET`: Type a random, long string of letters and numbers (e.g., `super-secret-key-12345`).
   - `FRONTEND_ORIGIN`: For now, leave it blank or put `*`. Once we deploy Vercel in the next step, you will update this to your Vercel URL!
7. Click **Apply** and Render will use your Dockerfile to build and deploy the backend! Copy the URL it gives you (e.g., `https://teamboard-api.onrender.com`).

---

## 3. Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/) and sign up with your GitHub account.
2. Click **Add New Project** and select your `heunets` repository.
3. **CRITICAL STEP**: Before clicking deploy, you need to configure the build settings because this is a monorepo workspace!
   - **Framework Preset**: Select `Vite`.
   - **Root Directory**: Click "Edit" and select the `frontend` folder.
   - **Build Command**: Turn on the override switch and paste this exactly: `cd .. && npm run build -w @teamboard/shared && cd frontend && npm run build`
   - **Environment Variables**: Add a new variable named `VITE_API_URL` and paste your Render backend URL (e.g., `https://teamboard-api.onrender.com`). Do *not* put a slash at the end.
4. Click **Deploy**. Vercel will now build the shared types first, and then build your React app seamlessly!

## 4. Final Polish
Now that Vercel gave you a live frontend URL (e.g., `https://teamboard-frontend.vercel.app`):
1. Go back to **Render**.
2. Go to your `teamboard-api` service -> **Environment**.
3. Update the `FRONTEND_ORIGIN` variable to match your Vercel URL exactly.
4. This ensures that CORS blocks any hackers trying to access your API from other websites, and only allows your Vercel frontend to talk to it!
