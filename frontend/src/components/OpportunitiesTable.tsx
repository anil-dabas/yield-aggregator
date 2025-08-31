import { useEffect, useRef } from 'react';
import { YieldOpportunity } from '../types';

interface OpportunitiesTableProps {
  opportunities: YieldOpportunity[];
  title: string;
}

const OpportunitiesTable: React.FC<OpportunitiesTableProps> = ({ opportunities, title }) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const headers = grid.querySelectorAll('.grid-header > div');
    const handles = grid.querySelectorAll('.resize-handle');

    const resize = (e: MouseEvent, index: number) => {
      const header = headers[index];
      const nextHeader = headers[index + 1];
      if (!header || !nextHeader) return;

      const startX = e.clientX;
      const startWidth = header.getBoundingClientRect().width;
      const nextWidth = nextHeader.getBoundingClientRect().width;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.max(100, startWidth + delta); // Minimum width 100px
        const newNextWidth = Math.max(100, nextWidth - delta);
        grid.style.gridTemplateColumns = Array.from(headers)
        .map((_, i) =>
            i === index
                ? `${newWidth}px`
                : i === index + 1
                    ? `${newNextWidth}px`
                    : getComputedStyle(grid).gridTemplateColumns.split(' ')[i] || '1fr'
        )
        .join(' ');
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    handles.forEach((handle, index) => {
      handle.addEventListener('mousedown', (e) => resize(e as MouseEvent, index));
    });

    return () => {
      handles.forEach((handle, index) => {
        handle.removeEventListener('mousedown', (e) => resize(e as MouseEvent, index));
      });
    };
  }, []);

  return (
      <div>
        <h2>{title}</h2>
        <div className="grid-container" ref={gridRef}>
          <div className="grid-header">
            <div>ID<span className="resize-handle"></span></div>
            <div>Name<span className="resize-handle"></span></div>
            <div>Provider<span className="resize-handle"></span></div>
            <div>Asset<span className="resize-handle"></span></div>
            <div>Chain<span className="resize-handle"></span></div>
            <div>APR (%)<span className="resize-handle"></span></div>
            <div>Category<span className="resize-handle"></span></div>
            <div>Liquidity<span className="resize-handle"></span></div>
            <div>Risk Score<span className="resize-handle"></span></div>
            <div>Updated At</div>
          </div>
          {opportunities.map((opp) => (
              <div key={opp.id} className="grid-row">
                <div>{opp.id}</div>
                <div>{opp.name}</div>
                <div>{opp.provider}</div>
                <div>{opp.asset}</div>
                <div>{opp.chain}</div>
                <div>{opp.apr ? (opp.apr * 100).toFixed(2) : 'N/A'}</div>
                <div>{opp.category}</div>
                <div>{opp.liquidity}</div>
                <div>{opp.riskScore}</div>
                <div>{new Date(opp.updatedAt).toLocaleString()}</div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default OpportunitiesTable;