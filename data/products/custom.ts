import { Product, ProductCategory } from '../../types';
import { PETIT_DESCRIPTION, GRAND_DESCRIPTION } from './descriptions';

export const customProducts: Product[] = [
  { 
    id: 'petit-1', 
    name: 'Personalizado Petit', 
    description: PETIT_DESCRIPTION,
    price: 44000, 
    category: ProductCategory.CUSTOM_BOX, 
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/pNqT99TLAwmGpzZR9QPQX.png?size=2000x2000',
    galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/pNqT99TLAwmGpzZR9QPQX.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/sj7Sma0vlBBJt8ebL2_mo.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/n7-i5klThMf7Ce6iYadlW.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/f518vWMGBQ-8Dz1hMbabo.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/0rcrzEARgnsDNKMdo5fJZ.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/CuOdtGPr9RfIPEkGbV5_L.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/Kp-KYfctzMbrV8n6A93lg.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/m0O2NjEaZPaLwZbeIxnjO.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/v1j2S6TFl3QSBhEU2qhfh.png?size=2000x2000'],
  },
  { 
    id: 'grand-1', 
    name: 'Personalizado Grand', 
    description: GRAND_DESCRIPTION,
    price: 80000, 
    category: ProductCategory.CUSTOM_BOX, 
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/-E9ck5JSeN6G59hflUca2.png?size=2000x2000',
    galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/-E9ck5JSeN6G59hflUca2.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/QjNbvSY3dnCMSNaQhH8tc.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/n7-i5klThMf7Ce6iYadlW.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/f518vWMGBQ-8Dz1hMbabo.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/0rcrzEARgnsDNKMdo5fJZ.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/CuOdtGPr9RfIPEkGbV5_L.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/Kp-KYfctzMbrV8n6A93lg.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/m0O2NjEaZPaLwZbeIxnjO.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/v1j2S6TFl3QSBhEU2qhfh.png?size=2000x2000'],
  },
  { 
    id: 'petit-balloon', 
    name: 'Personalizado Petit con globo aerostático', 
    description: PETIT_DESCRIPTION + "\n\n🎈 Incluye estructura de globo aerostático decorativo.",
    price: 78000, 
    category: ProductCategory.CUSTOM_BOX, 
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/b2eOS3PoSHSbGujtKqxkW.png?size=2000x2000',
    galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/b2eOS3PoSHSbGujtKqxkW.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/lEARquBEAW30IulFsskJV.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/qUt4TjGqh3v7sf57XH7SB.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/n7-i5klThMf7Ce6iYadlW.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/f518vWMGBQ-8Dz1hMbabo.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/0rcrzEARgnsDNKMdo5fJZ.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/CuOdtGPr9RfIPEkGbV5_L.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/Kp-KYfctzMbrV8n6A93lg.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/m0O2NjEaZPaLwZbeIxnjO.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/v1j2S6TFl3QSBhEU2qhfh.png?size=2000x2000'],
  },
  {
    id: 'personalizado-bebe-custom',
    name: 'Personalizado Bienvenido Bebé',
    description: "¿Buscaste y buscaste y no encontraste el regalo perfecto para ese bebé en camino? Llegaste al regalo indicado! \n\nEste regalo es PERSONALIZADO!!! \n\n-Por fuera: elegí la presentación que más te guste (globo con forma de globo aerostático rosa o celeste o globo burbuja con confetti por dentro)\n\n-Por dentro: Elegí lo que te gustaría para el bebé\n-Ajuar de 3 piezas (🍼Body mangas largas tipo \"ranita\", pantaloncito y gorrito)\n-Toallita con forma de elefante \n-Medias de bebé\n\n Elegí tu detalle: con o sin peluche! 🐥🐣🍼 además podés agregar el nombre del recién nacido!!",
    price: 33650,
    category: ProductCategory.CUSTOM_BOX,
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/rgeXlKy8O_tHqUHFm9Bw9.png?size=2000x2000',
  },
];
