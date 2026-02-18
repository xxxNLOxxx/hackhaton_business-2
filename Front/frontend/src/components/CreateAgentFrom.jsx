import React, { useState } from 'react';
import { UserPlus, Sparkles, Palette, PlusCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = "http://localhost:8000";

const CreateAgentForm = ({ onCreated }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [mood, setMood] = useState(0);
    const [color, setColor] = useState('#3b82f6');

    const createAgent = async () => {
        if (!name.trim()) return;
        const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        const userEmail = localStorage.getItem('user_email');

        try {
            await axios.post(`${API_URL}/me/agents`, {
                id, name, bio, mood, color
            }, {
                headers: { email: userEmail }
            });

            setName('');
            setBio('');
            setMood(0);
            setIsExpanded(false); // Схлопываем форму после создания
            onCreated?.();
        } catch (err) {
            console.error(err);
            alert("Ошибка создания");
        }
    };

    // Стили, как в AgentCard.jsx
    const cardStyle = {
        background: 'linear-gradient(145deg, #1e1e1e 0%, #161616 100%)',
        borderRadius: '20px',
        padding: '24px',
        color: '#e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1px dashed rgba(255,255,255,0.2)`,
        height: 'fit-content',
    };

    const sectionStyle = {
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginTop: '12px',
    };

    const inputStyle = {
        width: '100%', padding: '12px', borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.3)', color: '#fff',
        fontSize: '14px', outline: 'none', boxSizing: 'border-box'
    };

    if (!isExpanded) {
        return (
            <div
                onClick={() => setIsExpanded(true)}
                style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}
            >
                <PlusCircle size={32} color="#555" />
                <span style={{ marginTop: '10px', color: '#777', fontWeight: 'bold' }}>Добавить агента</span>
            </div>
        );
    }

    return (
        <div style={cardStyle}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', color: color }}>
                <UserPlus size={20} /> Создать сущность
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input placeholder="Имя" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                <textarea placeholder="Био" value={bio} onChange={e => setBio(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} />

                <div style={sectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                        <span>Настроение: {mood.toFixed(1)}</span>
                        <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ border: 'none', background: 'none', width: '24px', height: '24px' }} />
                    </div>
                    <input type="range" min={-1} max={1} step={0.1} value={mood} onChange={e => setMood(parseFloat(e.target.value))} style={{ width: '100%', accentColor: color }} />
                </div>

                <button onClick={createAgent} style={{
                    padding: '12px', borderRadius: '12px', border: 'none', background: color, color: '#fff',
                    fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px'
                }}>
                    <Sparkles size={16} /> Создать
                </button>
                 <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#777', fontSize: '12px', cursor: 'pointer' }}>Отмена</button>
            </div>
        </div>
    );
};

export default CreateAgentForm;
