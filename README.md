# @valentindft/ng-base-config

Config ESLint, Prettier, TypeScript, lint-staged et Stylelint mutualisée entre tous mes projets Angular. Publiée publiquement sur **npm** : [`@valentindft/ng-base-config`](https://www.npmjs.com/package/@valentindft/ng-base-config).

```bash
npm install -D @valentindft/ng-base-config
```

---

## Pourquoi ce package existe

Sans config partagée, chaque projet Angular accumule sa propre copie des mêmes règles ESLint, du même `prettier.config.js`, du même `tsconfig` strict. Mettre à jour une règle signifie ouvrir chaque repo. Ce package centralise tout ça : un seul endroit à modifier, tous les projets se mettent à jour via `npm update`.

---

## Architecture

Ce package est l'un des deux composants du toolkit perso :

```
angular-base-toolkit/
├── ng-base-config/     ← CE package — config partagée, publié sur npm
└── create-ng-app/      ← CLI npx — orchestre ng new + branchement de ce package
```

Chaque projet Angular consommateur installe `@valentindft/ng-base-config` comme dépendance de dev et y pointe directement depuis `eslint.config.mjs`, `package.json`, `tsconfig.json` et `stylelint.config.cjs` :

```
mongarage/                          nextframe/
├── eslint.config.mjs ──────────────────────────────────────┐
├── stylelint.config.cjs                                     │
├── lint-staged.config.cjs                                   │
├── package.json                                             │
│   └── prettier: "@valentindft/ng-base-config/prettier" ───├──► @valentindft/ng-base-config
└── tsconfig.json                                            │     ├── eslint/index.js
    └── extends: "…/tsconfig/base.json" ───────────────────┘     ├── prettier/index.js
                                                                   ├── tsconfig/base.json
                                                                   ├── lint-staged/index.js
                                                                   └── stylelint/index.js
```

---

## Contenu

### `eslint/index.js` — factory flat config ESLint

Exporte une fonction `buildConfig({ prefix })` qui retourne une flat config ESLint complète pour Angular. Nécessite que le projet ait un `tsconfig.json` valide (pour les règles type-aware).

**Extends :** `@eslint/js` · `typescript-eslint` (recommended + stylistic) · `angular-eslint` (tsRecommended + templateRecommended + templateAccessibility)

**Règles :**

| Règle | Niveau | Raison |
|---|---|---|
| `@angular-eslint/component-selector` | error | kebab-case avec le prefix du projet |
| `@angular-eslint/directive-selector` | error | camelCase avec le prefix du projet |
| `@angular-eslint/prefer-on-push-change-detection` | warn | cohérence avec l'archi signals/zoneless |
| `@typescript-eslint/no-unused-vars` | warn | ignore les vars préfixées `_` |
| `@typescript-eslint/no-explicit-any` | warn | décourage `any` sans l'interdire |
| `@typescript-eslint/explicit-function-return-type` | off | trop verbeux avec l'inférence TS |
| `@typescript-eslint/no-floating-promises` | error | empêche d'oublier un `await` |
| `@typescript-eslint/await-thenable` | error | empêche d'`await` une non-Promise |
| `@typescript-eslint/consistent-type-imports` | warn | force `import type { Foo }` pour les types |
| `eqeqeq` | error | interdit `==`, force `===` |
| `no-console` | warn | évite les `console.log` oubliés en prod |

**Ignores globaux :** `dist/**`, `.angular/**`, `coverage/**`

---

### `prettier/index.js` — config Prettier

```js
{
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  semi: true,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  overrides: [{ files: '*.html', options: { parser: 'angular' } }]
}
```

Le parser `angular` pour les `.html` est nécessaire pour que Prettier comprenne la syntaxe de template Angular (`@if`, `@for`, bindings, etc.).

---

### `tsconfig/base.json` — base TypeScript strict

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "experimentalDecorators": true
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

`exactOptionalPropertyTypes` distingue une propriété absente (`foo?: string`) d'une propriété présente mais `undefined` (`foo: string | undefined`). Particulièrement utile avec les DTOs Supabase.

Ce fichier est étendu via `tsconfig.json` du projet consommateur — les options spécifiques au projet (`target`, `module`, `outDir`, etc.) restent dans le tsconfig du projet.

---

### `stylelint/index.js` — config Stylelint SCSS

```js
{
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'selector-class-pattern': '^[a-z][a-z0-9-]*(__[a-z][a-z0-9-]*)?(--[a-z][a-z0-9-]*)?$',
    'no-descending-specificity': null,
    'scss/at-rule-no-unknown': true,
    'import-notation': 'string',
  }
}
```

- `selector-class-pattern` : enforce la convention **BEM** (`block__element--modifier`)
- `no-descending-specificity` : désactivé car trop bruyant avec l'encapsulation des composants Angular
- `import-notation: 'string'` : force `@use 'variables'` plutôt que `@use url('variables')`

---

### `lint-staged/index.js` — règles lint-staged pre-commit

```js
{
  '*.ts':          ['eslint --fix', 'prettier --write'],
  '*.html':        ['eslint --fix', 'prettier --write'],
  '*.{scss,css}':  ['stylelint --fix', 'prettier --write'],
  '*.{json,md}':   ['prettier --write'],
}
```

Déclenché automatiquement par Husky au `git commit`. Seuls les fichiers stagés sont traités.

---

## Installation (prérequis machine)

Aucun. Le package est public sur le registre npm par défaut — pas de `~/.npmrc` à configurer, pas de token, pas de `npm login`. Un simple `npm install` suffit, y compris en CI et sur Vercel/Netlify.

---

## Init — Branchement dans un projet Angular

> Si tu utilises `create-ng-app`, tout ce qui suit est fait automatiquement.

### 1. Installer le package et ses pairs

```bash
npm install -D @valentindft/ng-base-config \
  eslint @eslint/js typescript-eslint angular-eslint \
  prettier husky lint-staged \
  stylelint stylelint-config-standard-scss
```

### 2. ESLint — créer `eslint.config.mjs`

```js
import buildConfig from '@valentindft/ng-base-config/eslint';

export default buildConfig({ prefix: 'ngf' }); // adapte le prefix à ton projet
```

### 3. Prettier — `package.json`

```json
{
  "prettier": "@valentindft/ng-base-config/prettier"
}
```

### 4. lint-staged — `lint-staged.config.cjs`

```js
module.exports = require('@valentindft/ng-base-config/lint-staged');
```

### 5. Stylelint — `stylelint.config.cjs`

```js
module.exports = require('@valentindft/ng-base-config/stylelint');
```

### 6. TypeScript — `tsconfig.json`

Ajouter `ng-base-config` dans le tableau `extends` existant (ne pas remplacer le tsconfig Angular généré) :

```json
{
  "extends": ["./tsconfig.base.json", "@valentindft/ng-base-config/tsconfig/base.json"]
}
```

### 7. Husky — hooks git

```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

### 8. Vérifier que tout fonctionne

```bash
npm run lint      # zéro erreur ESLint
npm run format    # Prettier appliqué
npx stylelint "**/*.scss"
git commit --allow-empty -m "test: vérifie le hook pre-commit"
```

---

## Update — Passer sur une nouvelle version

Quand une nouvelle version de `ng-base-config` est publiée :

### Mise à jour patch ou minor (`^1.0.0`)

Sans changement cassant, `npm update` suffit :

```bash
npm update @valentindft/ng-base-config
```

Vérifie ensuite que le lint passe toujours :

```bash
npm run lint
```

### Mise à jour major (changement cassant)

Modifier manuellement la version dans `package.json` puis réinstaller :

```bash
npm install -D @valentindft/ng-base-config@^2.0.0
npm run lint   # identifier les nouvelles erreurs à corriger
```

Les changements majeurs sont documentés dans les [releases GitHub](https://github.com/ValentinDft/ng-base-config/releases).

### Vérifier la version installée

```bash
npm list @valentindft/ng-base-config
```

---

## Faire évoluer une règle

1. Modifier le fichier concerné dans ce repo.
2. Bumper `version` dans `package.json` :
   - **patch** `1.0.x` → fix sans impact sur le code existant
   - **minor** `1.x.0` → nouvelle règle warn ou option optionnelle
   - **major** `x.0.0` → règle error ou changement cassant
3. Publier :
   ```bash
   git add -A && git commit -m "feat: ..."
   git tag v1.2.0
   git push && git push --tags
   ```
   Le workflow GitHub Actions publie automatiquement sur npm via
   **trusted publishing (OIDC)** — aucun `NPM_TOKEN` n'est stocké dans le repo.
   Le workflow refuse de publier si le tag ne correspond pas à la `version` du
   `package.json`.
4. Dans chaque projet existant :
   ```bash
   npm update @valentindft/ng-base-config
   ```

---

## Peer dependencies

Ce package ne regroupe pas ESLint et ses plugins — chaque projet les installe directement pour garder le contrôle sur les versions :

| Package | Version minimale |
|---|---|
| `@eslint/js` | `>=9.0.0` |
| `typescript-eslint` | `>=8.0.0` |
| `angular-eslint` | `>=18.0.0` |
| `stylelint` | `>=16.0.0` |
| `stylelint-config-standard-scss` | `>=13.0.0` |