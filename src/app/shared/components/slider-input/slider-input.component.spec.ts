import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderInputComponent } from './slider-input.component';

describe('SliderInputComponent', () => {
  let fixture: ComponentFixture<SliderInputComponent>;
  let component: SliderInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SliderInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'test-input');
    fixture.componentRef.setInput('label', 'Monthly SIP');
    fixture.componentRef.setInput('value', 10000);
    fixture.componentRef.setInput('min', 500);
    fixture.componentRef.setInput('max', 100000);
    fixture.componentRef.setInput('step', 500);
    fixture.detectChanges();
  });

  it('should create and render initial value', () => {
    expect(component).toBeTruthy();
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input[type="number"]');
    expect(inputEl.value).toBe('10000');
  });

  it('should not emit or clamp when user clears the input with backspace', () => {
    let emitted: number | undefined;
    component.valueChange.subscribe(val => (emitted = val));

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input[type="number"]');
    inputEl.value = '';
    component.onTextInput({ target: inputEl } as any);

    // Should NOT emit 500 or 0 while typing
    expect(emitted).toBeUndefined();
  });

  it('should allow typing partial numbers less than min without clamping to min prematurely', () => {
    let emitted: number | undefined;
    component.valueChange.subscribe(val => (emitted = val));

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input[type="number"]');
    // User types '2' (e.g. on the way to typing 2500)
    inputEl.value = '2';
    component.onTextInput({ target: inputEl } as any);

    // Emits 2 for real-time reactivity without clamping to min (500)
    expect(emitted).toBe(2);
  });

  it('should clamp to min on blur if empty or below min', () => {
    let emitted: number | undefined;
    component.valueChange.subscribe(val => (emitted = val));

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input[type="number"]');
    inputEl.value = '';
    component.onTextCommit({ target: inputEl } as any);

    expect(emitted).toBe(500);
    expect(inputEl.value).toBe('500');

    // Below min
    inputEl.value = '200';
    component.onTextCommit({ target: inputEl } as any);
    expect(emitted).toBe(500);
    expect(inputEl.value).toBe('500');
  });

  it('should clamp to max on blur if above max', () => {
    let emitted: number | undefined;
    component.valueChange.subscribe(val => (emitted = val));

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input[type="number"]');
    inputEl.value = '250000';
    component.onTextCommit({ target: inputEl } as any);

    expect(emitted).toBe(100000);
    expect(inputEl.value).toBe('100000');
  });

  it('should emit on slider change', () => {
    let emitted: number | undefined;
    component.valueChange.subscribe(val => (emitted = val));

    const sliderEl: HTMLInputElement = fixture.nativeElement.querySelector('input[type="range"]');
    sliderEl.value = '25000';
    component.onSliderChange({ target: sliderEl } as any);

    expect(emitted).toBe(25000);
  });
});
