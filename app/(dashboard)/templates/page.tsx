'use client';

import { useState, useEffect } from 'react';
import {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useUpdateTemplateMutation,
  useResetTemplateMutation,
} from '@/store/templates';
import { Button, Modal, Input } from '@/components/ui';
import EditorWithTemplates from '@/components/editor/EditorWithTemplates';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { convertHtmlToVariables } from '@/components/editor/variableHelpers';
import type { NotificationTemplate } from '@/store/templates/types';
// import 'react-toastify/dist/ReactToastify.css';

export default function TemplatesPage() {
  const { data: templates = [], isLoading, refetch } = useGetTemplatesQuery();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [resetTemplate] = useResetTemplateMutation();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
  });

  // Fetch full template data when editing
  const { data: fullTemplate, isLoading: isLoadingTemplate } = useGetTemplateQuery(
    { id: selectedTemplateId || '' },
    { skip: !selectedTemplateId || !isUpdateModalOpen }
  );

  // Extract variables from nested structure
  // Priority: variables array > base_template.type.variables
  const templateVariables =
    fullTemplate?.variables ||
    fullTemplate?.base_template?.type?.variables ||
    [];

  // Convert API variables to editor format
  const editorVariables = templateVariables.map((variable) => ({
    key: variable.key,
    label: variable.label,
    defaultValue: undefined,
  }));

  // Update form data when full template loads
  useEffect(() => {
    if (fullTemplate && isUpdateModalOpen) {
      setFormData({
        title: fullTemplate.title,
        body: fullTemplate.body,
      });
    }
  }, [fullTemplate, isUpdateModalOpen]);

  const handleEdit = (template: NotificationTemplate) => {
    setSelectedTemplateId(template.id);
    setIsUpdateModalOpen(true);
  };

  const handleReset = (template: NotificationTemplate) => {
    setSelectedTemplateId(template.id);
    setIsResetModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId || !fullTemplate) return;

    try {
      // formData.body is already in {{variable}} format from the onChange handler
      await updateTemplate({
        id: fullTemplate.id,
        title: formData.title,
        body: formData.body,
      }).unwrap();

      toast.success('Template updated successfully');
      setIsUpdateModalOpen(false);
      setSelectedTemplateId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update template');
    }
  };

  const handleResetConfirm = async () => {
    if (!selectedTemplateId) return;

    try {
      await resetTemplate({ id: selectedTemplateId }).unwrap();
      toast.success('Template reset successfully');
      setIsResetModalOpen(false);
      setSelectedTemplateId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reset template');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-neutral-500">Loading templates...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Notification Templates</h1>

        {templates.length === 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
            <p className="text-neutral-500">No templates found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {template.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {template.provider.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">{template.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                            Update
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleReset(template)}>
                            Reset
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Update Modal */}
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedTemplateId(null);
          }}
          title="Update Notification Template"
          size="xl"
        >
          {isLoadingTemplate ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-neutral-500">Loading template...</div>
            </div>
          ) : fullTemplate ? (
            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                containerClassName="w-full"
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Body <span className="text-error">*</span>
                </label>
                <EditorWithTemplates
                  data={formData.body}
                  onChange={(html) => {
                    // Convert HTML with variable nodes back to {{variable}} format for storage
                    const bodyWithVariables = convertHtmlToVariables(html);
                    setFormData({ ...formData, body: bodyWithVariables });
                  }}
                  variables={editorVariables}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedTemplateId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Update
                </Button>
              </div>
            </form>
          ) : null}
        </Modal>

        {/* Reset Confirmation Modal */}
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => {
            setIsResetModalOpen(false);
            setSelectedTemplateId(null);
          }}
          title="Reset Template"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-neutral-700">
              Are you sure you want to reset this template? This will restore it to its default
              values and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsResetModalOpen(false);
                  setSelectedTemplateId(null);
                }}
              >
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleResetConfirm}>
                Reset
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
