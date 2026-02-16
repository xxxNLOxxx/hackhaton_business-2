import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const RelationshipGraph = ({ agents }) => {
    // useMemo нужен, чтобы граф не перерисовывался при каждом движении мышки,
    // а только когда меняются данные об агентах
    const graphData = useMemo(() => {
        const nodes = Object.values(agents).map(a => ({
            id: a.id,
            name: a.name,
            val: 10 // размер узла
        }));

        const links = [];
        Object.values(agents).forEach(agent => {
            if (agent.relationships) {
                Object.entries(agent.relationships).forEach(([targetId, value]) => {
                    // Рисуем связи только между агентами (игнорируем user для графа)
                    if (targetId !== 'user' && agents[targetId]) {
                        links.push({
                            source: agent.id,
                            target: targetId,
                            value: value,
                            // Чем сильнее чувства (в любую сторону), тем толще линия
                            width: Math.abs(value) + 1,
                            color: value >= 0 ? '#4ade80' : '#f87171'
                        });
                    }
                });
            }
        });

        return { nodes, links };
    }, [agents]);

    return (
        <div style={{
            background: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #333'
        }}>
            <ForceGraph2D
                graphData={graphData}
                width={450}
                height={400}
                nodeLabel="name"
                nodeColor={() => '#3b82f6'}
                linkColor={link => link.color}
                linkWidth={link => link.width}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={d => Math.abs(d.value) * 0.01}
                backgroundColor="#000000"
            />
        </div>
    );
};

export default RelationshipGraph;