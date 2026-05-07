import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBuildingStore } from '../../store/useBuildingStore';

interface AddProps {
  mode: 'add';
  apartmentId: number;
  onClose: () => void;
}

interface EditProps {
  mode: 'edit';
  apartmentId: number;
  roomId: string;
  currentTemp: number;
  onClose: () => void;
}

type Props = AddProps | EditProps;

/** Modal for adding a new room or editing an existing room's temperature. */
export function RoomModal(props: Props) {
  const addRoom = useBuildingStore(s => s.addRoom);
  const editRoomTemp = useBuildingStore(s => s.editRoomTemp);
  const isEdit = props.mode === 'edit';
  const [temp, setTemp] = useState(isEdit ? String((props as EditProps).currentTemp) : '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') props.onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      const val = parseFloat(temp);
      if (!isNaN(val)) editRoomTemp(props.apartmentId, (props as EditProps).roomId, val);
    } else {
      addRoom(props.apartmentId);
    }
    props.onClose();
  }

  return (
    <Backdrop onClose={props.onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-ci-blue px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            {isEdit ? `Edit Room ${(props as EditProps).roomId}` : `Add Room — Apt ${props.apartmentId}`}
          </h2>
          <button onClick={props.onClose} className="text-white/70 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-0.5 bg-ci-green" />

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {isEdit ? (
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                min={10}
                max={40}
                value={temp}
                onChange={e => setTemp(e.target.value)}
                autoFocus
                className="w-full border border-ci-border rounded-lg px-3 py-2.5 text-ci-text text-sm focus:outline-none focus:border-ci-blue"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              A new room will be added with a random temperature between 10–40°C, and heating or cooling will be set automatically.
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={props.onClose}
              className="flex-1 px-4 py-2 text-sm text-gray-500 border border-ci-border hover:border-gray-400 rounded-lg transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-bold text-white bg-ci-blue hover:bg-ci-blue-dark rounded-lg transition-colors cursor-pointer"
            >
              {isEdit ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </Backdrop>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}
