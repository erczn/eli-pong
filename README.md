# Eli’s christening invitation

A mobile-first React 18 / Vite app with original procedural chibi characters, an invitation, guest RSVP and wishes, and a parent dashboard. Requires **Node.js 22+**. Uses Firebase Authentication, Cloud Firestore, and Firebase Hosting within their Spark quotas. All bundled illustrations and 3D decorations are original; dependencies and Google Fonts use their open-source licenses.

## 1. Run the preview

```sh
npm install
```

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
npm run dev -- --port 5174
```

On macOS/Linux use `cp .env.example .env`. Open the URL printed by Vite. Without Firebase values, the app runs a labeled local demo. At `/admin`, create your own 6–12 digit browser passcode. Profile edits and selected photos stay in that browser; guest submissions are disabled. Demo edits do not sync to other devices. Browser storage is limited, so keep a backup of your original photos. Connecting Firebase uses the shared database instead of importing local demo edits automatically.

## 2. Create the Firebase project and database

1. Open [Firebase Console](https://console.firebase.google.com/) and create a project. Google Analytics is optional. Keep the **Spark** plan; no billing account is needed for this implementation.
2. In **Project settings → General**, add a **Web app**. Copy its configuration values into `.env` as shown below. You do not need a separate frontend API server.
3. Open **Build → Firestore Database → Create database**. Create the **default `(default)` database**, choose production mode, and choose a location appropriate for your guests. The application uses native Cloud Firestore, not Realtime Database or a named secondary database.
4. Open **Build → Authentication → Get started → Sign-in method** and enable **Email/Password**. Do not enable anonymous public parent registration.
5. In **Authentication → Users → Add user**, create an account for each parent with a strong password. In Authentication settings, add `localhost` for local testing and your deployed hostname to authorized domains if they are not already present.

Example `.env` (replace the placeholders with your project's values):

```dotenv
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-web-app-id
GOOGLE_CLOUD_PROJECT=your-project
```

`VITE_FIREBASE_STORAGE_BUCKET` is optional and unused by the new device-photo flow. Firebase Web config identifies the project and is public in the built app. Access protection comes from Auth and Firestore rules. Never put an admin service-account key in a `VITE_*` variable or commit it to Git. Restart Vite after editing `.env`; rebuild before deployment.

## 3. Select your project and deploy database rules/indexes

Install the Firebase CLI once:

```sh
npm install -g firebase-tools
firebase login
firebase use --add
```

Run these commands from the project folder. Select the same project ID used in `.env`, then deploy:

```sh
firebase deploy --only firestore
```

This deploys `firestore.rules` and `firestore.indexes.json`. Do not leave the database in test mode or replace the rules with public write access.

The included rules allow public reads of event content, public sponsor/family profiles, schedule, gallery, and wishes. Guests can only create valid RSVPs and wishes with bounded fields and server timestamps. **Guests cannot read RSVPs or edit/delete content.** Content management and private RSVP access require a Firebase account with the `admin: true` custom claim. The photo fields are excluded from single-field indexing because they may hold compressed image data; no composite indexes are required by the current queries.

## 4. Populate the collections and grant parent access

The seed script and admin-claim script run on your computer, never in the browser. Choose one credential method:

- **Google Cloud CLI:** run `gcloud auth application-default login` using an account with permission to manage this Firebase project.
- **Service account:** in Firebase **Project settings → Service accounts**, generate a private key and store the JSON **outside this repository**. In PowerShell set its location for the current terminal:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\secure\eli-firebase-admin.json'
```

On macOS/Linux use `export GOOGLE_APPLICATION_CREDENTIALS=/secure/eli-firebase-admin.json`. This key grants privileged access; keep it private. Set `GOOGLE_CLOUD_PROJECT` in `.env` to the actual project ID.

Create the sample documents:

```sh
npm run seed
```

The script preserves existing documents. It creates the following collections/documents automatically; you do not need to create them manually in the console:

| Collection | Example document | Main fields | Access |
| --- | --- | --- | --- |
| `event` | `main` | `babyName`, `date` (YYYY-MM-DD), `time` (HH:mm), `timezone`, `venue`, `address`, `mapQuery`, `mapLink`, `reception`, `receptionAddress`, `dressCode`, `parentsNames`, `welcomeMessage`, `giftInfo` | Public read; parent writes |
| `godparents` | `richmond`, `mae`, `eli`, sponsor IDs | `role`, `name`, `photoUrl`, `message`, optional `characterConfig`, `modelPath` | Public read; parent writes |
| `schedule` | `ceremony`, `photos`, etc. | `time`, `title`, `description`, numeric `order` | Public read; parent writes |
| `gallery` | Generated IDs / seed IDs | `imageUrl`, `caption`, numeric `order` | Public read; parent writes |
| `rsvps` | Auto-generated on guest submit | `name`, integer `guestCount` (1–20), boolean `attending`, `dietaryNotes`, `message`, timestamp `createdAt` | Guest create only; parent read/manage |
| `wishes` | Auto-generated on guest submit | `name`, `message`, timestamp `createdAt` | Public read and validated guest create; parent moderation |

`rsvps` and `wishes` may be absent until the first real guest submission; this is normal. `createdAt` is generated using Firestore `serverTimestamp()`. Keep one `event/main` document. Profile roles are `father`, `mother`, `baby`, `godfather` (ninong), and `godmother` (ninang); keep one record for each family role and as many sponsors as needed. `characterConfig` contains `skin`, `hair`, `hairStyle` (`short`/`long`), `outfit`, and `accessory`.

Grant each parent account its admin claim after creating it in Authentication:

