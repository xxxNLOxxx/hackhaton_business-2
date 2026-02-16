import React, { useState } from 'react';
import { User, Heart, Zap, ChevronDown, ChevronUp, Brain, Target } from 'lucide-react';

const AgentCard = ({ id, agent, onInteract }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Используем цвет из бэкенда или дефолтный, если цвет не задан
    const agentColor = agent.color || '#3b82f6';
    // Настроение для полоски (переводим из -1..1 в 0..100%)
    const moodPercent = ((agent.mood + 1) / 2) * 100;
    // Цвет настроения: красный для плохого, зеленый для хорошего
    const moodColor = agent.mood > 0 ? '#4ade80' : '#f87171';

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
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                borderLeft: `6px solid ${agentColor}`,
                color: '#e5e7eb',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                height: 'fit-content'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        background: `${agentColor}22`, 
                        padding: '10px', 
                        borderRadius: '12px',
                        border: `1px solid ${agentColor}44` 
                    }}>
                        <User size={28} color={agentColor} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>{agent.name}</h2>
                        <span style={{ fontSize: '11px', color: '#555', fontWeight: 'bold' }}>STATION: {id.toUpperCase()}</span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* Визуальный индикатор настроения */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px', textTransform: 'uppercase' }}>Mood System</div>
                        <div style={{ 
                            width: '80px', 
                            height: '6px', 
                            background: '#111', 
                            borderRadius: '10px', 
                            overflow: 'hidden',
                            border: '1px solid #333'
                        }}>
                            <div style={{ 
                                width: `${moodPercent}%`, 
                                height: '100%', 
                                background: moodColor,
                                boxShadow: `0 0 10px ${moodColor}`
                            }} />
                        </div>
                    </div>
                    {isExpanded ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />}
                </div>
            </div>

            <p style={{ color: '#aaa', fontSize: '14px', marginTop: '15px', lineHeight: '1.5' }}>
                {agent.bio}
            </p>

            {/* ИНСПЕКТОР (Расширенная информация) */}
            {isExpanded && (
                <div style={{ 
                    marginTop: '20px', 
                    paddingTop: '20px', 
                    borderTop: '1px solid #333',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    {/* Блок ТЕКУЩАЯ ЦЕЛЬ (Requirement: Архитектура агента) */}
                    <div style={{ 
                        marginBottom: '15px', 
                        background: '#151515', 
                        padding: '12px', 
                        borderRadius: '10px', 
                        border: '1px solid #222'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <Target size={14} color="#3b82f6" />
                            <span style={{ color: '#3b82f6', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Текущая установка</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#eee', fontStyle: 'italic' }}>
                            "{agent.current_goal || "Анализ окружающего пространства..."}"
                        </div>
                    </div>

                    {/* Блок ПАМЯТЬ (Requirement: Глубина памяти) */}
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <Brain size={14} color="#8b5cf6" />
                            <span style={{ color: '#8b5cf6', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Локальная память</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                            {agent.history && agent.history.length > 0
                                ? agent.history.slice(-3).map((h, i) => (
                                    <div key={i} style={{ 
                                        padding: '4px 0', 
                                        borderBottom: i === 2 ? 'none' : '1px solid #1a1a1a',
                                        color: i === agent.history.slice(-3).length - 1 ? '#ccc' : '#777'
                                    }}>
                                        {h}
                                    </div>
                                ))
                                : "Записи отсутствуют..."}
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleButtonClick}
                style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: agentColor,
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '800',
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: `0 4px 20px ${agentColor}33`
                }}
            >
                <Zap size={18} fill="#fff" />
                Взаимодействовать
            </button>
        </div>
    );
};

export default AgentCard;