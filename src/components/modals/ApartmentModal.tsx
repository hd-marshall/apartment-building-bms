import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBuildingStore } from '../../store/useBuildingStore';
import type { Apartment } from '../../models/Apartment';

interface AddProps {
  mode: 'add';
  onClose: () => void;
}

interface EditProps {
  mode: 'edit';
  apartment: Apartment;
  onClose: () => void;
}

type Props = AddProps | EditProps;

/** Modal for adding a new apartment or editing an existing owner name. */
export function ApartmentModal(props: Props) {
  const building = useBuildingStore(s => s.building);
  const addApartment = useBuildingStore(s => s.addApartment);
  const editApartmentOwner = useBuildingStore(s => s.editApartmentOwner);
  const isEdit = props.mode === 'edit';

  const [aptId, setAptId] = useState(isEdit ? String((props as EditProps).apartment.apartmentId) : '');
  const [owner, setOwner] = useState(isEdit ? (props as EditProps).apartment.owner : '');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') props.onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      editApartmentOwner((props as EditProps).apartment.apartmentId, owner);
    } else {
      const id = parseInt(aptId, 10);
      if (isNaN(id) || id <= 0) { setError('Enter a valid apartment number'); return; }
      if (building.getApartment(id)) { setError(`Apartment ${id} already exists`); return; }
      addApartment(id, owner || 'Unassigned');
    }
    props.onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && props.onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-ci-blue px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            {isEdit ? `Edit Apt ${(props as EditProps).apartment.apartmentId}` : 'Add Apartment'}
          </h2>
          <button onClick={props.onClose} className="text-white/70 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-0.5 bg-ci-green" />

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {!isEdit && (
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">
                Apartment Number
              </label>
              <input
                type="number"
                value={aptId}
                onChange={e => { setAptId(e.target.value); setError(''); }}
                autoFocus
                placeholder="e.g. 103"
                className="w-full border border-ci-border rounded-lg px-3 py-2.5 text-ci-text text-sm focus:outline-none focus:border-ci-blue placeholder:text-gray-300"
              />
              {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">
              Owner Name
            </label>
            <input
              type="text"
              value={owner}
              onChange={e => setOwner(e.target.value)}
              autoFocus={isEdit}
              placeholder="e.g. Jordan Lee"
              className="w-full border border-ci-border rounded-lg px-3 py-2.5 text-ci-text text-sm focus:outline-none focus:border-ci-blue placeholder:text-gray-300"
            />
          </div>

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
              {isEdit ? 'Save Changes' : 'Add Apartment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
