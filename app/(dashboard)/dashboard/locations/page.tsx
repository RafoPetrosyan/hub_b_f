'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { EditIcon, MoreVerticalIcon } from '@/components/ui/icons';
import LocationFormModal from '@/components/dashboard/LocationFormModal';
import DeleteConfirmModal from '@/components/dashboard/DeleteConfirmModal';
import {
  useGetLocationsQuery,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} from '@/store/locations';
import type { LocationResponse, Address, WorkingHour } from '@/store/locations/types';
import { toast } from 'react-toastify';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatTime(time: string): string {
  if (!time) return '—';
  const [hourStr, minStr] = time.split(':');
  const hour = parseInt(hourStr || '0', 10);
  const min = minStr ? parseInt(minStr.slice(0, 2), 10) : 0;
  if (hour === 0 && min === 0) return 'Closed';
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}:${min.toString().padStart(2, '0')} ${period}`;
}

function formatAddress(addr: Address): string {
  const parts = [
    addr.street,
    addr.city,
    addr.state ? `${addr.state} ${addr.zip}`.trim() : addr.zip,
  ].filter(Boolean);
  return parts.join(', ') || '—';
}

function buildHoursRows(workingHours: WorkingHour[]): { day: string; text: string }[] {
  const byDay: Record<string, { open: string; close: string }> = {};
  DAY_ORDER.forEach((day) => {
    byDay[day] = { open: '', close: '' };
  });
  workingHours.forEach((wh) => {
    const day = wh.day.charAt(0).toUpperCase() + wh.day.slice(1).toLowerCase();
    if (DAY_ORDER.includes(day)) {
      byDay[day] = { open: wh.open, close: wh.close };
    }
  });

  return DAY_ORDER.map((day) => {
    const { open, close } = byDay[day];
    const isClosed = !open || !close || open === close;
    const text = isClosed ? 'Closed' : `${formatTime(open)} - ${formatTime(close)}`;
    return { day, text };
  });
}

function LocationCard({
  location,
  isMenuOpen,
  onEdit,
  onMenuToggle,
  onEditLocation,
  onDeleteLocation,
  onSetPrimary,
  onCloseMenu,
}: {
  location: LocationResponse;
  isMenuOpen: boolean;
  onEdit: (location: LocationResponse) => void;
  onMenuToggle: (location: LocationResponse) => void;
  onEditLocation: (location: LocationResponse) => void;
  onDeleteLocation: (location: LocationResponse) => void;
  onSetPrimary: (location: LocationResponse) => void;
  onCloseMenu: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, onCloseMenu]);

  const addressLine = formatAddress(location.address);
  const hoursRows = buildHoursRows(location.working_hours || []);
  const staffCount = location.trades?.length ?? 0;
  const servicesCount = 0; // Not in API; placeholder per design

  return (
    <div className="bg-d-content-item-bg rounded-[12px] p-5 sm:p-6 shadow-sm max-w-[795px] relative">
      {/* Header: name + Primary badge on same row, actions top-right */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-d-content-item-title truncate">
              {location.name}
            </h3>
            {location.is_primary && (
              <span className="inline-flex px-2.5 py-0.5 w-[106px] h-[24px] font-bold items-center justify-center rounded-full text-xs bg-d-accent-light text-d-accent flex-shrink-0">
                Primary
              </span>
            )}
          </div>
          <p className="text-sm text-d-content-item-sub-title mt-0.5 break-words">{addressLine}</p>
        </div>
        <div className="relative flex items-center gap-1 flex-shrink-0" ref={menuRef}>
          {location.is_primary && (
            <button
              type="button"
              onClick={() => onEdit(location)}
              className="p-2 rounded-lg text-neutral-600 hover:bg-d-accent-light hover:text-d-accent transition-colors"
              aria-label="Edit location"
            >
              <EditIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onMenuToggle(location)}
            className="p-2 rounded-lg text-neutral-600 hover:bg-d-accent-light hover:text-d-accent transition-colors"
            aria-label="More options"
          >
            <MoreVerticalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] py-1 rounded-lg bg-d-content-item-bg border border-[var(--border-default)] shadow-lg">
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-d-content-item-title hover:bg-d-accent-light transition-colors"
                onClick={() => {
                  onEditLocation(location);
                  onCloseMenu();
                }}
              >
                Edit
              </button>
              {!location.is_primary && (
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm text-d-content-item-title hover:bg-d-accent-light transition-colors"
                  onClick={() => {
                    onSetPrimary(location);
                    onCloseMenu();
                  }}
                >
                  Set as primary
                </button>
              )}
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-error hover:bg-red-50 transition-colors"
                onClick={() => {
                  onDeleteLocation(location);
                  onCloseMenu();
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hours: day on left, time right-aligned */}
      <div className="pt-4 border-t border-[var(--border-default)]">
        <h4 className="text-sm font-bold text-d-content-item-title mb-3">Hours</h4>
        <ul className="space-y-1.5 text-sm text-d-content-item-title">
          {hoursRows.map(({ day, text }) => (
            <li key={day} className="flex justify-between gap-4">
              <span>{day}</span>
              <span className="text-d-content-item-sub-title text-right flex-shrink-0">{text}</span>
            </li>
          ))}
        </ul>
        {/* Metrics: uppercase labels, display-only fields */}
        <div className="flex mt-4">
          <div>
            <p className="text-xs font-bold text-d-content-item-sub-title uppercase tracking-wide mb-1.5">
              Staff members
            </p>
            <div className="min-h-[40px] max-w-[141px] h-[56px] px-3 py-2 rounded-lg bg-neutral-100 border border-[var(--border-default)] flex items-center text-sm font-medium text-d-content-item-title">
              {staffCount}
            </div>
          </div>
          <div className="ml-[12px]">
            <p className="text-xs font-bold text-d-content-item-sub-title uppercase tracking-wide mb-1.5">
              Services offered
            </p>
            <div className="min-h-[40px] max-w-[141px] h-[56px] px-3 py-2 rounded-lg bg-neutral-100 border border-[var(--border-default)] flex items-center text-sm font-medium text-d-content-item-title">
              {servicesCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LocationsPage() {
  const [menuLocationId, setMenuLocationId] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationResponse | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<LocationResponse | null>(null);

  const { data: locations = [], isLoading, refetch } = useGetLocationsQuery();
  const [updateLocation] = useUpdateLocationMutation();
  const [deleteLocation, { isLoading: isDeleting }] = useDeleteLocationMutation();

  const handleAddLocation = () => {
    setEditingLocation(null);
    setIsLocationModalOpen(true);
  };

  const handleEdit = (location: LocationResponse) => {
    setEditingLocation(location);
    setIsLocationModalOpen(true);
    setMenuLocationId(null);
  };

  const handleEditFromMenu = (location: LocationResponse) => {
    setEditingLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleMenuToggle = (location: LocationResponse) => {
    setMenuLocationId((prev) => (prev === location.id ? null : location.id));
  };

  const handleCloseMenu = () => setMenuLocationId(null);

  const handleSetPrimary = async (location: LocationResponse) => {
    try {
      await updateLocation({
        id: location.id,
        data: {
          name: location.name,
          is_primary: true,
          address: location.address,
          working_hours: location.working_hours || [],
          trades: (location.trades || []).map((t) => t.id),
        },
      }).unwrap();
      toast.success('Primary location updated.');
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      toast.error(e?.data?.message || e?.message || 'Failed to set primary location.');
    }
  };

  const handleDeleteLocation = (location: LocationResponse) => {
    setLocationToDelete(location);
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;
    try {
      await deleteLocation({ id: locationToDelete.id }).unwrap();
      toast.success('Location deleted successfully.');
      setLocationToDelete(null);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      toast.error(e?.data?.message || e?.message || 'Failed to delete location.');
    }
  };

  return (
    <div>
      <div className="max-w-[1600px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-[12px]">
          <div>
            <h1 className="text-xl font-bold text-d-title mb-2">Locations</h1>
            <p className="text-sm text-d-sub-title font-medium">Manage your business locations</p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleAddLocation}
            className="!bg-d-accent rounded-full w-full sm:w-auto sm:min-w-[160px]"
          >
            Add Location
          </Button>
        </div>

        {isLoading ? (
          <p className="text-d-content-item-sub-title font-medium py-8">Loading...</p>
        ) : locations.length === 0 ? (
          <div className="bg-d-content-item-bg rounded-[12px] p-8 sm:p-12 text-center">
            <p className="text-d-content-item-sub-title font-medium mb-4">
              No locations yet. Add your first location to get started.
            </p>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleAddLocation}
              className="!bg-d-accent rounded-full"
            >
              Add Location
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {locations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                isMenuOpen={menuLocationId === loc.id}
                onEdit={handleEdit}
                onMenuToggle={handleMenuToggle}
                onEditLocation={handleEditFromMenu}
                onDeleteLocation={handleDeleteLocation}
                onSetPrimary={handleSetPrimary}
                onCloseMenu={handleCloseMenu}
              />
            ))}
          </div>
        )}
      </div>

      <LocationFormModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        }}
        editingLocation={editingLocation}
        onSuccess={() => refetch()}
      />

      <DeleteConfirmModal
        isOpen={!!locationToDelete}
        onClose={() => setLocationToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Location"
        message={
          locationToDelete
            ? `Are you sure you want to delete "${locationToDelete.name}"? This action cannot be undone.`
            : undefined
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
