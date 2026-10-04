import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  // Flagship Loan Prepayment Simulator & Loan Suite
  {
    path: 'loan-prepayment-calculator',
    loadComponent: () =>
      import('./pages/loan-calculator/loan-calculator.component').then(
        m => m.LoanCalculatorComponent
      )
  },
  {
    path: 'emi-calculator',
    loadComponent: () =>
      import('./pages/loan-calculator/loan-calculator.component').then(
        m => m.LoanCalculatorComponent
      )
  },
  {
    path: 'loan-amortization-calculator',
    loadComponent: () =>
      import('./pages/loan-calculator/loan-calculator.component').then(
        m => m.LoanCalculatorComponent
      )
  },
  {
    path: 'loan-calculator',
    loadComponent: () =>
      import('./pages/loan-calculator/loan-calculator.component').then(
        m => m.LoanCalculatorComponent
      )
  },
  {
    path: 'home-loan-calculator',
    loadComponent: () =>
      import('./pages/loan-calculator/loan-calculator.component').then(
        m => m.LoanCalculatorComponent
      )
  },
  {
    path: 'car-loan-calculator',
    loadComponent: () =>
      import('./pages/loan-calculator/loan-calculator.component').then(
        m => m.LoanCalculatorComponent
      )
  },
  // Investment Suite
  {
    path: 'step-up-sip-calculator',
    loadComponent: () =>
      import('./pages/calculator-view/calculator-view.component').then(
        m => m.CalculatorViewComponent
      )
  },
  {
    path: 'step-up-investment-calculator',
    loadComponent: () =>
      import('./pages/calculator-view/calculator-view.component').then(
        m => m.CalculatorViewComponent
      )
  },
  {
    path: 'compound-interest-calculator',
    loadComponent: () =>
      import('./pages/calculator-view/calculator-view.component').then(
        m => m.CalculatorViewComponent
      )
  },
  {
    path: 'compound-calculator',
    loadComponent: () =>
      import('./pages/calculator-view/calculator-view.component').then(
        m => m.CalculatorViewComponent
      )
  },
  {
    path: 'sip-calculator',
    loadComponent: () =>
      import('./pages/calculator-view/calculator-view.component').then(
        m => m.CalculatorViewComponent
      )
  },
  {
    path: 'retirement-calculator',
    loadComponent: () =>
      import('./pages/calculator-view/calculator-view.component').then(
        m => m.CalculatorViewComponent
      )
  },
  {
    path: 'investment-calculator',
    loadComponent: () =>
      import('./pages/calculator-view/calculator-view.component').then(
        m => m.CalculatorViewComponent
      )
  },
  {
    path: 'inflation-calculator',
    loadComponent: () =>
      import('./pages/calculator-view/calculator-view.component').then(
        m => m.CalculatorViewComponent
      )
  },
  {
    path: 'savings-goal-calculator',
    loadComponent: () =>
      import('./pages/calculator-view/calculator-view.component').then(
        m => m.CalculatorViewComponent
      )
  },
  {
    path: 'swp-calculator',
    loadComponent: () =>
      import('./pages/calculator-view/calculator-view.component').then(
        m => m.CalculatorViewComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
