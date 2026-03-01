import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, AlertCircle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinanceStore } from '@/lib/store';
import { autoDetectCategory } from '@/lib/categories';
import { toast } from 'sonner';

interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

  const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));

  const dateIdx = header.findIndex(h => h.includes('date'));
  const descIdx = header.findIndex(h => h.includes('desc') || h.includes('narration') || h.includes('particular') || h.includes('remark'));
  const amountIdx = header.findIndex(h => h.includes('amount') || h.includes('value'));
  const debitIdx = header.findIndex(h => h.includes('debit') || h.includes('withdrawal'));
  const creditIdx = header.findIndex(h => h.includes('credit') || h.includes('deposit'));

  if (dateIdx === -1) throw new Error('Could not find a "Date" column in CSV.');
  if (descIdx === -1 && amountIdx === -1 && debitIdx === -1) throw new Error('Could not find description or amount columns.');

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
    if (cols.length < 2 || !cols[dateIdx]) continue;

    const dateStr = cols[dateIdx];
    const description = descIdx !== -1 ? cols[descIdx] : 'Unknown';

    let amount = 0;
    let type: 'income' | 'expense' = 'expense';

    if (debitIdx !== -1 && creditIdx !== -1) {
      const debit = parseFloat(cols[debitIdx]) || 0;
      const credit = parseFloat(cols[creditIdx]) || 0;
      if (credit > 0) { amount = credit; type = 'income'; }
      else { amount = debit; type = 'expense'; }
    } else if (amountIdx !== -1) {
      amount = parseFloat(cols[amountIdx]) || 0;
      if (amount < 0) { amount = Math.abs(amount); type = 'expense'; }
      else { type = 'income'; }
    }

    if (amount === 0) continue;

    // Parse date (try common formats)
    let parsedDate = dateStr;
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) parsedDate = d.toISOString().slice(0, 10);
    } catch { /* keep original */ }

    rows.push({
      date: parsedDate,
      description,
      amount,
      type,
      category: autoDetectCategory(description),
    });
  }

  if (rows.length === 0) throw new Error('No valid transactions found in CSV.');
  return rows;
}

export default function CSVUploadPage() {
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [error, setError] = useState('');
  const [imported, setImported] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { addTransactions } = useFinanceStore();

  const handleFile = useCallback((file: File) => {
    setError('');
    setParsed(null);
    setImported(false);

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        setParsed(rows);
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = () => {
    if (!parsed) return;
    addTransactions(parsed);
    setImported(true);
    toast.success(`${parsed.length} transactions imported successfully!`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Import Bank Statement</h1>
        <p className="text-muted-foreground mt-1">Upload a CSV file to auto-import and categorize transactions</p>
      </div>

      {/* Upload zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer
          ${dragOver
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border/60 bg-white/40 dark:bg-white/5 backdrop-blur-xl hover:border-primary/40'
          }`}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.csv';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
      >
        <Upload className={`w-10 h-10 mx-auto mb-4 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="font-medium font-display">Drop your CSV file here</p>
        <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
        <p className="text-xs text-muted-foreground mt-3">Supports columns: Date, Description/Narration, Amount/Debit/Credit</p>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Import Error</p>
            <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4 text-muted-foreground" /></button>
        </motion.div>
      )}

      {/* Success animation */}
      <AnimatePresence>
        {imported && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-8 h-8 text-success" />
            </motion.div>
            <h3 className="text-lg font-semibold font-display">Import Successful!</h3>
            <p className="text-sm text-muted-foreground mt-1">{parsed?.length} transactions imported and categorized.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview */}
      {parsed && !imported && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold font-display">{parsed.length} transactions found</h3>
            </div>
            <Button onClick={handleImport} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Import All
            </Button>
          </div>

          <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {parsed.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 text-xs">{row.date}</td>
                      <td className="px-4 py-2.5 text-xs max-w-[200px] truncate">{row.description}</td>
                      <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{row.category}</span></td>
                      <td className="px-4 py-2.5 text-xs text-right font-medium">₹{row.amount.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${row.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          {row.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.length > 50 && (
              <div className="px-4 py-2 text-xs text-muted-foreground text-center border-t border-border/30">
                Showing 50 of {parsed.length} transactions
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
