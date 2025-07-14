import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import { MoreVertical, Calendar, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Session {
  id: number;
  topic: string;
  date: string;
  time: string;
  duration: string;
}

interface SessionActionsProps {
  session: Session;
  onCancel: (id: number) => void;
  onReschedule: (id: number, newDate: string, newTime: string) => void;
}

export default function SessionActions({ session, onCancel, onReschedule }: SessionActionsProps) {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState(session.date);
  const [newTime, setNewTime] = useState(session.time);

  const handleReschedule = () => {
    onReschedule(session.id, newDate, newTime);
    setIsRescheduleOpen(false);
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="text-white/70 hover:text-white transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="z-50 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg p-2 w-48 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
            sideOffset={5}
          >
            <div className="space-y-1">
              <Dialog.Root open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
                <Dialog.Trigger asChild>
                  <button className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                    Reschedule
                  </button>
                </Dialog.Trigger>

                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md z-50 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <Dialog.Title className="text-xl font-bold text-white mb-4">
                      Reschedule Session
                    </Dialog.Title>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          New Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-white/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          New Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-white/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => setIsRescheduleOpen(false)}
                        className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReschedule}
                        className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                      >
                        Confirm
                      </button>
                    </div>

                    <Dialog.Close asChild>
                      <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>

              <button
                onClick={() => onCancel(session.id)}
                className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel Session
              </button>
            </div>

            <Popover.Arrow className="fill-gray-900/95" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}