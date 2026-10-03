import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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
    path: 'compound-calculator',
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
    path: 'sip-calculator',
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
    path: '**',
    redirectTo: ''
  }
];
