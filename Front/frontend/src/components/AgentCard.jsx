import React, { useState } from 'react';
import { User, Zap, ChevronDown, ChevronUp, Brain, Target, Activity } from 'lucide-react';

const AgentCard = ({ id, agent, onInteract }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    const agentColor = agent.color || '#3b82f6';
    const moodPercent = ((agent.mood + 1) / 2) * 100;
    const moodColor = agent.mood > 0 ? '#4ade80' : '#f87171';

    const handleButtonClick = (e) => {
        e.stopPropagation();
        onInteract(id);
    };

    const cardStyle = {
        background: 'linear-gradient(145deg, #1e1e1e 0%, #161616 100%)',
        borderRadius: '20px',
        padding: '24px',
        color: '#e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: 'fit-content',
        minWidth: '320px',
        position: 'relative',
        overflow: 'visible', // Важно: разрешаем свечению выходить за границы
        marginBottom: '15px',
        border: `1px solid ${isHovered || isExpanded ? agentColor + 'aa' : 'rgba(255,255,255,0.1)'}`,
        
        // ДИНАМИЧЕСКИЙ СЛОЙ: если открыта или наведен курсор — она сверху
        zIndex: isExpanded || isHovered ? 100 : 1,
        
        boxShadow: isExpanded || isHovered 
            ? `0 20px 50px rgba(0,0,0,0.6), 0 0 20px ${agentColor}44` 
            : `0 8px 32px rgba(0,0,0,0.4)`,
        
        transform: isHovered ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)',
    };

    const sectionStyle = {
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginTop: '12px',
        backdropFilter: 'blur(5px)'
    };

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={cardStyle}
        >
            {/* Яркое пятно света под карточкой при наведении или открытии */}
            {(isHovered || isExpanded) && (
                <div style={{
                    position: 'absolute',
                    inset: '-1px',
                    borderRadius: '20px',
                    background: `radial-gradient(circle at top right, ${agentColor}33, transparent 70%)`,
                    pointerEvents: 'none',
                    zIndex: -1
                }} />
            )}

            {/* Шапка */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                        background: `${agentColor}22`, 
                        padding: '10px', 
                        borderRadius: '14px',
                        border: `1px solid ${agentColor}44`,
                        boxShadow: isHovered ? `0 0 15px ${agentColor}44` : 'none'
                    }}>
                        <User size={24} color={agentColor} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>{agent.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Activity size={10} color="#555" />
                            <span style={{ fontSize: '10px', color: '#555', fontWeight: 'bold' }}>{id.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ width: '60px', height: '4px', background: '#111', borderRadius: '10px' }}>
                        <div style={{ 
                            width: `${moodPercent}%`, 
                            height: '100%', 
                            background: moodColor, 
                            boxShadow: `0 0 10px ${moodColor}`,
                            transition: 'width 0.5s ease' 
                        }} />
                    </div>
                    {isExpanded ? <ChevronUp size={20} color={agentColor} /> : <ChevronDown size={20} color="#444" />}
                </div>
            </div>

            {/* Био */}
            <div style={{ ...sectionStyle, borderLeft: `3px solid ${agentColor}` }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#ccc', lineHeight: '1.5' }}>
                    {agent.bio}
                </p>
            </div>

            {/* Развернутый блок */}
            <div style={{ 
                maxHeight: isExpanded ? '400px' : '0px', 
                opacity: isExpanded ? 1 : 0,
                transition: 'all 0.4s ease-in-out',
                overflow: 'hidden'
            }}>
                <div style={sectionStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Target size={14} color={agentColor} />
                        <span style={{ color: agentColor, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Directive</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#eee', fontStyle: 'italic' }}>
                        "{agent.current_goal || "Scanning..."}"
                    </div>
                </div>

                <div style={sectionStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Brain size={14} color="#a78bfa" />
                        <span style={{ color: '#a78bfa', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Cognitive Buffer</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        {agent.history && agent.history.length > 0 ? agent.history[agent.history.length - 1] : "Logs empty."}
                    </div>
                </div>

                <button
                    onClick={handleButtonClick}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: agentColor,
                        color: '#fff',
                        fontWeight: '800',
                        marginTop: '15px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        boxShadow: `0 5px 15px ${agentColor}44`
                    }}
                >
                    <Zap size={16} fill="#fff" />
                    Initialize interaction
                </button>
            </div>
        </div>
    );
};

export default AgentCard;