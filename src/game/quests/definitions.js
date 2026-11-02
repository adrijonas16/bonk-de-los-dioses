/* Bonk de los Dioses · encargos dentro de la partida (primera versión: Machu Picchu) */
const Q_REALMS = { ukupacha: true };
const QMAX = 2;
const Q_IDS = ['ladron', 'llama', 'sellos', 'favor'];
const Q_EMBER = 20; // segundos de brasa
const Q_SEAL_TIME = 100; // límite del encuentro del gigante
const QDEF = {
  ladron: {
    icon: '🦊',
    col: '#ffb040',
    name: 'El ladrón de ambrosía',
    give: 'Un cofre de ambrosía brilla en la terraza. Atoq, un zorro ladrón, lo vigila: si lo abres, lo roba y huye.',
    rew: '1 cofre del jefe (eliges 1 de 3 objetos). Rápido: unos 30 s.',
    risk: 'Atoq corre al 95 % de tu velocidad durante 50 s mientras siguen las hordas. Si te quedas atrás te espera, y tropieza cada pocos segundos.',
  },
  llama: {
    icon: '🔥',
    col: '#ff8a2a',
    name: 'La llama de Inti',
    give: 'Lleva la llama sagrada a los dos braseros apagados, en el orden que quieras.',
    rew: 'Fuego de Inti: tus golpes queman toda la partida. Los braseros encendidos sirven de refugio en este reino.',
    risk: 'Ventiscas anunciadas 5 s antes: fuera de un tambo (anillo azul) la llama se debilita; los golpes también. Si se apaga, la brasa dura 20 s.',
  },
  sellos: {
    icon: '🗿',
    col: '#c8a0ff',
    name: 'Los sellos del gigante',
    give: 'Tres sellos cierran la puerta del Apu y protegen al Guardián de piedra. Solo sus propios puños pueden romperlos.',
    rew: '1 cofre del jefe y un altar de don dentro de la puerta.',
    risk: 'El Guardián pega fuerte (círculo morado 1,2 s antes) y mientras queden sellos solo recibe el 35 % del daño y no puede morir. Tienes 100 s.',
  },
};
/* Favores divinos: el sistema elige el primero compatible con el grupo. Solo «tormenta» está implementado. */
const FAVORS = {
  tormenta: {
    givers: ['illapa', 'shango', 'zeus'],
    tag: 'trueno',
    icon: 'ϟ',
    col: '#ffe060',
    relic: 'la Illa',
    title: 'Charcos de tormenta',
    desc: 'Los enemigos que matas dejan charcos, y cada 4 s la tormenta moja a los jefes y élites cercanos. Cada 2,5 s un rayo electrocuta a todos los que pisan charcos cercanos. Tus rayos también los electrifican.',
  },
};
const Q_HUNT = { aliado: 8, neutral: 6, rival: 4 };
let Q_BURN = false;
