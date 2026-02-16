import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const RelationshipGraph = ({ data }) => {
    // Если данных еще нет, показываем заглушку
    if (!data || !data.nodes) return <div style={{color: '#555', padding: '20px'}}>Загрузка графа...</div>;

    return (
        <div style={{
            background: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #333'
        }}>
            <ForceGraph2D
                graphData={data} // Используем готовые данные с бэкенда
                width={480}
                height={320}
                nodeLabel="name"
                nodeColor={node => node.color || '#3b82f6'}
                linkColor={link => link.value >= 0 ? '#4ade80' : '#f87171'}
                linkWidth={link => Math.abs(link.value) * 3 + 1}
                linkDirectionalParticles={2}
                // Частицы бегут быстрее, если отношения сильные
                linkDirectionalParticleSpeed={d => Math.abs(d.value) * 0.01}
                backgroundColor="#000000"
            />
        </div>
    );
};

export default RelationshipGraph;