```sh
node --env-file=.env scripts/set-admin.js parent@example.com
```

Replace the email and repeat for the other parent. Sign out and sign back in to refresh the claim. Open `/admin`, log in with the Firebase email/password, and create this browser’s additional passcode. A passcode alone does not grant database permissions. Detailed passcode limitations and recovery steps are in [docs/parent-dashboard.md](docs/parent-dashboard.md).

## 5. Add photos directly from a phone or computer

1. Open the parent dashboard and unlock it.
2. For a profile, choose **Parents & Eli** or **Ninangs & ninongs → Edit profile**. For album pictures, choose **Photo gallery → Add photo**.
3. Press **Choose from device** to open your phone’s photo library or computer file picker. On supported phones, **Take a photo** opens the camera.
4. Check the preview, enter the name/message or caption, then press **Save profile** or **Save photo**. Choosing a file alone does not save it.

The browser accepts JPG, PNG, WebP, AVIF, and phone HEIC/HEIF files **when the browser can decode them**. If a HEIC image is unsupported, export it as JPG/PNG first. Source files are limited to 15 MB and 48 megapixels. Photos are oriented by the browser decoder, resized to at most 1200 pixels on the long edge, flattened onto a cream background, and re-encoded as JPEG at **120 KiB or less**. Re-encoding removes source metadata. The original file on your device is not changed or backed up.

To keep this flow usable on Spark, the compressed image is stored as a bounded data URL in `godparents.photoUrl` or `gallery.imageUrl`, in the same Firestore document as its details. Saving is one document write; there is no separate upload bucket, server, or paid image service. Parents must be authenticated admins to save online. Removing or replacing a photo updates that document; deleting a gallery entry removes its stored photo too. Existing HTTPS URLs and `/photos/...` paths still work through **Or use an existing image link**.

**This is intended for a small event album, not full-resolution storage.** Keep the album small (for example, 20–30 selected images) and monitor Firestore reads, storage, and network quotas. Gallery/profile listeners download those compressed fields with their documents. Firestore has a 1 MiB document limit; the photo cap leaves ample room for the text fields. Browser-only demo storage is much smaller and can fill up; the form reports that error without pretending the save succeeded. Original photos should be backed up separately.

Firebase Cloud Storage requires Blaze billing, so this feature deliberately does not use it. The repository's legacy `storage.rules` is inactive; `firebase.json` deploys only Firestore and Hosting. See [Firebase Storage requirements](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), [Firestore limits](https://firebase.google.com/docs/firestore/quotas), and [free quotas](https://firebase.google.com/docs/firestore/pricing). Spark quotas can be exhausted; free does not mean unlimited.

## 6. Deploy and test the real database

```sh
npm test
npm run build
firebase deploy --only firestore,hosting
```

`firebase deploy` also works for the resources currently configured. Hosting serves `dist` and rewrites `/admin/...` to the React app. On another laptop, clone the repository, install Node 22+, run `npm install`, recreate `.env`, then run `npm run dev`. Never commit `.env` or the admin JSON key.

Before sending invitations, check:

- As a guest, load the church, program, family cards, and photos; submit an RSVP and a wish.
- Verify the RSVP appears only after parent login; an unauthenticated attempt to read `rsvps` must be denied.
- Confirm a normal non-admin account cannot write public content or read RSVP records.
- Add a sponsor and device photo from the dashboard; confirm they appear on another device connected to the same project.
- Replace/remove a photo, moderate a wish, export RSVPs, and verify the passcode lock.
- In Firebase Console, inspect the created documents and monitor Firestore Usage. A passcode does not replace the Firebase account check or rules.

Local build/unit checks do not prove deployed rules or a real database works. Production Firebase integration and device-camera behavior must be tested with your project and phones. The dashboard uses a phone-first layout with a menu, single-column forms, 44px+ controls, readable 16px inputs, photo previews, and RSVP cards; wider screens get the desktop sidebar/table.

## Characters, artwork, music, and credits

Original 3D parents and baby use `src/three/Chibi.jsx`, `Stage.jsx`, and `characterConfig.js`; no downloaded models, textures, HDRIs, or paid assets are needed. The family models open their cards; keyboard buttons provide the same access. Feet are anchored to the stage, shoulders connect to the body, and reduced-motion settings are respected. Canvas/images are lazy-loaded with a static SVG fallback for unsupported WebGL.

Optional GLB files can replace the procedural characters at `public/models/godfather.glb`, `godmother.glb`, and `baby.glb`, or via a profile's `modelPath`. Use trusted same-origin paths, face +Z, feet at y=0, approximately two units tall, and test animations/scale before sharing. Keep models under about 2 MB using free Blender or gltf-transform/Draco tools.

Optional free asset sources: [Quaternius](https://quaternius.com/), [Kenney](https://kenney.nl/assets), [Poly Pizza](https://poly.pizza/), [Sketchfab](https://sketchfab.com/) (Downloadable + Creative Commons), [Mixamo](https://www.mixamo.com/) (free Adobe account), [Blender](https://www.blender.org/), and [Ready Player Me](https://readyplayer.me/) (check current terms). Check each model's license and add required author/source/license credits in the footer. No third-party model is bundled. No official Cocomelon logo or character is included.

Fredoka and Nunito are SIL OFL fonts from Google Fonts. Optional licensed audio can be placed at `public/music/lullaby.mp3`; playback is off until a guest presses the music toggle. Add audio credits to the footer. Replace illustrated placeholders with your own family photos and replace the Open Graph image with an absolute PNG/JPEG URL for reliable message previews. Lighthouse mobile >85 remains a target, not a verified result.
