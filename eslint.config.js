// Root scripts only (scripts/): each app and package has its own configuration
import nest from '@makido/eslint/nest';
import { defineConfig } from 'eslint/config';

export default defineConfig(nest, {
  languageOptions: {
    parserOptions: { tsconfigRootDir: import.meta.dirname },
  },
});
