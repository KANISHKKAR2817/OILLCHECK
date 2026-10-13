import React from 'react';
import { ScanDetail } from '../../types';
import { Printer, ShieldCheck, Download } from 'lucide-react';

interface PrintableReportProps {
  scan: ScanDetail;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ scan }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PillCheck_Screening_Report_${scan.id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-navy-900 text-xs font-semibold border border-surface-200 transition-colors shadow-2xs"
        title="Print Clinical Summary"
      >
        <Printer className="w-4 h-4 text-surface-600" />
        <span>Print Summary</span>
      </button>

      <button
        onClick={handleDownloadJson}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-navy-900 text-xs font-semibold border border-surface-200 transition-colors shadow-2xs"
        title="Export Report JSON"
      >
        <Download className="w-4 h-4 text-surface-600" />
        <span>Export Data</span>
      </button>
    </div>
  );
};
