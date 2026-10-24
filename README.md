# Eli’s christening

React 18 / Vite / Node 22+ (the current Firebase Admin SDK requires Node 22), Firebase Auth, Firestore, optional Storage, three.js, React Three Fiber, Drei, React Router, and Framer Motion. All bundled artwork is original SVG or procedural geometry. No purchased assets or services are needed to run the demo.

## Run locally

```sh
npm install
cp .env.example .env
npm run dev
npm run build
```

On PowerShell use `Copy-Item .env.example .env`. Without Firebase config, this is an explicitly labeled demo: all sections render but RSVP and wishes are not saved. The existing `dist` has been replaced by this project's build. Sample date, venues, family names, illustrations, and portraits must be replaced before inviting guests. Edit `src/data.js` for demo defaults. All dates use the event's explicit UTC offset, default +08:00. The sample date is February 14, 2027.

## Firebase setup

1. Create a Firebase project and register a Web app. Copy its config into matching `VITE_FIREBASE_*` variables in `.env`. Client config is public by design; authorization comes from security rules. Never put service account keys in Vite env variables.
2. Create Firestore in production mode. Enable Authentication → Email/password. Create parent accounts manually in the Firebase console. There is no public registration UI. Add the deployment hostname to authorized domains.
3. Install the free Firebase CLI: `npm install -g firebase-tools`. Run `firebase login`, then `firebase use --add` to select your project.
4. Deploy the rules before opening submissions: `firebase deploy --only firestore:rules`.
5. Set up Application Default Credentials with `gcloud auth application-default login` (free Google Cloud CLI), or set `GOOGLE_APPLICATION_CREDENTIALS` to a securely stored admin service-account file outside this repository. Set `GOOGLE_CLOUD_PROJECT` in `.env`.
6. Run `npm run seed`. It creates sample `event/main`, `godparents`, `schedule`, and `gallery` documents, preserving existing documents. Gallery samples refer to the bundled SVGs. Then grant each parent access: `node --env-file=.env scripts/set-admin.js parent@example.com`.
7. Sign out and back in at `/admin` after granting the claim. Both the UI and Firebase rules require the `admin: true` custom claim. Dashboard editors accept JSON matching the seed schema; add an optional `characterConfig` object to a godparent (skin, hair, hairStyle, outfit, accessory). Supported hairStyle values: short, long. Use a single `event/main` document.

Collections: event, godparents, schedule, gallery, rsvps, wishes. RSVPs are private, create-only for guests; wishes are public and create-only for guests. Rules enforce fields, types, lengths, timestamps, and guest limits. Parents can edit/delete wishes and manage content. Public anonymous posting can still attract spam; use Firebase App Check if necessary and monitor your quotas. No email confirmation or paid Cloud Functions is used.

## Important: Spark and Storage

Firebase Cloud Storage now requires Blaze billing, including existing buckets from February 3, 2026. This means the requested combination of **Spark-only + Firebase Storage uploads is no longer available**. See [Firebase's official Storage notice](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024).

To stay strictly on Spark without a billing account, keep compressed family images in `public/photos`, rebuild/redeploy, and enter their `/photos/example.webp` URLs through the gallery editor. Firestore, Auth, and Hosting can operate within their Spark quotas. The optional upload implementation compresses photos to WebP at max 1600 px before writing Storage; enable it only if you independently choose Blaze and review applicable quotas/costs. This project does not enable billing. For Storage use, deploy `firebase deploy --only storage` after provisioning a bucket, and set VITE_FIREBASE_STORAGE_BUCKET. Only parent admins can upload; reads are public.

## Deploy to Firebase Hosting

```sh
npm run build
firebase deploy --only hosting,firestore:rules
```

After optional Storage provisioning and rules deployment you can use `firebase deploy` for all configured resources. Spark users should keep using the targeted command above; deploying Storage on Spark will fail. Firebase Hosting rewrites `/admin` to the SPA. Rebuild after changing Vite env variables. Configure a budget if you choose billing; budget alerts do not cap charges.

## Characters, artwork, and audio

`src/three/characterConfig.js` controls procedural skin, hair, outfit, hair style, and accessories. Three toys bob, wave on hover/tap, and show a small burst on tap. Godparent taps open their Firestore message. Canvas is lazy-loaded with a loading state and a static SVG fallback on render errors / no WebGL. OrbitControls allows limited horizontal rotation. Native card buttons provide keyboard access to the same profiles. Reduced-motion users get static toys and no scroll animation.

Place optional models at `public/models/godfather.glb`, `godmother.glb`, or `baby.glb`; missing models use toys. A godparent's `modelPath` overrides the default URL. Use trusted, same-origin model paths. Models should face +Z, feet y=0, approximately 2 units high. Included animation clips play automatically. Invalid GLB loading errors fall back to the procedural character. Use Blender (free) for export; compress with gltf-transform or Draco, targeting under 2 MB each. The default loader supports standard GLB and Drei's default Draco support; test custom compression before sharing.

Optional sources (check the individual asset's license and add exact author/source/license to footer credits): [Quaternius](https://quaternius.com/) and [Kenney](https://kenney.nl/assets) have CC0 packs; [Poly Pizza](https://poly.pizza/) has CC0/CC-BY assets; [Sketchfab](https://sketchfab.com/) filter Downloadable + Creative Commons; [Mixamo](https://www.mixamo.com/) free account and applicable Adobe terms; [Blender](https://www.blender.org/) for editing; [Ready Player Me](https://readyplayer.me/) check current terms before use. Free access does not automatically mean unrestricted redistribution. No third-party model is bundled.

Replace `public/memory-*.svg` and `public/portrait-*.svg` with family artwork/photos. These are clearly illustrated placeholders. `public/family.svg` is the static scene fallback. No official Cocomelon logo or character is included. Add a licensed `public/music/lullaby.mp3` if desired; playback is off by default, with visible toggle and error feedback when absent. Credit it in the footer. Google Fonts Fredoka / Nunito are SIL OFL.

## Accessibility and verification

Mobile-first CSS, skip link, visible focus, semantic labels, native modal focus trapping/Escape, alt text, lazy images/map, reduced-motion support, and keyboard profile cards are included. The gallery opens a native-dialog lightbox. Forms use browser validation and Firestore validation; loading/error/success states are visible. Share uses Web Share with clipboard fallback. Open Graph tags are in index.html; replace OG image with an absolute URL to a real PNG/JPEG and add og:url for reliable messaging-app previews (SVG previews are inconsistently supported).

Run a mobile Lighthouse audit against your real deployed URL after connecting Firebase. A score above 85 is a target, not an achieved claim; 3D, fonts, and the map can affect device/network performance. No Firebase backend or security-rule emulator test can be claimed without configured credentials/emulators. Verify guest creation, forbidden RSVP reads, forbidden guest edits, parent-only writes, login/logout, image uploads if enabled, and CSV export before sharing.
