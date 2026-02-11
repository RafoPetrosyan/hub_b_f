'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { Button, Checkbox, Input, Select } from '@/components/ui';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon } from '@/components/ui/icons';
import ReactSelect, { StylesConfig, GroupBase } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import type { SelectOption } from '@/components/ui/Select';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import { useGetAvailableServicesQuery, useSubmitOnboardingStepMutation } from '@/store/onboarding';

// Service data structure
interface ServiceItem {
  id: string;
  name: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  services: ServiceItem[];
}

interface SelectedService {
  categoryId: string;
  serviceId: string;
  categoryName: string;
  serviceName: string;
}

interface CustomService {
  id: string;
  category: string;
  serviceName: string;
  variations: string;
  price: number;
}

export default function Step7Page() {
  const router = useRouter();
  const { onboardingData } = useOnboardingStep(9);
  const {
    data: availableServicesData,
    isLoading: isLoadingServices,
    error: servicesError,
  } = useGetAvailableServicesQuery();
  const [submitOnboardingStep, { isLoading: isSubmitting }] = useSubmitOnboardingStepMutation();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedServiceValue, setSelectedServiceValue] = useState<string>('');
  const [selectKey, setSelectKey] = useState(0);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customVariations, setCustomVariations] = useState<string[]>([]);
  const [hasRestoredData, setHasRestoredData] = useState(false);

  // Transform API data to component's expected structure and filter out empty services
  const SERVICE_CATEGORIES: ServiceCategory[] = useMemo(() => {
    if (!availableServicesData) return [];

    return availableServicesData
      .filter((specialization) => specialization.services && specialization.services.length > 0)
      .map((specialization) => ({
        id: specialization.id,
        name: specialization.name,
        services: specialization.services.map((service) => ({
          id: service.id,
          name: service.name,
        })),
      }));
  }, [availableServicesData]);

  // Create grouped options for the select dropdown
  type GroupedOption = {
    label: string;
    options: Array<{ value: string; label: string }>;
  };

  const groupedServicesOptions: GroupedOption[] = useMemo(() => {
    return SERVICE_CATEGORIES.map((category) => ({
      label: category.name,
      options: category.services.map((service) => ({
        value: `${category.id}:${service.id}`,
        label: service.name,
      })),
    }));
  }, [SERVICE_CATEGORIES]);

  // Restore data from onboardingData if available
  useEffect(() => {
    // Only restore once and when we have the necessary data
    if (hasRestoredData || !onboardingData || !availableServicesData || SERVICE_CATEGORIES.length === 0) {
      return;
    }

    const step9Data = onboardingData?.steps_data?.['9'];
    if (step9Data?.services && Array.isArray(step9Data.services) && step9Data.services.length > 0) {
      const restoredSelectedServices: SelectedService[] = [];
      const restoredCustomServices: CustomService[] = [];
      const restoredCustomCategoriesSet = new Set<string>();
      const restoredCustomVariationsSet = new Set<string>();

      step9Data.services.forEach((service: { name: string; specialization_name: string; price_in_cents: number }, index: number) => {
        // Try to match with available services (select services typically have price_in_cents === 10)
        if (service.price_in_cents === 10) {
          // This is likely a select service - try to find matching service
          const matchingCategory = SERVICE_CATEGORIES.find(
            (cat) => cat.name === service.specialization_name
          );
          
          if (matchingCategory) {
            const matchingService = matchingCategory.services.find(
              (srv) => srv.name === service.name
            );
            
            if (matchingService) {
              // Found matching select service
              restoredSelectedServices.push({
                categoryId: matchingCategory.id,
                serviceId: matchingService.id,
                categoryName: matchingCategory.name,
                serviceName: matchingService.name,
              });
              return;
            }
          }
        }

        // If not matched as select service, treat as custom service
        // Find or create category
        let categoryId: string;
        let categoryName: string = service.specialization_name;
        
        const existingCategory = SERVICE_CATEGORIES.find(
          (cat) => cat.name === service.specialization_name
        );
        
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Custom category
          categoryId = `custom-${service.specialization_name}`;
          restoredCustomCategoriesSet.add(service.specialization_name);
        }

        // Determine variation name
        // The service.name is the variation for custom services
        const variationName = service.name;
        
        // Check if it's a known variation or custom
        const knownVariations = [
          'length-type-based',
          'size-based',
          'duration-based',
          'complexity-based',
          'material-based',
          'none',
        ];
        
        let variationValue: string;
        if (knownVariations.includes(variationName.toLowerCase())) {
          variationValue = variationName.toLowerCase();
        } else {
          // Custom variation
          variationValue = `custom-${variationName}`;
          restoredCustomVariationsSet.add(variationName);
        }

        // Convert price from cents to dollars
        const priceInDollars = service.price_in_cents / 100;

        restoredCustomServices.push({
          id: `restored-${Date.now()}-${index}-${Math.random()}`,
          category: categoryId,
          serviceName: '', // Not used for custom services, variation is the name
          variations: variationValue,
          price: priceInDollars,
        });
      });

      // Update state
      if (restoredSelectedServices.length > 0) {
        setSelectedServices(restoredSelectedServices);
      }
      
      if (restoredCustomServices.length > 0) {
        setCustomServices(restoredCustomServices);
        setShowAddServiceForm(true);
      }
      
      if (restoredCustomCategoriesSet.size > 0) {
        setCustomCategories(Array.from(restoredCustomCategoriesSet));
      }
      
      if (restoredCustomVariationsSet.size > 0) {
        setCustomVariations(Array.from(restoredCustomVariationsSet));
      }
      
      setHasRestoredData(true);
    }
  }, [onboardingData, availableServicesData, SERVICE_CATEGORIES, hasRestoredData]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Check if a category is selected (all services in category)
  const isCategorySelected = (category: ServiceCategory): boolean => {
    const categoryServices = category.services;
    return (
      categoryServices.length > 0 &&
      categoryServices.every((service) =>
        selectedServices.some(
          (selected) => selected.categoryId === category.id && selected.serviceId === service.id
        )
      )
    );
  };

  // Check if a category is partially selected (some but not all services)
  const isCategoryPartiallySelected = (category: ServiceCategory): boolean => {
    const categoryServices = category.services;
    const selectedCount = categoryServices.filter((service) =>
      selectedServices.some(
        (selected) => selected.categoryId === category.id && selected.serviceId === service.id
      )
    ).length;
    return selectedCount > 0 && selectedCount < categoryServices.length;
  };

  // Toggle category selection (select/deselect all services in category)
  const toggleCategorySelection = (category: ServiceCategory) => {
    const isSelected = isCategorySelected(category);
    if (isSelected) {
      // Deselect all services in this category
      setSelectedServices((prev) => prev.filter((selected) => selected.categoryId !== category.id));
    } else {
      // Select all services in this category
      const newSelections: SelectedService[] = category.services.map((service) => ({
        categoryId: category.id,
        serviceId: service.id,
        categoryName: category.name,
        serviceName: service.name,
      }));
      setSelectedServices((prev) => {
        // Remove existing selections for this category first
        const filtered = prev.filter((selected) => selected.categoryId !== category.id);
        return [...filtered, ...newSelections];
      });
    }
  };

  // Toggle individual service selection
  const toggleServiceSelection = (category: ServiceCategory, service: ServiceItem) => {
    const isSelected = selectedServices.some(
      (selected) => selected.categoryId === category.id && selected.serviceId === service.id
    );

    if (isSelected) {
      // Deselect this service
      setSelectedServices((prev) =>
        prev.filter(
          (selected) => !(selected.categoryId === category.id && selected.serviceId === service.id)
        )
      );
    } else {
      // Select this service
      setSelectedServices((prev) => [
        ...prev,
        {
          categoryId: category.id,
          serviceId: service.id,
          categoryName: category.name,
          serviceName: service.name,
        },
      ]);
    }
  };

  // Check if a service is selected
  const isServiceSelected = (categoryId: string, serviceId: string): boolean => {
    return selectedServices.some(
      (selected) => selected.categoryId === categoryId && selected.serviceId === serviceId
    );
  };

  // Handle service selection from dropdown
  const handleServiceSelect = (value: string) => {
    if (!value) {
      setSelectedServiceValue('');
      return;
    }
    const [categoryId, serviceId] = value.split(':');
    const category = SERVICE_CATEGORIES.find((cat) => cat.id === categoryId);
    const service = category?.services.find((srv) => srv.id === serviceId);

    if (category && service) {
      const isSelected = isServiceSelected(categoryId, serviceId);
      if (!isSelected) {
        setSelectedServices((prev) => [
          ...prev,
          {
            categoryId,
            serviceId,
            categoryName: category.name,
            serviceName: service.name,
          },
        ]);
      }
    }
    // Clear the selection after adding by resetting the component
    setSelectedServiceValue('');
    setSelectKey((prev) => prev + 1);

    // Auto-expand the category when a service is selected
    if (category) {
      setExpandedCategories((prev) => {
        const newSet = new Set(prev);
        newSet.add(category.id);
        return newSet;
      });
    }
  };

  const onSubmit = async () => {
    try {
      // Build services array according to Step9Dto structure
      const services: Array<{
        name: string;
        specialization_name: string;
        price_in_cents: number;
      }> = [];

      // Create a map of custom service IDs to their full data for quick lookup
      const customServiceMap = new Map<string, CustomService>();
      customServices.forEach((cs) => {
        // Include all services with a category (variations and serviceName are optional)
        if (cs.category) {
          customServiceMap.set(cs.id, cs);
        }
      });

      // Track which custom services have been processed to avoid duplicates
      const processedCustomServiceIds = new Set<string>();

      // Process selected services first
      selectedServices.forEach((service) => {
        if (service.serviceId.startsWith('custom-')) {
          // This is a custom service that was already saved to selectedServices
          // Try to find it in customServices map
          const customServiceId = service.serviceId.replace('custom-', '');
          const customService = customServiceMap.get(customServiceId);

          if (customService) {
            // Mark as processed to avoid duplicate
            processedCustomServiceIds.add(customServiceId);

            // Get variation name (remove 'custom-' prefix if present)
            const variationName = customService.variations
              ? customService.variations.startsWith('custom-')
                ? customService.variations.replace('custom-', '')
                : customService.variations
              : service.serviceName; // Fallback to service name if no variation

            // Get category name (remove 'custom-' prefix if present)
            const categoryName = customService.category.startsWith('custom-')
              ? customService.category.replace('custom-', '')
              : SERVICE_CATEGORIES.find((cat) => cat.id === customService.category)?.name ||
                customService.category;

            // Convert price from dollars to cents, or use 0 if not set
            const priceInCents = customService.price ? Math.round(customService.price * 100) : 0;

            services.push({
              name: variationName,
              specialization_name: categoryName,
              price_in_cents: priceInCents,
            });
          } else {
            // Custom service not found in map (was saved earlier and customServices was cleared)
            // Use service name as name and category name as specialization_name
            services.push({
              name: service.serviceName,
              specialization_name: service.categoryName,
              price_in_cents: 0, // No price info available for already saved custom services
            });
          }
        } else {
          // This is a "select service" (from dropdown)
          // For select services, use service name as name, category name as specialization_name, and fixed price of 10 cents
          services.push({
            name: service.serviceName, // Service name (no variation for select services)
            specialization_name: service.categoryName,
            price_in_cents: 10, // Fixed price for select services
          });
        }
      });

      // Process custom services from the customServices array that haven't been saved to selectedServices yet
      // Include services that have a category (variations and serviceName are optional)
      customServices
        .filter((service) => service.category && !processedCustomServiceIds.has(service.id))
        .forEach((customService) => {
          // Get variation name (remove 'custom-' prefix if present)
          // Use variation as the name (per DTO requirement), fallback to serviceName or category name if no variation
          const variationName = customService.variations
            ? customService.variations.startsWith('custom-')
              ? customService.variations.replace('custom-', '')
              : customService.variations
            : customService.serviceName.trim() || 
              (customService.category.startsWith('custom-') 
                ? customService.category.replace('custom-', '')
                : SERVICE_CATEGORIES.find((cat) => cat.id === customService.category)?.name || 
                  'Custom Service'); // Fallback to service name, category name, or default

          // Get category name (remove 'custom-' prefix if present)
          const categoryName = customService.category.startsWith('custom-')
            ? customService.category.replace('custom-', '')
            : SERVICE_CATEGORIES.find((cat) => cat.id === customService.category)?.name ||
              customService.category;

          // Convert price from dollars to cents, or use 0 if not set
          const priceInCents = customService.price ? Math.round(customService.price * 100) : 0;

          services.push({
            name: variationName,
            specialization_name: categoryName,
            price_in_cents: priceInCents,
          });
        });

      // Prepare the request body
      const requestBody: {
        step: number;
        services?: Array<{
          name: string;
          specialization_name: string;
          price_in_cents: number;
        }>;
      } = {
        step: 9,
      };

      // Only include services if there are any
      if (services.length > 0) {
        requestBody.services = services;
      }

      // Submit the onboarding step
      await submitOnboardingStep(requestBody).unwrap();

      // Navigate to next step on success
      router.push('/sign-up/step-10');
    } catch (error) {
      console.error('Failed to submit onboarding step:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleSkip = async () => {
    try {
      // Submit empty data to skip this step
      await submitOnboardingStep({
        step: 9,
      }).unwrap();
      router.push('/sign-up/step-10');
    } catch (error) {
      console.error('Failed to skip onboarding step:', error);
      // You might want to show an error message to the user here
    }
  };

  // Category options for custom service form (including custom ones)
  const categoryOptions: SelectOption[] = useMemo(() => {
    const existingCategories = SERVICE_CATEGORIES.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
    const customCategoryOptions = customCategories.map((cat) => ({
      value: `custom-${cat}`,
      label: cat,
    }));
    return [...existingCategories, ...customCategoryOptions];
  }, [SERVICE_CATEGORIES, customCategories]);

  // Variations options for custom service form (including custom ones)
  const variationsOptions: SelectOption[] = useMemo(() => {
    const defaultOptions = [
      { value: 'length-type-based', label: 'Length / Type Based' },
      { value: 'size-based', label: 'Size Based' },
      { value: 'duration-based', label: 'Duration Based' },
      { value: 'complexity-based', label: 'Complexity Based' },
      { value: 'material-based', label: 'Material Based' },
      { value: 'none', label: 'No Variations' },
    ];
    const customVariationOptions = customVariations.map((variation) => ({
      value: `custom-${variation}`,
      label: variation,
    }));
    return [...defaultOptions, ...customVariationOptions];
  }, [customVariations]);

  // Add a new custom service entry
  const handleAddCustomService = () => {
    const newService: CustomService = {
      id: `custom-${Date.now()}-${Math.random()}`,
      category: '',
      serviceName: '',
      variations: '',
      price: 0,
    };
    setCustomServices((prev) => [...prev, newService]);
    setShowAddServiceForm(true);
  };

  // Update a custom service
  const handleUpdateCustomService = (
    id: string,
    field: keyof CustomService,
    value: string | number
  ) => {
    setCustomServices((prev) =>
      prev.map((service) => (service.id === id ? { ...service, [field]: value } : service))
    );
  };

  // Remove a custom service
  const handleRemoveCustomService = (id: string) => {
    setCustomServices((prev) => {
      const updated = prev.filter((service) => service.id !== id);
      // Reset form state if all custom services are removed
      if (updated.length === 0) {
        setShowAddServiceForm(false);
      }
      return updated;
    });
  };

  // Save custom service to selected services (called when user fills and moves on)
  const handleSaveCustomService = (customService: CustomService) => {
    // Only require category (variations and serviceName are optional)
    if (!customService.category) {
      return; // Don't save if category is missing
    }

    // Handle custom categories (those starting with "custom-")
    let categoryName: string;
    if (customService.category.startsWith('custom-')) {
      categoryName = customService.category.replace('custom-', '');
    } else {
      const category = SERVICE_CATEGORIES.find((cat) => cat.id === customService.category);
      categoryName = category?.name || customService.category;
    }

    // Generate a unique service ID
    const serviceId = `custom-${customService.id}`;

      // Check if already selected
      const isAlreadySelected = selectedServices.some(
        (selected) =>
          selected.categoryId === customService.category && selected.serviceId === serviceId
      );

      if (!isAlreadySelected) {
        // Use variation as service name if serviceName is empty, otherwise use serviceName
        const displayName = customService.serviceName.trim() || 
          (customService.variations 
            ? (customService.variations.startsWith('custom-') 
                ? customService.variations.replace('custom-', '') 
                : customService.variations)
            : 'Custom Service');
        
        setSelectedServices((prev) => [
          ...prev,
          {
            categoryId: customService.category,
            serviceId: serviceId,
            categoryName: categoryName,
            serviceName: displayName,
          },
        ]);

      // Auto-expand the category
      setExpandedCategories((prev) => {
        const newSet = new Set(prev);
        newSet.add(customService.category);
        return newSet;
      });
    }
  };

  // Save all valid custom services before submitting
  const saveAllCustomServices = () => {
    customServices.forEach((service) => {
      // Only require category
      if (service.category) {
        handleSaveCustomService(service);
      }
    });
    setCustomServices([]);
    setShowAddServiceForm(false);
  };

  // Format price for display
  const formatPrice = (value: number | undefined): string => {
    if (value === undefined || value === null) return '0';
    return value.toString();
  };

  // Parse price from input
  const parsePrice = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Custom styles for react-select grouped options
  const selectStyles: StylesConfig<
    { value: string; label: string },
    false,
    GroupBase<{ value: string; label: string }>
  > = {
    control: (base, state) => ({
      ...base,
      minHeight: '48px',
      padding: '0 4px',
      borderRadius: '8px',
      border: `1px solid ${state.isFocused ? 'var(--primary-normal)' : 'var(--neutral-300)'}`,
      boxShadow: state.isFocused ? `0 0 0 2px rgba(14, 165, 233, 0.2)` : 'none',
      backgroundColor: 'white',
      cursor: 'pointer',
      '&:hover': {
        border: `1px solid ${state.isFocused ? 'var(--primary-normal)' : 'var(--neutral-300)'}`,
      },
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#111827',
    }),
    input: (base) => ({
      ...base,
      color: '#111827',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid var(--neutral-200)',
      marginTop: '4px',
      zIndex: 99999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 99999,
    }),
    groupHeading: (base) => ({
      ...base,
      fontSize: '12px',
      fontWeight: 600,
      color: 'var(--neutral-700)',
      textTransform: 'uppercase',
      padding: '8px 16px',
      backgroundColor: 'var(--neutral-50)',
      borderBottom: '1px solid var(--neutral-200)',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'var(--primary-normal-active)'
        : state.isFocused
          ? 'var(--primary-light)'
          : 'white',
      color: state.isSelected ? 'white' : 'var(--neutral-700)',
      cursor: 'pointer',
      padding: '12px 16px 12px 32px', // More left padding to show indentation
      '&:active': {
        backgroundColor: state.isSelected ? 'var(--primary-light-active)' : 'var(--primary-light)',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: 'var(--neutral-500)',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 150ms ease',
      '&:hover': {
        color: 'var(--neutral-700)',
      },
    }),
  };

  // Show loading state
  if (isLoadingServices) {
    return (
      <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
            Your services
          </h1>
          <p className="text-sm sm:text-base text-secondary leading-[20px] sm:leading-[24px]">Loading services...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (servicesError) {
    return (
      <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
            Your services
          </h1>
          <p className="text-sm sm:text-base text-error leading-[20px] sm:leading-[24px]">
            Failed to load services. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-inter px-2 sm:px-4">
      {/* Title */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-display-sm sm:text-display-md md:text-display-lg leading-tight sm:leading-[40px] md:leading-[56px] mb-2 sm:mb-3 font-gazpacho font-normal text-heading">
          Your services
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-[20px] sm:leading-[24px]">
          We've added common services based on your business. Edit, add, or remove as needed.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="max-w-[921px] mx-auto"
      >
        {/* Services Selection Card */}
        {!showAddServiceForm && customServices.length === 0 && (
          <div className="rounded-[12px] mb-6 sm:mb-8 bg-neutral-25 ">
            <div className="bg-primary-light p-4 sm:p-5 md:p-[24px] rounded-[12px]">
              {/* Add additional Service Button - Only show when form is not visible */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                {selectedServices.length === 0 ? (
                  <p className="text-xs sm:text-sm text-secondary">
                    No services yet. Add your first service below
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-secondary">
                    {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}{' '}
                    selected
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleAddCustomService}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-primary-normal text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
                >
                  Add additional Service
                </button>
              </div>
              {/* Select Services Section - Only show when Add Service form is not visible */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-bold text-strong mb-2">SELECT SERVICES</label>
                <ReactSelect<
                  { value: string; label: string },
                  false,
                  GroupBase<{ value: string; label: string }>
                >
                  key={selectKey}
                  instanceId="service-select"
                  inputId="service-select-input"
                  options={groupedServicesOptions}
                  placeholder="Search for services name"
                  value={null}
                  onChange={(selectedOption) => {
                    handleServiceSelect(selectedOption?.value || '');
                  }}
                  isSearchable={true}
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                  menuShouldScrollIntoView={true}
                  menuShouldBlockScroll={true}
                />
              </div>
            </div>
          </div>
        )}

        {/*Selected Services Section - Only show when Add Service form is visible*/}
        {selectedServices.length > 0 && (showAddServiceForm || customServices.length > 0) && (
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg md:text-md font-bold text-strong mb-3 sm:mb-4">Selected services</h3>
            <div className="space-y-2">
              {/* Group by category to avoid duplicate expansions */}
              {Array.from(
                new Set(
                  selectedServices
                    .filter((s) => !s.serviceId.startsWith('custom-'))
                    .map((s) => s.categoryId)
                )
              ).map((categoryId) => {
                const category = SERVICE_CATEGORIES.find((cat) => cat.id === categoryId);
                if (!category) return null;

                const isExpanded = expandedCategories.has(categoryId);
                const categorySelectedServices = selectedServices.filter(
                  (selected) =>
                    selected.categoryId === categoryId && !selected.serviceId.startsWith('custom-')
                );

                return (
                  <div
                    key={categoryId}
                    className={`space-y-2 rounded-[12px] ${isExpanded && 'border-1 border-border-default'}`}
                  >
                    {categorySelectedServices.map((selected) => {
                      const service = category.services.find(
                        (srv) => srv.id === selected.serviceId
                      );
                      if (!service) return null;

                      return (
                        <div
                          key={`${selected.categoryId}-${selected.serviceId}`}
                          className={`flex items-center min-h-[48px] sm:h-[58px] gap-2 sm:gap-3 py-2 border-1 border-border-default pl-4 sm:pl-8 md:pl-[40px] rounded-t-[12px] bg-primary-light ${!isExpanded && 'rounded-b-[12px] border-none'}`}
                        >
                          <Checkbox
                            id={`selected-service-${selected.categoryId}-${selected.serviceId}`}
                            checked={true}
                            onChange={() => {
                              toggleServiceSelection(category, service);
                            }}
                          />
                          <span className="text-xs sm:text-sm text-primary-darker flex-1">
                            {selected.serviceName}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleCategory(categoryId)}
                            className="p-1 hover:bg-neutral-100 rounded transition-colors mr-2 sm:mr-[10px] flex-shrink-0"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                    {/* Expanded view showing all services in category - show once after all selected services */}
                    {isExpanded && (
                      <div className="pl-4 sm:pl-6 md:pl-8 space-y-2 pb-2 px-3 sm:px-4 md:px-[22px] mt-3 sm:mt-4 md:mt-[16px]">
                        {category.services.map((serviceItem) => {
                          const serviceSelected = isServiceSelected(category.id, serviceItem.id);
                          return (
                            <div
                              key={serviceItem.id}
                              className="flex items-center min-h-[48px] sm:h-[58px] gap-2 sm:gap-3 py-2 border-1 border-border-default mt-2 sm:mt-[8px] pl-4 sm:pl-8 md:pl-[40px] rounded-[12px] bg-white"
                            >
                              <Checkbox
                                id={`service-${category.id}-${serviceItem.id}`}
                                checked={serviceSelected}
                                onChange={() => toggleServiceSelection(category, serviceItem)}
                              />
                              <span className="text-xs sm:text-sm text-primary-darker">
                                {serviceItem.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Custom services (not in categories) */}
              {selectedServices
                .filter((selected) => selected.serviceId.startsWith('custom-'))
                .map((selected) => (
                  <div
                    key={`${selected.categoryId}-${selected.serviceId}`}
                    className="flex items-center min-h-[48px] sm:h-[58px] gap-2 sm:gap-3 py-2 border-1 border-border-default pl-4 sm:pl-8 md:pl-[40px] rounded-[12px] bg-white"
                  >
                    <Checkbox
                      id={`selected-service-${selected.categoryId}-${selected.serviceId}`}
                      checked={true}
                      onChange={() => {
                        // Remove custom service from selected
                        setSelectedServices((prev) =>
                          prev.filter(
                            (s) =>
                              !(
                                s.categoryId === selected.categoryId &&
                                s.serviceId === selected.serviceId
                              )
                          )
                        );
                      }}
                    />
                    <span className="text-xs sm:text-sm text-primary-darker flex-1">
                      {selected.serviceName}
                    </span>
                    <div className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Spacer for alignment */}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Add Services Section - Only show when Add additional Service is clicked */}
        {(showAddServiceForm || customServices.length > 0) && (
          <div className="mb-4 sm:mb-6 rounded-[12px] bg-neutral-25 p-4 sm:p-5 md:p-6">
            <h3 className="text-base sm:text-lg md:text-md font-bold text-strong mb-3 sm:mb-4">Add services</h3>

            {/* Custom Service Entries */}
            <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
              {customServices.map((customService) => (
                <div
                  key={customService.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end bg-primary-light p-3 sm:p-4 rounded-[12px]"
                >
                  {/* Service Category */}
                  <div className="col-span-1 sm:col-span-12 md:col-span-5">
                    <label className="block text-xs sm:text-sm font-bold text-strong mb-2">
                      SERVICE CATEGORY
                    </label>
                    <CreatableSelect
                      options={categoryOptions}
                      placeholder="Select or add service category"
                      value={
                        customService.category
                          ? categoryOptions.find((opt) => opt.value === customService.category) || {
                              value: customService.category,
                              label: customService.category.startsWith('custom-')
                                ? customService.category.replace('custom-', '')
                                : customService.category,
                            }
                          : null
                      }
                      onChange={(selectedOption) => {
                        if (!selectedOption) {
                          handleUpdateCustomService(customService.id, 'category', '');
                          return;
                        }
                        const value = selectedOption.value;
                        // Value is already in the correct format (with custom- prefix for new options)
                        handleUpdateCustomService(customService.id, 'category', value);
                      }}
                      onCreateOption={(inputValue) => {
                        const trimmedValue = inputValue.trim();
                        if (!trimmedValue) return;
                        
                        const customValue = `custom-${trimmedValue}`;
                        
                        // Add to custom categories list if not already there
                        // Use functional update to ensure it's added immediately
                        setCustomCategories((prev) => {
                          if (!prev.includes(trimmedValue)) {
                            return [...prev, trimmedValue];
                          }
                          return prev;
                        });
                        
                        // Set the value immediately - CreatableSelect will also call onChange,
                        // but this ensures it's selected right away
                        handleUpdateCustomService(customService.id, 'category', customValue);
                      }}
                      getNewOptionData={(inputValue) => {
                        const trimmedValue = inputValue.trim();
                        // Store with custom- prefix so it matches our stored values
                        return {
                          value: `custom-${trimmedValue}`,
                          label: trimmedValue,
                        };
                      }}
                      isValidNewOption={(inputValue) => {
                        const trimmed = inputValue.trim();
                        return trimmed.length > 0 && !categoryOptions.some(
                          (opt) => opt.label.toLowerCase() === trimmed.toLowerCase()
                        );
                      }}
                      isSearchable={true}
                      styles={selectStyles}
                      classNamePrefix="react-select"
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      menuPosition="fixed"
                      menuShouldScrollIntoView={true}
                      menuShouldBlockScroll={true}
                      formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                    />
                  </div>

                  {/* Variations */}
                  <div className="col-span-1 sm:col-span-12 md:col-span-4">
                    <label className="block text-xs sm:text-sm font-bold text-strong mb-2">VARIATIONS</label>
                    <CreatableSelect
                      options={variationsOptions}
                      placeholder="Select or add variations"
                      value={
                        customService.variations
                          ? variationsOptions.find(
                              (opt) => opt.value === customService.variations
                            ) || {
                              value: customService.variations,
                              label: customService.variations.startsWith('custom-')
                                ? customService.variations.replace('custom-', '')
                                : customService.variations,
                            }
                          : null
                      }
                      onChange={(selectedOption) => {
                        if (!selectedOption) {
                          handleUpdateCustomService(customService.id, 'variations', '');
                          return;
                        }
                        const value = selectedOption.value;
                        // Value is already in the correct format (with custom- prefix for new options)
                        handleUpdateCustomService(customService.id, 'variations', value);
                      }}
                      onCreateOption={(inputValue) => {
                        const trimmedValue = inputValue.trim();
                        if (!trimmedValue) return;
                        
                        const customValue = `custom-${trimmedValue}`;
                        
                        // Add to custom variations list if not already there
                        // Use functional update to ensure it's added immediately
                        setCustomVariations((prev) => {
                          if (!prev.includes(trimmedValue)) {
                            return [...prev, trimmedValue];
                          }
                          return prev;
                        });
                        
                        // Set the value immediately - CreatableSelect will also call onChange,
                        // but this ensures it's selected right away
                        handleUpdateCustomService(customService.id, 'variations', customValue);
                      }}
                      getNewOptionData={(inputValue) => {
                        const trimmedValue = inputValue.trim();
                        // Store with custom- prefix so it matches our stored values
                        return {
                          value: `custom-${trimmedValue}`,
                          label: trimmedValue,
                        };
                      }}
                      isValidNewOption={(inputValue) => {
                        const trimmed = inputValue.trim();
                        return trimmed.length > 0 && !variationsOptions.some(
                          (opt) => opt.label.toLowerCase() === trimmed.toLowerCase()
                        );
                      }}
                      isSearchable={true}
                      styles={selectStyles}
                      classNamePrefix="react-select"
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      menuPosition="fixed"
                      menuShouldScrollIntoView={true}
                      menuShouldBlockScroll={true}
                      formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                    />
                  </div>

                  {/* Price */}
                  <div className="col-span-1 sm:col-span-6 md:col-span-2">
                    <Input
                      label="PRICE(OPTIONAL)"
                      type="text"
                      value={
                        customService.price !== undefined && customService.price !== null
                          ? `$${formatPrice(customService.price)}`
                          : '$0'
                      }
                      onChange={(e) => {
                        const numValue = parsePrice(e.target.value);
                        handleUpdateCustomService(customService.id, 'price', numValue);
                      }}
                      placeholder="$0"
                      labelClassName="font-bold text-xs"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-1 sm:col-span-6 md:col-span-1 flex items-end pb-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomService(customService.id)}
                      className="text-neutral-600 flex !mt-[10px] items-center justify-center hover:text-error transition-colors bg-white h-[40px] w-[40px] sm:h-[50px] sm:w-[50px] rounded-[12px]"
                      aria-label="Delete service"
                    >
                      <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Service Button */}
            <button
              type="button"
              onClick={handleAddCustomService}
              className="w-full py-2.5 sm:py-3 rounded-[12px] border-2 border-dashed border-primary-normal bg-primary-light-active transition-all"
            >
              <span className="text-xs sm:text-sm md:text-sm font-medium text-text-emphasis">Add Service</span>
            </button>
          </div>
        )}

        {/* Service Categories - Only show when services are selected and Add Service form is not visible */}
        {selectedServices.length > 0 && !showAddServiceForm && customServices.length === 0 && (
          <div className="space-y-2 mt-6 sm:mt-8 md:mt-[40px] rounded-[12px] mb-4 sm:mb-5 md:mb-[20px]">
            {SERVICE_CATEGORIES.filter((category) => {
              // Only show categories that have at least one selected service
              return category.services.some((service) =>
                isServiceSelected(category.id, service.id)
              );
            }).map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              const isSelected = isCategorySelected(category);
              const isPartiallySelected = isCategoryPartiallySelected(category);

              return (
                <div
                  key={category.id}
                  className={`pb-2 border-border-default border-1 rounded-[12px] ${!isExpanded && 'border-none'}`}
                >
                  {/* Category Header */}
                  <div
                    className={`flex min-h-[48px] sm:h-[58px] items-center justify-between py-2 sm:py-3 bg-primary-light px-4 sm:px-6 md:px-[40px] rounded-t-[12px] border-b-1 border-border-default ${!isExpanded && 'border-none rounded-b-[12px]'}`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={isSelected || isPartiallySelected}
                        onChange={() => toggleCategorySelection(category)}
                      />
                      <span className="text-xs sm:text-sm font-medium text-strong flex-1 truncate">
                        {category.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="p-1 hover:bg-neutral-100 rounded transition-colors flex-shrink-0"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
                      )}
                    </button>
                  </div>

                  {/* Category Services */}
                  {isExpanded && (
                    <div className="pl-4 sm:pl-6 md:pl-8 space-y-2 pb-2 px-3 sm:px-4 md:px-[22px] mt-3 sm:mt-4 md:mt-[16px]">
                      {category.services.map((service) => {
                        const serviceSelected = isServiceSelected(category.id, service.id);
                        return (
                          <div
                            key={service.id}
                            className="flex items-center min-h-[48px] sm:h-[58px] gap-2 sm:gap-3 py-2 border-1 border-border-default mt-2 sm:mt-[8px] pl-4 sm:pl-8 md:pl-[40px] rounded-[12px]"
                          >
                            <Checkbox
                              id={`service-${category.id}-${service.id}`}
                              checked={serviceSelected}
                              onChange={() => toggleServiceSelection(category, service)}
                            />
                            <span className="text-xs sm:text-sm text-primary-darker">{service.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Continue Button */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] md:w-[420px] bg-primary-normal rounded-full font-medium text-sm sm:text-base text-text-on-gradient transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs sm:text-sm text-secondary hover:text-strong transition-colors"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
