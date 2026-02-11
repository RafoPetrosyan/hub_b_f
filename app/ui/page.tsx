'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Input,
  Select,
  Checkbox,
  Button,
  DatePicker,
  Textarea,
  Switch,
  Radio,
  SelectOption,
  RadioOption,
} from '@/components/ui';

export default function UIPage() {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [textareaValue, setTextareaValue] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);

  const selectOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const radioOptions: RadioOption[] = [
    { value: 'radio1', label: 'Radio Option 1' },
    { value: 'radio2', label: 'Radio Option 2' },
    { value: 'radio3', label: 'Radio Option 3' },
  ];

  const handleButtonClick = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">UI Components</h1>
          <p className="text-neutral-600">
            A collection of reusable UI components for the application
          </p>
        </div>

        <div className="space-y-12">
          {/* Input Component */}
          <section className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Input</h2>
            <div className="space-y-6">
              <Input
                label="Default Input"
                placeholder="Enter text here"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input label="Required Input" required placeholder="This field is required" />
              <Input
                label="Input with Helper Text"
                helperText="This is some helpful information"
                placeholder="With helper text"
              />
              <Input
                label="Input with Error"
                error="This field has an error"
                placeholder="Error state"
              />
              <Input label="Disabled Input" disabled value="Disabled value" />
            </div>
          </section>

          {/* Select Component */}
          <section className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Select</h2>
            <div className="space-y-6">
              <Select
                label="Default Select"
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                placeholder="Choose an option"
              />
              <Select
                label="Required Select"
                required
                options={selectOptions}
                placeholder="Required selection"
              />
              <Select
                label="Select with Error"
                error="Please select a valid option"
                options={selectOptions}
                placeholder="Error state"
              />
              <Select
                label="Disabled Select"
                disabled
                options={selectOptions}
                placeholder="Disabled"
              />
            </div>
          </section>

          {/* Textarea Component */}
          <section className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Textarea</h2>
            <div className="space-y-6">
              <Textarea
                label="Default Textarea"
                placeholder="Enter your message here"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={4}
              />
              <Textarea
                label="Textarea with Helper Text"
                helperText="Maximum 500 characters"
                placeholder="With helper text"
              />
              <Textarea
                label="Textarea with Error"
                error="This field is required"
                placeholder="Error state"
              />
              <Textarea label="Disabled Textarea" disabled value="This textarea is disabled" />
            </div>
          </section>

          {/* Checkbox Component */}
          <section className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Checkbox</h2>
            <div className="space-y-6">
              <Checkbox
                label="Default Checkbox"
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
              />
              <Checkbox label="Required Checkbox" required />
              <Checkbox
                label="Checkbox with Helper Text"
                helperText="Check this to agree to terms"
              />
              <Checkbox label="Checkbox with Error" error="You must accept the terms" />
              <Checkbox label="Disabled Checkbox" disabled checked />
              <Checkbox label="Checked by default" defaultChecked />
            </div>
          </section>

          {/* Radio Component */}
          <section className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Radio</h2>
            <div className="space-y-6">
              <Radio
                label="Default Radio Group"
                options={radioOptions}
                name="radio-group-1"
                value={radioValue}
                onChange={(e) => setRadioValue(e.target.value)}
              />
              <Radio
                label="Horizontal Radio Group"
                options={radioOptions}
                name="radio-group-2"
                direction="row"
              />
              <Radio
                label="Required Radio Group"
                required
                options={radioOptions}
                name="radio-group-3"
              />
              <Radio
                label="Radio with Error"
                error="Please select an option"
                options={radioOptions}
                name="radio-group-4"
              />
            </div>
          </section>

          {/* Switch Component */}
          <section className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Switch</h2>
            <div className="space-y-6">
              <Switch
                label="Default Switch"
                checked={switchChecked}
                onChange={(e) => setSwitchChecked(e.target.checked)}
              />
              <Switch label="Switch with Labels" onLabel="Enabled" offLabel="Disabled" />
              <Switch label="Required Switch" required />
              <Switch label="Switch with Helper Text" helperText="Toggle this feature on or off" />
              <Switch label="Disabled Switch" disabled checked />
            </div>
          </section>

          {/* Button Component */}
          <section className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Button</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-neutral-700 mb-4">Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-700 mb-4">Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-700 mb-4">States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button loading={buttonLoading} onClick={handleButtonClick}>
                    {buttonLoading ? 'Loading...' : 'Click to Load'}
                  </Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </section>

          {/* DatePicker Component */}
          <section className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">DatePicker</h2>
            <div className="space-y-6">
              <DatePicker
                label="Default Date Picker"
                value={dateValue}
                onChange={setDateValue}
                placeholderText="Select a date"
              />
              <DatePicker label="Required Date Picker" required placeholderText="Select a date" />
              <DatePicker
                label="Date Picker with Error"
                error="Please select a valid date"
                placeholderText="Error state"
              />
              <DatePicker label="Disabled Date Picker" disabled placeholderText="Disabled" />
              <DatePicker
                label="Date Picker with Min/Max"
                minDate={new Date()}
                maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                placeholderText="Select future date"
              />
            </div>
          </section>

          {/* Combined Form Example */}
          <section className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Form Example</h2>
            <div className="space-y-6 max-w-2xl">
              <Input label="Full Name" required placeholder="Enter your full name" />
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="your.email@example.com"
              />
              <DatePicker label="Date of Birth" placeholderText="Select your date of birth" />
              <Select
                label="Country"
                required
                options={selectOptions}
                placeholder="Select your country"
              />
              <Textarea
                label="Bio"
                helperText="Tell us about yourself"
                placeholder="Write a short bio"
                rows={4}
              />
              <Radio label="Gender" required options={radioOptions} name="gender" direction="row" />
              <Checkbox
                label="I agree to the terms and conditions"
                required
                helperText="You must accept to continue"
              />
              <Switch label="Enable notifications" onLabel="On" offLabel="Off" />
              <div className="flex gap-4 pt-4">
                <Button variant="primary">Submit</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
