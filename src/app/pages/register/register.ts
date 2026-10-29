import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  street = '';
  buildingNumber = '';
  apartmentNumber = '';
  postalCode = '';
  city = '';
  error = '';

  async submit(): Promise<void> {
    this.error = '';

    try {
      await this.auth.register(
        this.name,
        this.email,
        this.password,
        {
          street: this.street,
          buildingNumber: this.buildingNumber,
          apartmentNumber: this.apartmentNumber || undefined,
          postalCode: this.postalCode,
          city: this.city
        }
      );

      await this.router.navigate(['/login']);
    } catch (error) {
      this.error = error instanceof Error
        ? error.message
        : 'Nie udało się utworzyć konta.';
    }
  }
}