import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoanCalculatorComponent } from './loan-calculator.component';

describe('LoanCalculatorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanCalculatorComponent],
      providers: [
        provideRouter([
          { path: 'loan-prepayment-calculator', component: LoanCalculatorComponent },
          { path: '**', component: LoanCalculatorComponent }
        ])
      ]
    }).compileComponents();
  });

  it('should create the loan calculator component', () => {
    const fixture = TestBed.createComponent(LoanCalculatorComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });

  it('should initialize with benchmark home loan default parameters', () => {
    const fixture = TestBed.createComponent(LoanCalculatorComponent);
    const comp = fixture.componentInstance;
    const state = comp.state();

    expect(state.loanAmount).toBe(5000000);
    expect(state.annualInterestRate).toBe(8.5);
    expect(state.tenureYears).toBe(20);
    expect(state.oneTimePrepaymentAmount).toBe(500000);
    expect(state.oneTimePrepaymentMonth).toBe(36);
    expect(state.prepaymentMode).toBe('reduce-tenure');
  });

  it('should compute valid simulation with substantial interest savings', () => {
    const fixture = TestBed.createComponent(LoanCalculatorComponent);
    const comp = fixture.componentInstance;
    const sim = comp.simulation();

    expect(Math.round(sim.originalLoan.monthlyEmi)).toBe(43391);
    expect(sim.interestSaved).toBeGreaterThan(1150000);
    expect(sim.monthsSaved).toBeGreaterThanOrEqual(40);
    expect(sim.prepaidLoan.tenureMonths).toBeLessThan(240);
  });

  it('should switch presets between Home, Car, and Personal Loans correctly', () => {
    const fixture = TestBed.createComponent(LoanCalculatorComponent);
    const comp = fixture.componentInstance;

    comp.setPreset('car');
    expect(comp.state().loanAmount).toBe(1200000);
    expect(comp.state().annualInterestRate).toBe(9.0);
    expect(comp.state().tenureYears).toBe(5);

    comp.setPreset('personal');
    expect(comp.state().loanAmount).toBe(500000);
    expect(comp.state().annualInterestRate).toBe(12.0);
    expect(comp.state().tenureYears).toBe(3);
  });

  it('should apply interactive "What If" scenarios immediately', () => {
    const fixture = TestBed.createComponent(LoanCalculatorComponent);
    const comp = fixture.componentInstance;

    comp.applyWhatIfScenario('prepay-1l-yearly');
    expect(comp.state().recurringPrepaymentAmount).toBe(100000);
    expect(comp.state().prepaymentFrequency).toBe('annually');
    expect(comp.simulation().interestSaved).toBeGreaterThan(0);

    comp.applyWhatIfScenario('extra-5k-emi');
    expect(comp.state().annualEmiIncreaseAmount).toBe(5000);
  });

  it('should toggle schedule view mode and change chart tabs', () => {
    const fixture = TestBed.createComponent(LoanCalculatorComponent);
    const comp = fixture.componentInstance;

    comp.setScheduleView('annual');
    expect(comp.scheduleViewMode()).toBe('annual');

    comp.setScheduleView('monthly');
    expect(comp.scheduleViewMode()).toBe('monthly');

    comp.setChartTab('breakdown');
    expect(comp.activeChartTab()).toBe('breakdown');

    comp.setChartTab('cumulative-interest');
    expect(comp.activeChartTab()).toBe('cumulative-interest');

    comp.setChartTab('annual-bar');
    expect(comp.activeChartTab()).toBe('annual-bar');

    comp.setChartTab('balance');
    expect(comp.activeChartTab()).toBe('balance');
  });

  it('should support opting out of prepayment simulation with clean zero-savings fallback', () => {
    const fixture = TestBed.createComponent(LoanCalculatorComponent);
    const comp = fixture.componentInstance;

    expect(comp.hasPrepayment()).toBe(true);

    // Opt out of prepayment
    comp.updateField('enablePrepayment', false);
    expect(comp.hasPrepayment()).toBe(false);
    expect(comp.simulation().interestSaved).toBe(0);
    expect(comp.simulation().monthsSaved).toBe(0);
    expect(comp.simulation().prepaidLoan.monthlyEmi).toBe(comp.simulation().originalLoan.monthlyEmi);
    expect(comp.simulation().prepaidLoan.totalInterest).toBe(comp.simulation().originalLoan.totalInterest);
  });

  it('should cleanly handle setting prepayment amount to 0', () => {
    const fixture = TestBed.createComponent(LoanCalculatorComponent);
    const comp = fixture.componentInstance;

    comp.updateField('oneTimePrepaymentAmount', 0);
    comp.updateField('recurringPrepaymentAmount', 0);
    comp.updateField('annualEmiIncreaseAmount', 0);
    comp.updateField('annualEmiIncreasePercent', 0);

    expect(comp.hasPrepayment()).toBe(false);
    expect(comp.simulation().interestSaved).toBe(0);
    expect(comp.simulation().monthsSaved).toBe(0);
    expect(comp.simulation().prepaidLoan.tenureMonths).toBe(comp.simulation().originalLoan.tenureMonths);
  });

  it('should allow fluid backspace clearing and typing without premature clamping to 10k', () => {
    const fixture = TestBed.createComponent(LoanCalculatorComponent);
    const comp = fixture.componentInstance;

    // Simulate clearing loan amount input (empty string)
    const emptyEvent = { target: { value: '' } } as any;
    comp.onLoanAmountInput(emptyEvent);
    // Value remains unchanged while input is empty so DOM doesn't get stomped
    expect(comp.state().loanAmount).toBe(5000000);

    // Simulate typing 5000 (which is less than min 10000, e.g. while typing 500000)
    const partialEvent = { target: { value: '5000' } } as any;
    comp.onLoanAmountInput(partialEvent);
    expect(comp.state().loanAmount).toBe(5000); // Does NOT snap to 10000!

    // On blur, if below min (10000), it clamps to 10000
    const blurEvent = { target: { value: '5000' } } as any;
    comp.onLoanAmountBlur(blurEvent);
    expect(comp.state().loanAmount).toBe(10000);
    expect(blurEvent.target.value).toBe('10000');

    // On blur if empty, it restores default for preset (5000000 for home)
    const blurEmptyEvent = { target: { value: '' } } as any;
    comp.onLoanAmountBlur(blurEmptyEvent);
    expect(comp.state().loanAmount).toBe(5000000);
    expect(blurEmptyEvent.target.value).toBe('5000000');
  });

  it('should validate and clamp interest rate and tenure on blur', () => {
    const fixture = TestBed.createComponent(LoanCalculatorComponent);
    const comp = fixture.componentInstance;

    // Interest rate blur with empty input restores default 8.5
    const rateEmptyEvent = { target: { value: '' } } as any;
    comp.onRateBlur(rateEmptyEvent);
    expect(comp.state().annualInterestRate).toBe(8.5);

    // Interest rate > 30 clamps to 30
    const rateHighEvent = { target: { value: '45' } } as any;
    comp.onRateBlur(rateHighEvent);
    expect(comp.state().annualInterestRate).toBe(30);

    // Tenure blur with empty input restores default 20
    const tenureEmptyEvent = { target: { value: '' } } as any;
    comp.onTenureBlur(tenureEmptyEvent);
    expect(comp.state().tenureYears).toBe(20);

    // Tenure > 40 clamps to 40
    const tenureHighEvent = { target: { value: '60' } } as any;
    comp.onTenureBlur(tenureHighEvent);
    expect(comp.state().tenureYears).toBe(40);
  });
});
