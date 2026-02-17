import React, { useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const RelationshipGraph = ({ data }) => {
  // Настройка частиц (тех самых "микробов")
  const getParticleColor = useCallback(link => {
    return link.value > 0 ? '#4ade80' : '#f87171'; // Зеленые для друзей, красные для врагов
  }, []);

  return (
    <div style={{ 
      background: 'radial-gradient(circle, #1a1a1a 0%, #000000 100%)', 
      borderRadius: '16px', 
      overflow: 'hidden',
      border: '1px solid #333' 
    }}>
      <ForceGraph2D
        graphData={data}
        width={480}
        height={320}
        backgroundColor="rgba(0,0,0,0)" // Прозрачный фон для градиента
        
        // --- НОДЫ (Агенты) ---
        nodeLabel="name"
        nodeRelSize={7}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          // Рисуем свечение вокруг ноды
          ctx.shadowColor = node.color || '#3b82f6';
          ctx.shadowBlur = 15;
          
          // Само тело ноды
          ctx.fillStyle = node.color || '#3b82f6';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fill();
          
          // Подпись под нодой
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.textAlign = 'center';
          ctx.fillText(label, node.x, node.y + 10);
        }}

        // --- ЛИНИИ (Связи) ---
        linkColor={link => link.color || '#333333'}
        linkWidth={link => Math.abs(link.value) * 1.2}
        linkDirectionalParticles={3} // Количество летящих точек
        linkDirectionalParticleSpeed={d => Math.abs(d.value) * 0.006}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={getParticleColor}
        
        // Настройки физики для плавности
        d3VelocityDecay={0.3}
      />
    </div>
  );
};

export default RelationshipGraph;