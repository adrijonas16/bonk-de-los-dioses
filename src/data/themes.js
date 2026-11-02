/* ---------- Estilo de la interfaz por panteón ---------- */
const svg = (s) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' shape-rendering='crispEdges'>${s}</svg>`)}")`;
const THEMES = {
  Griega: {
    panel: '#c4673a',
    deep: '#9c4a25',
    ink: '#1c1210',
    light: '#f2e3c6',
    acc: '#e8b53e',
    band: '#1c1210',
    pat: svg("<path d='M0 19H19V3H5V15H14V8H9' fill='none' stroke='#c4673a' stroke-width='3'/>"),
    tag: 'Ruinas y meandros',
  },
  Primordial: {
    panel: '#3a2a5a',
    deep: '#24183a',
    ink: '#1c1210',
    light: '#f2e3c6',
    acc: '#b07aff',
    band: '#1c1210',
    pat: svg("<path d='M0 19H19V3H5V15H14V8H9' fill='none' stroke='#b07aff' stroke-width='3'/>"),
    tag: 'Antes de los dioses',
  },
  Nórdica: {
    panel: '#4a5a6a',
    deep: '#2f3a46',
    ink: '#0e141a',
    light: '#e6eef4',
    acc: '#7de0ff',
    band: '#0e141a',
    pat: svg("<path d='M4 18L11 4L18 18M7 12H15' fill='none' stroke='#7de0ff' stroke-width='2'/>"),
    tag: 'Runas y escarcha',
  },
  Egipcia: {
    panel: '#d9b26b',
    deep: '#a87a3c',
    ink: '#1a1410',
    light: '#fbf3dc',
    acc: '#2f6fae',
    band: '#2f4f9e',
    pat: svg(
      "<path d='M11 3C7 8 7 14 11 19C15 14 15 8 11 3Z' fill='#e8b53e'/><rect x='0' y='19' width='22' height='3' fill='#e8b53e'/>"
    ),
    tag: 'Lotos y oro',
  },
  Mesopotámica: {
    panel: '#b98a5e',
    deep: '#7d5636',
    ink: '#1a120c',
    light: '#f4e6cf',
    acc: '#2f4f9e',
    band: '#2f4f9e',
    pat: svg(
      "<circle cx='11' cy='11' r='5' fill='none' stroke='#e8b53e' stroke-width='2'/><circle cx='11' cy='11' r='1.5' fill='#e8b53e'/>"
    ),
    tag: 'Lapislázuli y rosetas',
  },
  Hindú: {
    panel: '#c2452d',
    deep: '#8a2a1f',
    ink: '#1a0a08',
    light: '#fbecd8',
    acc: '#f2c23a',
    band: '#3a1a5a',
    pat: svg(
      "<path d='M11 2C15 7 15 12 11 16C7 12 7 7 11 2Z' fill='#f2c23a'/><circle cx='11' cy='19' r='2' fill='#e27aa8'/>"
    ),
    tag: 'Lotos y azafrán',
  },
  Japonesa: {
    panel: '#f2e8dc',
    deep: '#c8b8a4',
    ink: '#1a1414',
    light: '#ffffff',
    acc: '#d83a2a',
    band: '#1c2a4a',
    pat: svg(
      "<path d='M0 22A11 11 0 0 1 22 22M4 22A7 7 0 0 1 18 22M8 22A3 3 0 0 1 14 22' fill='none' stroke='#9ad0e8' stroke-width='1.5'/>"
    ),
    font: '"DotGothic16"',
    tag: 'Olas seigaiha',
  },
  China: {
    panel: '#a8281f',
    deep: '#6e1610',
    ink: '#1a0806',
    light: '#fbe8c8',
    acc: '#f2c23a',
    band: '#1a0806',
    pat: svg("<path d='M3 19V3H19V19H7V7H15V15H11' fill='none' stroke='#f2c23a' stroke-width='2'/>"),
    tag: 'Laca roja y nubes',
  },
  Mexica: {
    panel: '#2f8a7a',
    deep: '#1f5a50',
    ink: '#0c1614',
    light: '#f2ead6',
    acc: '#f2a22c',
    band: '#0c1614',
    pat: svg("<path d='M0 20H6V14H12V8H18V2H22' fill='none' stroke='#f2a22c' stroke-width='3'/>"),
    tag: 'Grecas escalonadas',
  },
  Maya: {
    panel: '#3a7a5a',
    deep: '#24503a',
    ink: '#08140e',
    light: '#eef2e0',
    acc: '#e8c23a',
    band: '#08140e',
    pat: svg(
      "<rect x='3' y='3' width='16' height='16' fill='none' stroke='#e8c23a' stroke-width='2'/><rect x='8' y='8' width='6' height='6' fill='#3fb3b0'/>"
    ),
    tag: 'Glifos y jade',
  },
  Andina: {
    panel: '#b3304a',
    deep: '#7a1f32',
    ink: '#14060a',
    light: '#fbe8ea',
    acc: '#f2c23a',
    band: '#14060a',
    pat: svg(
      "<path d='M8 2H14V8H20V14H14V20H8V14H2V8H8Z' fill='none' stroke='#f2c23a' stroke-width='2'/><rect x='10' y='10' width='2' height='2' fill='#3a8ad0'/>"
    ),
    tag: 'Chakana y tocapus',
  },
  Yoruba: {
    panel: '#3a5ab0',
    deep: '#243a7a',
    ink: '#080c1a',
    light: '#eaf0ff',
    acc: '#f2f2f2',
    band: '#080c1a',
    pat: svg(
      "<ellipse cx='11' cy='11' rx='4' ry='6' fill='#f2ead6'/><path d='M11 6V16' stroke='#3a2a1a' stroke-width='1.5'/>"
    ),
    tag: 'Índigo adire y caracoles',
  },
  Celta: {
    panel: '#3a6a4a',
    deep: '#24442f',
    ink: '#0a140e',
    light: '#eaf4ea',
    acc: '#c9d86a',
    band: '#0a140e',
    pat: svg(
      "<path d='M11 11C11 5 17 5 17 9M11 11C5 11 5 17 9 17M11 11C17 11 17 17 13 17M11 11C11 17 5 17 5 13' fill='none' stroke='#c9d86a' stroke-width='1.8'/>"
    ),
    tag: 'Nudos y trisqueles',
  },
  Cristiana: {
    panel: '#f4ecd8',
    deep: '#d8c890',
    ink: '#1a1608',
    light: '#ffffff',
    acc: '#c99a2a',
    band: '#2a3a7a',
    pat: svg(
      "<rect x='9' y='3' width='4' height='16' fill='#f4d27a'/><rect x='4' y='8' width='14' height='4' fill='#f4d27a'/>"
    ),
    tag: 'Oro y vitrales',
  },
};
