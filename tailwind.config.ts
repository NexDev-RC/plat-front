// En Tailwind v4 este archivo es opcional.
// La configuración se hace principalmente en globals.css con @theme.
// Se mantiene por compatibilidad con librerías que lo requieran.
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config
