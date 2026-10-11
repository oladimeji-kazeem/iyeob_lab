<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep the modular monolith divided into catalog, access, and workspace modules so reusable learning content stays independent of institution-specific semester offerings.
- Model course templates separately from semester offerings; enrollment and per-semester pricing belong to offerings, not templates.
- This is a mock-only frontend: role switching and mutations are demonstrative and reset on refresh; do not treat client role state as an authentication or authorization boundary.
- Server operations must derive principals from verified sessions and call the server-only permission guard before reading or mutating institution-scoped data; no live protected endpoints exist in the mock build.
- Keep shared demo state in the workspace provider across routes, and expose every major workspace view through its own TanStack route.
