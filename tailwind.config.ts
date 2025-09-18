import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          500: 'var(--color-accent)',
        },
        muted: 'var(--color-muted)',
        card: 'var(--color-card)'
      },
      borderRadius: {
        card: 'var(--radius-card)',
        chip: 'var(--radius-chip)'
      },
      boxShadow: {
        card: 'var(--shadow-card)'
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)'
      }
    }
  },
  plugins: [],
};

export default config;


