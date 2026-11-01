import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import InvoiceTemplate from './InvoiceTemplate';

/**
 * Invoice Modal for viewing and printing invoice from Admin and Student portals
 */
export const InvoiceModal = ({ isOpen, onClose, invoiceData }) => {
    if (!isOpen || !invoiceData) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div 
                className="bg-slate-100 dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Toolbar (no-print) */}
                <div className="no-print flex items-center justify-between p-4 sm:px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white font-arabic">
                                إيصال الفاتورة الضريبية
                            </h2>
                            <p className="text-xs text-slate-400 font-mono">
                                {invoiceData.invoiceNumber || invoiceData.orderNumber}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#004C97] hover:bg-[#071942] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer font-arabic"
                        >
                            <Printer className="w-4 h-4" />
                            <span>طباعة (A4)</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                            title="إغلاق"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-100/60 dark:bg-slate-950/40">
                    <InvoiceTemplate 
                        invoiceData={invoiceData} 
                        showControls={false} 
                        onPrint={handlePrint}
                    />
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
