'use client';

import { useState, useMemo } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { ShieldIcon, SearchIcon, UserPlusIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import AddUserModal from '@/components/dashboard/AddUserModal';
import DeleteConfirmModal from '@/components/dashboard/DeleteConfirmModal';
import type { SelectOption } from '@/components/ui';
import {
  useGetStaffQuery,
  useGetStaffCountQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} from '@/store/staff';
import { useGetLocationsQuery } from '@/store/locations';
import type { StaffMember, StaffRole } from '@/store/staff/types';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/lib/errorUtils';

// Map API roles to display roles
const roleDisplayMap: Record<StaffRole, string> = {
  business_admin: 'Business Admin',
  manager: 'Manager',
  provider: 'Provider',
};

// Map display roles to API roles
const roleApiMap: Record<string, StaffRole> = {
  'Business Admin': 'business_admin',
  Manager: 'manager',
  Provider: 'provider',
};

export default function Staff() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    locationId: string;
  } | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  // Build query params for staff API
  const staffQueryParams = useMemo(() => {
    const params: {
      search?: string;
      location_id?: string;
      role?: StaffRole;
    } = {};

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (selectedLocation !== 'all') {
      params.location_id = selectedLocation;
    }

    if (selectedRole !== 'all') {
      const apiRole = roleApiMap[selectedRole] as StaffRole | undefined;
      if (apiRole) {
        params.role = apiRole;
      }
    }

    return params;
  }, [searchQuery, selectedRole, selectedLocation]);

  // Fetch staff data
  const {
    data: staffData,
    isLoading: isLoadingStaff,
    error: staffError,
    refetch: refetchStaff,
  } = useGetStaffQuery(staffQueryParams);

  // Fetch staff count
  const {
    data: staffCount,
    isLoading: isLoadingCount,
    error: countError,
  } = useGetStaffCountQuery();

  // Fetch locations for filter dropdown
  const { data: locationsData } = useGetLocationsQuery();

  // Mutations
  const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
  const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();

  // Build role options
  const roleOptions: SelectOption[] = useMemo(() => {
    return [
      { value: 'all', label: 'All Roles' },
      { value: 'Business Admin', label: 'Business Admin' },
      { value: 'Manager', label: 'Manager' },
      { value: 'Provider', label: 'Provider' },
    ];
  }, []);

  // Build location options
  const locationOptions: SelectOption[] = useMemo(() => {
    if (!locationsData) {
      return [{ value: 'all', label: 'All Locations' }];
    }

    return [
      { value: 'all', label: 'All Locations' },
      ...locationsData.map((location) => ({
        value: location.id,
        label: location.name,
      })),
    ];
  }, [locationsData]);

  // Calculate summary statistics from API
  const stats = useMemo(() => {
    if (!staffCount) {
      return { total: 0, admins: 0, managers: 0, providers: 0 };
    }

    return {
      total: staffCount.total,
      admins: staffCount.business_admin,
      managers: staffCount.manager,
      providers: staffCount.provider,
    };
  }, [staffCount]);

  // Transform staff data for display
  const displayUsers = useMemo(() => {
    if (!staffData) return [];

    return staffData.map((member: StaffMember) => {
      const fullName = `${member.first_name} ${member.last_name}`;
      const initials = `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
      const displayRole = roleDisplayMap[member.role] || member.role;
      const status = member.status === 1 ? 'Active' : 'Inactive';

      return {
        id: member.id,
        name: fullName,
        initials,
        phone: member.phone || undefined,
        email: member.email,
        role: displayRole,
        apiRole: member.role,
        locationId: member.location_id,
        locationName: member.location_name,
        status,
        rawData: member,
      };
    });
  }, [staffData]);

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'Business Admin':
        return 'bg-primary-500 text-white';
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Active':
        return 'bg-primary-500 text-white';
      case 'Inactive':
        return 'bg-error text-white';
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };

  const handleCreateStaff = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    locationId: string;
  }) => {
    const apiRole = roleApiMap[data.role] as StaffRole | undefined;
    if (!apiRole) {
      toast.error('Invalid role selected');
      throw new Error('Invalid role selected');
    }

    try {
      await createStaff({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        role: apiRole,
        location_id: data.locationId || undefined,
      }).unwrap();

      toast.success('Staff member created successfully');
      setIsAddUserModalOpen(false);
      refetchStaff();
    } catch (error: any) {
      // Show error in both toast and modal
      const errorMessage = getErrorMessage(error, 'Failed to create staff member');
      toast.error(errorMessage || 'Failed to create staff member');
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleEditStaff = (user: (typeof displayUsers)[0]) => {
    const displayRole = user.role;
    setSelectedUser({
      id: user.id,
      firstName: user.rawData.first_name,
      lastName: user.rawData.last_name,
      email: user.email,
      phone: user.phone || '',
      role: displayRole,
      locationId: user.locationId || '',
    });
    setIsEditUserModalOpen(true);
  };

  const handleUpdateStaff = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    locationId: string;
  }) => {
    if (!selectedUser) {
      throw new Error('No user selected');
    }

    const apiRole = roleApiMap[data.role] as StaffRole | undefined;
    if (!apiRole) {
      toast.error('Invalid role selected');
      throw new Error('Invalid role selected');
    }

    try {
      await updateStaff({
        id: selectedUser.id,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || undefined,
          role: apiRole,
          location_id: data.locationId || undefined,
        },
      }).unwrap();

      toast.success('Staff member updated successfully');
      setIsEditUserModalOpen(false);
      setSelectedUser(null);
      refetchStaff();
    } catch (error: any) {
      // Show error in both toast and modal
      const errorMessage = getErrorMessage(error, 'Failed to update staff member');
      toast.error(errorMessage || 'Failed to update staff member');
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleDeleteClick = (user: (typeof displayUsers)[0]) => {
    setUserToDelete({ id: user.id, name: user.name });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteStaff({ id: userToDelete.id }).unwrap();
      toast.success('Staff member deleted successfully');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      refetchStaff();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete staff member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldIcon className="w-8 h-8 text-neutral-900" />
          <h1 className="text-3xl font-bold text-neutral-900">User Management</h1>
        </div>
        <p className="text-neutral-600 ml-11">
          Manage your business users with different access levels
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="text-sm text-neutral-600 mb-1">Total Users</div>
          <div className="text-3xl font-bold text-neutral-900">
            {isLoadingCount ? '...' : stats.total}
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="text-sm text-neutral-600 mb-1">Business Admins</div>
          <div className="text-3xl font-bold text-neutral-900">
            {isLoadingCount ? '...' : stats.admins}
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="text-sm text-neutral-600 mb-1">Managers</div>
          <div className="text-3xl font-bold text-neutral-900">
            {isLoadingCount ? '...' : stats.managers}
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="text-sm text-neutral-600 mb-1">Providers</div>
          <div className="text-3xl font-bold text-neutral-900">
            {isLoadingCount ? '...' : stats.providers}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-4 border border-neutral-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full md:w-auto">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefixIcon={<SearchIcon className="w-5 h-5" />}
              containerClassName="w-full"
            />
          </div>
          <div className="flex gap-4 flex-1 md:flex-initial">
            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={(value) => setSelectedRole(value)}
              placeholder="All Roles"
              containerClassName="w-full md:w-48"
            />
            <Select
              options={locationOptions}
              value={selectedLocation}
              onChange={(value) => setSelectedLocation(value)}
              placeholder="All Locations"
              containerClassName="w-full md:w-48"
            />
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full md:w-auto"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Locations
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoadingStaff ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    Loading staff members...
                  </td>
                </tr>
              ) : staffError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-error">
                    Error loading staff members. Please try again.
                  </td>
                </tr>
              ) : displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No staff members found
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-neutral-700">
                            {user.initials}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{user.name}</div>
                          {user.phone && (
                            <div className="text-sm text-neutral-500">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.locationName ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-200 text-neutral-700">
                            {user.locationName}
                          </span>
                        ) : (
                          <span className="text-sm text-neutral-400">No location</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditStaff(user)}
                          disabled={isUpdating}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary-50 text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
                          title="Edit staff member"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          disabled={isDeleting}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-error/10 text-error hover:text-error/80 transition-colors disabled:opacity-50"
                          title="Delete staff member"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleCreateStaff}
        mode="add"
      />

      {/* Edit User Modal */}
      <AddUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateStaff}
        initialData={selectedUser || undefined}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this staff member? This action cannot be undone.'
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
