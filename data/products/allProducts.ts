import { Product } from '../../types';
import { customProducts } from './custom';
import { valentineProducts } from './valentine';
import { cakesProducts } from './cakes';
import { breakfastProducts } from './breakfast';
import { boardProducts } from './boards';
import { kidsProducts } from './kids';
import { footballProducts } from './football';

export const MOCK_PRODUCTS: Product[] = [
  ...customProducts,
  ...valentineProducts,
  ...cakesProducts,
  ...breakfastProducts,
  ...boardProducts,
  ...kidsProducts,
  ...footballProducts,
];
