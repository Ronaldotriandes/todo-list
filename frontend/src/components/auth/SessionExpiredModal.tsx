'use client';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionExpiredModal({ isOpen, onClose }: SessionExpiredModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, router]);

  const handleLoginRedirect = () => {
    onClose();
    router.push('/login');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session Expired" size="sm">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your session has expired
          </h3>
          <p className="text-sm text-gray-600">
            For your security, you have been logged out due to inactivity.
            Please log in again to continue.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            Redirecting to login page in <span className="font-bold">{countdown}</span> seconds...
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={countdown <= 0}
          >
            Stay Here
          </Button>
          <Button
            onClick={handleLoginRedirect}
            disabled={countdown <= 0}
          >
            Login Now
          </Button>
        </div>
      </div>
    </Modal>
  );
}