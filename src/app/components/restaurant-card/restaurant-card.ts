import { Component, input, model, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { Restaurant } from '../../models/restaurant.model';
import { RouterLink } from '@angular/router';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-restaurant-card',
  styleUrl: './restaurant-card.scss',
  templateUrl: './restaurant-card.html',
})
export class RestaurantCard {
  private description = signal('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
  private canUpdate = signal(true);

  restaurant = model.required<Restaurant>();

  private form = form(this.restaurant);

  private updateRestaurantData() {
    console.log('Updating restaurant data...', this.restaurant());
  }
  // private onDescriptionChange(ev: InputEvent) {
  //   const target = ev.target as HTMLInputElement;
  //   console.log('Description changed', target.value);
  // }
  private onDescriptionChange(val: string) {
    console.log('Description changed', val);
  }
}
