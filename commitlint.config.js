module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nuova funzionalità
        'fix',      // Bug fix
        'docs',     // Solo documentazione
        'style',    // Formattazione (non cambia logica)
        'refactor', // Refactoring del codice
        'perf',     // Miglioramento performance
        'test',     // Aggiunta o modifica test
        'build',    // Modifiche al sistema di build
        'ci',       // Modifiche CI/CD
        'chore',    // Altre modifiche (non src/test)
        'revert',   // Revert di commit precedente
      ],
    ],
    'subject-case': [0], // Permette qualsiasi case nel subject
    'body-max-line-length': [0], // Disabilita limite lunghezza body
  },
};
