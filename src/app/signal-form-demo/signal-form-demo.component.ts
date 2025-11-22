import { JsonPipe } from '@angular/common';
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  form,
  Field,
  required,
  email,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  validate,
  customError,
} from '@angular/forms/signals';

interface UserRegistrationData {
  // Text inputs
  firstName: string;
  lastName: string;
  username: string;

  // Email
  email: string;

  // Number
  age: number;

  // Date and time
  birthdate: string;
  preferredTime: string;

  // Textarea
  bio: string;

  // Password fields for custom validation
  password: string;
  confirmPassword: string;

  // Checkboxes
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  agreeToTerms: boolean;

  // Radio buttons
  subscriptionPlan: string;

  // Select
  country: string;
}

@Component({
  selector: 'app-signal-form-demo',
  templateUrl: './signal-form-demo.component.html',
  styleUrl: './signal-form-demo.component.css',
  imports: [Field, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormDemoComponent {
  // Countries for select dropdown
  countries = [
    { code: '', name: 'Select a country' },
    { code: 'us', name: 'United States' },
    { code: 'ca', name: 'Canada' },
    { code: 'mx', name: 'Mexico' },
    { code: 'uk', name: 'United Kingdom' },
    { code: 'de', name: 'Germany' },
    { code: 'fr', name: 'France' },
    { code: 'es', name: 'Spain' },
    { code: 'it', name: 'Italy' },
    { code: 'jp', name: 'Japan' },
    { code: 'au', name: 'Australia' },
  ];

  // Initial form model
  private initialModel: UserRegistrationData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    age: 0,
    birthdate: '',
    preferredTime: '',
    bio: '',
    password: '',
    confirmPassword: '',
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false,
    agreeToTerms: false,
    subscriptionPlan: '',
    country: '',
  };

  // Form model signal
  userModel = signal<UserRegistrationData>({ ...this.initialModel });

  // Submitted data signal
  submittedData = signal<UserRegistrationData | null>(null);

  // Create form with validations
  userForm = form(this.userModel, (schemaPath) => {
    // Text inputs - required with length constraints
    required(schemaPath.firstName, { message: 'First name is required' });
    minLength(schemaPath.firstName, 2, { message: 'First name must be at least 2 characters' });
    maxLength(schemaPath.firstName, 50, { message: 'First name must not exceed 50 characters' });

    required(schemaPath.lastName, { message: 'Last name is required' });
    minLength(schemaPath.lastName, 2, { message: 'Last name must be at least 2 characters' });
    maxLength(schemaPath.lastName, 50, { message: 'Last name must not exceed 50 characters' });

    required(schemaPath.username, { message: 'Username is required' });
    minLength(schemaPath.username, 3, { message: 'Username must be at least 3 characters' });
    maxLength(schemaPath.username, 20, { message: 'Username must not exceed 20 characters' });
    pattern(schemaPath.username, /^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    });

    // Email validation
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Please enter a valid email address' });

    // Number validation with min/max
    required(schemaPath.age, { message: 'Age is required' });
    min(schemaPath.age, 18, { message: 'You must be at least 18 years old' });
    max(schemaPath.age, 120, { message: 'Please enter a valid age' });

    // Date validation
    required(schemaPath.birthdate, { message: 'Birthdate is required' });
    // validate(schemaPath.birthdate, (value) => {
    //   if (!value) return null;
    //   const selectedDate = new Date(value);
    //   const today = new Date();
    //   const age = today.getFullYear() - selectedDate.getFullYear();
    //   if (age < 18) {
    //     return customError({ kind: 'age', message: 'You must be at least 18 years old' });
    //   }
    //   if (selectedDate > today) {
    //     return customError({ kind: 'future', message: 'Birthdate cannot be in the future' });
    //   }
    //   return null;
    // });

    // Time validation
    required(schemaPath.preferredTime, { message: 'Preferred time is required' });

    // Textarea with max length
    required(schemaPath.bio, { message: 'Bio is required' });
    minLength(schemaPath.bio, 10, { message: 'Bio must be at least 10 characters' });
    maxLength(schemaPath.bio, 500, { message: 'Bio must not exceed 500 characters' });

    // Password validation
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' });
    pattern(schemaPath.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message: 'Password must contain uppercase, lowercase, number, and special character',
    });

    // Confirm password - custom cross-field validation
    required(schemaPath.confirmPassword, { message: 'Please confirm your password' });
    // validate(schemaPath.confirmPassword, (confirmValue) => {
    //   const passwordValue = this.userForm.password().value();
    //   if (confirmValue !== passwordValue) {
    //     return customError({
    //       kind: 'passwordMismatch',
    //       message: 'Passwords do not match',
    //     });
    //   }
    //   return null;
    // });

    // Checkbox validation - at least one notification method
    validate(schemaPath.emailNotifications, () => {
      const hasNotification =
        this.userForm.emailNotifications().value() ||
        this.userForm.smsNotifications().value() ||
        this.userForm.pushNotifications().value();

      if (!hasNotification) {
        return customError({
          kind: 'noNotification',
          message: 'Please select at least one notification method',
        });
      }
      return null;
    });

    // Terms agreement required
    validate(schemaPath.agreeToTerms, (value) => {
      if (!value) {
        return customError({
          kind: 'termsRequired',
          message: 'You must agree to the terms and conditions',
        });
      }
      return null;
    });

    // Radio button validation
    required(schemaPath.subscriptionPlan, { message: 'Please select a subscription plan' });

    // Select validation
    required(schemaPath.country, { message: 'Please select your country' });
  });

  onSubmit(event: Event) {
    event.preventDefault();

    // Mark all fields as touched to show validation errors
    this.touchAllFields();

    // Check if form is valid
    if (this.userForm().valid()) {
      const formData = this.userModel();
      console.log('Form submitted successfully:', formData);
      this.submittedData.set(formData);
    } else {
      console.log('Form has validation errors');
      this.submittedData.set(null);
    }
  }

  resetForm() {
    // Reset the model to initial values
    this.userModel.set({ ...this.initialModel });
    this.submittedData.set(null);
    console.log('Form reset to initial state');
  }

  fillSampleData() {
    this.userModel.set({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe123',
      email: 'john.doe@example.com',
      age: 25,
      birthdate: '1999-01-15',
      preferredTime: '14:30',
      bio: 'I am a software developer passionate about web technologies and building amazing user experiences.',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      agreeToTerms: true,
      subscriptionPlan: 'premium',
      country: 'us',
    });
    console.log('Sample data filled');
  }

  private touchAllFields() {
    // Helper method to mark all fields as touched
    this.userForm.firstName().markAsTouched();
    this.userForm.lastName().markAsTouched();
    this.userForm.username().markAsTouched();
    this.userForm.email().markAsTouched();
    this.userForm.age().markAsTouched();
    this.userForm.birthdate().markAsTouched();
    this.userForm.preferredTime().markAsTouched();
    this.userForm.bio().markAsTouched();
    this.userForm.password().markAsTouched();
    this.userForm.confirmPassword().markAsTouched();
    this.userForm.emailNotifications().markAsTouched();
    this.userForm.smsNotifications().markAsTouched();
    this.userForm.pushNotifications().markAsTouched();
    this.userForm.agreeToTerms().markAsTouched();
    this.userForm.subscriptionPlan().markAsTouched();
    this.userForm.country().markAsTouched();
  }
}
