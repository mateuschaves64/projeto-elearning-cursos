// Configuração do Jest para rodar com ES Modules (package.json -> "type": "module").
// `transform: {}` desliga o Babel, pois o Node já entende ESM nativamente.
// Para rodar, o Node precisa da flag --experimental-vm-modules (os scripts do package.json já incluem).
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,

  // A atividade foca na camada de serviços, então a cobertura é medida em src/services
  collectCoverageFrom: ['src/services/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],

  // Exigência da atividade: mínimo de 80% de cobertura
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 },
  },
};
