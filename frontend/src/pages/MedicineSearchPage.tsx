import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MedicineReferenceDetail } from '../types';
import { Search, Database, ExternalLink, ShieldCheck, Tag, Building2, CheckCircle2 } from 'lucide-react';

export const MedicineSearchPage: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineReferenceDetail[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMedicines = async (searchTerm = '') => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.searchMedicines(searchTerm || undefined);
      setMedicines(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to search medicine references');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines(query.trim());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-surface-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Database className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-950 font-sans tracking-tight">
            Reference Formulary Catalog
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-surface-500 mt-1">
          Configured pharmaceutical registry records with official provenance from FDA NDC, WHO, and CDSCO
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="bg-white border border-surface-200 rounded-2xl p-4 shadow-2xs flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand name, active molecule, manufacturer, or barcode..."
            className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
        >
          Search Catalog
        </button>
      </form>

      {/* Results List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-surface-400">
          Querying verified reference registry...
        </div>
      ) : errorMsg ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {errorMsg}
        </div>
      ) : medicines.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-2xl p-12 text-center space-y-3 shadow-2xs">
          <p className="text-sm font-bold text-navy-950">No Reference Records Found</p>
          <p className="text-xs text-surface-400 max-w-sm mx-auto">
            No medicine matching "{query}" is currently configured in the local reference database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.map((med) => (
            <div
              key={med.id}
              className="bg-white border border-surface-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-sans">{med.brand_name}</h3>
                  <p className="text-xs text-surface-500 font-medium">{med.generic_name}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-brand-50 text-brand-700 font-bold border border-brand-200 shrink-0">
                  {med.dosage_form}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-1">
                <div className="flex items-center gap-1.5 text-surface-600">
                  <Tag className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>Strength: {med.strength}</span>
                </div>
                <div className="flex items-center gap-1.5 text-surface-600">
                  <Building2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>Mfr: {med.manufacturer}</span>
                </div>
              </div>

              {med.packaging_desc && (
                <p className="text-[11px] text-surface-500 bg-surface-50 p-2.5 rounded-xl border border-surface-200/60 leading-relaxed">
                  <strong className="text-surface-700">Packaging: </strong>
                  {med.packaging_desc}
                </p>
              )}

              {/* Batches on record */}
              {med.batches.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-surface-400 font-semibold">
                    Known Batches ({med.batches.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {med.batches.map((b) => (
                      <span
                        key={b.id}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          b.status === 'authorized'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {b.batch_number} ({b.status})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Provenance footer */}
              <div className="pt-2 border-t border-surface-100 flex items-center justify-between text-[11px] text-surface-400">
                <span className="font-mono">ID: {med.product_id}</span>
                {med.source && (
                  <span className="flex items-center gap-1 text-brand-600 font-medium">
                    {med.source.name}
                    {med.source.url && (
                      <a href={med.source.url} target="_blank" rel="noreferrer" className="text-surface-400 hover:text-brand-700">
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
