# How to Connect Your Domain (himanshugarg.in)

Your website is built and ready — it just needs your domain pointed at it.
This is a **one-time, 2-minute change** in your Hostinger account. No
password needs to be shared with anyone.

---

## Step 1 — Log in to Hostinger

1. Go to **hpanel.hostinger.com** and log in.
2. Click **Domains**, then select **himanshugarg.in**.
3. Go to **DNS / Nameservers**.

---

## Step 2 — Confirm the nameservers

At the top of the page, under **Nameservers**, you should see:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

If you see these already listed, click **Change Nameservers** and **Save /
Confirm** them — they may be shown but not yet applied. If instead you see
different nameservers, replace them with the two above and save.

This single change hands over DNS management to Vercel, which then
automatically handles everything needed to serve your website — no manual
records to add.

---

## Step 3 — Wait for it to take effect

- Nameserver changes typically apply within a few hours, but can take up to
  **24–48 hours** to fully propagate worldwide.
- Once it's done, **himanshugarg.in** and **www.himanshugarg.in** will both
  load your website automatically, with a secure padlock (https).
- You can ignore the "Manage DNS records" section further down the
  Hostinger page — once nameservers point to Vercel, that section no longer
  applies.

---

## Good to know

- You don't need to share your Hostinger password with anyone for this.
- If you ever add an email service on this domain in the future, that's
  managed through Vercel's DNS settings, not Hostinger's — let your
  developer know if you set one up.
- If anything on the Hostinger page looks different from what's described
  here (e.g. different button names), it's fine — the goal is simply
  setting the nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`.
