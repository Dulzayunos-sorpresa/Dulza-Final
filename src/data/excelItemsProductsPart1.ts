import { Product } from '../../types';
import { NEW_OPTIONS } from './newOptions';

export const EXCEL_ITEMS_PRODUCTS_PART1: Product[] = NEW_OPTIONS.flatMap(option => 
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
