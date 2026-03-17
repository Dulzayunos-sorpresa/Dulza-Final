import { ProductOption } from '../types';

export const COMMON_OPTIONS: Record<string, ProductOption> = {
  PRESENTATION: {
    id: 'presentacion',
    name: 'Presentaciones',
    type: 'select',
    values: [
      { name: 'Con miniglobo de regalo', price: 0 },
      { name: 'Con 1 globo metalizado grande', price: 7000 },
      { name: 'Con 2 globos metalizados clásico o 1 globo con frase personalizada', price: 12000 },
      { name: 'Con globo grande burbuja aerostático', price: 22000 },
      { name: 'Con globo grande burbuja aerostático PERSONALIZADO', price: 27000 },
    ]
  },
  BALLOON_PHRASE: {
    id: 'frase-globo',
    name: '🎈Frase de tu globo',
    type: 'multi-select',
    maxSelections: 2,
    values: [
      { name: 'Feliz cumple / cumpleaños' },
      { name: 'Feliz día mamá' },
      { name: 'Feliz aniversario' },
      { name: 'Feliz día' },
      { name: 'Felicidades' },
      { name: 'Te amo' },
      { name: 'Te amamos' },
      { name: 'Te quiero' },
      { name: 'Mis 15 Años' },
      { name: 'Bienvenido/a' },
    ]
  },
  CAKES: {
    id: 'tortas',
    name: '🍰 Elegí tu torta!',
    type: 'select',
    values: [
      { name: 'Minitorta Chocotorta', price: 8500 },
      { name: 'Minitorta Oreo', price: 8500 },
      { name: 'Minitorta Lemon Pie', price: 7500 },
      { name: 'Minitorta Cheesecake Frutos Rojos', price: 9500 },
      { name: 'Minitorta Brownie con Dulce de Leche', price: 8000 },
      { name: 'Minitorta Rogel', price: 7500 },
    ]
  },
  CUPS: {
    id: 'tazas',
    name: '☕ Tazas y Tazones',
    type: 'multi-select',
    maxSelections: 2,
    values: [
      { name: '☕🤍Tazón artesanal línea PREMIUM (cerámica)', price: 18166.50 },
      { name: '☕🤍Taza cerámica romántica (modelos surtidos)', price: 11500 },
      { name: '☕🤍Taza cerámica MAMÁ', price: 10500 },
      { name: '☕🤍Taza cerámica Boca', price: 14000 },
      { name: '☕🤍Taza cerámica River', price: 13650 },
      { name: '☕🤍Taza cerámica Talleres', price: 13650 },
      { name: '☕🤍Taza cerámica Belgrano', price: 14000 },
      { name: '☕🤍Taza Stitch (cerámica)', price: 16500 },
      { name: '☕🤍Tazón Stitch celeste', price: 19500 },
      { name: '☕🤍Taza cerámica Angel (Novia de stitch)', price: 16500 },
      { name: '☕TAZA cerámica de café CON PLATO', price: 16500 },
      { name: '☕🤍Taza cerámica LABUBU', price: 12650 },
      { name: '☕🤍Taza cerámica CARPI-UCCINO CAPIBARA', price: 12650 },
      { name: '☕CALDERO cerámico HARRY POTTER 500ml', price: 38500 },
    ]
  },
  DRINKS: {
    id: 'bebidas',
    name: '🥤 Bebidas Adicionales',
    type: 'multi-select',
    values: [
      { name: 'Jugo de Naranja Natural 500ml', price: 3500 },
      { name: 'Leche Chocolatada 250ml', price: 2200 },
      { name: 'Café en saquitos (x2)', price: 1500 },
      { name: 'Té de hierbas surtidos (x4)', price: 1200 },
      { name: 'Yogur con cereales', price: 2800 },
    ]
  },
  SWEETS: {
    id: 'dulces',
    name: '🍫 Dulces y Chocolates',
    type: 'multi-select',
    values: [
      { name: 'Caja de Bombones Ferrero Rocher x3', price: 5500 },
      { name: 'Caja de Bombones Ferrero Rocher x8', price: 12500 },
      { name: 'Tableta de Chocolate Milka 100g', price: 3200 },
      { name: 'Alfajor Artesanal Premium', price: 1800 },
      { name: 'Caja de Macarons x6', price: 9500 },
    ]
  },
  MATES: {
    id: 'mates',
    name: '🧉Mates - Set materos',
    type: 'multi-select',
    maxSelections: 2,
    values: [
      { name: '🧉Mate IMPERIAL Premium', price: 24650 },
      { name: '🧉Mate PREMIUM (con bombilla)', price: 18650 },
      { name: '🧉Mate térmico color ROSA (con bombilla)', price: 14650 },
      { name: '🧉Mate cerámico PAPÁ (con bombilla)', price: 10229 },
      { name: '🤍Set de yerbera y azucarera metálica', price: 17649 },
    ]
  },
  TRAYS: {
    id: 'bandejas',
    name: '🍱Bandejas desayunadoras',
    type: 'multi-select',
    values: [
      { name: '🤍Bandeja desayunadora pequeña "TE QUEREMOS MUCHO"', price: 13500 },
      { name: '🤍Bandeja desayunadora mediana "FELIZ DÍA"', price: 16500 },
      { name: '🤍Bandeja PREMIUM ESPEJADA RENTANGULAR PLATEADA', price: 25000 },
      { name: '🤍Bandeja desayunadora PREMIUM de cama (CON PATAS)', price: 24500 },
    ]
  }
};
