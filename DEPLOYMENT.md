# 🚀 Hosting Efronix Intelligence on Vercel

Follow these steps to deploy your premium AI SaaS website to the web.

## Step 1: Prepare Your Project
1.  **Check Environment Variables**: Ensure your `VITE_API_KEY` is ready. You will need this for the Vercel dashboard.
2.  **Routing Check**: I have already added a `vercel.json` to your project to ensure all routes (like `/chat` and `/admin`) work correctly when hosted.

## Step 2: Push to GitHub/GitLab/Bitbucket (Recommended)
1.  Create a new repository on your preferred platform.
2.  Initialize git in your project folder (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Ready for deployment"
    ```
3.  Push your code to the remote repository.

## Step 3: Deploy on Vercel
1.  Go to [vercel.com](https://vercel.com) and sign in.
2.  Click **"Add New"** > **"Project"**.
3.  Import your repository.
4.  **Configure Project**:
    - **Framework Preset**: Vercel should automatically detect **Vite**.
    - **Root Directory**: `./`
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
5.  **Environment Variables**:
    - This is crucial! Under the "Environment Variables" section, add:
      - **KEY**: `VITE_API_KEY`
      - **VALUE**: `AIzaSyAXBP6fNCNVAhkYmw_Jn83r_GgqN_if_P4` (The key you provided)
6.  Click **"Deploy"**.

## Step 4: Verification
- Once finished, Vercel will provide you with a production URL (e.g., `efronix-intelligence.vercel.app`).
- Visit the URL and test the Chat and News features to ensure everything is working perfectly.

---
> [!TIP]
> If you make changes in the future and push them to your repository, Vercel will automatically redeploy the site for you!
