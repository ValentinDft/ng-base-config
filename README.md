# @valentindft/ng-base-config

Config ESLint, Prettier, TypeScript et lint-staged partagées entre tous mes
projets Angular.

Publie en **privé** sur GitHub Packages.

## Contenu

- `eslint/` — factory de config ESLint flat config. Prend `{ prefix }` en
  paramètre pour le sélecteur de composants/directives.
- `prettier/` — config Prettier (avec parser `angular` pour le HTML).
- `tsconfig/base.json` — base TypeScript strict (`strict: true` + quelques
  regles supplementaires non bloquantes).
- `lint-staged/` — règles lint-staged utilisées par le hook Husky pre-commit.

## Faire evoluer une regle pour tous les projets existants

1. Modifie le fichier concerne ici.
2. Bump la version dans `package.json` (semver : patch pour un fix, minor
   pour une regle ajoutee, major pour un changement cassant).
3. ```
   git add -A && git commit -m "feat: nouvelle regle X"
   git tag v1.1.0
   git push && git push --tags
   ```
   → publication automatique.
4. Dans chaque projet existant : `npm update @valentindft/ng-base-config`
   (ou bump le numero de version a la main dans son `package.json` si tu
   veux controler precisement quand chaque projet adopte la nouvelle
   regle).

