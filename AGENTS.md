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

- All app pages live under `src/routes/_authenticated/` (gate redirects to `/auth`); module visibility comes from `user_roles` + `permissoes_modulo` via `useSessao`/`podeVer`, and RLS must use `pode_acessar(modulo, editar)` for every new module table — UI checks alone are not security.
- First signed-up user becomes `admin` via the `handle_new_user` trigger; others start with no role until an admin assigns one on `/usuarios`.
