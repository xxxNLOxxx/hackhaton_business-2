import React, { useState } from 'react';
import { User, Heart, Zap, ChevronDown, ChevronUp, Brain } from 'lucide-react';

const AgentCard = ({ id, agent, onInteract }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const moodColor = agent.mood > 0 ? '#4ade80' : '#f87171';

    // Функция для кнопки, чтобы клик не уходил на саму карточку (Интерактивность)
    const handleButtonClick = (e) => {
        e.stopPropagation();
        onInteract(id);
    };

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
                background: '#1e1e1e',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                borderLeft: `6px solid ${moodColor}`,
                color: '#e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                height: 'fit-content' // Чтобы карточка не растягивалась на всю высоту колонки
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <User size={24} color={moodColor} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{agent.name}</h2>
                        <span style={{ fontSize: '10px', color: '#4b5563' }}>ID: {id}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        background: '#2d2d2d',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: `1px solid ${moodColor}44` // Полупрозрачная рамка в цвет настроения
                    }}>
                        <Heart size={14} color={moodColor} fill={moodColor} />
                        <span style={{ fontWeight: 'bold', color: moodColor }}>{agent.mood.toFixed(1)}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />}
                </div>
            </div>

            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '12px', lineHeight: '1.4' }}>
                {agent.bio}
            </p>

            {/* ИНСПЕКТОР АГЕНТА (Обновленный) */}
            {isExpanded && (
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #333' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#3b82f6', marginBottom: '10px' }}>
                        <Brain size={16} /> СОСТОЯНИЕ АГЕНТА
                    </h4>

                    {/* ВЫВОД ЦЕЛИ (АРХИТЕКТУРА АГЕНТА) */}
                    <div style={{ marginBottom: '15px', background: '#1a1a1a', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                        <small style={{ color: '#555', textTransform: 'uppercase', fontSize: '10px' }}>Текущая цель:</small>
                        <div style={{ fontSize: '13px', color: '#fff' }}>{agent.current_goal || "Адаптация к среде"}</div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#d1d5db', background: '#111', padding: '12px', borderRadius: '10px' }}>
                        {agent.history && agent.history.length > 0
                            ? agent.history.slice(-3).map((h, i) => (
                                <div key={i} style={{ marginBottom: '6px' }}>• {h}</div>
                            ))
                            : "Память пуста..."}
                    </div>
                </div>
            )}

            <button
                onClick={handleButtonClick}
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: moodColor,
                    color: '#121212',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: `0 4px 14px ${moodColor}44`
                }}
            >
                <Zap size={16} />
                <span>Воздействовать</span>
            </button>
        </div>
    );
};

export default AgentCard;