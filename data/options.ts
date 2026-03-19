import { ProductOption } from '../types';

export const COMMON_OPTIONS: Record<string, ProductOption> = {
  PRESENTATION: {
    id: 'presentacion',
    name: 'Presentaciones',
    type: 'select',
    values: [
      { id: 'pres-1', name: 'Con miniglobo de regalo', price: 0 },
      { id: 'pres-2', name: 'Con 1 globo metalizado grande', price: 7000 },
      { id: 'pres-3', name: 'Con 2 globos metalizados clásico o 1 globo con frase personalizada', price: 12000 },
      { id: 'pres-4', name: 'Con globo grande burbuja aerostático', price: 22000 },
      { id: 'pres-5', name: 'Con globo grande burbuja aerostático PERSONALIZADO', price: 27000 },
    ]
  },
  BALLOON_PHRASE: {
    id: 'frase-globo',
    name: '🎈Frase de tu globo',
    type: 'multi-select',
    maxSelections: 2,
    values: [
      { id: 'phrase-1', name: 'Feliz cumple / cumpleaños' },
      { id: 'phrase-2', name: 'Feliz día mamá' },
      { id: 'phrase-3', name: 'Feliz aniversario' },
      { id: 'phrase-4', name: 'Feliz día' },
      { id: 'phrase-5', name: 'Felicidades' },
      { id: 'phrase-6', name: 'Te amo' },
      { id: 'phrase-7', name: 'Te amamos' },
      { id: 'phrase-8', name: 'Te quiero' },
      { id: 'phrase-9', name: 'Mis 15 Años' },
      { id: 'phrase-10', name: 'Bienvenido/a' },
    ]
  },
  CAKES: {
    id: 'tortas',
    name: '🍰 Elegí tu torta!',
    type: 'select',
    values: [
      { id: 'cake-1', name: 'Minitorta Chocotorta', price: 8500 },
      { id: 'cake-2', name: 'Minitorta Oreo', price: 8500 },
      { id: 'cake-3', name: 'Minitorta Lemon Pie', price: 7500 },
      { id: 'cake-4', name: 'Minitorta Cheesecake Frutos Rojos', price: 9500 },
      { id: 'cake-5', name: 'Minitorta Brownie con Dulce de Leche', price: 8000 },
      { id: 'cake-6', name: 'Minitorta Rogel', price: 7500 },
    ]
  },
  CUPS: {
    id: 'tazas',
    name: '☕ Tazas y Tazones',
    type: 'multi-select',
    maxSelections: 2,
    values: [
      { id: 'cup-1', name: '☕🤍Tazón artesanal línea PREMIUM (cerámica)', price: 18166.50 },
      { id: 'cup-2', name: '☕🤍Taza cerámica romántica (modelos surtidos)', price: 11500 },
      { id: 'cup-3', name: '☕🤍Taza cerámica MAMÁ', price: 10500 },
      { id: 'cup-4', name: '☕🤍Taza cerámica Boca', price: 14000 },
      { id: 'cup-5', name: '☕🤍Taza cerámica River', price: 13650 },
      { id: 'cup-6', name: '☕🤍Taza cerámica Talleres', price: 13650 },
      { id: 'cup-7', name: '☕🤍Taza cerámica Belgrano', price: 14000 },
      { id: 'cup-8', name: '☕🤍Taza Stitch (cerámica)', price: 16500 },
      { id: 'cup-9', name: '☕🤍Tazón Stitch celeste', price: 19500 },
      { id: 'cup-10', name: '☕🤍Taza cerámica Angel (Novia de stitch)', price: 16500 },
      { id: 'cup-11', name: '☕TAZA cerámica de café CON PLATO', price: 16500 },
      { id: 'cup-12', name: '☕🤍Taza cerámica LABUBU', price: 12650 },
      { id: 'cup-13', name: '☕🤍Taza cerámica CARPI-UCCINO CAPIBARA', price: 12650 },
      { id: 'cup-14', name: '☕CALDERO cerámico HARRY POTTER 500ml', price: 38500 },
    ]
  },
  DRINKS: {
    id: 'bebidas',
    name: '🥤 Bebidas Adicionales',
    type: 'multi-select',
    values: [
      { id: 'drink-1', name: 'Jugo de Naranja Natural 500ml', price: 3500 },
      { id: 'drink-2', name: 'Leche Chocolatada 250ml', price: 2200 },
      { id: 'drink-3', name: 'Café en saquitos (x2)', price: 1500 },
      { id: 'drink-4', name: 'Té de hierbas surtidos (x4)', price: 1200 },
      { id: 'drink-5', name: 'Yogur con cereales', price: 2800 },
    ]
  },
  SWEETS: {
    id: 'dulces',
    name: '🍫 Dulces y Chocolates',
    type: 'multi-select',
    values: [
      { id: 'sweet-1', name: 'Caja de Bombones Ferrero Rocher x3', price: 5500 },
      { id: 'sweet-2', name: 'Caja de Bombones Ferrero Rocher x8', price: 12500 },
      { id: 'sweet-3', name: 'Tableta de Chocolate Milka 100g', price: 3200 },
      { id: 'sweet-4', name: 'Alfajor Artesanal Premium', price: 1800 },
      { id: 'sweet-5', name: 'Caja de Macarons x6', price: 9500 },
    ]
  },
  MATES: {
    id: 'mates',
    name: '🧉Mates - Set materos',
    type: 'multi-select',
    maxSelections: 2,
    values: [
      { id: 'mate-1', name: '🧉Mate IMPERIAL Premium', price: 24650 },
      { id: 'mate-2', name: '🧉Mate PREMIUM (con bombilla)', price: 18650 },
      { id: 'mate-3', name: '🧉Mate térmico color ROSA (con bombilla)', price: 14650 },
      { id: 'mate-4', name: '🧉Mate cerámico PAPÁ (con bombilla)', price: 10229 },
      { id: 'mate-5', name: '🤍Set de yerbera y azucarera metálica', price: 17649 },
    ]
  },
  TRAYS: {
    id: 'bandejas',
    name: '🍱Bandejas desayunadoras',
    type: 'multi-select',
    values: [
      { id: 'tray-1', name: '🤍Bandeja desayunadora pequeña "TE QUEREMOS MUCHO"', price: 13500 },
      { id: 'tray-2', name: '🤍Bandeja desayunadora mediana "FELIZ DÍA"', price: 16500 },
      { id: 'tray-3', name: '🤍Bandeja PREMIUM ESPEJADA RENTANGULAR PLATEADA', price: 25000 },
      { id: 'tray-4', name: '🤍Bandeja desayunadora PREMIUM de cama (CON PATAS)', price: 24500 },
    ]
  }
};
