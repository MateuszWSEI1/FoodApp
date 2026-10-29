
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Restaurant } from '../../models/restaurant.model';
import { Product } from '../../models/product.model';
import { ProductCard } from '../product-card/product-card';
import data from '../../../data/restaurants.json';
import productsData from '../../../data/products.json';

@Component({
  selector: 'app-restaurant-details',
  imports: [RouterLink, ProductCard],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.scss',
})
export class RestaurantDetails {
  route = inject(ActivatedRoute);
  id = Number(this.route.snapshot.paramMap.get('id'));

  restaurant = (data as Restaurant[]).find(r => r.id === this.id);

  products = productsData as Product[];

  categories = [
    { name: 'Mięso', products: this.products.slice(0, 2) },
    { name: 'Produkty podstawowe', products: this.products.slice(2, 5) },
    { name: 'Warzywa', products: this.products.slice(5, 7) },
    { name: 'Dodatki', products: this.products.slice(7, 10) }
  ];

  cartCount = 0;

  addToCart(product: Product) {
    if (product.availability) {
      this.cartCount++;
    }
  }
}
