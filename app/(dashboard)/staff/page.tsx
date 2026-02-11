'use client';

import { ToastContainer } from 'react-toastify';
import Staff from '@/components/dashboard/Staff';
import 'react-toastify/dist/ReactToastify.css';

export default function StaffPage() {
  return (
    <div className="p-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
      <Staff />
    </div>
  );
}
