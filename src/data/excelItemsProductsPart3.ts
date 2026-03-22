import { Product } from '../../types';
import { NEW_OPTIONS_PART3 } from './newOptionsPart3';

export const EXCEL_ITEMS_PRODUCTS_PART3: Product[] = NEW_OPTIONS_PART3.flatMap(option => 
  option.values.map(val => ({
    id: val.id,
    name: val.name,
    description: `Categoría: ${option.name}`,
    price: val.price || 0,
    category: option.name,
    image: `https://picsum.photos/seed/${val.id}/800/600`,
    stock: val.stock ?? 0,
    isHidden: (val.stock === 0)
  }))
);
