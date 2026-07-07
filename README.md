# @valentindft/ng-base-config

Config ESLint, Prettier, TypeScript et lint-staged mutualisée entre tous mes projets Angular. Publiée en privé sur **GitHub Packages**.

---

## Pourquoi ce package existe

Sans config partagée, chaque projet Angular accumule sa propre copie des mêmes règles ESLint, du même `prettier.config.js`, du même `tsconfig` strict. Mettre à jour une règle signifie ouvrir chaque repo. Ce package centralise tout ça : un seul endroit à modifier, tous les projets se mettent à jour via `npm update`.

---

## Architecture

Ce package est l'un des deux composants du toolkit perso :

```
angular-base-toolkit/
├── ng-base-config/     ← CE package — config partagée, publié sur GitHub Packages
└── create-ng-app/      ← CLI npx — orchestre ng new + branchement de ce package
```

Chaque projet Angular consommateur installe `@valentindft/ng-base-config` comme dépendance de dev et y pointe directement depuis `eslint.config.mjs`, `package.json` (prettier, lint-staged) et `tsconfig.json` :

```
mongarage/                      nextframe/
├── eslint.config.mjs ──────────────────────────────────┐
├── package.json                                         │
│   ├── prettier: "@valentindft/ng-base-config/prettier" ├──► @valentindft/ng-base-config
│   └── lint-staged: "…/lint-staged"                    │     ├── eslint/index.js
└── tsconfig.json                                        │     ├── prettier/index.js
    └── extends: "…/tsconfig/base.json" ────────────────┘     ├── lint-staged/index.js
                                                               └── tsconfig/base.json
```

---

## Contenu

### `eslint/index.js` — factory flat config ESLint

Exporte une fonction `buildConfig({ prefix })` qui retourne une flat config ESLint complète pour Angular.

**Extends :** `@eslint/js` · `typescript-eslint` (recommended + stylistic) · `angular-eslint` (tsRecommended + templateRecommended + templateAccessibility)

**Règles ajoutées :**
- `@angular-eslint/component-selector` : kebab-case avec le prefix passé en argument
- `@angular-eslint/directive-selector` : camelCase avec le prefix passé en argument
- `@typescript-eslint/no-unused-vars` : warn (ignore les variables préfixées `_`)
- `@typescript-eslint/no-explicit-any` : warn
- `@typescript-eslint/explicit-function-return-type` : off

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

Ce fichier est étendu via `tsconfig.json` du projet consommateur — les options spécifiques au projet (`target`, `module`, `outDir`, etc.) restent dans le tsconfig du projet.

---

### `lint-staged/index.js` — règles lint-staged pre-commit

```js
{
  '*.ts':          ['eslint --fix', 'prettier --write'],
  '*.html':        ['eslint --fix', 'prettier --write'],
  '*.{scss,css}':  ['prettier --write'],
  '*.{json,md}':   ['prettier --write'],
}
```

Déclenché automatiquement par Husky au `git commit`. Seuls les fichiers stagés sont traités.

---

## Installation (prérequis machine)

Ce package est publié sur GitHub Packages (registre privé). Il faut configurer `~/.npmrc` une fois par machine :

```
@valentindft:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<PAT avec scope read:packages>
```

Génère le PAT sur **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens** avec la permission `read:packages`.

---

## Init — Branchement dans un projet Angular

> Si tu utilises `create-ng-app`, tout ce qui suit est fait automatiquement.

### 1. Installer le package et ses pairs

```bash
npm install -D @valentindft/ng-base-config eslint @eslint/js typescript-eslint angular-eslint prettier husky lint-staged
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

### 4. lint-staged — `package.json`

```json
{
  "lint-staged": "@valentindft/ng-base-config/lint-staged"
}
```

### 5. TypeScript — `tsconfig.json`

Ajouter `ng-base-config` dans le tableau `extends` existant (ne pas remplacer le tsconfig Angular généré) :

```json
{
  "extends": ["./tsconfig.base.json", "@valentindft/ng-base-config/tsconfig/base.json"]
}
```

### 6. Husky — hook pre-commit

```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

### 7. Vérifier que tout fonctionne

```bash
npm run lint      # zéro erreur ESLint
npm run format    # Prettier appliqué
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
   git tag v1.1.0
   git push && git push --tags
   ```
   Le workflow GitHub Actions publie automatiquement sur GitHub Packages.
4. Dans chaque projet existant :
   ```bash
   npm update @valentindft/ng-base-config
   ```

---

## Peer dependencies

Ce package ne regroupe pas ESLint et ses plugins — chaque projet les installe directement pour garder le contrôle sur les versions :

| Package | Version minimale |
| ------- | ---------------- |
| `@eslint/js` | `>=9.0.0` |
| `typescript-eslint` | `>=8.0.0` |
| `angular-eslint` | `>=18.0.0` |
