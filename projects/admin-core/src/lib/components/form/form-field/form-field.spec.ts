import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldComponent } from './form-field';
import { FormControl, Validators } from '@angular/forms';

describe('FormFieldComponent Validation Engine', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
  });

  it('detects isRequired from standalone required input', () => {
    fixture.componentRef.setInput('required', true);
    expect(component.isRequired()).toBe(true);
  });

  it('detects isRequired automatically from Reactive FormControl with Validators.required', () => {
    const control = new FormControl('', [Validators.required]);
    fixture.componentRef.setInput('control', control);
    expect(component.isRequired()).toBe(true);
  });

  it('isValueEmpty detects empty strings and nulls', () => {
    fixture.componentRef.setInput('value', '');
    expect(component.isValueEmpty()).toBe(true);

    fixture.componentRef.setInput('value', '   ');
    expect(component.isValueEmpty()).toBe(true);

    fixture.componentRef.setInput('value', 'Valid Text');
    expect(component.isValueEmpty()).toBe(false);
  });

  it('does not show error if required field is untouched', () => {
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('value', '');
    fixture.componentRef.setInput('touched', false);

    expect(component.hasError()).toBe(false);
  });

  it('shows error and required message when required field is touched and empty', () => {
    fixture.componentRef.setInput('label', 'Company Name');
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('value', '');
    fixture.componentRef.setInput('touched', true);

    expect(component.hasError()).toBe(true);
    expect(component.errorMessage()).toBe('Company Name is required');
  });

  it('clears error when touched required field gets a valid value', () => {
    fixture.componentRef.setInput('label', 'Company Name');
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('touched', true);
    fixture.componentRef.setInput('value', 'EasyFlys Ltd');

    expect(component.hasError()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });
});
