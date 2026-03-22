import { Product } from '../../types';

export const NEW_PRODUCTS: Product[] = [
  // DESAYUNOS
  {
    id: 'prod-desayuno-clasico',
    name: 'Desayuno Clásico Artesanal',
    subtitle: 'El favorito de siempre',
    description: 'Incluye: Taza, infusiones, jugo, sandwich de jamón y queso, medialunas, cookies y porción de torta.',
    price: 15500,
    category: 'DESAYUNOS',
    image: 'https://picsum.photos/seed/breakfast1/800/600',
    stock: 10,
    isHidden: false
  },
  {
    id: 'prod-desayuno-premium',
    name: 'Desayuno Premium Sorpresa',
    subtitle: 'Para alguien muy especial',
    description: 'Incluye: Taza premium, infusiones variadas, jugo orgánico, tablita de salame y quesos, scons de queso, cookies artesanales, porción de torta y globo metalizado.',
    price: 22500,
    category: 'DESAYUNOS',
    image: 'https://picsum.photos/seed/breakfast2/800/600',
    stock: 5,
    isHidden: false
  },
  {
    id: 'prod-desayuno-agotado',
    name: 'Desayuno Especial Agotado',
    subtitle: 'Próximamente disponible',
    description: 'Un desayuno muy completo que volverá pronto.',
    price: 18000,
    category: 'DESAYUNOS',
    image: 'https://picsum.photos/seed/breakfast3/800/600',
    stock: 0,
    isHidden: true
  },

  // MERIENDAS
  {
    id: 'prod-merienda-dulce',
    name: 'Merienda Dulce Tentación',
    description: 'Ideal para compartir la tarde. Incluye alfajores, cookies, muffins y porción de torta.',
    price: 12500,
    category: 'MERIENDAS',
    image: 'https://picsum.photos/seed/merienda1/800/600',
    stock: 8,
    isHidden: false
  },

  // PICADAS
  {
    id: 'prod-picada-amigos',
    name: 'Picada para Amigos',
    description: 'Tablita con variedad de quesos, salame, aceitunas y chalitas.',
    price: 19500,
    category: 'PICADAS',
    image: 'https://picsum.photos/seed/picada1/800/600',
    stock: 15,
    isHidden: false
  },

  // REGALOS
  {
    id: 'prod-regalo-oso',
    name: 'Oso de Peluche Gigante',
    description: 'Un regalo tierno y suave para cualquier ocasión.',
    price: 25000,
    category: 'REGALOS',
    image: 'https://picsum.photos/seed/peluche1/800/600',
    stock: 3,
    isHidden: false
  },

  // FLORES
  {
    id: 'prod-ramo-rosas',
    name: 'Ramo de 12 Rosas Rojas',
    description: 'El clásico gesto de amor.',
    price: 32000,
    category: 'FLORES',
    image: 'https://picsum.photos/seed/flores1/800/600',
    stock: 20,
    isHidden: false
  },

  // INFANTILES
  {
    id: 'prod-desayuno-infantil',
    name: 'Desayuno Infantil Temático',
    description: 'Con tazas de personajes, leche chocolatada, cereales y sorpresas.',
    price: 14500,
    category: 'INFANTILES',
    image: 'https://picsum.photos/seed/infantil1/800/600',
    stock: 12,
    isHidden: false
  }
];
