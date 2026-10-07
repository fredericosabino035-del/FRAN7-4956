# FRAN7
Approved monochrome redesign, supplied photos, Kz, WhatsApp checkout. Confirmed contacts. Add protected manager for prices/photos/etc.
- [x] Inspect references/assets, init managed app, auth schema
- [ ] Catalogue schema/seed/API/auth authorization
- [ ] Storefront, product comments, cart, policies, management
- [ ] Build/lint/browser testing, deliver
- [x] Catalogue database seeded, protected API (unauthenticated admin returns 401)
- [x] Storefront, cart persistence/quantity/WhatsApp link, public comment persistence, policies, manager UI
- [x] Build and lint passed. Desktop/mobile browser checked, no page errors or horizontal overflow; test comment removed.
- Google login and authorized management edits require owner's account; not end-to-end tested here.
- Requested edits completed: product 1 at 10 500 Kz, star/BREVEMENTE/Novembro release info editable in management; upcoming piece not purchasable until release label cleared. Removed only support benefit icon. Sticky header tested desktop/mobile. Build/lint passed.
- New index/registo HTML attachments inspected. Registration file stores plaintext passwords in localStorage; do not reuse authentication logic. Await user's intent for these new attachments.
## Client accounts and visual revision
Approved: adapt visual to newly supplied HTML and add secure client registration/login/profile. Preserve previous edits. Public store; /conta tabs -> /perfil; user-scoped profiles, optional phone/birthday/marketing. No password import from unsafe source HTML.
