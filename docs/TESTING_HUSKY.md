# 🧪 Testare Husky e Git Hooks

Questa guida ti mostra come verificare che Husky funzioni correttamente.

## ✅ Test 1: Pre-Commit Hook (lint-staged)

### Test con Errore ESLint

1. **Crea un file con errore:**

```bash
echo "const x = 1" > test-file.ts
git add test-file.ts
git commit -m "test: file con errore"
```

2. **Risultato atteso:**

```
✔ Running tasks for staged files...
✖ eslint --fix found errors
```

Il commit viene **bloccato** finché non correggi l'errore.

### Test con File Corretto

1. **Crea un file valido:**

```bash
cat > test-file.ts << 'EOF'
export const greeting = "Hello World";
console.log(greeting);
EOF
git add test-file.ts
git commit -m "test: Aggiunto file di test"
```

2. **Risultato atteso:**

```
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
[main abc1234] test: Aggiunto file di test
```

Il commit viene **completato** e il codice viene formattato automaticamente.

---

## ✅ Test 2: Commit-Msg Hook (commitlint)

### Test con Messaggi NON Validi

```bash
# ❌ Messaggio generico
git commit -m "fix stuff"
# Output: ✖ subject may not be empty [subject-empty]

# ❌ Senza tipo
git commit -m "updated files"
# Output: ✖ type may not be empty [type-empty]

# ❌ Tipo non valido
git commit -m "update: something"
# Output: ✖ type must be one of [feat, fix, docs...]
```

### Test con Messaggi Validi

```bash
# ✅ Feature
git commit -m "feat: Aggiunta gestione scadenze"

# ✅ Bug fix
git commit -m "fix: Corretto bug login admin"

# ✅ Documentazione
git commit -m "docs: Aggiornato README con esempi"

# ✅ Con body e footer
git commit -m "feat: Sistema notifiche email

Implementato sistema completo di notifiche:
- Scheduler con node-cron
- Template email personalizzabili
- Tracking stato invio

Closes #123"
```

---

## ✅ Test 3: Prisma Schema

### Test Modifica Schema

1. **Modifica `prisma/schema.prisma`:**

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String? // <- Aggiungi questo campo
}
```

2. **Committa:**

```bash
git add prisma/schema.prisma
git commit -m "feat: Aggiunto campo name a User"
```

3. **Risultato atteso:**

```
✔ Running tasks for staged files...
✔ prisma format
✔ prisma generate
[main abc1234] feat: Aggiunto campo name a User
```

Il Prisma Client viene **rigenerato automaticamente**!

---

## 🚫 Test 4: Bypassare Hook (Emergenza)

Solo in casi eccezionali:

```bash
# Bypassa tutti gli hook
git commit --no-verify -m "WIP: work in progress"

# ⚠️ ATTENZIONE: Usa solo se:
# - Commit WIP temporaneo
# - Emergenza critica
# - Sapere esattamente cosa stai facendo
```

---

## 🐛 Troubleshooting

### Gli Hook Non Si Attivano

```bash
# Verifica Husky installato
ls -la .husky/

# Reinstalla hook
rm -rf .husky
npm run prepare

# Verifica permessi
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Errori lint-staged

```bash
# Esegui manualmente per vedere errori dettagliati
npx lint-staged

# Se fallisce, controlla file modificati
git diff --name-only --cached
```

### Errori commitlint

```bash
# Testa messaggio
echo "feat: test message" | npx commitlint

# Vedi regole configurate
cat commitlint.config.js
```

### Errori Prisma Generate

```bash
# Rigenera manualmente
npm run prisma:generate

# Verifica schema valido
npx prisma validate
```

---

## 📊 Esempi Pratici Workflow

### Workflow Tipico

```bash
# 1. Modifica file
vim app/api/users/route.ts

# 2. Stage file
git add app/api/users/route.ts

# 3. Commit (hook si attivano automaticamente)
git commit -m "feat: Aggiunta API gestione utenti"

# Output:
# ✔ ESLint controlla...
# ✔ Prettier formatta...
# ✔ Commitlint verifica messaggio...
# ✔ Commit completato!

# 4. Push
git push
```

### Workflow con Errori

```bash
# 1. Modifica file con errore
echo "const x = " > test.ts

# 2. Tenta commit
git add test.ts
git commit -m "feat: test"

# Output:
# ✖ ESLint trovato errori:
#   test.ts
#   1:11  error  Unexpected token

# 3. Correggi errore
echo "const x = 1;" > test.ts

# 4. Riprova commit
git add test.ts
git commit -m "feat: test"

# Output:
# ✔ Tutto OK!
```

---

## 🎯 Verifica Setup Completo

Esegui questo script per verificare tutto:

```bash
#!/bin/bash

echo "🔍 Verifica Husky Setup..."

# 1. Verifica Husky installato
if [ -d ".husky" ]; then
  echo "✅ Directory .husky presente"
else
  echo "❌ Directory .husky mancante"
  exit 1
fi

# 2. Verifica hook pre-commit
if [ -f ".husky/pre-commit" ]; then
  echo "✅ Hook pre-commit presente"
else
  echo "❌ Hook pre-commit mancante"
fi

# 3. Verifica hook commit-msg
if [ -f ".husky/commit-msg" ]; then
  echo "✅ Hook commit-msg presente"
else
  echo "❌ Hook commit-msg mancante"
fi

# 4. Verifica commitlint.config.js
if [ -f "commitlint.config.js" ]; then
  echo "✅ commitlint.config.js presente"
else
  echo "❌ commitlint.config.js mancante"
fi

# 5. Verifica lint-staged in package.json
if grep -q "lint-staged" package.json; then
  echo "✅ lint-staged configurato in package.json"
else
  echo "❌ lint-staged non configurato"
fi

echo ""
echo "🎉 Setup completato correttamente!"
```

Salva come `verify-husky.sh` ed esegui:

```bash
chmod +x verify-husky.sh
./verify-husky.sh
```

---

## 📚 Risorse

- [Husky Documentation](https://typicode.github.io/husky/)
- [Conventional Commits Spec](https://www.conventionalcommits.org/)
- [commitlint Rules](https://commitlint.js.org/#/reference-rules)
- [lint-staged Examples](https://github.com/okonet/lint-staged#examples)
