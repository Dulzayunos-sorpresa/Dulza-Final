import { Product, ProductCategory } from '../../types';
import { COMMON_OPTIONS } from '../options';
import { 
  PREMIUM_ENORME_DESCRIPTION, 
  DELUXE_FLOWER_DESCRIPTION, 
  DELUXE_15_DESCRIPTION,
  ARTESANAL_COMPARTIR_DESCRIPTION,
  CAJA_TENTACION_DESCRIPTION,
  SIN_TACC_DESCRIPTION,
  SALUDABLE_DESCRIPTION
} from './descriptions';

export const breakfastProducts: Product[] = [
  { 
    id: 'da2', 
    name: 'Premium Completo Enorme', 
    subtitle: 'Con globos de regalo',
    description: PREMIUM_ENORME_DESCRIPTION, 
    price: 105000, 
    category: ProductCategory.BREAKFAST, 
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1740743569577-76706.png?size=2000x2000', 
    tags: ['ENVÍO GRATIS', 'PREMIUM'],
    galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1740743569577-76706.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1740743569577-2873.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1740743569577-91470.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1740743569577-14238.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1740743569577-98695.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1740743569577-6511.png?size=2000x2000'],
    options: [
      COMMON_OPTIONS.PRESENTATION,
      COMMON_OPTIONS.BALLOON_PHRASE,
      COMMON_OPTIONS.CAKES,
      COMMON_OPTIONS.CUPS,
      COMMON_OPTIONS.DRINKS,
      COMMON_OPTIONS.SWEETS
    ]
  },
  {
      id: 'deluxe-ramo',
      name: 'Deluxe con ramo de flores',
      subtitle: 'Con globos de regalo!',
      description: DELUXE_FLOWER_DESCRIPTION,
      price: 245000,
      category: ProductCategory.BREAKFAST, 
      image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/lrou1_BS8d_Ry0n-Lg576.png?size=2000x2000',
      tags: ['PREMIUM', 'ENVÍO GRATIS'],
      galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/lrou1_BS8d_Ry0n-Lg576.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/PLfpQFqdvqz6MCShL1FKh.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/311CnJyZYm0BAz8S0Elzf.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/a0SAWbU5csxyoLGuIgmor.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/kmuDxPwCtcAkTFcBXB-KS.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/AKYS1Bhxin9B-aBHSxKsa.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1JZMVjJPwdGMkLR9ulkMM.png?size=2000x2000'],
      options: [
        COMMON_OPTIONS.PRESENTATION,
        COMMON_OPTIONS.BALLOON_PHRASE,
        COMMON_OPTIONS.CUPS,
        COMMON_OPTIONS.SWEETS
      ]
  },
  {
      id: 'deluxe-15',
      name: 'Deluxe de 15 años',
      subtitle: 'En bandeja artesanal de madera',
      description: DELUXE_15_DESCRIPTION,
      price: 130000,
      category: ProductCategory.BREAKFAST,
      image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/ltzlicpfCBcOMPXpGot_Q.png?size=2000x2000',
      tags: ['ENVÍO GRATIS'],
       galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/ltzlicpfCBcOMPXpGot_Q.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/j4pAf9iBTaiHDM0TwUznT.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/qPm2JDYMqCbCxOfdt9Gzu.png?size=2000x2000'],
       options: [
         COMMON_OPTIONS.PRESENTATION,
         COMMON_OPTIONS.BALLOON_PHRASE,
         COMMON_OPTIONS.CAKES,
         COMMON_OPTIONS.CUPS,
         COMMON_OPTIONS.SWEETS
       ]
  },
  {
      id: 'artesanal-compartir',
      name: 'Artesanal para compartir',
      subtitle: '¡Super abundante!',
      description: ARTESANAL_COMPARTIR_DESCRIPTION,
      price: 63000,
      category: ProductCategory.BREAKFAST,
      image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/0cYeZ1xz0AKk5duyGBvZp.png?size=2000x2000',
      galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/0cYeZ1xz0AKk5duyGBvZp.png?size=2000x2000','https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/rJM0b2AanNwNthaEUwwxb.png?size=2000x2000','https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/g8gECYrHXWdZTcurimSsP.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/l9ijvM9Vg8QwO3yRlSpEo.png?size=2000x2000'],
      options: [
        COMMON_OPTIONS.PRESENTATION,
        COMMON_OPTIONS.BALLOON_PHRASE,
        COMMON_OPTIONS.CUPS,
        COMMON_OPTIONS.MATES,
        COMMON_OPTIONS.TRAYS
      ]
  },
  {
      id: 'caja-tentacion',
      name: 'Caja Tentación',
      description: CAJA_TENTACION_DESCRIPTION,
      price: 45000,
      category: ProductCategory.BREAKFAST,
      image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1758998891698-19919.png?size=2000x2000',
      galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1758998891698-19919.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1758998891698-72865.png?size=2000x2000'],
      options: [
        COMMON_OPTIONS.PRESENTATION,
        COMMON_OPTIONS.BALLOON_PHRASE,
        COMMON_OPTIONS.CAKES,
        COMMON_OPTIONS.SWEETS
      ]
  },
  {
      id: 'sin-tacc',
      name: 'Sin TACC Clásico',
      description: SIN_TACC_DESCRIPTION,
      price: 59000,
      category: ProductCategory.BREAKFAST,
      image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1730044923948-70871.png?size=2000x2000',
      tags: ['SIN TACC'],
      options: [
        COMMON_OPTIONS.PRESENTATION,
        COMMON_OPTIONS.BALLOON_PHRASE,
        COMMON_OPTIONS.CUPS,
        COMMON_OPTIONS.DRINKS
      ]
  },
  {
      id: 'saludable',
      name: 'Desayuno Saludable',
      description: SALUDABLE_DESCRIPTION,
      price: 65000,
      category: ProductCategory.BREAKFAST,
      image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/tk8VmYIxL_S0CKfPjzEsJ.png?size=2000x2000',
      galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/tk8VmYIxL_S0CKfPjzEsJ.png?size=2000x2000','https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1n87YOHhbEIWSy8kDyL0e.png?size=2000x2000','https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/3cifotpQPF_vt39QjBecv.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/fbtLjL8oFD4OEIj1FxXkn.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/Ikn3XT0OYbgg-AD8uDi7F.png?size=2000x2000'],
      tags: ['FIT'],
      options: [
        COMMON_OPTIONS.PRESENTATION,
        COMMON_OPTIONS.BALLOON_PHRASE,
        COMMON_OPTIONS.DRINKS,
        COMMON_OPTIONS.TRAYS
      ]
  },
];
