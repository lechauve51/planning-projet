'use client';

import { useState, useRef } from 'react';
import { usePlanningStore } from '@/store/usePlanningStore';
import { toPng, toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export function ExportImageBar() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportScale, setExportScale] = useState(2);
  const cards = usePlanningStore((state) => state.getCards());
  const selectedCardIndex = usePlanningStore((state) => state.selectedCardIndex);
  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const exportCard = async (cardIndex: number, format: 'png' | 'jpg' = 'png') => {
    // Find the card element in the visible timeline
    const visibleCard = document.querySelector(`[data-card-index="${cardIndex}"]`);
    const cardElement = visibleCard as HTMLElement || cardRefs.current[cardIndex];
    
    if (!cardElement) {
      alert('Impossible de trouver la carte à exporter');
      return;
    }

    setIsExporting(true);
    try {
      const dataUrl = format === 'png'
        ? await toPng(cardElement, {
            quality: 1,
            pixelRatio: exportScale,
            backgroundColor: '#ffffff',
          })
        : await toJpeg(cardElement, {
            quality: 0.95,
            pixelRatio: exportScale,
            backgroundColor: '#ffffff',
          });

      const card = cards[cardIndex];
      const filename = `planning-${card.title.replace(/\s+/g, '-')}-${Date.now()}.${format}`;
      saveAs(dataUrl, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllCards = async (format: 'png' | 'jpg' = 'png') => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const promises = cards.map(async (card, index) => {
        const cardElement = cardRefs.current[index];
        if (!cardElement) return null;

        const dataUrl = format === 'png'
          ? await toPng(cardElement, {
              quality: 1,
              pixelRatio: exportScale,
              backgroundColor: '#ffffff',
            })
          : await toJpeg(cardElement, {
              quality: 0.95,
              pixelRatio: exportScale,
              backgroundColor: '#ffffff',
            });

        // Convert data URL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return { filename: `planning-${card.title.replace(/\s+/g, '-')}.${format}`, blob };
      });

      const results = await Promise.all(promises);
      results.forEach((result) => {
        if (result) {
          zip.file(result.filename, result.blob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `planning-all-${Date.now()}.zip`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  // Store refs for cards
  const setCardRef = (index: number, element: HTMLDivElement | null) => {
    cardRefs.current[index] = element;
  };

  return (
    <>
      <div className="bg-card border border-line rounded-card shadow-card p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-muted">
              Échelle d&apos;export:
            </label>
            <select
              value={exportScale}
              onChange={(e) => setExportScale(parseInt(e.target.value))}
              className="px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
              disabled={isExporting}
            >
              <option value="1">1x</option>
              <option value="2">2x (recommandé)</option>
              <option value="3">3x (haute résolution)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => exportCard(selectedCardIndex, 'png')}
              disabled={isExporting}
              className="px-4 py-2 bg-navy text-white rounded-[10px] hover:bg-opacity-90 transition disabled:opacity-50 text-xs font-black"
            >
              {isExporting ? 'Export...' : 'Export PNG (carte actuelle)'}
            </button>
            <button
              onClick={() => exportCard(selectedCardIndex, 'jpg')}
              disabled={isExporting}
              className="px-4 py-2 bg-navy text-white rounded-[10px] hover:bg-opacity-90 transition disabled:opacity-50 text-xs font-black"
            >
              Export JPG (carte actuelle)
            </button>
            {cards.length > 1 && (
              <>
                <button
                  onClick={() => exportAllCards('png')}
                  disabled={isExporting}
                  className="px-4 py-2 bg-gold text-navy rounded-[10px] hover:bg-opacity-90 transition disabled:opacity-50 text-xs font-black border border-line2"
                >
                  Export PNG (toutes)
                </button>
                <button
                  onClick={() => exportAllCards('jpg')}
                  disabled={isExporting}
                  className="px-4 py-2 bg-gold text-navy rounded-[10px] hover:bg-opacity-90 transition disabled:opacity-50 text-xs font-black border border-line2"
                >
                  Export JPG (toutes)
                </button>
              </>
            )}
          </div>
        </div>
      </div>

    </>
  );
}


