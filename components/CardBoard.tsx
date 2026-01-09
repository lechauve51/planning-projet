'use client';

import { usePlanningStore } from '@/store/usePlanningStore';
import { TimelineCard } from './TimelineCard';

export function CardBoard() {
  const cards = usePlanningStore((state) => state.getCards());
  const selectedCardIndex = usePlanningStore((state) => state.selectedCardIndex);
  const setSelectedCard = usePlanningStore((state) => state.setSelectedCard);

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p>Aucune carte disponible. Configurez la timeline dans les paramètres.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cards.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={() => setSelectedCard(index)}
              className={`px-4 py-2 rounded transition ${
                selectedCardIndex === index
                  ? 'bg-navy text-white'
                  : 'bg-white text-navy hover:bg-gray-100'
              }`}
            >
              {card.title}
            </button>
          ))}
        </div>
      )}
      
      <TimelineCard card={cards[selectedCardIndex]} cardIndex={selectedCardIndex} />
    </div>
  );
}

