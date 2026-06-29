# How to Add a Testimonial

You can add new client testimonials yourself — no developer needed.
It's two steps: **upload the video to YouTube**, then **add a row to the sheet**.
New cards appear on the website within a minute or two.

---

## Step 1 — Upload the video to YouTube

1. Go to **youtube.com** and sign in with the **practice's channel** (not a personal one).
2. Click the **camera "＋" icon** (top right) → **Upload video**.
3. Choose the video file.
4. **Title:** keep it neutral, e.g. `Shivani — Healing Journey`
   (this title is visible to viewers, so avoid personal notes).
5. On the "Visibility" step, choose **Unlisted**
   *(not Private — Private videos won't play on the website).*
6. Click **Publish**, then **copy the video link** (the `Share` button gives a
   link like `https://youtu.be/AbC123dEfGh`).

---

## Step 2 — Add a row to the Google Sheet

Open the testimonials sheet and fill in **one row per person**:

| Column | What to put | Required? |
|--------|-------------|-----------|
| **name** | First name, e.g. `Shivani` | ✅ Yes |
| **age** | e.g. `50` | optional |
| **profession** | e.g. `LCHF Baker` | optional |
| **youtube_url** | the link you copied in Step 1 | optional* |
| **after_text** | a short "what changed" paragraph (optional) | optional |

\* Without a video link, the card shows as **"Video coming soon."** Add the link later and it goes live.

Then just **save**. That's it.

---

## Highlighting key words

To make important words stand out (**bold + gold**) in the "What Changed"
paragraph, wrap them in **double asterisks** in the `after_text` cell:

```
In just 3 months, Mansi healed persistent **acne and hives** after multiple
failed dermatologist treatments and achieved significant **fat loss** — without
any medications or serums.
```

→ "acne and hives" and "fat loss" appear bold and gold on the site.

---

## Good to know

- Changes show on the site in **1–2 minutes** (refresh the page if needed).
- **To remove a testimonial:** delete its row.
- **Don't rename the column headers** (`name, age, profession, youtube_url, after_text`) — the website matches them by name.
- Keep videos **Unlisted** and titles **neutral** — the title and channel name are visible in the player.
