import { ProductList } from '@/features/products/product-list/product-list';
import { ProductsProvider } from '@/features/products/stores/products-store';
import { getProducts } from '@/features/products/api/get-products';

export default function Home() {
  return (
    <main className="w-full px-4 py-6 md:py-[50px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <ProductsProvider initialProducts={getProducts()}>
          <ProductList />
        </ProductsProvider>
      </div>
    </main>
  );
}
