import withMT from '@material-tailwind/react/utils/withMT';

export default withMT({
  content: [
    './index.html',
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: { 950: '#0e0b23' },
        indigo: {
          950: '#181059',
        },
      },
      transitionProperty: {
        border: 'border,border-radius,box-shadow,background-color',
      },
      boxShadow: {
        stat: '0 0 30px -15px rgba(0, 0, 0, 0.5)',
      },
      fontSize: {
        slidetitle: [
          '3.6rem',
          {
            lineHeight: '4rem',
            letterSpacing: '-0.01em',
            fontWeight: '600',
          },
        ],
        slideparagraph: [
          '1.3rem',
          {
            lineHeight: '2.25rem',
            letterSpacing: '-0.02em',
            fontWeight: '400',
          },
        ],
      },
    },
    plugins: [],
  },
});
