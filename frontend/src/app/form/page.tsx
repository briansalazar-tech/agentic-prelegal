'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NDAForm } from '@/components/NDAForm';
import { NDAPreview } from '@/components/NDAPreview';
import { DownloadButton } from '@/components/DownloadButton';
import { NDAFormData, defaultFormData } from '@/types/nda';
import { isNdaReadyForDownload } from '@/utils/nda';

export default function NDAFormPage() {
  const [formData, setFormData] = useState<NDAFormData>(defaultFormData);
  const ready = isNdaReadyForDownload(formData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#032147' }}>
                Mutual NDA Creator
              </h1>
              <p className="text-sm" style={{ color: '#888888' }}>
                Fill in the form to generate your Mutual Non-Disclosure Agreement
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {ready && <DownloadButton formData={formData} />}
            <Link
              href="/"
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm"
            >
              ← AI Assistant
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Side by Side */}
      <main className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Agreement Details</h2>
              <p className="text-sm text-slate-500">
                Enter the key information for your Mutual NDA
              </p>
            </div>
            <div className="p-6 max-h-[calc(100vh-220px)] overflow-y-auto">
              <NDAForm formData={formData} onChange={setFormData} />
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Document Preview</h2>
                <p className="text-sm text-slate-500">Updates live as you fill in the form</p>
              </div>
              {ready && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Ready to download
                </span>
              )}
            </div>
            <div className="p-6 max-h-[calc(100vh-220px)] overflow-y-auto">
              <NDAPreview formData={formData} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-[1800px] mx-auto px-6 py-4 text-center text-sm text-slate-500">
          Based on{' '}
          <a
            href="https://commonpaper.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Common Paper
          </a>{' '}
          Standard Terms, licensed under{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            CC BY 4.0
          </a>
        </div>
      </footer>
    </div>
  );
}
