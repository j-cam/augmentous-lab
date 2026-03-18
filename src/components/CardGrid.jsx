import React from 'react';

const products = [
  { id: 1, name: 'Widget A', price: '$19.99', image: '/images/widget-a.jpg' },
  { id: 2, name: 'Widget B', price: '$24.99', image: '/images/widget-b.jpg' },
  { id: 3, name: 'Widget C', price: '$14.99', image: '/images/widget-c.jpg' },
];

export default function CardGrid() {
  return (
    <section className="card-grid">
      <h2>Our Products</h2>
      <div className="grid">
        {products.map((product) => (
          <div className="card" key={product.id}>
            <img src={product.image} />
            <h3>{product.name}</h3>
            <p>{product.price}</p>

            <div
              className="card-action"
              onClick={() => console.log(`Added ${product.name}`)}
            >
              Add to Cart
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
