# React + TypeScript + Vite

Este modelo fornece uma configuração mínima para fazer React funcionar no Vite com HMR e algumas regras ESLint.

Atualmente, duas plugins oficiais estão disponíveis:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) usando [Babel](https://babeljs.io/) para Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) usando [SWC](https://swc.rs/) para Fast Refresh

## Expandindo a configuração do ESLint

Se você estiver desenvolvendo uma aplicação para produção, recomendamos atualizar a configuração para habilitar regras de linting com verificação de tipos:

```js
export default tseslint.config({
  extends: [
    // Remova ...tseslint.configs.recommended e substitua por isso
    ...tseslint.configs.recommendedTypeChecked,
    // Alternativamente, use isso para regras mais rigorosas
    ...tseslint.configs.strictTypeChecked,
    // Opcionalmente, adicione isso para regras estilísticas
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // outras opções...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

## Expandindo a Configuração de Vite

Para o uso de um arquivo `.env` personalizado, consulte [as documentações do dotenv de Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) para mais informações.

## Primeiros Passos

1. Clone este repositório
2. Execute `npm install` para instalar as dependências
3. Execute `npm run dev` para iniciar o servidor de desenvolvimento
4. Abra seu navegador em `http://localhost:3000`

## Recursos

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [ESLint](https://eslint.org/)
