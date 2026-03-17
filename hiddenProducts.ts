import { Product, ProductCategory } from './types';

// Store products here that you want to hide from the active catalog
// To hide a product: Cut the product object from MOCK_PRODUCTS in context/store.tsx and paste it here.

export const HIDDEN_PRODUCTS: Product[] = [
    {
        id: 'desayuno-ejemplo-oculto',
        name: 'Desayuno Box Ejemplo (Archivado)',
        subtitle: 'Este producto no es visible en la web',
        description: "Este es un ejemplo de cómo guardar un desayuno en este archivo.\n\nPara reactivarlo, simplemente copia este objeto y pegalo nuevamente en el archivo context/store.tsx",
        price: 0,
        category: ProductCategory.BREAKFAST,
        image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1740743569577-76706.png?size=2000x2000',
        tags: ['OCULTO'],
    },
    {
        id: 'river-picada',
    name: 'Picada Millonaria (River)',
    description: "Para el hincha millonario que vibra con la banda roja, que celebra cada partido como una final y que merece una picada tan gloriosa como su pasión. Ideal para mirar el partido, festejar o simplemente disfrutar como un verdadero fanático.\n\nEste regalo espectacular es ideal para comer 2 personas abundante e incluye:\n🍷Vino Escorihuela Gascón o lata de cerveza (o reemplazo a elección abonando la diferencia)\n🍖 Salame de la colonia\n🧀 Surtido de quesos regionales\n🥓 Surtido de embutidos regionales\n🫒 Aceitunas\n🥨 Snack salado \n🥜 Frutos secos\n🧄 Mayonesa de ajo\n🥄 Mayonesa clásica\n🥖 Pan fresco\n🍟 Papas fritas\n❤️🤍Cookie temática de River\n🎈 3 globos metalizados\n❤️🤍 Decoración especial de River\n🏷️ Stickers temáticos + tarjeta para el hincha\n\nUna experiencia gastronómica digna del más grande!",
    price: 78900,
    category: ProductCategory.FOOTBALL,
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/ZhJGXDhSZ-_Bu2UX4qk_b.png?size=2000x2000',
    galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/ZhJGXDhSZ-_Bu2UX4qk_b.png?size=2000x2000','https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/Sd86HPAQBUTxgg3w5c_qm.png?size=2000x2000'],
    },
    {
    id: 'boca-picada',
    name: 'Picada Bostera (Boca)',
    description: "Para el hincha xeneize que siente la Bombonera en el pecho, que vive el fútbol con intensidad y que merece una picada azul y oro a la altura de su pasión. Perfecta para mirar el partido o compartir entre gritos de “¡Dale Bo!”\n\nEste regalo espectacular es ideal para comer 2 personas abundante e incluye:\n🍷Vino Escorihuela Gascón o lata de cerveza (o reemplazo a elección abonando la diferencia)\n🍖 Salame de la colonia\n🧀 Surtido de quesos regionales\n🥓 Surtido de embutidos regionales\n🫒 Aceitunas\n🥨 Snack salado \n🥜 Frutos secos\n🧄 Mayonesa de ajo\n🥄 Mayonesa clásica\n🥖 Pan fresco\n🍟 Papas fritas\n💙💛Cookie temática de Boca\n🎈 3 globos metalizados\n💙💛 Decoración especial de Boca Juniors\n🏷️ Stickers temáticos + tarjeta para el hincha\n\nLa picada ideal para un verdadero hincha de azul y oro!",
    price: 78600,
    category: ProductCategory.FOOTBALL,
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/SkVkdY_swpYan4ZjQYwYK.png?size=2000x2000',
    galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/SkVkdY_swpYan4ZjQYwYK.png?size=2000x2000','https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1mAuXCUWPmDP10moJ5c6q.png?size=2000x2000'],
    },
    {
    id: 'talleres-picada',
    name: 'Picada Matadora (Talleres)',
    description: "Para el fanático albiazul que respira Talleres, que late al ritmo del Matador y que disfruta cada momento de cancha. Una picada que combina sabor y pasión, perfecta para alentar desde casa.\n\nEste regalo espectacular es ideal para comer 2 personas abundante e incluye:\n🍷Vino Escorihuela Gascón o lata de cerveza (o reemplazo a elección abonando la diferencia)\n🍖 Salame de la colonia\n🧀 Surtido de quesos regionales\n🥓 Surtido de embutidos regionales\n🫒 Aceitunas\n🥨 Snack salado\n🥜 Frutos secos\n🧄 Mayonesa de ajo\n🥄 Mayonesa clásica\n🥖 Pan fresco\n🍟 Papas fritas\n🔵⚪Cookie temática de Talleres\n🎈 3 globos metalizados\n🔵⚪ Decoración especial de Talleres\n🏷️ Stickers temáticos + tarjeta para el hincha\n\nUna picada matadora para un hincha que nunca abandona!",
    price: 78900,
    category: ProductCategory.FOOTBALL,
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/YzAEl29ZgD64Puevcb6xP.png?size=2000x2000',
    galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/YzAEl29ZgD64Puevcb6xP.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/xfOwRGgFlc5OLsI3wYwXP.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/WwWnkSsKwJNVM8jjqP46i.png?size=2000x2000'],
  },
  {
    id: 'instituto-picada',
    name: 'Picada Gloriosa (Instituto)',
    description: "Para el glorioso que alienta desde Alta Córdoba hasta donde esté, que vive cada partido con el corazón rojo y blanco. Una picada que acompaña la pasión, los festejos y los buenos momentos.\n\nEste regalo espectacular es ideal para comer 2 personas abundante e incluye:\n🍷Vino Escorihuela Gascón o lata de cerveza (o reemplazo a elección abonando la diferencia)\n🍖 Salame de la colonia\n🧀 Surtido de quesos regionales\n🥓 Surtido de embutidos regionales\n🫒 Aceitunas\n🥨 Snack salado\n🥜 Frutos secos\n🧄 Mayonesa de ajo\n🥄 Mayonesa clásica\n🥖 Pan fresco\n🍟 Papas fritas\n❤️🤍Cookie temática de Instituto\n🎈 3 globos metalizados\n❤️🤍 Decoración especial de Instituto\n🏷️ Stickers temáticos + tarjeta para el hincha\n\nUna picada gloriosa para hinchas que sienten la camiseta de verdad.",
    price: 78900,
    category: ProductCategory.FOOTBALL,
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/Je4CNaOPtyejvxM3Lat5D.png?size=2000x2000',
  },
  {
    id: 'belgrano-picada',
    name: 'Picada Pirata (Belgrano)',
    description: "Para el pirata que lleva el celeste en el alma, que vive cada partido con emoción y que disfruta celebrar con una buena picada mientras alienta a Belgrano. Ideal para compartir en familia o entre hinchas del gigante Alberdi.\n    \n    Este regalo espectacular es ideal para comer 2 personas abundante e incluye:\n    \n    🍷Vino Escorihuela Gascón o lata de cerveza (o reemplazo a elección abonando la diferencia)\n    🍖 Salame de la colonia\n    🧀 Surtido de quesos regionales\n    🥓 Surtido de embutidos regionales\n    🫒 Aceitunas\n    🥨 Snack salado\n    🥜 Frutos secos\n    🧄 Mayonesa de ajo\n    🥄 Mayonesa clásica\n    🥖 Pan fresco\n    🍟 Papas fritas\n    ⚽Cookie temática de Belgrano\n    🎈 3 globos metalizados\n    ⚽⚪ Decoración especial de Belgrano\n    🏷️ Stickers temáticos + tarjeta para el hincha\n    \n    Para vivir la pasión pirata… ¡con mucho sabor!",
    price: 78900,
    category: ProductCategory.FOOTBALL,
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/URkluBmdQcBfcBP0oSbKf.png?size=2000x2000',
  },
  {
    id: 'magic-flor',
    name: 'Caja Mágica FLOR AMARILLA',
    description: "✨CAJA MÁGICA FLOR AMARILLA✨\n\nUn regalo lleno de alegría y color 💛✨\nInspirado en la energía del sol y la ternura de las flores, este box combina sabores deliciosos y detalles adorables que iluminan el día de quien lo recibe.\n\nEste MEGA REGALO Incluye:\n👑 Peluche disfrazado (podés consultar modelos disponibles y elegir el que más te guste)\n👑 Cookie artesanal de flor🌻\n👑 Papas Fritas chips\n👑 Alfajor Bon o Bon\n👑 Bolsita de gomitas dulces (surtidas)\n👑 Pochoclos dulces\n👑 Aritos de cereales\n👑 Juguito \n👑Leche chocolatada\n👑 Cookies de chocolate\n👑 Ramo de margaritas decorativas\n👑Globo de regalo: Flor amarilla\n\n✨ Ideal para regalar buena energía, amor y dulzura en un detalle que transmite felicidad...",
    price: 58900,
    category: ProductCategory.KIDS,
    image: 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/AVLzpZNrouZcaIM6pwCKP.png?size=2000x2000',
    galleryImages: ['https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/AVLzpZNrouZcaIM6pwCKP.png?size=2000x2000', 'https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/ncsYKghEccJrWGSQwSq30.png?size=2000x2000'],
    tags: ['MÁS VENDIDO'],
  },
];