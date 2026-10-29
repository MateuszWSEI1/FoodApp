
import { Component, computed, signal } from '@angular/core';
import { RestaurantCard } from '../restaurant-card/restaurant-card';
import data from '../../../data/restaurants.json';
import { Restaurant } from '../../models/restaurant.model';

@Component({
  imports: [RestaurantCard],
  selector: 'app-restaurant-list',
  styleUrl: './restaurant-list.scss',
  templateUrl: './restaurant-list.html',
})
export class RestaurantList {
  readonly restaurants = signal(data as Restaurant[]);
  readonly searchTerm = signal('');
  readonly cuisineFilter = signal('all');
  readonly activeOnly = signal(false);
  readonly sortBy = signal('none');

  readonly visibleRestaurants = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const cuisine = this.cuisineFilter();
    const active = this.activeOnly();
    const sort = this.sortBy();

    return this.restaurants().filter(restaurant => {
      const name = restaurant.name.toLowerCase();
      const text = (restaurant.name + ' ' + restaurant.description).toLowerCase();

      if (!name.includes(search)) return false;
      if (active && !restaurant.isActive) return false;

      if (cuisine === 'burger' && !text.includes('burger')) return false;
      if (cuisine === 'pizza' && !text.includes('pizz')) return false;
      if (cuisine === 'sushi' && !text.includes('sushi')) return false;
      if (cuisine === 'asia' && restaurant.cuisine !== 'chinese' && restaurant.cuisine !== 'thai') return false;
      if (cuisine === 'italian' && restaurant.cuisine !== 'italian') return false;
      if (cuisine === 'polish' && restaurant.cuisine !== 'polish') return false;
      if (cuisine === 'healthy' && !text.includes('fit') && !text.includes('diet') && !text.includes('sałat')) return false;

      return true;
      }).sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'time') return a.deliveryTimeMin - b.deliveryTimeMin;
      if (sort === 'fee') return a.deliveryFee - b.deliveryFee;
      return 0;
    });
  });

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onCuisineChange(event: Event) {
    this.cuisineFilter.set((event.target as HTMLSelectElement).value);
  }

  onStatusChange(event: Event) {
    this.activeOnly.set((event.target as HTMLInputElement).checked);
  }
  onSortChange(event: Event) {
  this.sortBy.set((event.target as HTMLSelectElement).value);
}
resetFilters() {
  this.searchTerm.set('');
  this.cuisineFilter.set('all');
  this.activeOnly.set(false);
  this.sortBy.set('none');
}
}
