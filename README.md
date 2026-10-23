# LiquidJournal Web

Installable web app for Mac and phone: **https://thatelyar.github.io/liquidjournal-web/**

- **Mac:** open the link in Safari, then choose **File → Add to Dock** (macOS Sonoma or newer).
- **iPhone:** Safari → Share → Add to Home Screen → enable Open as Web App when shown → Add.
- **Android:** Chrome menu → Install app / Add to Home screen.

This public repository contains only the web frontend and public demo assets. The original desktop project remains private. The browser stores each person's journal locally; Mac and phone do not sync automatically. New workspaces start empty; the one-time migration removes bundled sample records while retaining records with user-created IDs. A local recovery snapshot is kept before migration. Original cloud authentication, broker sync, live AI and payments are not connected.

Workspace backup/import: https://thatelyar.github.io/liquidjournal-web/#/demo/local-tools . Export from the native app's Workspace backup / import menu to transfer trades and notes here. Custom Share background media stays in each device's own media library. Keep exports for records you want to preserve before clearing browser storage or uninstalling the app.

The offline app shell is cached after a successful online visit. Images and media are cached as used when a complete response is available; unvisited media needs a connection. Functional/browser tests were skipped at the owner's request; this release is prepared for installation, without a claim that every feature has been tested.

Owner-authorized personal copy. The repository does not grant a redistribution license for third-party assets.
