# Git Hooks Configuration

Questo progetto utilizza **Husky** e **lint-staged** per automatizzare controlli di qualità del codice.

## 🎯 Hook Configurati

### Pre-Commit Hook

Eseguito **prima** di ogni commit:

- ✅ **ESLint**: Controlla errori JavaScript/TypeScript
- ✅ **Prettier**: Formatta automaticamente il codice
- ✅ **Prisma Format**: Formatta schema.prisma
- ✅ **Prisma Generate**: Aggiorna client se schema modificato

### Commit-Msg Hook

Verifica il formato del messaggio di commit secondo [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# ✅ VALIDI
git commit -m "feat: Aggiunto pannello admin"
git commit -m "fix: Corretto bug login"
git commit -m "docs: Aggiornato README"
git commit -m "refactor: Semplificato codice auth"

# ❌ NON VALIDI
git commit -m "fix stuff"
git commit -m "updated files"
git commit -m "aaa"
```

## 📝 Tipi di Commit Permessi

- `feat`: Nuova funzionalità
- `fix`: Correzione bug
- `docs`: Solo documentazione
- `style`: Formattazione (non cambia logica)
- `refactor`: Refactoring del codice
- `perf`: Miglioramento performance
- `test`: Aggiunta o modifica test
- `build`: Modifiche al sistema di build
- `ci`: Modifiche CI/CD
- `chore`: Altre modifiche (dipendenze, config)
- `revert`: Revert di commit precedente

## 🔧 Utilizzo

Gli hook si attivano **automaticamente**. Non serve fare nulla!

```bash
# Esempio workflow normale
git add .
git commit -m "feat: Aggiunta gestione scadenze"

# Hook si attiva automaticamente:
# ✅ ESLint controlla file .ts/.tsx modificati
# ✅ Prettier formatta codice
# ✅ Commitlint verifica messaggio
# ✅ Commit completato!
```

## 🚫 Bypassare Hook (sconsigliato)

Solo in casi eccezionali:

```bash
git commit --no-verify -m "WIP: work in progress"
```

## 🐛 Troubleshooting

### Hook non si attiva

```bash
# Reinstalla Husky
npm run prepare
```

### Errori lint-staged

```bash
# Esegui manualmente
npx lint-staged
```

### Problemi Prisma

```bash
# Rigenera client
npm run prisma:generate
```

## 📚 Risorse

- [Husky Documentation](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [commitlint](https://commitlint.js.org/)
