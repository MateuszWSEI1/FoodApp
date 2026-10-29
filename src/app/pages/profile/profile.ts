import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Address } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html'
})
export class Profile {
  private auth = inject(AuthService);

  name = '';
  email = '';
  phone = '';
  street = '';
  buildingNumber = '';
  apartmentNumber = '';
  postalCode = '';
  city = '';
  message = '';
  error = '';

  constructor() {
    const user = this.auth.currentUser();

    if (user) {
      this.name = user.name;
      this.email = user.email;
      this.phone = user.phone ?? '';

      const address = user.deliveryAddress;

      if (address) {
        this.street = address.street;
        this.buildingNumber = address.buildingNumber;
        this.apartmentNumber = address.apartmentNumber ?? '';
        this.postalCode = address.postalCode;
        this.city = address.city;
      }
    }
  }

  save(): void {
    this.message = '';
    this.error = '';

    try {
      const user = this.auth.currentUser();

      if (!user) {
        throw new Error('Musisz się zalogować.');
      }

      let address: Address | undefined;

      if (user.role === 'customer') {
        address = {
          street: this.street,
          buildingNumber: this.buildingNumber,
          apartmentNumber: this.apartmentNumber || undefined,
          postalCode: this.postalCode,
          city: this.city
        };
      }

      this.auth.updateProfile(
        this.name,
        this.email,
        this.phone || undefined,
        address
      );

      this.message = 'Profil został zapisany.';
    } catch (error) {
      this.error = error instanceof Error
        ? error.message
        : 'Nie udało się zapisać profilu.';
    }
  }

  get role(): string {
    return this.auth.currentUser()?.role ?? '';
  }
}