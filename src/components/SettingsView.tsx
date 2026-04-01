import { AppSettings } from '../types';
import { cn } from '../lib/utils';

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}

export const SettingsView = ({ settings, setSettings }: SettingsViewProps) => (
  <div className="max-w-2xl space-y-8">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Settings</h2>
      <p className="text-slate-500">Customize your workspace preferences.</p>
    </div>

    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-4">Typography</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'font-inter', name: 'Inter', desc: 'Modern & Clean' },
            { id: 'font-space', name: 'Space Grotesk', desc: 'Tech & Geometric' },
            { id: 'font-playfair', name: 'Playfair Display', desc: 'Elegant & Serif' },
            { id: 'font-mono', name: 'JetBrains Mono', desc: 'Technical & Precise' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSettings({ ...settings, fontFamily: f.id })}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                settings.fontFamily === f.id 
                  ? "border-black bg-slate-50 ring-4 ring-black/5" 
                  : "border-slate-100 hover:border-slate-200"
              )}
            >
              <div className={cn("text-lg font-bold mb-1", f.id, settings.fontFamily === f.id ? "text-black" : "text-slate-900")}>{f.name}</div>
              <div className="text-xs text-slate-500">{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <label className="block text-sm font-semibold text-slate-700 mb-4">Layout Template</label>
        <div className="flex gap-4">
          {[
            { id: 'grid', label: 'Grid View' },
            { id: 'list', label: 'List View' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setSettings({ ...settings, viewTemplate: v.id as any })}
              className={cn(
                "flex-1 py-3 rounded-xl border-2 font-medium transition-all",
                settings.viewTemplate === v.id 
                  ? "border-black bg-slate-50 text-black" 
                  : "border-slate-100 text-slate-500 hover:bg-slate-50"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);
