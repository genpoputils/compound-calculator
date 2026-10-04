import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { CurrencyService } from '../../core/services/currency.service';
import { AdBannerComponent } from '../../shared/components/ad-banner/ad-banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AdBannerComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  readonly currencyService = inject(CurrencyService);

  ngOnInit(): void {
    this.seoService.updateMeta({
      title: 'CompoundCalc – Investment, Loan & Financial Decision Calculators',
      description: 'Make smarter financial decisions. Calculate compound interest, SIP returns, step-up investments, and simulate loan prepayments to save lakhs in interest.',
      canonicalUrl: 'https://compoundcalc.genpoputils.com/',
      keywords: 'financial calculator, compound interest calculator, loan prepayment calculator, sip calculator, emi calculator, retirement calculator, investment planning',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CompoundCalc - Financial Calculators & Prepayment Simulator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0'
        }
      }
    });
  }
}
