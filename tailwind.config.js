/** Tailwind v3 config. Build: see CLAUDE.md ("CSS build").
 *  Same theme that used to live inline next to the Play CDN script. */
module.exports = {
  content: ['./*.html', './blog/*.html'],
  theme: {
    extend: {
      colors: {
        navy: '#0A1628',
        'navy-mid': '#152238',
        sky: '#4A9EFF',
        'sky-light': '#D6EAFF',
        cream: '#FAF9F6',
        warm: '#F0F4F8',
        green: '#22C55E',
        'text-muted': '#64748B',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['"Cabinet Grotesk"', 'system-ui', 'sans-serif'],
      },
    },
  },
};
