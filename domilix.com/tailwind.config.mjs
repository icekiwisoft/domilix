import withMT from '@material-tailwind/react/utils/withMT';

export default withMT({
  darkMode: 'class',
  content: [
    './index.html',
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ── MD3 Color Tokens (from DESIGN.md — exact values) ─────────────
      colors: {
        // Primary — user override: #E8921A (bright orange CTA)
        primary:                  '#E8921A',
        'primary-light':          '#F0A84A',
        'primary-container':      '#f5a623',  // amber — used for CTA button backgrounds
        'on-primary':             '#ffffff',
        'on-primary-container':   '#644000',  // dark brown text on amber
        'primary-fixed':          '#ffddb4',
        'primary-fixed-dim':      '#ffb955',
        'on-primary-fixed':       '#291800',
        'on-primary-fixed-variant': '#633f00',
        'surface-tint':           '#835500',
        'inverse-primary':        '#ffb955',

        // Secondary — blue-gray (from DESIGN.md)
        secondary:                '#516071',
        'on-secondary':           '#ffffff',
        'secondary-container':    '#d1e1f5',
        'on-secondary-container': '#556475',
        'secondary-fixed':        '#d4e4f8',
        'secondary-fixed-dim':    '#b8c8dc',
        'on-secondary-fixed':     '#0d1d2b',  // very dark navy — promo card bg
        'on-secondary-fixed-variant': '#394858',

        // Tertiary — teal/cyan
        tertiary:                 '#00658a',
        'on-tertiary':            '#ffffff',
        'tertiary-container':     '#3ac2ff',
        'on-tertiary-container':  '#004d6a',
        'tertiary-fixed':         '#c4e7ff',
        'tertiary-fixed-dim':     '#7cd0ff',
        'on-tertiary-fixed':      '#001e2c',
        'on-tertiary-fixed-variant': '#004c69',

        // Error
        error:                    '#ba1a1a',
        'on-error':               '#ffffff',
        'error-container':        '#ffdad6',
        'on-error-container':     '#93000a',

        // Surface / Background (from DESIGN.md exact values)
        background:               '#fff8f4',
        'on-background':          '#211a12',
        surface:                  '#fff8f4',
        'surface-bright':         '#fff8f4',
        'surface-dim':            '#e6d8ca',
        'surface-variant':        '#eee0d2',
        'surface-container-lowest':  '#ffffff',
        'surface-container-low':     '#fff1e4',
        'surface-container':         '#faebdd',
        'surface-container-high':    '#f4e6d8',
        'surface-container-highest': '#eee0d2',
        'on-surface':             '#211a12',
        'on-surface-variant':     '#524534',

        // Outline
        outline:                  '#857462',
        'outline-variant':        '#d7c3ae',

        // Inverse
        'inverse-surface':        '#372f26',
        'inverse-on-surface':     '#fdeee0',

        // Custom
        'dark-section':           '#2C3A2E',
        'on-dark-section':        '#D9E7DC',

        // Legacy (backward compat)
        dark:                     '#0F0F0F',
        'background-light':       '#FAFAFA',
        gray:   { 950: '#0e0b23' },
        indigo: { 950: '#181059' },
      },

      // ── Typography ────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'ui-sans-serif', 'sans-serif'],
        body:    ['Plus Jakarta Sans', 'ui-sans-serif', 'sans-serif'],
      },

      fontSize: {
        'display-xl':  ['3.75rem', { lineHeight: '4.5rem',  fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['2.5rem',  { lineHeight: '3rem',    fontWeight: '700', letterSpacing: '-0.01em' }],
        'headline-md': ['2rem',    { lineHeight: '2.5rem',  fontWeight: '700' }],
        'headline-sm': ['1.5rem',  { lineHeight: '2rem',    fontWeight: '600' }],
        'body-lg':     ['1.125rem',{ lineHeight: '1.75rem', fontWeight: '400' }],
        'body-md':     ['1rem',    { lineHeight: '1.5rem',  fontWeight: '400' }],
        'label-md':    ['0.875rem',{ lineHeight: '1.25rem', fontWeight: '600', letterSpacing: '0.05em' }],
        caption:       ['0.75rem', { lineHeight: '1rem',    fontWeight: '500' }],
        // Legacy
        slidetitle:    ['3.6rem',  { lineHeight: '4rem',    letterSpacing: '-0.01em', fontWeight: '600' }],
        slideparagraph:['1.3rem',  { lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: '400' }],
      },

      // ── Spacing (8px base) ────────────────────────────────────────────
      spacing: {
        xs:     '0.25rem',  // 4px
        sm:     '0.75rem',  // 12px
        base:   '0.5rem',   // 8px
        md:     '1.5rem',   // 24px
        lg:     '3rem',     // 48px
        xl:     '4rem',     // 64px
        gutter: '1.5rem',   // 24px
      },

      maxWidth: {
        container: '80rem', // 1280px
      },

      // ── Border Radius ─────────────────────────────────────────────────
      borderRadius: {
        DEFAULT: '0.25rem', // 4px
        lg:      '0.5rem',  // 8px  — cards (matches reference)
        xl:      '0.75rem', // 12px — inputs, chips
        '2xl':   '1rem',    // 16px
        '3xl':   '1.5rem',  // 24px
        full:    '9999px',
      },

      // ── Shadows ───────────────────────────────────────────────────────
      boxShadow: {
        card:       '0 4px 20px rgba(0,0,0,0.04)',
        'card-hover':'0 8px 32px rgba(0,0,0,0.10)',
        nav:        '0 1px 4px 0 rgba(0,0,0,0.06)',
        stat:       '0 0 30px -15px rgba(0,0,0,0.5)',
      },

      // ── Misc ──────────────────────────────────────────────────────────
      transitionProperty: {
        border: 'border,border-radius,box-shadow,background-color',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #E8921A, #f5a623)',
      },
    },
    plugins: [],
  },
});
