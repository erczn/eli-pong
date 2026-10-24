# Parent dashboard

Open `/admin`. With Firebase configured, only signed-in accounts with the `admin: true` custom claim can access the dashboard. Guest RSVP records remain protected by Firestore rules; no public route exposes them. After account verification, a separate passcode screen locks this browser’s dashboard.

## Passcode lock

On first use, choose and confirm a private code containing 6–12 digits. There is no default code, Vite environment passcode, or plaintext passcode stored in the project. The browser stores a randomly salted PBKDF2-SHA-256 verifier (210,000 iterations). Each browser and signed-in parent account has its own code. Unlock state stays in memory: refreshing the page or leaving and returning requires the code again. Use **Lock dashboard** to lock immediately; 10 minutes of inactivity also locks it and unmounts the private data views. Five incorrect attempts trigger a one-minute browser cooldown, retained across page refreshes.

This is a **browser convenience/privacy lock, not server-enforced authentication or a second authentication factor**. A person controlling browser storage or client code can bypass it or its cooldown. It must not be used to protect private online data by itself. Firebase Auth and admin-only Firestore rules remain the actual security boundary. No private record listeners mount before both the account check and browser lock succeed. Nothing in the browser passcode changes Firebase permissions.

In the live version, **Forgot passcode?** requires reauthentication with the parent’s Firebase account password before resetting this browser’s code. In the local demo, retain your chosen code; removing only the `eli-parent-passcode:demo` and `eli-parent-passcode:demo:attempts` browser-storage entries resets the lock without removing the separate `eli-invitation-demo:*` profile settings. Do not clear all site data unless you intend to discard local demo edits. HTTPS (or localhost) and secure browser storage are required.

## Demo and dashboard pages

Without Firebase configuration, `/admin` is a clearly labeled **local demo**. Edits are kept in this browser’s localStorage and appear immediately on the local invitation. They are not uploaded or shared. There are no real RSVP or wish records in this demo. Public submission forms continue to explain that Firebase must be connected; they never pretend a submission was saved.

- `/admin/godparents`: add, search, edit, or remove ninangs and ninongs using ordinary name, role, photo, message, and character-color fields.
- `/admin/messages`: read public wishes and private RSVP notes, filter by source, and remove wishes from the public wall.
- `/admin/rsvps`: search guests, count attending people, and export replies to CSV.
- `/admin/family`: edit the photo, message, and character colors for Dad, Eli, and Mom. Each family member has a clickable model and keyboard-accessible button on the invitation.
- `/admin/event`, `/admin/schedule`, `/admin/gallery`: edit event information, program entries, and photos using labeled fields.

Profiles use the existing `godparents` collection. Valid roles are `father`, `mother`, `baby`, `godfather`, and `godmother`. Older `Father` / `Mother` values are normalized when displayed. Keep exactly one father, one mother, and one baby profile. Sponsor cards display only godfather/godmother profiles; the three hero models display the family. Missing family records have placeholder defaults. Use the seed script for a new Firebase project; it preserves existing records. For an existing project, saving each family card in the dashboard creates/updates its corresponding record.

Photo fields now have **Choose from device**, a preview, and a camera option on supported phones. Save the form to apply the selected photo. Images are compressed to JPEG at 120 KiB or less and stored in the profile/gallery Firestore document, keeping the small-event workflow compatible with Spark. Original files are not backed up. In local demo mode the image stays in this browser and may exhaust its limited storage. Existing HTTPS URLs and `/photos/...` paths remain available as an alternative. See the README for the exact database setup, photo limits, and free-quota considerations. No paid images, models, HDRIs, fonts, or APIs have been added. The dashboard starts with a phone-first layout and menu; desktop screens receive the sidebar/table layout.

The stage uses fixed foot positions and gentle breathing through a tiny scale change; it does not bob whole bodies above the ground. Arms pivot around connected shoulder joints. The scene includes free procedural lighting and geometry with no downloaded texture, model, or environment-map dependencies. Optional GLB support remains available under the original licensing guidance.

Run `node --test scripts/profiles.test.js` for profile-role and demo-store checks. Production login and Firestore permissions require testing with your own Firebase project before guest use.
