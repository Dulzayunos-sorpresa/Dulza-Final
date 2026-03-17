import { Product, ProductCategory } from '../../types';

export const boardProducts: Product[] = [
  {
    id: 'picada-individual',
    name: 'Picada individual',
    subtitle: 'Come 1, pican 2',
    description: "✨Picada Individual✨\n\nUna propuesta pensada para disfrutar sin apuros.\nIdeal para una persona, perfecta para compartir entre dos.\n\nIncluye una cuidada selección de sabores:\n\n• Salame de la colonia\n• Surtido de quesos\n• Surtido de embutidos\n• Aceitunas \n\nAcompañamientos:\n• Papas fritas\n• Pan\n• Salsas: barbacoa o mayonesa de ajo (según disponibilidad) y mayonesa clásica\n\n✨ Opcional: bebida a elección\n\nPresentada en caja de regalo, con moño y tarjeta dedicatoria personalizada.\nPodés sumar globo a elección para completar la experiencia!",
    price: 55000,
    category: ProductCategory.BOARD,
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/-AnREvRsctCPDuXVk_vv1.png?size=2000x2000',
    tags: ['NUEVO'],
  },
  {
    id: 'picada-gourmet',
    name: 'Picada Gourmet',
    subtitle: 'Elegí el tamaño',
    description: "✨Picada Gourmet✨\n\nUna picada pensada para disfrutar, ideal para compartir y descubrir una variedad de sabores regionales cuidadosamente seleccionados.\n\nIncluye una selección gourmet de quesos y fiambres:\n\n• Queso pepato a la pimienta\n• Queso pategrás\n• Queso azul\n• Queso tybo especiado al ají\n• Variedad de fiambres\n• Salame de la colonia\n\nAcompañamientos y delicatessen:\n• Aceitunas\n• Tomates cherry\n• Papas fritas\n• Hummus clásico\n• Hummus de palta\n• Salsas: mayonesa, barbacoa o mayonesa de ajo (según disponibilidad)\n• Frutas de estación o cerezas (según stock)\n\n🎁 Presentación\nServida en tabla de madera, presentada en bolsa de regalo con moño y tarjeta dedicatoria, o en caja con visor.\nPodés sumar globo a elección para completar la experiencia.\n\n📸 Imagen ilustrativa. El diseño de la tabla puede variar según la cantidad de porciones o personas elegida",
    price: 75000,
    category: ProductCategory.BOARD,
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1752079447138-96202.png?size=2000x2000',
    tags: ['NUEVO'],
    galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1752079447138-96202.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1752079447138-72217.png?size=2000x2000'],
  }
];
